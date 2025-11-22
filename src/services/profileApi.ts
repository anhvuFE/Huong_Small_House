import apiClient from '../lib/http';
import type { User } from '../types';
import type { BackendUser } from './authApi';
import { transformBackendUser } from './authApi';
import { useAuthStore } from '../store/useAuthStore';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  address?: string;
}

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const profileApi = {
  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<BackendUser | null>>('/profile');
    const backendUser = response.data?.data;

    if (backendUser) {
      return transformBackendUser(backendUser);
    }

    // Fallback: keep using current user in store to avoid breaking UI when API returns null
    const existingUser = useAuthStore.getState().user;
    if (existingUser) {
      return existingUser;
    }

    throw new Error('Dữ liệu hồ sơ trống');
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const response = await apiClient.put<ApiResponse<BackendUser>>('/profile', {
      name: payload.fullName,
      phone: payload.phone,
      address: payload.address,
    });
    return transformBackendUser(response.data.data);
  },

  async changePassword(payload: ChangePasswordPayload): Promise<string> {
    const response = await apiClient.put<ApiResponse<{ message: string }>>('/profile/password', payload);
    return response.data.data.message;
  },
};
