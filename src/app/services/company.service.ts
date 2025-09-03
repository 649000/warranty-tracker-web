import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

// Define the Company interface based on your API response
// Adjust this interface according to the actual structure of your company data
export interface Company {
  id: number; // Or string, depending on your API
  name: string;
  // Add other properties as needed, e.g., address, contactInfo, etc.
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService extends BaseApiService<Company, number> {
  constructor(http: HttpClient) {
    // Call the parent constructor with the base URL and endpoint
    super(http, 'http://localhost:8080/api', 'company');
  }

  // Search companies by name
  searchCompanies(name: string): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/${this.endpoint}/search?name=${name}`);
  }
}
