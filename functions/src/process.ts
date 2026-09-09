import { Firestore } from 'firebase-admin/firestore';
import { keyForDayStart, singaporeDayStart } from './calendar.js';
import { NOTIFICATION_PREFERENCES_DOC, PREFERENCE_ENABLED_FIELD } from './config.js';
import type { DeliveryAdapter } from './delivery/adapter.js';
import { isEligibleForReminder } from './eligibility.js';
import { claimDelivery, markSuccess, recordFailure, type LedgerLine } from './ledger.js';
import { renderDigest, formatSingaporeDate } from './render.js';
import { findDueCoverages } from './selection.js';

export interface AuthUser {
  email?: string | null;
  emailVerified?: boolean;
}

export interface UserLookup {
  getUser(uid: string): Promise<AuthUser | null>;
}

export interface ReminderDeps {
  db: Firestore;
  auth: UserLookup;
  adapter: DeliveryAdapter;
  /** Public origin used to build warranty detail links, e.g. https://app.example.com */
  origin: string;
  runAt?: Date;
}

export type RecipientOutcome =
  | 'sent'
  | 'no_user'
  | 'skipped_unverified'
  | 'skipped_disabled'
  | 'skipped_existing'
  | 'failed'
  | 'failed_terminal';

export interface RecipientResult {
  uid: string;
  outcome: RecipientOutcome;
  attemptNumber: number;
  messageId?: string;
}

export interface ReminderRunResult {
  dateKey: string;
  candidateCount: number;
  recipients: RecipientResult[];
}

function toLedgerLine(candidate: {
  productId: string;
  coverageId: string;
  productName: string;
  expiry: Date | null;
  daysAhead: number;
}): LedgerLine | null {
  if (!candidate.expiry) {
    return null;
  }
  return {
    productId: candidate.productId,
    coverageId: candidate.coverageId,
    productName: candidate.productName,
    expiry: candidate.expiry,
    daysAhead: candidate.daysAhead,
  };
}

export async function runDailyReminders(deps: ReminderDeps): Promise<ReminderRunResult> {
  const { db, auth, adapter, origin } = deps;
  const dayStart = singaporeDayStart(deps.runAt);
  const dateKey = keyForDayStart(dayStart);

  const candidates = await findDueCoverages(db, dayStart);
  const grouped = new Map<string, LedgerLine[]>();
  for (const candidate of candidates) {
    const line = toLedgerLine(candidate);
    if (!line) {
      continue;
    }
    grouped.set(candidate.uid, [...(grouped.get(candidate.uid) ?? []), line]);
  }

  const recipients: RecipientResult[] = [];
  const dateLabel = formatSingaporeDate(dayStart);

  for (const [uid, lines] of grouped) {
    const user = await auth.getUser(uid).catch(() => null);
    if (!user?.email) {
      recipients.push({ uid, outcome: 'no_user', attemptNumber: 0 });
      continue;
    }

    const preference = await db.doc(`users/${uid}/settings/${NOTIFICATION_PREFERENCES_DOC}`).get();
    const preferenceEnabled = preference.get(PREFERENCE_ENABLED_FIELD) as boolean | undefined;

    if (user.emailVerified !== true) {
      recipients.push({ uid, outcome: 'skipped_unverified', attemptNumber: 0 });
      continue;
    }
    if (!isEligibleForReminder({ email: user.email, emailVerified: true, preferenceEnabled })) {
      recipients.push({ uid, outcome: 'skipped_disabled', attemptNumber: 0 });
      continue;
    }

    const claim = await claimDelivery(db, uid, dateKey, lines);
    if (!claim.claimed) {
      recipients.push({
        uid,
        outcome: 'skipped_existing',
        attemptNumber: claim.attemptNumber,
      });
      continue;
    }

    const digest = renderDigest(origin, dateLabel, claim.lines);
    const result = await adapter.send({
      to: user.email,
      subject: digest.subject,
      html: digest.html,
      text: digest.text,
    });

    if (result.ok) {
      await markSuccess(db, uid, dateKey, result.messageId);
      recipients.push({
        uid,
        outcome: 'sent',
        attemptNumber: claim.attemptNumber,
        messageId: result.messageId,
      });
    } else {
      await recordFailure(db, uid, dateKey, result.message, claim.attemptNumber);
      const outcome: RecipientOutcome = claim.attemptNumber >= 3 ? 'failed_terminal' : 'failed';
      recipients.push({ uid, outcome, attemptNumber: claim.attemptNumber });
    }
  }

  return { dateKey, candidateCount: candidates.length, recipients };
}
