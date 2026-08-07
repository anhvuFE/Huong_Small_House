import apiClient from '../lib/http';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface FeedbackPayload {
  name?: string;
  email: string;
  message: string;
  orderId?: number;
  productId?: number;
}

export const feedbackApi = {
  // POST /feedback — công khai (optionalAuth): khách gửi liên hệ/góp ý.
  async submit(payload: FeedbackPayload): Promise<void> {
    await apiClient.post<ApiResponse<unknown>>('/feedback', payload);
  },
};

export default feedbackApi;
