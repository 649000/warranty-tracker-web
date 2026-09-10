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

function userProducts(uid: string) {
  return testEnv
    .authenticatedContext(uid)
    .firestore()
    .collection('users')
    .doc(uid)
    .collection('products');
}

function userSettings(uid: string) {
  return testEnv
    .authenticatedContext(uid)
    .firestore()
    .collection('users')
    .doc(uid)
    .collection('settings');
}

describe('Firestore security rules', () => {
  it('denies unauthenticated reads of products', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await expect(
      db.collection('users').doc('alice').collection('products').get(),
    ).rejects.toThrow();
  });

  it('allows a user to create and read their own product', async () => {
    await userProducts('alice')
      .doc('p1')
      .set({ name: 'Sony headphones', purchaseDate: new Date() });

    const snapshot = await userProducts('alice').get();
    expect(snapshot.docs.map((d) => d.id)).toContain('p1');
  });

  it('denies a user reading another user’s product', async () => {
    await userProducts('alice')
      .doc('p1')
      .set({ name: 'Sony headphones', purchaseDate: new Date() });

    await expect(
      testEnv
        .authenticatedContext('bob')
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
      testEnv
        .authenticatedContext('alice')
        .firestore()
        .collection('users')
        .doc('bob')
        .collection('products')
        .doc('p1')
        .set({ name: 'Sony headphones', purchaseDate: new Date() }),
    ).rejects.toThrow();
  });

  it('denies writing coverages of another user’s product', async () => {
    await userProducts('alice')
      .doc('p1')
      .set({ name: 'Sony headphones', purchaseDate: new Date() });

    await expect(
      testEnv
        .authenticatedContext('bob')
        .firestore()
        .collection('users')
        .doc('alice')
        .collection('products')
        .doc('p1')
        .collection('coverages')
        .doc('c1')
        .set({ source: 'manufacturer', duration: { months: 12 } }),
    ).rejects.toThrow();
  });

  it('allows a user to write coverages on their own product', async () => {
    await userProducts('alice')
      .doc('p1')
      .set({ name: 'Sony headphones', purchaseDate: new Date() });

    await userProducts('alice')
      .doc('p1')
      .collection('coverages')
      .doc('c1')
      .set({ source: 'manufacturer', duration: { months: 12 } });

    const snapshot = await userProducts('alice').doc('p1').collection('coverages').get();
    expect(snapshot.docs.map((d) => d.id)).toContain('c1');
  });

  it('allows a user to read and change their own notification preference', async () => {
    const notifications = userSettings('alice').doc('notifications');
    await notifications.set({ expiryEmailsEnabled: false });

    const read = await notifications.get();
    expect(read.data()?.['expiryEmailsEnabled']).toBe(false);

    await notifications.set({ expiryEmailsEnabled: true });
    const updated = await notifications.get();
    expect(updated.data()?.['expiryEmailsEnabled']).toBe(true);
  });

  it('denies a user reading another user’s notification preference', async () => {
    await userSettings('alice').doc('notifications').set({ expiryEmailsEnabled: true });

    await expect(
      testEnv
        .authenticatedContext('bob')
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
      testEnv
        .authenticatedContext('alice')
        .firestore()
        .collection('users')
        .doc('bob')
        .collection('settings')
        .doc('notifications')
        .set({ expiryEmailsEnabled: false }),
    ).rejects.toThrow();
  });

  it('allows an authenticated user to read the claim directory', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context
        .firestore()
        .collection('claimContacts')
        .doc('manufacturer_apple')
        .set({ type: 'manufacturer', name: 'Apple', matchKeys: ['apple'] });
    });

    const snapshot = await testEnv
      .authenticatedContext('alice')
      .firestore()
      .collection('claimContacts')
      .doc('manufacturer_apple')
      .get();
    expect(snapshot.data()?.['name']).toBe('Apple');
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
    const directory = testEnv.authenticatedContext('alice').firestore().collection('claimContacts');

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
    const delivery = testEnv
      .authenticatedContext('alice')
      .firestore()
      .collection('users')
      .doc('alice')
      .collection('reminderDeliveries')
      .doc('2026-09-10');

    await expect(delivery.set({ state: 'processing' })).rejects.toThrow();
    await expect(delivery.get()).rejects.toThrow();
  });
});
