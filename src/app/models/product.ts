import { UserProduct } from './user-product';

export interface Product {
  id: number;
  name: string;
  brand?: string;
  modelNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  userProducts?: UserProduct[];
}

export interface CreateProductRequest {
  name: string;
  brand?: string;
  modelNumber?: string;
}

export interface UpdateProductRequest {
  id: number;
  name?: string;
  brand?: string;
  modelNumber?: string;
}
