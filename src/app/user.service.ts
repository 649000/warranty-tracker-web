import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  // Add user-specific methods here if needed
}
