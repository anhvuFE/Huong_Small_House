import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true, // gửi kèm cookie refreshToken
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const newAccessToken = response.headers?.['x-access-token'] as string | undefined;
    if (newAccessToken) {
      // Lưu lại access token mới khi backend tự refresh bằng cookie refreshToken
      useAuthStore.getState().setTokens({ accessToken: newAccessToken, refreshToken: useAuthStore.getState().refreshToken });
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default apiClient;
