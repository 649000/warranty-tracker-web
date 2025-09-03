import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

// Define the Company interface based on your API response
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
  searchCompanies(name: string, includeAuth: boolean = true): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/${this.endpoint}/search?name=${name}`, { 
      headers: this.getHeaders(includeAuth) 
    });
  }
  
  // Override methods that require authentication
  getAll(includeAuth: boolean = true): Observable<Company[]> {
    return super.getAll(includeAuth);
  }
  
  getById(id: number, includeAuth: boolean = true): Observable<Company> {
    return super.getById(id, includeAuth);
  }
  
  create(company: Omit<Company, 'id'>, includeAuth: boolean = true): Observable<Company> {
    return super.create(company, includeAuth);
  }
  
  update(company: Company, includeAuth: boolean = true): Observable<Company> {
    return super.update(company, includeAuth);
  }
  
  delete(id: number, includeAuth: boolean = true): Observable<void> {
    return super.delete(id, includeAuth);
  }
}
