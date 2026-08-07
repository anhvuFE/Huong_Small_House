import apiClient from '../lib/http';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface BackendReview {
  _id?: string;
  rating: number;
  comment?: string;
  user?: { name?: string } | string;
  createdAt?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  author: string;
  createdAt?: string;
}

const toReview = (r: BackendReview): Review => ({
  id: r._id ?? Math.random().toString(36).slice(2),
  rating: r.rating,
  comment: r.comment,
  author: typeof r.user === 'object' && r.user?.name ? r.user.name : 'Khách hàng',
  createdAt: r.createdAt,
});

export const reviewApi = {
  // GET /reviews/:productId — công khai.
  async list(productId: number): Promise<Review[]> {
    const res = await apiClient.get<ApiResponse<BackendReview[]>>(`/reviews/${productId}`);
    return res.data.data.map(toReview);
  },

  // POST /reviews — cần đăng nhập.
  async create(payload: { productId: number; rating: number; comment?: string }): Promise<void> {
    await apiClient.post<ApiResponse<BackendReview>>('/reviews', payload);
  },
};

export default reviewApi;
