import apiClient from '../lib/http';
import type { Address, User, UserRole } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface MessageResponse {
  success: boolean;
  message: string;
}

export interface BackendUser {
  _id?: string;
  id?: string;
  userId?: number;
  name?: string;
  email: string;
  phone?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  avatar?: string;
  address?: string;
}

interface AuthApiResponse {
  user: BackendUser;
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  password: string;
}

export interface AuthSuccess {
  user: User;
  accessToken: string;
  refreshToken: string;
}

const parseDate = (value?: string | Date): Date | undefined => {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const normalizeRole = (role?: string): UserRole => {
  return role?.toLowerCase() === 'admin' ? 'ADMIN' : 'CUSTOMER';
};

export const transformBackendUser = (payload: BackendUser): User => {
  const createdAt = parseDate(payload.createdAt) ?? new Date();
  const updatedAt = parseDate(payload.updatedAt) ?? createdAt;
  const normalizedId = payload.id ?? payload._id ?? String(payload.userId ?? payload.email);

  const addresses: Address[] = payload.address
    ? [
        {
          id: 'primary',
          userId: normalizedId,
          receiverName: payload.name ?? payload.email ?? 'Khách hàng',
          phone: payload.phone ?? '',
          province: '',
          district: '',
          ward: '',
          street: payload.address,
          isDefault: true,
          createdAt,
          updatedAt,
        },
      ]
    : [];

  return {
    id: normalizedId,
    email: payload.email,
    phone: payload.phone ?? '',
    fullName: payload.name ?? payload.email ?? 'Người dùng',
    avatar: payload.avatar,
    role: normalizeRole(payload.role),
    isEmailVerified: true,
    isPhoneVerified: Boolean(payload.phone),
    addresses,
    address: payload.address ?? addresses[0]?.street,
    defaultAddressId: addresses[0]?.id,
    createdAt,
    updatedAt,
    lastLogin: parseDate(payload.lastLogin),
  };
};

const transformAuthResponse = (payload: AuthApiResponse): AuthSuccess => ({
  user: transformBackendUser(payload.user),
  accessToken: payload.accessToken,
  refreshToken: payload.refreshToken,
});

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthSuccess> {
    const response = await apiClient.post<ApiResponse<AuthApiResponse>>('/auth/login', payload);
    return transformAuthResponse(response.data.data);
  },

  async register(payload: RegisterPayload): Promise<AuthSuccess> {
    const response = await apiClient.post<ApiResponse<AuthApiResponse>>('/auth/register', payload);
    return transformAuthResponse(response.data.data);
  },

  async refresh(refreshToken: string): Promise<string> {
    const response = await apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', {
      refreshToken,
    });
    return response.data.data.accessToken;
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<string> {
    const response = await apiClient.post<MessageResponse>('/auth/forgot-password', payload);
    return response.data.message;
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<string> {
    const response = await apiClient.post<MessageResponse>('/auth/reset-password', payload);
    return response.data.message;
  },
};
