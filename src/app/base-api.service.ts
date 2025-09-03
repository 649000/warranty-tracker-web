import { Injectable, signal, computed, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  // Method to fetch all entities
  getAll(): Observable<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}/${this.endpoint}`);
  }

  // Method to fetch a single entity by ID
  getById(id: ID): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${this.endpoint}/${id}`);
  }

  // Method to create a new entity
  create(entity: Omit<T, 'id'>): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${this.endpoint}`, entity);
  }

  // Method to update an existing entity
  update(entity: T & { id: ID }): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${this.endpoint}/${entity.id}`, entity);
  }

  // Method to delete an entity
  delete(id: ID): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${this.endpoint}/${id}`);
  }

  // Getter for the entities signal (read-only)
  get entities(): Signal<T[]> {
    return this._entities.asReadonly();
  }

  // Example method to load entities into the signal (to be called by subclasses)
  protected loadEntities(): void {
    this.getAll().subscribe({
      next: (entities) => this._entities.set(entities),
      error: (error) => console.error(`Error loading ${this.endpoint}:`, error)
    });
  }
}
