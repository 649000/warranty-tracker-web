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
  /** The current user's products (realtime). */
  readonly products = signal<Product[]>([]);
  /** Coverages keyed by product id (realtime). */
  readonly coverages = signal<ReadonlyMap<string, Coverage[]>>(new Map());
  /** True once the initial product snapshot has arrived. */
  readonly loaded = signal(false);

  private productsUnsub: Unsubscribe | null = null;
  private readonly coverageUnsubs = new Map<string, Unsubscribe>();
  private uid = '';

  /** Starts realtime listeners for a user's products and their coverages. */
  watch(uid: string): void {
    this.stopWatching();
    this.uid = uid;
    const q = query(collection(this.db, 'users', uid, 'products'));
    this.productsUnsub = onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map((d) => productFromDoc(d.id, d.data()));
      this.products.set(products);
      for (const product of products) {
        this.ensureCoverageListener(product.id);
      }
      this.loaded.set(true);
    });
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
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => coverageFromDoc(d.id, d.data()));
      this.coverages.update((map) => {
        const next = new Map(map);
        next.set(productId, list);
        return next;
      });
    });
    this.coverageUnsubs.set(productId, unsub);
  }

  coveragesFor(productId: string): Coverage[] {
    return this.coverages().get(productId) ?? [];
  }

  async getProduct(uid: string, productId: string): Promise<Product | null> {
    const snapshot = await getDoc(doc(this.db, 'users', uid, 'products', productId));
    return snapshot.exists() ? productFromDoc(snapshot.id, snapshot.data()) : null;
  }

  async setProofOfPurchase(
    uid: string,
    productId: string,
    proof: ProofOfPurchase | null,
  ): Promise<void> {
    const ref = doc(this.db, 'users', uid, 'products', productId);
    if (proof) {
      await updateDoc(ref, { proofOfPurchase: proof });
    } else {
      await updateDoc(ref, { proofOfPurchase: deleteField() });
    }
  }

  async addProduct(uid: string, draft: ProductDraft, coverages: CoverageDraft[]): Promise<string> {
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
  }

  async updateProduct(uid: string, productId: string, draft: ProductDraft): Promise<void> {
    const ref = doc(this.db, 'users', uid, 'products', productId);
    await updateDoc(ref, { ...productToDoc(draft), updatedAt: serverTimestamp() });
  }

  async deleteProduct(uid: string, productId: string): Promise<void> {
    const coverageDocs = await getDocs(
      collection(this.db, 'users', uid, 'products', productId, 'coverages'),
    );
    const batch = writeBatch(this.db);
    for (const d of coverageDocs.docs) {
      batch.delete(d.ref);
    }
    batch.delete(doc(this.db, 'users', uid, 'products', productId));
    await batch.commit();
  }

  async addCoverage(uid: string, productId: string, draft: CoverageDraft): Promise<void> {
    await addDoc(
      collection(this.db, 'users', uid, 'products', productId, 'coverages'),
      coverageToDoc(draft),
    );
    await updateDoc(doc(this.db, 'users', uid, 'products', productId), {
      updatedAt: serverTimestamp(),
    });
    this.analytics.log('coverage_added', { product_id: productId });
  }

  async updateCoverage(uid: string, productId: string, coverage: Coverage): Promise<void> {
    const ref = doc(this.db, 'users', uid, 'products', productId, 'coverages', coverage.id);
    await updateDoc(ref, { ...coverageToDoc(coverage), updatedAt: serverTimestamp() });
  }

  async deleteCoverage(uid: string, productId: string, coverageId: string): Promise<void> {
    await deleteDoc(doc(this.db, 'users', uid, 'products', productId, 'coverages', coverageId));
    await updateDoc(doc(this.db, 'users', uid, 'products', productId), {
      updatedAt: serverTimestamp(),
    });
  }

  /** Removes all of a user's products (coverages included). For account deletion. */
  async deleteAllProducts(uid: string): Promise<void> {
    const productDocs = await getDocs(query(collection(this.db, 'users', uid, 'products')));
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
