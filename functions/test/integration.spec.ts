import { initializeApp, deleteApp, type App } from 'firebase-admin/app';
import {
  getFirestore,
  Timestamp,
  type CollectionReference,
  type Firestore,
} from 'firebase-admin/firestore';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { keyForDayStart, singaporeDayStart } from '../src/calendar.js';
import type { DeliveryAdapter } from '../src/delivery/adapter.js';
import { claimDelivery, markSuccess, recordFailure, type LedgerLine } from '../src/ledger.js';
import { runDailyReminders, type AuthUser } from '../src/process.js';

const RUN_AT = new Date('2026-09-10T12:00:00Z');
const ORIGIN = 'https://app.example.com';
const DAY_START = singaporeDayStart(RUN_AT);
const DATE_KEY = keyForDayStart(DAY_START);
const DAY_MS = 86_400_000;

interface SeededUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  preferenceEnabled?: boolean;
}

class RecordingAdapter implements DeliveryAdapter {
  sends: Array<{ to: string; subject: string; html: string }> = [];
  failure: { kind: 'rejected' | 'provider' | 'network'; message: string } | null = null;

  async send(input: { to: string; subject: string; html: string; text: string }) {
    this.sends.push({ to: input.to, subject: input.subject, html: input.html });
    if (this.failure) {
      return { ok: false as const, ...this.failure };
    }
    return { ok: true as const, messageId: `msg-${this.sends.length}` };
  }
}

let app: App;
let db: Firestore;
let adapter: RecordingAdapter;
let users: Map<string, AuthUser>;

function coverageRef(uid: string, productId: string, coverageId: string) {
  return db.doc(`users/${uid}/products/${productId}/coverages/${coverageId}`);
}

function productRef(uid: string, productId: string) {
  return db.doc(`users/${uid}/products/${productId}`);
}

function expiryDaysFromToday(daysAhead: number, hours = 6): Date {
  return new Date(DAY_START.getTime() + daysAhead * DAY_MS + hours * 3_600_000);
}

async function seedCoverage(
  uid: string,
  productId: string,
  coverageId: string,
  productName: string,
  expiry: Date | null,
): Promise<void> {
  await productRef(uid, productId).set({ name: productName, ownerId: uid });
  const data: Record<string, unknown> = {
    source: 'manufacturer',
    duration: { months: 12 },
    startDate: Timestamp.fromDate(DAY_START),
    manualExpiry: true,
  };
  if (expiry) {
    data['expiryDate'] = Timestamp.fromDate(expiry);
  }
  await coverageRef(uid, productId, coverageId).set(data);
}

function userFor(seed: SeededUser): AuthUser {
  return { email: seed.email, emailVerified: seed.emailVerified };
}

beforeAll(async () => {
  app = initializeApp({ projectId: 'demo-warranty-tracker' });
  db = getFirestore(app);
});

afterAll(async () => {
  await deleteApp(app);
});

async function wipeAll(db: Firestore): Promise<void> {
  const collections = await db.listCollections();
  for (const collection of collections) {
    await wipeCollection(collection);
  }
}

async function wipeCollection(collection: CollectionReference): Promise<void> {
  const docs = await collection.listDocuments();
  for (const doc of docs) {
    const nested = await doc.listCollections();
    for (const sub of nested) {
      await wipeCollection(sub);
    }
    await doc.delete();
  }
}

beforeEach(async () => {
  adapter = new RecordingAdapter();
  users = new Map();
  await wipeAll(db);
});

async function seed(seeded: SeededUser[]): Promise<void> {
  for (const user of seeded) {
    users.set(user.uid, userFor(user));
    if (user.preferenceEnabled !== undefined) {
      await db
        .doc(`users/${user.uid}/settings/notifications`)
        .set({ expiryEmailsEnabled: user.preferenceEnabled });
    }
  }
}

function lookup(uid: string): Promise<AuthUser | null> {
  return Promise.resolve(users.get(uid) ?? null);
}

describe('daily reminder integration (Firestore emulator)', () => {
  it('batches all due coverage into one digest per eligible recipient only', async () => {
    await seed([
      { uid: 'alice', email: 'alice@example.com', emailVerified: true },
      { uid: 'bob', email: 'bob@example.com', emailVerified: true, preferenceEnabled: false },
      { uid: 'carol', email: 'carol@example.com', emailVerified: false },
    ]);
    await seedCoverage('alice', 'p-today', 'c-today', 'Acer Monitor', expiryDaysFromToday(0));
    await seedCoverage('alice', 'p-7', 'c-7', 'Sony Headphones', expiryDaysFromToday(7));
    await seedCoverage('bob', 'p-30', 'c-30', 'Keychron Keyboard', expiryDaysFromToday(30));
    await seedCoverage('carol', 'p-30', 'c-30', 'Logitech Mouse', expiryDaysFromToday(30));
    await seedCoverage('dave', 'p-lifetime', 'c-life', 'Anker Cable', null);
    await seedCoverage('dave', 'p-expired', 'c-old', 'Old Phone', expiryDaysFromToday(-400));

    const result = await runDailyReminders({
      db,
      auth: { getUser: lookup },
      adapter,
      origin: ORIGIN,
      runAt: RUN_AT,
    });

    expect(result.dateKey).toBe(DATE_KEY);
    expect(result.candidateCount).toBe(4);
    expect(adapter.sends).toHaveLength(1);
    expect(adapter.sends[0].to).toBe('alice@example.com');

    const digest = adapter.sends[0].html;
    expect(digest).toContain('https://app.example.com/warranties/p-today');
    expect(digest).toContain('https://app.example.com/warranties/p-7');
    expect(digest).toContain('expires in 7 days');
    expect(digest).toContain('expires today');
    expect(digest).not.toContain('Keychron');
    expect(digest).not.toContain('Logitech');
    expect(digest).not.toContain('Anker');

    const outcomes = result.recipients.map((r) => [r.uid, r.outcome]);
    expect(outcomes).toContainEqual(['alice', 'sent']);
    expect(outcomes).toContainEqual(['bob', 'skipped_disabled']);
    expect(outcomes).toContainEqual(['carol', 'skipped_unverified']);

    const ledger = await db.doc(`users/alice/reminderDeliveries/${DATE_KEY}`).get();
    expect(ledger.get('state')).toBe('success');
    const storedLines = ledger.get('lines') as Array<{ productId: string }>;
    expect(storedLines.map((l) => l.productId)).toEqual(expect.arrayContaining(['p-today', 'p-7']));
  });

  it('does not resend a successfully delivered threshold on a repeat run', async () => {
    await seed([{ uid: 'alice', email: 'alice@example.com', emailVerified: true }]);
    await seedCoverage('alice', 'p-7', 'c-7', 'Sony Headphones', expiryDaysFromToday(7));

    const first = await runDailyReminders({
      db,
      auth: { getUser: lookup },
      adapter,
      origin: ORIGIN,
      runAt: RUN_AT,
    });
    const second = await runDailyReminders({
      db,
      auth: { getUser: lookup },
      adapter,
      origin: ORIGIN,
      runAt: RUN_AT,
    });

    expect(adapter.sends).toHaveLength(1);
    expect(first.recipients.find((r) => r.uid === 'alice')?.outcome).toBe('sent');
    expect(second.recipients.find((r) => r.uid === 'alice')?.outcome).toBe('skipped_existing');
  });

  it('honours a fresh processing claim and reclaims only after its lease expires', async () => {
    await seed([{ uid: 'alice', email: 'alice@example.com', emailVerified: true }]);
    await seedCoverage('alice', 'p-7', 'c-7', 'Sony Headphones', expiryDaysFromToday(7));

    const ledger = db.doc(`users/alice/reminderDeliveries/${DATE_KEY}`);
    await ledger.set({ state: 'processing', updatedAt: Timestamp.now() });

    await runDailyReminders({
      db,
      auth: { getUser: lookup },
      adapter,
      origin: ORIGIN,
      runAt: RUN_AT,
    });
    expect(adapter.sends).toHaveLength(0);

    await ledger.set({
      state: 'processing',
      updatedAt: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)),
    });
    await runDailyReminders({
      db,
      auth: { getUser: lookup },
      adapter,
      origin: ORIGIN,
      runAt: RUN_AT,
    });
    expect(adapter.sends).toHaveLength(1);
  });

  it('fails twice then succeeds on the bounded third attempt without duplication', async () => {
    await seed([{ uid: 'alice', email: 'alice@example.com', emailVerified: true }]);
    await seedCoverage('alice', 'p-7', 'c-7', 'Sony Headphones', expiryDaysFromToday(7));

    adapter.failure = { kind: 'provider', message: 'upstream down' };
    await runDailyReminders({
      db,
      auth: { getUser: lookup },
      adapter,
      origin: ORIGIN,
      runAt: RUN_AT,
    });
    await runDailyReminders({
      db,
      auth: { getUser: lookup },
      adapter,
      origin: ORIGIN,
      runAt: RUN_AT,
    });
    expect(adapter.sends).toHaveLength(2);

    adapter.failure = null;
    const third = await runDailyReminders({
      db,
      auth: { getUser: lookup },
      adapter,
      origin: ORIGIN,
      runAt: RUN_AT,
    });
    expect(adapter.sends).toHaveLength(3);
    expect(third.recipients.find((r) => r.uid === 'alice')?.outcome).toBe('sent');

    const ledger = await db.doc(`users/alice/reminderDeliveries/${DATE_KEY}`).get();
    expect(ledger.get('attempts')).toBe(3);
    expect(ledger.get('state')).toBe('success');
  });

  it('reaches a terminal error state after the bounded retries are exhausted', async () => {
    await seed([{ uid: 'alice', email: 'alice@example.com', emailVerified: true }]);
    await seedCoverage('alice', 'p-7', 'c-7', 'Sony Headphones', expiryDaysFromToday(7));

    adapter.failure = { kind: 'network', message: 'timeout' };
    for (let run = 0; run < 4; run += 1) {
      await runDailyReminders({
        db,
        auth: { getUser: lookup },
        adapter,
        origin: ORIGIN,
        runAt: RUN_AT,
      });
    }

    expect(adapter.sends).toHaveLength(3);
    const ledger = await db.doc(`users/alice/reminderDeliveries/${DATE_KEY}`).get();
    expect(ledger.get('state')).toBe('terminal_error');
  });

  it('does not claim or send for unverified, disabled, or unknown recipients', async () => {
    await seed([
      { uid: 'alice', email: 'alice@example.com', emailVerified: true, preferenceEnabled: false },
      { uid: 'bob', email: 'bob@example.com', emailVerified: false },
    ]);
    await seedCoverage('alice', 'p-7', 'c-7', 'Sony Headphones', expiryDaysFromToday(7));
    await seedCoverage('bob', 'p-7', 'c-7', 'Logitech Mouse', expiryDaysFromToday(7));
    await seedCoverage('ghost', 'p-7', 'c-7', 'Anker Cable', expiryDaysFromToday(7));

    const result = await runDailyReminders({
      db,
      auth: { getUser: lookup },
      adapter,
      origin: ORIGIN,
      runAt: RUN_AT,
    });

    expect(adapter.sends).toHaveLength(0);
    expect(result.recipients.map((r) => r.outcome)).toEqual(
      expect.arrayContaining(['skipped_disabled', 'skipped_unverified', 'no_user']),
    );
    const ledger = await db.doc(`users/alice/reminderDeliveries/${DATE_KEY}`).get();
    expect(ledger.exists).toBe(false);
  });

  it('keeps the ledger claim logic consistent across direct helper use', async () => {
    const line: LedgerLine = {
      productId: 'p',
      coverageId: 'c',
      productName: 'Prod',
      expiry: expiryDaysFromToday(7),
      daysAhead: 7,
    };
    const first = await claimDelivery(db, 'alice', DATE_KEY, [line]);
    expect(first.claimed).toBe(true);
    expect(first.attemptNumber).toBe(1);

    await markSuccess(db, 'alice', DATE_KEY, 'msg-1');
    const again = await claimDelivery(db, 'alice', DATE_KEY, [line]);
    expect(again.claimed).toBe(false);

    await recordFailure(db, 'bob', DATE_KEY, 'boom', 3);
    const terminal = await claimDelivery(db, 'bob', DATE_KEY, [line]);
    expect(terminal.claimed).toBe(false);
  });
});
