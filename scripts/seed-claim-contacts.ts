import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore, type Firestore } from 'firebase-admin/firestore';
import { claimContactDocId } from '../src/app/core/utils/claim-key';
import { CLAIM_CONTACTS } from './claim-contacts.data';

const EMULATOR_HOST = '127.0.0.1:8080';
// Must match the web app's projectId so the emulator namespace lines up.
const EMULATOR_PROJECT = 'warranty-tracker-33dc5';
const LIVE_PROJECT = process.env['GCLOUD_PROJECT'] ?? 'warranty-tracker-33dc5';

/** Idempotently writes every curated claim contact, keyed `{type}_{name}`. */
export async function seedClaimContacts(
  db: Firestore,
): Promise<{ seeded: number; total: number }> {
  for (const contact of CLAIM_CONTACTS) {
    const id = claimContactDocId(contact.type, contact.name);
    await db
      .collection('claimContacts')
      .doc(id)
      .set({ ...contact, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  }
  const snapshot = await db.collection('claimContacts').get();
  return { seeded: CLAIM_CONTACTS.length, total: snapshot.size };
}

/**
 * CLI runner. Re-running updates existing documents in place (no duplicates).
 *
 * Usage:
 *   npm run seed:claim-contacts -- --emulator   # local emulator
 *   npm run seed:claim-contacts                 # live project (needs ADC)
 */
async function main(): Promise<void> {
  const useEmulator = process.argv.includes('--emulator');
  if (useEmulator) {
    process.env['FIRESTORE_EMULATOR_HOST'] ??= EMULATOR_HOST;
  }
  initializeApp({
    projectId: useEmulator ? EMULATOR_PROJECT : LIVE_PROJECT,
    ...(useEmulator ? {} : { credential: applicationDefault() }),
  });

  const { seeded, total } = await seedClaimContacts(getFirestore());
  console.log(`Seeded ${seeded} claim contacts; collection has ${total} documents.`);
  if (total !== seeded) {
    throw new Error(`Expected ${seeded} documents but found ${total}; check for duplicate keys.`);
  }
  console.log(
    `Target: ${useEmulator ? `emulator (${EMULATOR_PROJECT})` : `live project (${LIVE_PROJECT})`}`,
  );
}

const isDirectRun = process.argv[1]?.includes('seed-claim-contacts') ?? false;
if (isDirectRun) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
