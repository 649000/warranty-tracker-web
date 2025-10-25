import { UserProduct } from './user-product';

export interface User {
  id: number;
  firebaseUid: string;
  email: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
  userProducts?: UserProduct[];
}

export interface CreateUserRequest {
  firebaseUid: string;
  email: string;
  displayName: string;
}

export interface UpdateUserRequest {
  id: number;
  firebaseUid?: string;
  email?: string;
  displayName?: string;
}
