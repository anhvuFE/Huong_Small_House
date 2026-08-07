import type { UserRole } from './enums';
import type { Address } from './common';

export interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  avatar?: string;
  role: UserRole;
  status?: 'active' | 'locked';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  addresses: Address[];
  address?: string;
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
  name: string;
  email: string;
  phone?: string;
  password: string;
  address?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
