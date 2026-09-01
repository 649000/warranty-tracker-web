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
});
