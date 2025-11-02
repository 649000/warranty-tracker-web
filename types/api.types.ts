export interface User {
  id: number;
  firebaseUid: string;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  modelNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProduct {
  id: number;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  purchaseLocation: string;
  receiptNumber: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  product: Product;
  user: User;
}

export interface Warranty {
  id: number;
  startDate: string;
  endDate: string;
  warrantyPeriod: number;
  warrantyType: string;
  notes: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  user: User;
  userProduct: UserProduct;
  company: Company;
}

export interface Claim {
  id: number;
  referenceNumber: string;
  issueDescription: string;
  resolutionDetails: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
  warranty: Warranty;
}
