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
  id?: string;
  code: string;
  name?: string;
  description?: string;
  type: 'percent' | 'fixed';
  discountType?: 'PERCENT' | 'PERCENTAGE' | 'FIXED' | 'FIXED_AMOUNT';
  discountValue?: number;
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  startDate?: string;
  validFrom?: string;
  validUntil: string;
  endDate?: string;
  usageLimit?: number;
  usedCount?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePromotionPayload {
  name?: string;
  description?: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  validFrom?: string;
  validUntil: string;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
}

export interface UpdatePromotionPayload extends Partial<CreatePromotionPayload> {
  name?: string;
  description?: string;
  minOrderValue?: number;
  maxDiscount?: number;
  validFrom?: string;
  validUntil?: string;
}

interface UpdatePromotionStatusPayload {
  status?: 'ACTIVE' | 'INACTIVE' | 'active' | 'inactive' | boolean;
  isActive?: boolean;
}

const parseDate = (value?: string): Date | undefined => {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const toPromotion = (payload: BackendPromotion): PromotionCode => {
  const createdAt = parseDate(payload.createdAt) ?? new Date();
  const updatedAt = parseDate(payload.updatedAt) ?? createdAt;
  const startDate =
    parseDate(payload.startDate) ?? parseDate(payload.validFrom) ?? createdAt;
  const endDate =
    parseDate(payload.endDate) ?? parseDate(payload.validUntil) ?? updatedAt;

  const rawType = (payload.discountType ?? payload.type ?? 'PERCENT').toString().toUpperCase();
  const type: PromotionCode['type'] = rawType.includes('FIX') ? 'FIXED_AMOUNT' : 'PERCENTAGE';
  const value = payload.value ?? payload.discountValue ?? 0;

  const statusFromPayload =
    payload.isActive ?? (payload.status ? payload.status.toUpperCase() === 'ACTIVE' : undefined);
  const isActive = statusFromPayload ?? (endDate ? endDate > new Date() : true);

  return {
    id: payload._id ?? payload.id ?? payload.code,
    code: payload.code,
    name: payload.name ?? payload.code,
    description: payload.description ?? '',
    type,
    value,
    minOrderValue: payload.minOrderValue,
    maxDiscount: payload.maxDiscount,
    usageLimit: payload.usageLimit,
    usedCount: payload.usedCount ?? 0,
    startDate,
    endDate: endDate ?? updatedAt,
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
    const rawData = response.data.data as unknown;
    const items =
      Array.isArray(rawData)
        ? rawData
        : Array.isArray((rawData as { items?: BackendPromotion[] })?.items)
        ? (rawData as { items: BackendPromotion[] }).items
        : Array.isArray((rawData as { promotions?: BackendPromotion[] })?.promotions)
        ? (rawData as { promotions: BackendPromotion[] }).promotions
        : [];

    return items.map(toPromotion);
  },

  async validate(code: string): Promise<PromotionCode> {
    const response = await apiClient.get<ApiResponse<BackendPromotion>>(`/promotions/${code}`);
    return toPromotion(response.data.data);
  },

  async getById(id: string): Promise<PromotionCode> {
    const response = await apiClient.get<ApiResponse<BackendPromotion>>(`/promotions/id/${id}`);
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

  async update(id: string, payload: UpdatePromotionPayload): Promise<PromotionCode> {
    const { user } = useAuthStore.getState();
    if (user?.role !== 'ADMIN') {
      throw new Error('Chỉ admin mới có thể cập nhật khuyến mãi');
    }
    const response = await apiClient.patch<ApiResponse<BackendPromotion>>(
      `/promotions/id/${id}`,
      payload,
    );
    return toPromotion(response.data.data);
  },

  async updateStatus(id: string, isActive: boolean): Promise<PromotionCode> {
    const { user } = useAuthStore.getState();
    if (user?.role !== 'ADMIN') {
      throw new Error('Chỉ admin mới có thể cập nhật trạng thái khuyến mãi');
    }

    const statusPayload: UpdatePromotionStatusPayload = {
      status: isActive ? 'active' : 'inactive',
      isActive,
    };

    const response = await apiClient.patch<ApiResponse<BackendPromotion>>(
      `/promotions/${id}/status`,
      statusPayload,
    );

    return toPromotion(response.data.data);
  },

  async delete(id: string): Promise<void> {
    const { user } = useAuthStore.getState();
    if (user?.role !== 'ADMIN') {
      throw new Error('Chỉ admin mới có thể xóa khuyến mãi');
    }
    await apiClient.delete(`/promotions/id/${id}`);
  },
};
