import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Warranty, CreateWarrantyRequest, UpdateWarrantyRequest } from '../models/warranty';

@Injectable({
  providedIn: 'root'
})
export class WarrantyService {
  private apiUrl = `${environment.apiBaseUrl}/api/warranty`;

  constructor(private http: HttpClient) {}

  getUserWarranties(): Observable<Warranty[]> {
    return this.http.get<Warranty[]>(this.apiUrl);
  }

  getWarrantyById(id: number): Observable<Warranty> {
    return this.http.get<Warranty>(`${this.apiUrl}/${id}`);
  }

  getWarrantiesByStatus(status: string): Observable<Warranty[]> {
    return this.http.get<Warranty[]>(`${this.apiUrl}/status/${status}`);
  }

  getExpiringWarranties(days: number): Observable<Warranty[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<Warranty[]>(`${this.apiUrl}/expiring`, { params });
  }

  createWarranty(warranty: CreateWarrantyRequest): Observable<Warranty> {
    return this.http.post<Warranty>(this.apiUrl, warranty);
  }

  updateWarranty(id: number, warranty: UpdateWarrantyRequest): Observable<Warranty> {
    return this.http.put<Warranty>(`${this.apiUrl}/${id}`, warranty);
  }

  deleteWarranty(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
