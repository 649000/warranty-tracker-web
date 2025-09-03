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
  searchProducts(name?: string, brand?: string, modelNumber?: string, includeAuth: boolean = true): Observable<Product[]> {
    let url = `${this.baseUrl}/${this.endpoint}/search?`;
    if (name) url += `name=${name}&`;
    if (brand) url += `brand=${brand}&`;
    if (modelNumber) url += `modelNumber=${modelNumber}&`;
    // Remove trailing '&' if present
    url = url.endsWith('&') ? url.slice(0, -1) : url;
    return this.http.get<Product[]>(url, { headers: this.getHeaders(includeAuth) });
  }
  
  // Override methods to support token handling
  getAll(includeAuth: boolean = true): Observable<Product[]> {
    return super.getAll(includeAuth);
  }
  
  getById(id: number, includeAuth: boolean = true): Observable<Product> {
    return super.getById(id, includeAuth);
  }
  
  create(product: Omit<Product, 'id'>, includeAuth: boolean = true): Observable<Product> {
    return super.create(product, includeAuth);
  }
  
  update(product: Product, includeAuth: boolean = true): Observable<Product> {
    return super.update(product, includeAuth);
  }
  
  delete(id: number, includeAuth: boolean = true): Observable<void> {
    return super.delete(id, includeAuth);
  }
}
