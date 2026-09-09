import { Firestore, Timestamp } from 'firebase-admin/firestore';
import { keyForDayStart, singaporeDayStart, thresholdWindowsFor } from './calendar.js';

const PAGE_SIZE = 500;

export interface CoverageRecord {
  path: string;
  coverageId: string;
  /** Absent for lifetime coverages and for malformed documents. */
  expiry: Date | null;
}

export interface CoverageCandidate extends CoverageRecord {
  uid: string;
  productId: string;
  productName: string;
  daysAhead: number;
}

function parentOf(path: string): { uid: string; productId: string } | null {
  const segments = path.split('/');
  if (segments.length !== 6 || segments[0] !== 'users' || segments[2] !== 'products') {
    return null;
  }
  return { uid: segments[1], productId: segments[3] };
}

/**
 * Pure selector over already-fetched coverage records. Keeps only coverage
 * whose expiry falls on a 30/7/0-day Singapore calendar window; lifetime
 * coverages (no expiry) and already-expired or off-window dates are excluded.
 */
export function selectDueCoverages(dayStart: Date, records: CoverageRecord[]): CoverageCandidate[] {
  const windows = thresholdWindowsFor(dayStart);
  const candidates: CoverageCandidate[] = [];

  for (const record of records) {
    const parent = parentOf(record.path);
    if (!parent || !record.expiry) {
      continue;
    }
    const window = windows.find(
      (w) =>
        record.expiry!.getTime() >= w.start.getTime() && record.expiry!.getTime() < w.end.getTime(),
    );
    if (!window) {
      continue;
    }
    candidates.push({
      ...record,
      uid: parent.uid,
      productId: parent.productId,
      productName: '',
      daysAhead: window.daysAhead,
    });
  }
  return candidates;
}

/** Convenience wrapper used by tests: today's Singapore date derived from `now`. */
export function selectDueCoveragesNow(now: Date, records: CoverageRecord[]): CoverageCandidate[] {
  return selectDueCoverages(singaporeDayStart(now), records);
}

export function recordsFromDocs(
  docs: Array<{ id: string; ref: { path: string }; get: (field: string) => unknown }>,
): CoverageRecord[] {
  return docs.map((doc) => {
    const expiryValue = doc.get('expiryDate');
    const expiry = expiryValue instanceof Timestamp ? expiryValue.toDate() : null;
    return { path: doc.ref.path, coverageId: doc.id, expiry };
  });
}

/**
 * Finds coverage whose expiry falls on a reminder threshold date (30, 7 or
 * 0 Singapore calendar days out) and enriches it with the parent product name.
 */
export async function findDueCoverages(
  db: Firestore,
  dayStart: Date,
): Promise<CoverageCandidate[]> {
  const docs = await fetchWindowDocs(db, dayStart);
  const candidates = selectDueCoverages(dayStart, recordsFromDocs(docs));
  await hydrateProductNames(db, candidates);
  return candidates;
}

async function fetchWindowDocs(
  db: Firestore,
  dayStart: Date,
): Promise<Array<FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>>> {
  const collected: Array<FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>> =
    [];
  const seen = new Set<string>();

  for (const window of thresholdWindowsFor(dayStart)) {
    let cursor: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData> | undefined;
    for (;;) {
      let request = db
        .collectionGroup('coverages')
        .where('expiryDate', '>=', Timestamp.fromDate(window.start))
        .where('expiryDate', '<', Timestamp.fromDate(window.end))
        .orderBy('expiryDate')
        .limit(PAGE_SIZE);
      if (cursor) {
        request = request.startAfter(cursor);
      }
      const snapshot = await request.get();
      for (const doc of snapshot.docs) {
        if (!seen.has(doc.ref.path)) {
          seen.add(doc.ref.path);
          collected.push(doc);
        }
      }
      if (snapshot.docs.length < PAGE_SIZE) {
        break;
      }
      cursor = snapshot.docs[snapshot.docs.length - 1];
    }
  }
  return collected;
}

async function hydrateProductNames(db: Firestore, candidates: CoverageCandidate[]): Promise<void> {
  const loads = new Map<string, Promise<string>>();
  const loadName = (candidate: CoverageCandidate): Promise<string> => {
    const path = `users/${candidate.uid}/products/${candidate.productId}`;
    let load = loads.get(path);
    if (!load) {
      load = db
        .doc(path)
        .get()
        .then((snapshot) => {
          const name = snapshot.get('name');
          return typeof name === 'string' && name.length > 0 ? name : 'Your product';
        })
        .catch(() => 'Your product');
      loads.set(path, load);
    }
    return load;
  };
  await Promise.all(
    candidates.map(async (candidate) => {
      candidate.productName = await loadName(candidate);
    }),
  );
}

export function todayKey(): string {
  return keyForDayStart(singaporeDayStart(new Date()));
}
