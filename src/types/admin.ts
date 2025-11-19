export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  avatar?: string;
  permissions: AdminPermission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminPermission {
  module: AdminModule;
  actions: AdminAction[];
}

export type AdminModule =
  | 'PRODUCTS'
  | 'ORDERS'
  | 'USERS'
  | 'PROMOTIONS'
  | 'REPORTS'
  | 'SETTINGS'
  | 'CONTENT';

export type AdminAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  notes?: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    thumbnail: string;
    price: number;
  };
  quantity: number;
  price: number;
  total: number;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type PaymentMethod = 'COD' | 'BANK_TRANSFER' | 'CARD' | 'WALLET';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface Address {
  id: string;
  receiverName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  isDefault: boolean;
}

export interface PromotionCode {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  revenueGrowth: number;
  ordersGrowth: number;
  productsGrowth: number;
  usersGrowth: number;
  topSellingProducts: Array<{
    product: {
      id: string;
      name: string;
      thumbnail: string;
    };
    quantity: number;
    revenue: number;
  }>;
  recentOrders: Order[];
  ordersByStatus: Array<{
    status: OrderStatus;
    count: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
}

export interface AdminNotification {
  id: string;
  type: 'ORDER' | 'PRODUCT' | 'USER' | 'SYSTEM';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  relatedId?: string;
}