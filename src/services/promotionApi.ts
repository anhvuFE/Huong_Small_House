import apiClient from '../lib/http';
import { useAuthStore } from '../store/useAuthStore';
import type { PromotionCode } from '../types/admin';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface BackendPromotion {
  _id?: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  validUntil: string;
  usageLimit?: number;
  usedCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePromotionPayload {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  validUntil: string;
  usageLimit?: number;
}

const toPromotion = (payload: BackendPromotion): PromotionCode => {
  const createdAt = payload.createdAt ? new Date(payload.createdAt) : new Date();
  const updatedAt = payload.updatedAt ? new Date(payload.updatedAt) : createdAt;
  const endDate = payload.validUntil ? new Date(payload.validUntil) : updatedAt;
  const type = payload.type === 'percent' ? 'PERCENTAGE' : 'FIXED_AMOUNT';
  const isActive = endDate > new Date();

  return {
    id: payload._id ?? payload.code,
    code: payload.code,
    name: payload.code,
    description: '',
    type,
    value: payload.value,
    minOrderValue: undefined,
    maxDiscount: undefined,
    usageLimit: payload.usageLimit,
    usedCount: payload.usedCount ?? 0,
    startDate: createdAt,
    endDate,
    isActive,
    applicableProducts: [],
    applicableCategories: [],
    createdAt,
    updatedAt,
  };
};

export const promotionApi = {
  async listPromotions(): Promise<PromotionCode[]> {
    const response = await apiClient.get<ApiResponse<BackendPromotion[]>>('/promotions');
    return response.data.data.map(toPromotion);
  },

  async validate(code: string): Promise<PromotionCode> {
    const response = await apiClient.get<ApiResponse<BackendPromotion>>(`/promotions/${code}`);
    return toPromotion(response.data.data);
  },

  async create(payload: CreatePromotionPayload): Promise<PromotionCode> {
    const { user } = useAuthStore.getState();
    if (user?.role !== 'ADMIN') {
      throw new Error('Chỉ admin mới có thể tạo khuyến mãi');
    }
    const response = await apiClient.post<ApiResponse<BackendPromotion>>('/promotions', payload);
    return toPromotion(response.data.data);
  },
};
