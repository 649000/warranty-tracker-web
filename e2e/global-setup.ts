import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { seedClaimContacts } from '../scripts/seed-claim-contacts';

/**
 * Seeds the local Firestore emulator with the curated claim directory before
 * the e2e suite runs. Requires the emulators to be running (`npm run emulators`).
 */
export default async function globalSetup(): Promise<void> {
  process.env['FIRESTORE_EMULATOR_HOST'] ??= '127.0.0.1:8080';
  // Must match the web app's projectId so the emulator namespace lines up.
  initializeApp({ projectId: 'warranty-tracker-33dc5' });
  const { seeded, total } = await seedClaimContacts(getFirestore());
  console.log(`[e2e] seeded ${seeded} claim contacts (${total} documents).`);
}
