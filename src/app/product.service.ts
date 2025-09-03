import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  // Search products by name, brand, and model number
  searchProducts(name?: string, brand?: string, modelNumber?: string): Observable<Product[]> {
    let url = `${this.baseUrl}/${this.endpoint}/search?`;
    if (name) url += `name=${name}&`;
    if (brand) url += `brand=${brand}&`;
    if (modelNumber) url += `modelNumber=${modelNumber}&`;
    // Remove trailing '&' if present
    url = url.endsWith('&') ? url.slice(0, -1) : url;
    return this.http.get<Product[]>(url);
  }
}
