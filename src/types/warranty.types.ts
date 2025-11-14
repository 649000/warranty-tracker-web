import { User } from './user.types';
import { UserProduct } from './user-product.types';
import { Company } from './company.types';

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
