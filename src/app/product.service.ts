import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiService } from './base-api.service';

// Define the Product interface based on your API response
export interface Product {
  id: number; // Or string
  name: string;
  description?: string;
  // Add other properties as needed
}

@Injectable({
  providedIn: 'root'
})
export class ProductService extends BaseApiService<Product, number> {
  constructor(http: HttpClient) {
    super(http, 'http://localhost:8080/api', 'product');
  }

  // Add product-specific methods here if needed
}
