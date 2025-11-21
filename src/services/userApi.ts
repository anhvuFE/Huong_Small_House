import apiClient from '../lib/http';
import { useAuthStore } from '../store/useAuthStore';
import type { User } from '../types';
import { transformBackendUser, type BackendUser } from './authApi';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const userApi = {
  async listUsers(): Promise<User[]> {
    const { user } = useAuthStore.getState();
    if (user?.role !== 'ADMIN') {
      throw new Error('Bạn cần đăng nhập admin để xem danh sách người dùng.');
    }
    const response = await apiClient.get<ApiResponse<BackendUser[]>>('/users');
    return response.data.data.map(transformBackendUser);
  },
};
