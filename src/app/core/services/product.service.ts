import { inject, Service, signal } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { DB } from '../firebase/firebase.providers';
import type {
  Coverage,
  CoverageContact,
  CoverageDuration,
  CoverageScope,
  CoverageSource,
  Product,
  ProofOfPurchase,
} from '../models/warranty.model';
import { firestoreDate } from '../utils/firestore';
import { AnalyticsService } from './analytics.service';
import { ErrorReportingService } from './error-reporting.service';

export interface CoverageDraft {
  source: CoverageSource;
  scope: CoverageScope;
  duration: CoverageDuration;
  startDate: Date;
  expiryDate?: Date | null;
  manualExpiry?: boolean;
  contact?: CoverageContact;
  notes?: string;
}

export interface ProductDraft {
  name: string;
  category?: string;
  brand?: string;
  serialNumber?: string;
  retailer?: string;
  purchaseDate: Date;
  price?: { amount: number; currency: string };
  proofOfPurchase?: ProofOfPurchase;
}

@Service()
export class ProductService {
  private readonly db = inject(DB);
  private readonly analytics = inject(AnalyticsService);
  private readonly errorReporting = inject(ErrorReportingService);
  /** The current user's products (realtime). */
  readonly products = signal<Product[]>([]);
  /** Coverages keyed by product id (realtime). */
  readonly coverages = signal<ReadonlyMap<string, Coverage[]>>(new Map());
  /** True once the initial product snapshot has arrived. */
  readonly loaded = signal(false);
  /** True when the product snapshot listener fails (permission/network). */
  readonly error = signal(false);

  private productsUnsub: Unsubscribe | null = null;
  private readonly coverageUnsubs = new Map<string, Unsubscribe>();
  private uid = '';

  /** Runs a Firestore operation, reporting unexpected failures. */
  private async run<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.errorReporting.captureException(error, { operation });
      throw error;
    }
  }

  /** Starts realtime listeners for a user's products and their coverages. */
  watch(uid: string): void {
    this.stopWatching();
    this.uid = uid;
    this.error.set(false);
    const q = query(collection(this.db, 'users', uid, 'products'));
    this.productsUnsub = onSnapshot(
      q,
      (snapshot) => {
        const products = snapshot.docs.map((d) => productFromDoc(d.id, d.data()));
        this.products.set(products);
        for (const product of products) {
          this.ensureCoverageListener(product.id);
        }
        this.loaded.set(true);
        this.error.set(false);
      },
      (error) => {
        this.error.set(true);
        this.errorReporting.captureException(error, { operation: 'watchProducts' });
      },
    );
  }

  stopWatching(): void {
    this.productsUnsub?.();
    this.productsUnsub = null;
    for (const unsub of this.coverageUnsubs.values()) {
      unsub();
    }
    this.coverageUnsubs.clear();
  }

  private ensureCoverageListener(productId: string): void {
    if (this.coverageUnsubs.has(productId)) {
      return;
    }
    const q = query(collection(this.db, 'users', this.uid, 'products', productId, 'coverages'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => coverageFromDoc(d.id, d.data()));
        this.coverages.update((map) => {
          const next = new Map(map);
          next.set(productId, list);
          return next;
        });
      },
      (error) => this.errorReporting.captureException(error, { operation: 'watchCoverages' }),
    );
    this.coverageUnsubs.set(productId, unsub);
  }

  coveragesFor(productId: string): Coverage[] {
    return this.coverages().get(productId) ?? [];
  }

  async getProduct(uid: string, productId: string): Promise<Product | null> {
    return this.run('getProduct', async () => {
      const snapshot = await getDoc(doc(this.db, 'users', uid, 'products', productId));
      return snapshot.exists() ? productFromDoc(snapshot.id, snapshot.data()) : null;
    });
  }

  async setProofOfPurchase(
    uid: string,
    productId: string,
    proof: ProofOfPurchase | null,
  ): Promise<void> {
    await this.run('setProofOfPurchase', async () => {
      const ref = doc(this.db, 'users', uid, 'products', productId);
      if (proof) {
        await updateDoc(ref, { proofOfPurchase: proof });
      } else {
        await updateDoc(ref, { proofOfPurchase: deleteField() });
      }
    });
  }

  async addProduct(uid: string, draft: ProductDraft, coverages: CoverageDraft[]): Promise<string> {
    return this.run('addProduct', async () => {
      const ref = doc(collection(this.db, 'users', uid, 'products'));
      await setDoc(ref, {
        ...productToDoc(draft),
        ownerId: uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const batch = writeBatch(this.db);
      for (const coverage of coverages) {
        const cRef = doc(collection(this.db, 'users', uid, 'products', ref.id, 'coverages'));
        batch.set(cRef, coverageToDoc(coverage));
      }
      await batch.commit();
      this.analytics.log('product_added', { product_id: ref.id });
      return ref.id;
    });
  }

  async updateProduct(uid: string, productId: string, draft: ProductDraft): Promise<void> {
    await this.run('updateProduct', async () => {
      const ref = doc(this.db, 'users', uid, 'products', productId);
      await updateDoc(ref, { ...productToDoc(draft), updatedAt: serverTimestamp() });
    });
  }

  async deleteProduct(uid: string, productId: string): Promise<void> {
    await this.run('deleteProduct', async () => {
      const coverageDocs = await getDocs(
        collection(this.db, 'users', uid, 'products', productId, 'coverages'),
      );
      const batch = writeBatch(this.db);
      for (const d of coverageDocs.docs) {
        batch.delete(d.ref);
      }
      batch.delete(doc(this.db, 'users', uid, 'products', productId));
      await batch.commit();
    });
  }

  async addCoverage(uid: string, productId: string, draft: CoverageDraft): Promise<void> {
    await this.run('addCoverage', async () => {
      await addDoc(
        collection(this.db, 'users', uid, 'products', productId, 'coverages'),
        coverageToDoc(draft),
      );
      await updateDoc(doc(this.db, 'users', uid, 'products', productId), {
        updatedAt: serverTimestamp(),
      });
      this.analytics.log('coverage_added', { product_id: productId });
    });
  }

  async updateCoverage(uid: string, productId: string, coverage: Coverage): Promise<void> {
    await this.run('updateCoverage', async () => {
      const ref = doc(this.db, 'users', uid, 'products', productId, 'coverages', coverage.id);
      await updateDoc(ref, { ...coverageToDoc(coverage), updatedAt: serverTimestamp() });
    });
  }

  /** Removes a coverage's user-entered contact so a directory suggestion can show. */
  async clearCoverageContact(uid: string, productId: string, coverageId: string): Promise<void> {
    await this.run('clearCoverageContact', async () => {
      await updateDoc(doc(this.db, 'users', uid, 'products', productId, 'coverages', coverageId), {
        contact: deleteField(),
        updatedAt: serverTimestamp(),
      });
    });
  }

  async deleteCoverage(uid: string, productId: string, coverageId: string): Promise<void> {
    await this.run('deleteCoverage', async () => {
      await deleteDoc(doc(this.db, 'users', uid, 'products', productId, 'coverages', coverageId));
      await updateDoc(doc(this.db, 'users', uid, 'products', productId), {
        updatedAt: serverTimestamp(),
      });
    });
  }

  /** Removes all of a user's products (coverages included). For account deletion. */
  async deleteAllProducts(uid: string): Promise<void> {
    const productDocs = await this.run('listAllProducts', () =>
      getDocs(query(collection(this.db, 'users', uid, 'products'))),
    );
    for (const productDoc of productDocs.docs) {
      await this.deleteProduct(uid, productDoc.id);
    }
  }
}

function productToDoc(draft: ProductDraft): Record<string, unknown> {
  const data: Record<string, unknown> = {
    name: draft.name,
    purchaseDate: draft.purchaseDate,
  };
  if (draft.category) data['category'] = draft.category;
  if (draft.brand) data['brand'] = draft.brand;
  if (draft.serialNumber) data['serialNumber'] = draft.serialNumber;
  if (draft.retailer) data['retailer'] = draft.retailer;
  if (draft.price) data['price'] = draft.price;
  if (draft.proofOfPurchase) data['proofOfPurchase'] = draft.proofOfPurchase;
  return data;
}

function productFromDoc(id: string, data: Record<string, unknown>): Product {
  const str = (value: unknown): string | undefined =>
    typeof value === 'string' && value.length > 0 ? value : undefined;
  return {
    id,
    name: typeof data['name'] === 'string' ? data['name'] : '',
    category: str(data['category']),
    brand: str(data['brand']),
    serialNumber: str(data['serialNumber']),
    retailer: str(data['retailer']),
    purchaseDate: firestoreDate(data['purchaseDate']) ?? new Date(),
    price: data['price'] as { amount: number; currency: string } | undefined,
    proofOfPurchase: data['proofOfPurchase'] as ProofOfPurchase | undefined,
    ownerId: typeof data['ownerId'] === 'string' ? data['ownerId'] : '',
    createdAt: firestoreDate(data['createdAt']) ?? undefined,
    updatedAt: firestoreDate(data['updatedAt']) ?? undefined,
  };
}

function coverageToDoc(draft: CoverageDraft): Record<string, unknown> {
  const data: Record<string, unknown> = {
    source: draft.source,
    scope: draft.scope,
    duration: draft.duration,
    startDate: draft.startDate,
    expiryDate: draft.expiryDate ?? null,
    manualExpiry: draft.manualExpiry ?? false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (draft.contact) data['contact'] = draft.contact;
  if (draft.notes) data['notes'] = draft.notes;
  return data;
}

function coverageFromDoc(id: string, data: Record<string, unknown>): Coverage {
  return {
    id,
    source: (data['source'] as Coverage['source']) ?? 'manufacturer',
    scope: (data['scope'] as Coverage['scope']) ?? 'local',
    duration: (data['duration'] as CoverageDuration) ?? { months: 12 },
    startDate: firestoreDate(data['startDate']) ?? new Date(),
    expiryDate: firestoreDate(data['expiryDate']),
    manualExpiry: Boolean(data['manualExpiry']),
    contact: data['contact'] as CoverageContact | undefined,
    notes: typeof data['notes'] === 'string' ? data['notes'] : undefined,
    createdAt: firestoreDate(data['createdAt']) ?? undefined,
    updatedAt: firestoreDate(data['updatedAt']) ?? undefined,
  };
}
