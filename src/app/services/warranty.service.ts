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
  getWarrantiesByStatus(status: string, includeAuth: boolean = true): Observable<Warranty[]> {
    return this.http.get<Warranty[]>(`${this.baseUrl}/${this.endpoint}/status/${status}`, { 
      headers: this.getHeaders(includeAuth) 
    });
  }

  // Get user's expiring warranties
  getExpiringWarranties(days: number, includeAuth: boolean = true): Observable<Warranty[]> {
    return this.http.get<Warranty[]>(`${this.baseUrl}/${this.endpoint}/expiring?days=${days}`, { 
      headers: this.getHeaders(includeAuth) 
    });
  }

  // --- Admin endpoints ---

  // Get all warranties (admin only)
  getAllWarranties(includeAuth: boolean = true): Observable<Warranty[]> {
    return this.http.get<Warranty[]>(`${this.baseUrl}/${this.endpoint}/admin/all`, { 
      headers: this.getHeaders(includeAuth) 
    });
  }

  // Get warranties by user ID (admin only)
  getWarrantiesByUserId(userId: number, includeAuth: boolean = true): Observable<Warranty[]> {
    return this.http.get<Warranty[]>(`${this.baseUrl}/${this.endpoint}/admin/user/${userId}`, { 
      headers: this.getHeaders(includeAuth) 
    });
  }

  // Get warranties by company ID (admin only)
  getWarrantiesByCompanyId(companyId: number, includeAuth: boolean = true): Observable<Warranty[]> {
    return this.http.get<Warranty[]>(`${this.baseUrl}/${this.endpoint}/admin/company/${companyId}`, { 
      headers: this.getHeaders(includeAuth) 
    });
  }

  // Get expired warranties (admin only)
  getExpiredWarranties(includeAuth: boolean = true): Observable<Warranty[]> {
    return this.http.get<Warranty[]>(`${this.baseUrl}/${this.endpoint}/admin/expired`, { 
      headers: this.getHeaders(includeAuth) 
    });
  }

  // Get expiring warranties by date range (admin only)
  getExpiringWarrantiesByDateRange(startDate: string, endDate: string, includeAuth: boolean = true): Observable<Warranty[]> {
    return this.http.get<Warranty[]>(`${this.baseUrl}/${this.endpoint}/admin/expiring?startDate=${startDate}&endDate=${endDate}`, { 
      headers: this.getHeaders(includeAuth) 
    });
  }
  
  // Override base methods to support token handling
  getAll(includeAuth: boolean = true): Observable<Warranty[]> {
    return super.getAll(includeAuth);
  }
  
  getById(id: number, includeAuth: boolean = true): Observable<Warranty> {
    return super.getById(id, includeAuth);
  }
  
  create(warranty: Omit<Warranty, 'id'>, includeAuth: boolean = true): Observable<Warranty> {
    return super.create(warranty, includeAuth);
  }
  
  update(warranty: Warranty, includeAuth: boolean = true): Observable<Warranty> {
    return super.update(warranty, includeAuth);
  }
  
  delete(id: number, includeAuth: boolean = true): Observable<void> {
    return super.delete(id, includeAuth);
  }
}
