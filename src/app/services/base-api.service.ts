import { Injectable, signal, computed, Signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';

/**
 * A generic base service for handling common CRUD operations.
 * T represents the entity type.
 * ID represents the type of the entity's identifier (e.g., number, string).
 */
@Injectable({
  providedIn: 'root'
})
export class BaseApiService<T, ID> {
  protected readonly baseUrl: string;
  protected readonly endpoint: string;
  
  // Inject TokenService to access token
  protected readonly tokenService = inject(TokenService);

  // Generic signal for storing a list of entities
  private readonly _entities = signal<T[]>([]);
  // Computed signal for the count of entities
  readonly entityCount = computed(() => this._entities().length);

  constructor(
    http: HttpClient,
    baseUrl: string,
    endpoint: string
  ) {
    this.http = http;
    this.baseUrl = baseUrl;
    this.endpoint = endpoint;
  }

  // Expose HttpClient instance for use in subclasses
  protected readonly http: HttpClient;

  // Helper method to create headers with auth token if available
  protected getHeaders(includeAuth: boolean = true): HttpHeaders {
    let headers = new HttpHeaders();
    
    if (includeAuth) {
      const token = this.tokenService.token();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    
    return headers;
  }

  // Method to fetch all entities
  getAll(includeAuth: boolean = true): Observable<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}/${this.endpoint}`, { headers: this.getHeaders(includeAuth) });
  }

  // Method to fetch a single entity by ID
  getById(id: ID, includeAuth: boolean = true): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${this.endpoint}/${id}`, { headers: this.getHeaders(includeAuth) });
  }

  // Method to create a new entity
  create(entity: Omit<T, 'id'>, includeAuth: boolean = true): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${this.endpoint}`, entity, { headers: this.getHeaders(includeAuth) });
  }

  // Method to update an existing entity
  update(entity: T & { id: ID }, includeAuth: boolean = true): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${this.endpoint}/${entity.id}`, entity, { headers: this.getHeaders(includeAuth) });
  }

  // Method to delete an entity
  delete(id: ID, includeAuth: boolean = true): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${this.endpoint}/${id}`, { headers: this.getHeaders(includeAuth) });
  }

  // Getter for the entities signal (read-only)
  get entities(): Signal<T[]> {
    return this._entities.asReadonly();
  }

  // Example method to load entities into the signal (to be called by subclasses)
  protected loadEntities(includeAuth: boolean = true): void {
    this.getAll(includeAuth).subscribe({
      next: (entities) => this._entities.set(entities),
      error: (error) => console.error(`Error loading ${this.endpoint}:`, error)
    });
  }
}
