import { Injectable, signal, computed, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define a basic Company interface based on your API response
// Adjust this interface according to the actual structure of your company data
export interface Company {
  id: number; // Or string, depending on your API
  name: string;
  // Add other properties as needed, e.g., address, contactInfo, etc.
}

@Injectable({
  providedIn: 'root' // This makes the service a singleton
})
export class CompanyService {
  private readonly baseUrl = 'http://localhost:8080/api'; // Base URL for your API

  // Example signal for storing a list of companies (initially empty)
  private readonly _companies = signal<Company[]>([]);
  // Computed signal or derived state based on _companies (example: company count)
  readonly companyCount = computed(() => this._companies().length);

  constructor(private readonly http: HttpClient) {}

  // Method to fetch companies from the API
  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/company`);
  }

  // Method to fetch a single company by ID
  getCompany(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.baseUrl}/company/${id}`);
  }

  // Method to create a new company
  createCompany(company: Omit<Company, 'id'>): Observable<Company> {
    return this.http.post<Company>(`${this.baseUrl}/company`, company);
  }

  // Method to update an existing company
  updateCompany(company: Company): Observable<Company> {
    return this.http.put<Company>(`${this.baseUrl}/company/${company.id}`, company);
  }

  // Method to delete a company
  deleteCompany(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/company/${id}`);
  }

  // Getter for the companies signal (read-only)
  get companies(): Signal<Company[]> {
    return this._companies.asReadonly();
  }

  // Example method to load companies into the signal (you'd call this after fetching)
  // loadCompanies(): void {
  //   this.getCompanies().subscribe({
  //     next: (companies) => this._companies.set(companies),
  //     error: (error) => console.error('Error loading companies:', error)
  //   });
  // }
}
