import { Product } from './product.types';
import { User } from './user.types';

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
