import { User } from './user';
import { Company } from './company';
import { UserProduct } from './user-product';
import { Claim } from './claim';

export interface Warranty {
  id: number;
  startDate: Date;
  endDate: Date;
  warrantyPeriod?: number;
  warrantyType?: string;
  notes?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  company?: Company;
  userProduct?: UserProduct;
  claims?: Claim[];
}

export interface CreateWarrantyRequest {
  startDate: Date;
  endDate: Date;
  warrantyPeriod?: number;
  warrantyType?: string;
  notes?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  userId?: number;
  companyId?: number;
  userProductId?: number;
}

export interface UpdateWarrantyRequest {
  id: number;
  startDate?: Date;
  endDate?: Date;
  warrantyPeriod?: number;
  warrantyType?: string;
  notes?: string;
  status?: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  userId?: number;
  companyId?: number;
  userProductId?: number;
}
