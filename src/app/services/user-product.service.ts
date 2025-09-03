import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

// Define the UserProduct interface based on your API response
// This might represent a many-to-many relationship between Users and Products
export interface UserProduct {
  id: number; // Or string
  userId: number;
  productId: number;
  purchaseDate?: string; // ISO date string
  // Add other properties as needed
}

@Injectable({
  providedIn: 'root'
})
export class UserProductService extends BaseApiService<UserProduct, number> {
  constructor(http: HttpClient) {
    super(http, 'http://localhost:8080/api', 'user-product');
  }

  // Get user's products by product ID
  getUserProductsByProductId(productId: number, includeAuth: boolean = true): Observable<UserProduct[]> {
    return this.http.get<UserProduct[]>(`${this.baseUrl}/${this.endpoint}/product/${productId}`, { 
      headers: this.getHeaders(includeAuth) 
    });
  }
  
  // Override base methods to support token handling
  getAll(includeAuth: boolean = true): Observable<UserProduct[]> {
    return super.getAll(includeAuth);
  }
  
  getById(id: number, includeAuth: boolean = true): Observable<UserProduct> {
    return super.getById(id, includeAuth);
  }
  
  create(userProduct: Omit<UserProduct, 'id'>, includeAuth: boolean = true): Observable<UserProduct> {
    return super.create(userProduct, includeAuth);
  }
  
  update(userProduct: UserProduct, includeAuth: boolean = true): Observable<UserProduct> {
    return super.update(userProduct, includeAuth);
  }
  
  delete(id: number, includeAuth: boolean = true): Observable<void> {
    return super.delete(id, includeAuth);
  }
}
