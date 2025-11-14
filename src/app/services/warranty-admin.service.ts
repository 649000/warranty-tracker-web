import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Warranty } from '../models/warranty';

@Injectable({
  providedIn: 'root'
})
export class WarrantyAdminService {
  private apiUrl = `${environment.apiBaseUrl}/api/warranty/admin`;

  constructor(private http: HttpClient) {}

  getAllWarranties(): Observable<Warranty[]> {
    return this.http.get<Warranty[]>(`${this.apiUrl}/all`);
  }

  getWarrantiesByUserId(userId: number): Observable<Warranty[]> {
    return this.http.get<Warranty[]>(`${this.apiUrl}/user/${userId}`);
  }

  getWarrantiesByCompanyId(companyId: number): Observable<Warranty[]> {
    return this.http.get<Warranty[]>(`${this.apiUrl}/company/${companyId}`);
  }

  getExpiredWarranties(): Observable<Warranty[]> {
    return this.http.get<Warranty[]>(`${this.apiUrl}/expired`);
  }

  getExpiringWarranties(startDate: string, endDate: string): Observable<Warranty[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<Warranty[]>(`${this.apiUrl}/expiring`, { params });
  }
}
