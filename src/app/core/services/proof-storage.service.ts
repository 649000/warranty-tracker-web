import { inject, Service } from '@angular/core';
import {
  deleteObject,
  getDownloadURL,
  listAll,
  ref,
  uploadBytes,
  type FirebaseStorage,
} from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import { STORAGE } from '../firebase/firebase.providers';
import type { ProofOfPurchase } from '../models/warranty.model';
import { AnalyticsService } from './analytics.service';
import { ErrorReportingService } from './error-reporting.service';

export interface ProofUploadResult {
  storagePath: string;
  fileName: string;
  contentType: string;
}

@Service()
export class ProofStorageService {
  private readonly storage = inject<FirebaseStorage>(STORAGE);
  private readonly analytics = inject(AnalyticsService);
  private readonly errorReporting = inject(ErrorReportingService);

  /** Runs a Storage operation, reporting unexpected failures. */
  private async run<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.errorReporting.captureException(error, { operation });
      throw error;
    }
  }

  /**
   * Uploads a proof file. Images are downsized client-side (metadata stripped);
   * PDFs are stored as-is. Returns the stored file's metadata.
   */
  async uploadProof(
    uid: string,
    productId: string,
    file: File,
    kind: 'image' | 'pdf',
  ): Promise<ProofUploadResult> {
    return this.run('uploadProof', async () => {
      const fileId = `${Date.now()}-${sanitizeFileName(file.name)}`;
      const storagePath = `users/${uid}/proofs/${productId}/${fileId}`;
      const objectRef = ref(this.storage, storagePath);

      let toUpload = file;
      if (kind === 'image') {
        toUpload = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        });
      }

      const contentType = kind === 'image' ? toUpload.type || 'image/jpeg' : 'application/pdf';
      const uploaded = await uploadBytes(objectRef, toUpload, { contentType });
      this.analytics.log('proof_uploaded', { type: kind });
      return {
        storagePath: uploaded.ref.fullPath,
        fileName: file.name,
        contentType,
      };
    });
  }

  async downloadUrl(storagePath: string): Promise<string> {
    return this.run('downloadProofUrl', () => getDownloadURL(ref(this.storage, storagePath)));
  }

  async deleteProof(storagePath: string): Promise<void> {
    await this.run('deleteProof', () => deleteObject(ref(this.storage, storagePath)));
  }

  /** Removes every proof file for a user. For account deletion. */
  async deleteAllUserFiles(uid: string): Promise<void> {
    await this.run('deleteAllUserFiles', async () => {
      const root = ref(this.storage, `users/${uid}/proofs`);
      const list = await listAll(root);
      await Promise.all(list.items.map((item) => deleteObject(item)));
    });
  }

  toProof(
    storagePath: string,
    fileName: string,
    contentType: string,
    type: 'image' | 'pdf',
  ): ProofOfPurchase {
    return { type, storagePath, fileName, contentType };
  }
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80) || 'file';
}
