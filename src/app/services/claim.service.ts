import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Claim, CreateClaimRequest, UpdateClaimRequest } from '../models/claim';

@Injectable({
  providedIn: 'root'
})
export class ClaimService {
  private apiUrl = `${environment.apiBaseUrl}/api/claim`;

  constructor(private http: HttpClient) {}

  getUserClaims(): Observable<Claim[]> {
    return this.http.get<Claim[]>(this.apiUrl);
  }

  getClaimById(id: number): Observable<Claim> {
    return this.http.get<Claim>(`${this.apiUrl}/${id}`);
  }

  getClaimsByWarrantyId(warrantyId: number): Observable<Claim[]> {
    return this.http.get<Claim[]>(`${this.apiUrl}/warranty/${warrantyId}`);
  }

  getClaimsByStatus(status: string): Observable<Claim[]> {
    return this.http.get<Claim[]>(`${this.apiUrl}/status/${status}`);
  }

  createClaim(claim: CreateClaimRequest): Observable<Claim> {
    return this.http.post<Claim>(this.apiUrl, claim);
  }

  updateClaim(id: number, claim: UpdateClaimRequest): Observable<Claim> {
    return this.http.put<Claim>(`${this.apiUrl}/${id}`, claim);
  }

  deleteClaim(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
