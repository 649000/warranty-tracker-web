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
  getClaimsByWarrantyId(warrantyId: number): Observable<Claim[]> {
    return this.http.get<Claim[]>(`${this.baseUrl}/${this.endpoint}/warranty/${warrantyId}`);
  }

  // Get user's claims by status
  getClaimsByStatus(status: string): Observable<Claim[]> {
    return this.http.get<Claim[]>(`${this.baseUrl}/${this.endpoint}/status/${status}`);
  }
}
