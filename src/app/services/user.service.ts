import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

// Define the User interface based on your API response
export interface User {
  id: number; // Or string
  username: string;
  email: string;
  // Add other properties as needed
}

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseApiService<User, number> {
  constructor(http: HttpClient) {
    super(http, 'http://localhost:8080/api', 'user');
  }

  // Create user (POST /api/user)
  createUser(user: Omit<User, 'id'>, includeAuth: boolean = true): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/${this.endpoint}`, user, { 
      headers: this.getHeaders(includeAuth) 
    });
  }

  // Update user (PUT /api/user)
  updateUser(user: User, includeAuth: boolean = true): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${this.endpoint}`, user, { 
      headers: this.getHeaders(includeAuth) 
    });
  }
  
  // Override base methods to support token handling
  getAll(includeAuth: boolean = true): Observable<User[]> {
    return super.getAll(includeAuth);
  }
  
  getById(id: number, includeAuth: boolean = true): Observable<User> {
    return super.getById(id, includeAuth);
  }
  
  create(user: Omit<User, 'id'>, includeAuth: boolean = true): Observable<User> {
    return super.create(user, includeAuth);
  }
  
  update(user: User, includeAuth: boolean = true): Observable<User> {
    return super.update(user, includeAuth);
  }
  
  delete(id: number, includeAuth: boolean = true): Observable<void> {
    return super.delete(id, includeAuth);
  }
}
