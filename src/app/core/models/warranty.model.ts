export type CoverageSource = 'manufacturer' | 'retailer' | 'international' | 'other';
export type CoverageScope = 'local' | 'international';
export type ProofType = 'text' | 'image' | 'pdf';

export interface CoverageContact {
  hotline?: string;
  email?: string;
  url?: string;
}

export interface CoverageDuration {
  months?: number;
  lifetime?: boolean;
}

export interface Coverage {
  id: string;
  source: CoverageSource;
  scope: CoverageScope;
  duration: CoverageDuration;
  startDate: Date;
  expiryDate: Date | null;
  manualExpiry: boolean;
  contact?: CoverageContact;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProofOfPurchase {
  type: ProofType;
  text?: string;
  storagePath?: string;
  fileName?: string;
  contentType?: string;
}

export interface Price {
  amount: number;
  currency: string;
}

export interface Product {
  id: string;
  name: string;
  category?: string;
  brand?: string;
  serialNumber?: string;
  retailer?: string;
  purchaseDate: Date;
  price?: Price;
  proofOfPurchase?: ProofOfPurchase;
  ownerId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const DEFAULT_CURRENCY = 'SGD';
