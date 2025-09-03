import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiService } from './base-api.service';

// Define the Warranty interface based on your API response
export interface Warranty {
  id: number; // Or string
  productId: number; // Reference to Product
  userId: number;    // Reference to User
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  // Add other properties as needed
}

@Injectable({
  providedIn: 'root'
}
)
export class WarrantyService extends BaseApiService<Warranty, number> {
  constructor(http: HttpClient) {
    super(http, 'http://localhost:8080/api', 'warranty');
  }

  // Add warranty-specific methods here if needed
}
