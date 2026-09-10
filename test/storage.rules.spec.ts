import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { deleteObject, getBytes, ref, uploadBytes } from 'firebase/storage';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-warranty-tracker',
    storage: {
      rules: readFileSync('storage.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearStorage();
});

const FIVE_MB = 5 * 1024 * 1024;

function bytes(size: number): Uint8Array {
  return new Uint8Array(size);
}

describe('Storage security rules', () => {
  it('allows a user to upload a small image proof', async () => {
    const storage = testEnv.authenticatedContext('alice').storage();
    await assertSucceeds(
      uploadBytes(ref(storage, 'users/alice/proofs/p1/receipt.jpg'), bytes(1024), {
        contentType: 'image/jpeg',
      }),
    );
  });

  it('allows a user to upload a PDF proof', async () => {
    const storage = testEnv.authenticatedContext('alice').storage();
    await assertSucceeds(
      uploadBytes(ref(storage, 'users/alice/proofs/p1/receipt.pdf'), bytes(1024), {
        contentType: 'application/pdf',
      }),
    );
  });

  it('denies an upload larger than 5 MB', async () => {
    const storage = testEnv.authenticatedContext('alice').storage();
    await assertFails(
      uploadBytes(ref(storage, 'users/alice/proofs/p1/huge.jpg'), bytes(FIVE_MB + 1), {
        contentType: 'image/jpeg',
      }),
    );
  });

  it('denies a non-image, non-PDF content type', async () => {
    const storage = testEnv.authenticatedContext('alice').storage();
    await assertFails(
      uploadBytes(ref(storage, 'users/alice/proofs/p1/script.js'), bytes(16), {
        contentType: 'application/javascript',
      }),
    );
  });

  it('denies uploading into another user’s folder', async () => {
    const storage = testEnv.authenticatedContext('bob').storage();
    await assertFails(
      uploadBytes(ref(storage, 'users/alice/proofs/p1/receipt.jpg'), bytes(16), {
        contentType: 'image/jpeg',
      }),
    );
  });

  it('denies unauthenticated uploads', async () => {
    const storage = testEnv.unauthenticatedContext().storage();
    await assertFails(
      uploadBytes(ref(storage, 'users/alice/proofs/p1/receipt.jpg'), bytes(16), {
        contentType: 'image/jpeg',
      }),
    );
  });

  it('allows an owner to read and delete their own proof', async () => {
    const storage = testEnv.authenticatedContext('alice').storage();
    const object = ref(storage, 'users/alice/proofs/p1/receipt.jpg');
    await assertSucceeds(uploadBytes(object, bytes(16), { contentType: 'image/jpeg' }));
    await assertSucceeds(getBytes(object));
    await assertSucceeds(deleteObject(object));
  });

  it('denies reading another user’s proof', async () => {
    const alice = testEnv.authenticatedContext('alice').storage();
    await assertSucceeds(
      uploadBytes(ref(alice, 'users/alice/proofs/p1/receipt.jpg'), bytes(16), {
        contentType: 'image/jpeg',
      }),
    );

    const bob = testEnv.authenticatedContext('bob').storage();
    await assertFails(getBytes(ref(bob, 'users/alice/proofs/p1/receipt.jpg')));
  });
});
