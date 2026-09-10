import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-warranty-tracker',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

/** A signed-in user whose email address is verified. */
function verified(uid: string) {
  return testEnv.authenticatedContext(uid, { email_verified: true });
}

/** A signed-in user whose email address is not verified yet. */
function unverified(uid: string) {
  return testEnv.authenticatedContext(uid, { email_verified: false });
}

function productData(uid: string, overrides: Record<string, unknown> = {}) {
  return {
    name: 'Sony headphones',
    purchaseDate: new Date('2024-01-01'),
    ownerId: uid,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

function coverageData(overrides: Record<string, unknown> = {}) {
  return {
    source: 'manufacturer',
    scope: 'local',
    duration: { months: 12 },
    startDate: new Date('2024-01-01'),
    expiryDate: new Date('2025-01-01'),
    manualExpiry: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

function userProducts(uid: string) {
  return verified(uid).firestore().collection('users').doc(uid).collection('products');
}

function userSettings(uid: string) {
  return verified(uid).firestore().collection('users').doc(uid).collection('settings');
}

describe('Firestore security rules', () => {
  it('denies unauthenticated reads of products', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await expect(
      db.collection('users').doc('alice').collection('products').get(),
    ).rejects.toThrow();
  });

  it('allows a verified user to create and read their own product', async () => {
    await userProducts('alice').doc('p1').set(productData('alice'));

    const snapshot = await userProducts('alice').get();
    expect(snapshot.docs.map((d) => d.id)).toContain('p1');
  });

  it('denies an unverified user writing their own product', async () => {
    await expect(
      unverified('alice')
        .firestore()
        .collection('users')
        .doc('alice')
        .collection('products')
        .doc('p1')
        .set(productData('alice')),
    ).rejects.toThrow();
  });

  it('denies an unverified user reading their own product', async () => {
    await userProducts('alice').doc('p1').set(productData('alice'));

    await expect(
      unverified('alice').firestore().collection('users').doc('alice').collection('products').get(),
    ).rejects.toThrow();
  });

  it('denies a product write with an unknown field', async () => {
    await expect(
      userProducts('alice')
        .doc('p1')
        .set(productData('alice', { isAdmin: true })),
    ).rejects.toThrow();
  });

  it('denies a product write with the wrong field type', async () => {
    await expect(
      userProducts('alice')
        .doc('p1')
        .set(productData('alice', { name: 42 })),
    ).rejects.toThrow();
  });

  it('denies a product write with an over-length name', async () => {
    await expect(
      userProducts('alice')
        .doc('p1')
        .set(productData('alice', { name: 'x'.repeat(121) })),
    ).rejects.toThrow();
  });

  it('denies a product write that spoofs ownerId', async () => {
    await expect(userProducts('alice').doc('p1').set(productData('bob'))).rejects.toThrow();
  });

  it('denies a user reading another user’s product', async () => {
    await userProducts('alice').doc('p1').set(productData('alice'));

    await expect(
      verified('bob')
        .firestore()
        .collection('users')
        .doc('alice')
        .collection('products')
        .doc('p1')
        .get(),
    ).rejects.toThrow();
  });

  it('denies creating a product under another user’s path', async () => {
    await expect(
      verified('alice')
        .firestore()
        .collection('users')
        .doc('bob')
        .collection('products')
        .doc('p1')
        .set(productData('bob')),
    ).rejects.toThrow();
  });

  it('denies writing coverages of another user’s product', async () => {
    await userProducts('alice').doc('p1').set(productData('alice'));

    await expect(
      verified('bob')
        .firestore()
        .collection('users')
        .doc('alice')
        .collection('products')
        .doc('p1')
        .collection('coverages')
        .doc('c1')
        .set(coverageData()),
    ).rejects.toThrow();
  });

  it('allows a user to write coverages on their own product', async () => {
    await userProducts('alice').doc('p1').set(productData('alice'));

    await userProducts('alice').doc('p1').collection('coverages').doc('c1').set(coverageData());

    const snapshot = await userProducts('alice').doc('p1').collection('coverages').get();
    expect(snapshot.docs.map((d) => d.id)).toContain('c1');
  });

  it('denies a coverage write with an invalid source enum', async () => {
    await userProducts('alice').doc('p1').set(productData('alice'));

    await expect(
      userProducts('alice')
        .doc('p1')
        .collection('coverages')
        .doc('c1')
        .set(coverageData({ source: 'platinum' })),
    ).rejects.toThrow();
  });

  it('allows a user to read and change their own notification preference', async () => {
    const notifications = userSettings('alice').doc('notifications');
    await notifications.set({ expiryEmailsEnabled: false, updatedAt: new Date() });

    const read = await notifications.get();
    expect(read.data()?.['expiryEmailsEnabled']).toBe(false);

    await notifications.set({ expiryEmailsEnabled: true, updatedAt: new Date() });
    const updated = await notifications.get();
    expect(updated.data()?.['expiryEmailsEnabled']).toBe(true);
  });

  it('denies a settings write with an unknown field', async () => {
    await expect(
      userSettings('alice')
        .doc('notifications')
        .set({ expiryEmailsEnabled: true, updatedAt: new Date(), admin: true }),
    ).rejects.toThrow();
  });

  it('denies a user reading another user’s notification preference', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context
        .firestore()
        .collection('users')
        .doc('alice')
        .collection('settings')
        .doc('notifications')
        .set({ expiryEmailsEnabled: true, updatedAt: new Date() });
    });

    await expect(
      verified('bob')
        .firestore()
        .collection('users')
        .doc('alice')
        .collection('settings')
        .doc('notifications')
        .get(),
    ).rejects.toThrow();
  });

  it('denies a user changing another user’s notification preference', async () => {
    await expect(
      verified('alice')
        .firestore()
        .collection('users')
        .doc('bob')
        .collection('settings')
        .doc('notifications')
        .set({ expiryEmailsEnabled: false, updatedAt: new Date() }),
    ).rejects.toThrow();
  });

  it('allows a verified user to read the claim directory', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context
        .firestore()
        .collection('claimContacts')
        .doc('manufacturer_apple')
        .set({ type: 'manufacturer', name: 'Apple', matchKeys: ['apple'] });
    });

    const snapshot = await verified('alice')
      .firestore()
      .collection('claimContacts')
      .doc('manufacturer_apple')
      .get();
    expect(snapshot.data()?.['name']).toBe('Apple');
  });

  it('denies an unverified user reading the claim directory', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context
        .firestore()
        .collection('claimContacts')
        .doc('manufacturer_apple')
        .set({ type: 'manufacturer', name: 'Apple', matchKeys: ['apple'] });
    });

    await expect(
      unverified('alice').firestore().collection('claimContacts').doc('manufacturer_apple').get(),
    ).rejects.toThrow();
  });

  it('denies unauthenticated reads of the claim directory', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context
        .firestore()
        .collection('claimContacts')
        .doc('manufacturer_apple')
        .set({ type: 'manufacturer', name: 'Apple', matchKeys: ['apple'] });
    });

    await expect(
      testEnv
        .unauthenticatedContext()
        .firestore()
        .collection('claimContacts')
        .doc('manufacturer_apple')
        .get(),
    ).rejects.toThrow();
  });

  it('denies client writes to the claim directory', async () => {
    const directory = verified('alice').firestore().collection('claimContacts');

    await expect(
      directory.doc('manufacturer_apple').set({ type: 'manufacturer', name: 'Apple' }),
    ).rejects.toThrow();

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context
        .firestore()
        .collection('claimContacts')
        .doc('manufacturer_apple')
        .set({ type: 'manufacturer', name: 'Apple', matchKeys: ['apple'] });
    });

    await expect(
      directory.doc('manufacturer_apple').update({ name: 'Apple Inc' }),
    ).rejects.toThrow();
    await expect(directory.doc('manufacturer_apple').delete()).rejects.toThrow();
  });

  it('denies users access to the reminder delivery ledger', async () => {
    const delivery = verified('alice')
      .firestore()
      .collection('users')
      .doc('alice')
      .collection('reminderDeliveries')
      .doc('2026-09-10');

    await expect(delivery.set({ state: 'processing' })).rejects.toThrow();
    await expect(delivery.get()).rejects.toThrow();
  });
});
