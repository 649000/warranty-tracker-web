import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserProduct, CreateUserProductRequest, UpdateUserProductRequest } from '../models/user-product';

@Injectable({
  providedIn: 'root'
})
export class UserProductService {
  private apiUrl = `${environment.apiBaseUrl}/api/user-product`;

  constructor(private http: HttpClient) {}

  getUserProducts(): Observable<UserProduct[]> {
    return this.http.get<UserProduct[]>(this.apiUrl);
  }

  getUserProductById(id: number): Observable<UserProduct> {
    return this.http.get<UserProduct>(`${this.apiUrl}/${id}`);
  }

  getUserProductsByProductId(productId: number): Observable<UserProduct[]> {
    return this.http.get<UserProduct[]>(`${this.apiUrl}/product/${productId}`);
  }

  createUserProduct(userProduct: CreateUserProductRequest): Observable<UserProduct> {
    return this.http.post<UserProduct>(this.apiUrl, userProduct);
  }

  updateUserProduct(id: number, userProduct: UpdateUserProductRequest): Observable<UserProduct> {
    return this.http.put<UserProduct>(`${this.apiUrl}/${id}`, userProduct);
  }

  deleteUserProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
