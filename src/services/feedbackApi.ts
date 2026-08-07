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

export type FeedbackStatus = 'open' | 'in_progress' | 'resolved';

export interface Feedback {
  id: string;
  name: string;
  email: string;
  message: string;
  status: FeedbackStatus;
  response?: string;
  createdAt?: string;
}

interface BackendFeedback {
  _id?: string;
  name?: string;
  email: string;
  message: string;
  status: FeedbackStatus;
  response?: string;
  createdAt?: string;
}

const toFeedback = (f: BackendFeedback): Feedback => ({
  id: f._id ?? '',
  name: f.name ?? 'Khách',
  email: f.email,
  message: f.message,
  status: f.status,
  response: f.response,
  createdAt: f.createdAt,
});

export const feedbackApi = {
  // POST /feedback — công khai (optionalAuth): khách gửi liên hệ/góp ý.
  async submit(payload: FeedbackPayload): Promise<void> {
    await apiClient.post<ApiResponse<unknown>>('/feedback', payload);
  },

  // GET /feedback — admin.
  async list(): Promise<Feedback[]> {
    const res = await apiClient.get<ApiResponse<BackendFeedback[]>>('/feedback');
    return res.data.data.map(toFeedback);
  },

  // PATCH /feedback/:id/status — admin.
  async updateStatus(id: string, status: FeedbackStatus): Promise<Feedback> {
    const res = await apiClient.patch<ApiResponse<BackendFeedback>>(`/feedback/${id}/status`, { status });
    return toFeedback(res.data.data);
  },

  // POST /feedback/:id/respond — admin.
  async respond(id: string, response: string): Promise<Feedback> {
    const res = await apiClient.post<ApiResponse<BackendFeedback>>(`/feedback/${id}/respond`, { response });
    return toFeedback(res.data.data);
  },
};

export default feedbackApi;
