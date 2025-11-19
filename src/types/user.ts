import type { UserRole } from './enums';
import type { Address } from './common';

export interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  avatar?: string;
  role: UserRole;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  addresses: Address[];
  defaultAddressId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface LoginCredentials {
  email?: string;
  phone?: string;
  password: string;
}

export interface RegisterData {
  email: string;
  phone: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}
