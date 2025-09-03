import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
})
export class WarrantyService extends BaseApiService<Warranty, number> {
  constructor(http: HttpClient) {
    super(http, 'http://localhost:8080/api', 'warranty');
  }

  // Get user's warranties by status
  getWarrantiesByStatus(status: string): Observable<Warranty[]> {
    return this.http.get<Warranty[]>(`${this.baseUrl}/${this.endpoint}/status/${status}`);
  }

  // Get user's expiring warranties
  getExpiringWarranties(days: number): Observable<Warranty[]> {
    return this.http.get<Warranty[]>(`${this.baseUrl}/${this.endpoint}/expiring?days=${days}`);
  }

  // --- Admin endpoints ---

  // Get all warranties (admin only)
  getAllWarranties(): Observable<Warranty[]> {
    return this.http.get<Warranty[]>(`${this.baseUrl}/${this.endpoint}/admin/all`);
  }

  // Get warranties by user ID (admin only)
  getWarrantiesByUserId(userId: number): Observable<Warranty[]> {
    return this.http.get<Warranty[]>(`${this.baseUrl}/${this.endpoint}/admin/user/${userId}`);
  }

  // Get warranties by company ID (admin only)
  getWarrantiesByCompanyId(companyId: number): Observable<Warranty[]> {
    return this.http.get<Warranty[]>(`${this.baseUrl}/${this.endpoint}/admin/company/${companyId}`);
  }

  // Get expired warranties (admin only)
  getExpiredWarranties(): Observable<Warranty[]> {
    return this.http.get<Warranty[]>(`${this.baseUrl}/${this.endpoint}/admin/expired`);
  }

  // Get expiring warranties by date range (admin only)
  getExpiringWarrantiesByDateRange(startDate: string, endDate: string): Observable<Warranty[]> {
    return this.http.get<Warranty[]>(`${this.baseUrl}/${this.endpoint}/admin/expiring?startDate=${startDate}&endDate=${endDate}`);
  }
}
