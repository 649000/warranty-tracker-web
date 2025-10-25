import { Product } from './product';
import { User } from './user';
import { Warranty } from './warranty';

export interface UserProduct {
  id: number;
  serialNumber?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  purchaseLocation?: string;
  receiptNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  product?: Product;
  user?: User;
  warranties?: Warranty[];
}

export interface CreateUserProductRequest {
  serialNumber?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  purchaseLocation?: string;
  receiptNumber?: string;
  notes?: string;
  productId?: number;
  userId?: number;
}

export interface UpdateUserProductRequest {
  id: number;
  serialNumber?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  purchaseLocation?: string;
  receiptNumber?: string;
  notes?: string;
  productId?: number;
  userId?: number;
}
