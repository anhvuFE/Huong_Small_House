import apiClient from '../lib/http';
import type { CheckoutData, Order as CustomerOrder } from '../types';
import type { PaymentMethod as CustomerPaymentMethod } from '../types/enums';
import { useAuthStore } from '../store/useAuthStore';
import type { Address } from '../types/common';
import type {
  Order as AdminOrder,
  OrderStatus as AdminOrderStatus,
  PaymentMethod as AdminPaymentMethod,
  PaymentStatus,
} from '../types/admin';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface BackendOrderItem {
  id?: string;
  productId?: string | number;
  productName?: string;
  productImage?: string;
  price?: number;
  quantity?: number;
  subtotal?: number;
  product?: {
    id?: string;
    name?: string;
    thumbnail?: string;
    price?: number;
  };
}

interface BackendAddress {
  id?: string;
  userId?: string;
  receiverName?: string;
  phone?: string;
  province?: string;
  district?: string;
  ward?: string;
  street?: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface BackendOrder {
  _id?: string;
  id?: string;
  orderId?: number;
  orderNumber?: string;
  userId?: string;
  user?: {
    id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  };
  items?: BackendOrderItem[];
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  shippingAddress?: BackendAddress;
  billingAddress?: BackendAddress;
  notes?: string;
  subtotal?: number;
  shippingFee?: number;
  discount?: number;
  tax?: number;
  total?: number;
  couponCode?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

const parseDate = (value?: string | Date): Date => {
  const date = value instanceof Date ? value : value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const normalizeOrderStatus = (status?: string): AdminOrderStatus => {
  const normalized = status?.toUpperCase() as AdminOrderStatus | undefined;
  const allowed: AdminOrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'RETURNED'];
  return allowed.includes(normalized ?? 'PENDING') ? (normalized as AdminOrderStatus) : 'PENDING';
};

const normalizePaymentStatus = (status?: string): PaymentStatus => {
  const normalized = status?.toUpperCase() as PaymentStatus | undefined;
  const allowed: PaymentStatus[] = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];
  return allowed.includes(normalized ?? 'PENDING') ? (normalized as PaymentStatus) : 'PENDING';
};

const normalizeAdminPaymentMethod = (method?: string): AdminPaymentMethod => {
  const normalized = method?.toUpperCase() as AdminPaymentMethod | undefined;
  const allowed: AdminPaymentMethod[] = ['COD', 'BANK_TRANSFER', 'CARD', 'WALLET'];
  return allowed.includes(normalized ?? 'COD') ? (normalized as AdminPaymentMethod) : 'COD';
};

const normalizeCustomerPaymentMethod = (method?: string): CustomerPaymentMethod => {
  const normalized = method?.toUpperCase();
  if (normalized === 'CARD') return 'CREDIT_CARD';
  if (normalized === 'WALLET') return 'E_WALLET';
  const allowed: CustomerPaymentMethod[] = ['COD', 'BANK_TRANSFER', 'E_WALLET', 'CREDIT_CARD'];
  return (allowed.includes(normalized as CustomerPaymentMethod) ? normalized : 'COD') as CustomerPaymentMethod;
};

const toAddress = (payload?: BackendAddress, userId?: string): Address => {
  const createdAt = parseDate(payload?.createdAt);
  const updatedAt = parseDate(payload?.updatedAt ?? createdAt);
  return {
    id: payload?.id ?? 'address-unknown',
    userId: payload?.userId ?? userId ?? 'unknown',
    receiverName: payload?.receiverName ?? 'Khách hàng',
    phone: payload?.phone ?? '',
    province: payload?.province ?? '',
    district: payload?.district ?? '',
    ward: payload?.ward ?? '',
    street: payload?.street ?? '',
    isDefault: payload?.isDefault ?? true,
    createdAt,
    updatedAt,
  };
};

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

const isBrowser = typeof window !== 'undefined';
const ORDER_RATE_LIMIT_KEY = 'hs_order_rate_limit_until';

const getOrderRateLimitUntil = (): number => {
  if (!isBrowser) return 0;
  const raw = window.localStorage.getItem(ORDER_RATE_LIMIT_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
};

const setOrderRateLimitUntil = (timestamp: number): void => {
  if (isBrowser) {
    window.localStorage.setItem(ORDER_RATE_LIMIT_KEY, String(timestamp));
  }
};

const toAdminOrder = (payload: BackendOrder): AdminOrder => {
  const createdAt = parseDate(payload.createdAt);
  const updatedAt = parseDate(payload.updatedAt ?? createdAt);
  const orderId = payload.id ?? payload._id ?? String(payload.orderId ?? payload.orderNumber ?? generateId('order'));
  const subtotal = payload.subtotal ?? payload.items?.reduce((sum, item) => sum + (item.subtotal ?? (item.price ?? 0) * (item.quantity ?? 0)), 0) ?? 0;
  const total = payload.total ?? subtotal + (payload.shippingFee ?? 0) - (payload.discount ?? 0) + (payload.tax ?? 0);

  return {
    id: orderId,
    orderNumber: payload.orderNumber ?? `ORD-${orderId}`,
    userId: payload.userId ?? payload.user?.id ?? 'unknown',
    user: {
      id: payload.user?.id ?? payload.userId ?? 'unknown',
      fullName: payload.user?.fullName ?? 'Khách hàng',
      email: payload.user?.email ?? 'unknown@email.com',
      phone: payload.user?.phone ?? '',
    },
    items: (payload.items ?? []).map((item, index) => ({
      id: item.id ?? `${orderId}-item-${index + 1}`,
      productId: item.productId?.toString() ?? item.product?.id ?? `product-${index + 1}`,
      product: {
        id: item.product?.id ?? item.productId?.toString() ?? `product-${index + 1}`,
        name: item.product?.name ?? item.productName ?? 'Sản phẩm',
        thumbnail: item.product?.thumbnail ?? item.productImage ?? 'https://placehold.co/64x64?text=Item',
        price: item.product?.price ?? item.price ?? 0,
      },
      quantity: item.quantity ?? 1,
      price: item.price ?? item.product?.price ?? 0,
      total: item.subtotal ?? (item.price ?? 0) * (item.quantity ?? 0),
    })),
    status: normalizeOrderStatus(payload.status),
    paymentMethod: normalizeAdminPaymentMethod(payload.paymentMethod),
    paymentStatus: normalizePaymentStatus(payload.paymentStatus),
    shippingAddress: toAddress(payload.shippingAddress, payload.userId),
    notes: payload.notes,
    subtotal,
    shippingFee: payload.shippingFee ?? 0,
    discount: payload.discount ?? 0,
    total,
    couponCode: payload.couponCode,
    trackingNumber: payload.trackingNumber,
    createdAt,
    updatedAt,
  };
};

const toCustomerOrder = (payload: BackendOrder): CustomerOrder => {
  const createdAt = parseDate(payload.createdAt);
  const updatedAt = parseDate(payload.updatedAt ?? createdAt);
  const orderId = payload.id ?? payload._id ?? String(payload.orderId ?? payload.orderNumber ?? generateId('order'));
  const items = (payload.items ?? []).map((item, index) => ({
    productId: item.productId?.toString() ?? item.product?.id ?? `product-${index + 1}`,
    productName: item.product?.name ?? item.productName ?? 'Sản phẩm',
    productImage: item.product?.thumbnail ?? item.productImage ?? 'https://placehold.co/64x64?text=Item',
    price: item.price ?? item.product?.price ?? 0,
    quantity: item.quantity ?? 1,
    subtotal: item.subtotal ?? (item.price ?? 0) * (item.quantity ?? 0),
  }));
  const subtotal = payload.subtotal ?? items.reduce((sum, item) => sum + item.subtotal, 0);
  const total = payload.total ?? subtotal + (payload.shippingFee ?? 0) - (payload.discount ?? 0) + (payload.tax ?? 0);

  return {
    id: orderId,
    userId: payload.userId ?? payload.user?.id ?? 'unknown',
    orderNumber: payload.orderNumber ?? `ORD-${orderId}`,
    items,
    shippingAddress: toAddress(payload.shippingAddress, payload.userId),
    billingAddress: payload.billingAddress ? toAddress(payload.billingAddress, payload.userId) : undefined,
    paymentMethod: normalizeCustomerPaymentMethod(payload.paymentMethod),
    status: normalizeOrderStatus(payload.status),
    subtotal,
    shippingFee: payload.shippingFee ?? 0,
    discount: payload.discount ?? 0,
    tax: payload.tax ?? 0,
    total,
    couponCode: payload.couponCode,
    note: payload.notes,
    trackingNumber: payload.trackingNumber,
    estimatedDelivery: payload.estimatedDelivery ? parseDate(payload.estimatedDelivery) : undefined,
    deliveredAt: payload.deliveredAt ? parseDate(payload.deliveredAt) : undefined,
    cancelledAt: payload.cancelledAt ? parseDate(payload.cancelledAt) : undefined,
    cancelReason: payload.cancelReason,
    createdAt,
    updatedAt,
  };
};

export const orderApi = {
  _rateLimitedUntil: getOrderRateLimitUntil(),

  _ensureNotRateLimited() {
    const now = Date.now();
    if (this._rateLimitedUntil > now) {
      throw new Error('Server giới hạn số lần gọi. Vui lòng thử lại sau ít phút.');
    }
  },

  async listCustomerOrders(): Promise<CustomerOrder[]> {
    const response = await apiClient.get<ApiResponse<BackendOrder[]>>('/orders/me');
    return response.data.data.map(toCustomerOrder);
  },

  async getCustomerOrder(orderId: string): Promise<CustomerOrder> {
    const response = await apiClient.get<ApiResponse<BackendOrder>>(`/orders/${orderId}`);
    return toCustomerOrder(response.data.data);
  },

  async listAdminOrders(): Promise<AdminOrder[]> {
    const { accessToken, user } = useAuthStore.getState();
    if (!accessToken || user?.role !== 'ADMIN') {
      throw new Error('Bạn cần đăng nhập admin để xem danh sách đơn hàng.');
    }
    orderApi._ensureNotRateLimited();

    // Backend swagger: /orders is admin list, /orders/{id} for detail.
    const endpoints = ['/orders'];
    let lastError: unknown;

    for (const endpoint of endpoints) {
      try {
        const response = await apiClient.get<ApiResponse<BackendOrder[]>>(endpoint);
        return response.data.data.map(toAdminOrder);
      } catch (error) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

        if (status === 401) {
          useAuthStore.getState().logout();
          throw new Error(message || 'Token không hợp lệ, vui lòng đăng nhập lại (admin).');
        }
        if (status === 429) {
          orderApi._rateLimitedUntil = Date.now() + 60_000;
          setOrderRateLimitUntil(orderApi._rateLimitedUntil);
          throw new Error(message || 'Server giới hạn số lần gọi. Vui lòng thử lại sau ít phút.');
        }

        lastError = error;
        if (status && status !== 404) {
          break;
        }
      }
    }

    throw lastError ?? new Error('Không thể tải danh sách đơn hàng');
  },

  async getAdminOrder(orderId: string): Promise<AdminOrder> {
    const response = await apiClient.get<ApiResponse<BackendOrder>>(`/orders/${orderId}`);
    return toAdminOrder(response.data.data);
  },

  async updateAdminOrderStatus(orderId: string, status: AdminOrderStatus, paymentStatus?: PaymentStatus): Promise<AdminOrder> {
    const response = await apiClient.patch<ApiResponse<BackendOrder>>(`/orders/${orderId}/status`, {
      status,
      paymentStatus,
    });
    return toAdminOrder(response.data.data);
  },

  async createCustomerOrder(payload: CheckoutData): Promise<CustomerOrder> {
    const response = await apiClient.post<ApiResponse<BackendOrder>>('/orders', payload);
    return toCustomerOrder(response.data.data);
  },

  // Đặt hàng thật: POST /orders. Trả checkoutUrl nếu thanh toán Sepay.
  async placeOrder(payload: {
    email: string;
    items: { productId: number; quantity: number }[];
    paymentMethod: 'COD' | 'Sepay' | 'Bank';
    note?: string;
    promotionCode?: string;
    guest?: { name: string; phone: string; email: string; address: string };
  }): Promise<{ order: CustomerOrder | null; checkoutUrl?: string }> {
    const response = await apiClient.post<ApiResponse<{ order: BackendOrder; checkoutUrl?: string }>>(
      '/orders',
      payload,
    );
    const data = response.data.data;
    return {
      order: data?.order ? toCustomerOrder(data.order) : null,
      checkoutUrl: data?.checkoutUrl,
    };
  },

  // Tạo lại phiên thanh toán Sepay cho đơn đã có.
  async paySepay(orderId: number): Promise<string | undefined> {
    const response = await apiClient.post<ApiResponse<{ checkoutUrl?: string }>>(
      `/orders/${orderId}/payment/sepay`,
    );
    return response.data.data?.checkoutUrl;
  },
};
