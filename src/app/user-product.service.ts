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
  getUserProductsByProductId(productId: number): Observable<UserProduct[]> {
    return this.http.get<UserProduct[]>(`${this.baseUrl}/${this.endpoint}/product/${productId}`);
  }
}
