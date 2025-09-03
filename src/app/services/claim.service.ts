import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

// Define the Claim interface based on your API response
export interface Claim {
  id: number; // Or string
  warrantyId: number; // Reference to Warranty
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED'; // Example status enum
  // Add other properties as needed
}

@Injectable({
  providedIn: 'root'
})
export class ClaimService extends BaseApiService<Claim, number> {
  constructor(http: HttpClient) {
    super(http, 'http://localhost:8080/api', 'claim');
  }

  // Get claims by warranty ID
  getClaimsByWarrantyId(warrantyId: number, includeAuth: boolean = true): Observable<Claim[]> {
    return this.http.get<Claim[]>(`${this.baseUrl}/${this.endpoint}/warranty/${warrantyId}`, { 
      headers: this.getHeaders(includeAuth) 
    });
  }

  // Get user's claims by status
  getClaimsByStatus(status: string, includeAuth: boolean = true): Observable<Claim[]> {
    return this.http.get<Claim[]>(`${this.baseUrl}/${this.endpoint}/status/${status}`, { 
      headers: this.getHeaders(includeAuth) 
    });
  }
  
  // Override base methods to support token handling
  getAll(includeAuth: boolean = true): Observable<Claim[]> {
    return super.getAll(includeAuth);
  }
  
  getById(id: number, includeAuth: boolean = true): Observable<Claim> {
    return super.getById(id, includeAuth);
  }
  
  create(claim: Omit<Claim, 'id'>, includeAuth: boolean = true): Observable<Claim> {
    return super.create(claim, includeAuth);
  }
  
  update(claim: Claim, includeAuth: boolean = true): Observable<Claim> {
    return super.update(claim, includeAuth);
  }
  
  delete(id: number, includeAuth: boolean = true): Observable<void> {
    return super.delete(id, includeAuth);
  }
}
