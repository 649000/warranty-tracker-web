import { Firestore, Timestamp } from 'firebase-admin/firestore';
import { LEDGER_COLLECTION, MAX_SEND_ATTEMPTS, PROCESSING_LEASE_MS } from './config.js';

export interface LedgerLine {
  productId: string;
  coverageId: string;
  productName: string;
  expiry: Date;
  daysAhead: number;
}

interface StoredLine {
  productId: string;
  coverageId: string;
  productName: string;
  expiry: Timestamp;
  daysAhead: number;
}

export interface ClaimResult {
  claimed: boolean;
  attemptNumber: number;
  /** Canonical threshold lines for this user/date, used to render every attempt. */
  lines: LedgerLine[];
}

function ledgerRef(db: Firestore, uid: string, dateKey: string) {
  return db.doc(`users/${uid}/${LEDGER_COLLECTION}/${dateKey}`);
}

function storedLines(data: FirebaseFirestore.DocumentData | undefined): LedgerLine[] {
  const raw = data?.['lines'];
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.flatMap((line: Partial<StoredLine>) => {
    if (!line.productId || !line.coverageId || !line.expiry) {
      return [];
    }
    return [
      {
        productId: line.productId,
        coverageId: line.coverageId,
        productName: typeof line.productName === 'string' ? line.productName : 'Your product',
        expiry: line.expiry.toDate(),
        daysAhead: typeof line.daysAhead === 'number' ? line.daysAhead : 0,
      },
    ];
  });
}

function serializeLines(lines: LedgerLine[]): StoredLine[] {
  return lines.map((line) => ({
    productId: line.productId,
    coverageId: line.coverageId,
    productName: line.productName,
    expiry: Timestamp.fromDate(line.expiry),
    daysAhead: line.daysAhead,
  }));
}

function mergeLines(previous: LedgerLine[], incoming: LedgerLine[]): LedgerLine[] {
  const byCoverage = new Map<string, LedgerLine>();
  for (const line of [...previous, ...incoming]) {
    byCoverage.set(line.coverageId, line);
  }
  return [...byCoverage.values()];
}

export function isTerminalState(state: unknown): boolean {
  return state === 'success' || state === 'terminal_error';
}

/**
 * Transactionally claims the right to deliver one digest for a user/date.
 * A claim is granted when there is no prior record, the previous attempt
 * failed, or a stale `processing` claim has outlived its lease. Success and
 * terminal-error records are never claimed again.
 */
export async function claimDelivery(
  db: Firestore,
  uid: string,
  dateKey: string,
  lines: LedgerLine[],
): Promise<ClaimResult> {
  const ref = ledgerRef(db, uid, dateKey);
  const result = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const data = snapshot.data();
    const state = data?.['state'];
    const attempts = typeof data?.['attempts'] === 'number' ? (data?.['attempts'] as number) : 0;

    const leaseAlive =
      state === 'processing' &&
      data?.['updatedAt'] instanceof Timestamp &&
      Date.now() - (data?.['updatedAt'] as Timestamp).toMillis() < PROCESSING_LEASE_MS;

    if (isTerminalState(state) || leaseAlive) {
      return { claimed: false, attemptNumber: attempts, lines: storedLines(data) };
    }

    const attemptNumber = attempts + 1;
    const merged = mergeLines(storedLines(data), lines);
    if (attemptNumber > MAX_SEND_ATTEMPTS) {
      await transaction.set(
        ref,
        {
          state: 'terminal_error',
          lastError: 'Maximum send attempts reached',
          updatedAt: Timestamp.now(),
        },
        { merge: true },
      );
      return { claimed: false, attemptNumber, lines: merged };
    }

    await transaction.set(
      ref,
      {
        state: 'processing',
        attempts: attemptNumber,
        lines: serializeLines(merged),
        updatedAt: Timestamp.now(),
      },
      { merge: true },
    );
    return { claimed: true, attemptNumber, lines: merged };
  });
  return result;
}

export async function markSuccess(
  db: Firestore,
  uid: string,
  dateKey: string,
  messageId: string,
): Promise<void> {
  const ref = ledgerRef(db, uid, dateKey);
  await ref.set(
    { state: 'success', messageId, sentAt: Timestamp.now(), updatedAt: Timestamp.now() },
    { merge: true },
  );
}

export async function recordFailure(
  db: Firestore,
  uid: string,
  dateKey: string,
  message: string,
  attemptNumber: number,
): Promise<void> {
  const ref = ledgerRef(db, uid, dateKey);
  const state = attemptNumber >= MAX_SEND_ATTEMPTS ? 'terminal_error' : 'error';
  await ref.set({ state, lastError: message, updatedAt: Timestamp.now() }, { merge: true });
}
