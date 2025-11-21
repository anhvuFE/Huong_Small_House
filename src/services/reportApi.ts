import apiClient from '../lib/http';
import { useAuthStore } from '../store/useAuthStore';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface BaseReport {
  totalOrders: number;
  totalRevenue: number;
  bestSeller?: string;
}

interface DailyEntry {
  date: string;
  totalOrders: number;
  totalRevenue: number;
}

interface MonthlyEntry {
  month: string;
  totalOrders: number;
  totalRevenue: number;
}

interface MonthlyReport extends BaseReport {
  dailyBreakdown?: DailyEntry[];
}

interface YearlyReport extends BaseReport {
  monthlyBreakdown?: MonthlyEntry[];
}

interface TopProductsResponse {
  products: Array<{
    productId: number;
    name: string;
    totalSold: number;
  }>;
}

const requireAdmin = (): void => {
  const { user } = useAuthStore.getState();
  if (user?.role !== 'ADMIN') {
    throw new Error('Bạn cần đăng nhập admin để xem báo cáo.');
  }
};

const isBrowser = typeof window !== 'undefined';
const REPORT_RATE_LIMIT_KEY = 'hs_report_rate_limit_until';

const getReportRateLimitUntil = (): number => {
  if (!isBrowser) return 0;
  const raw = window.localStorage.getItem(REPORT_RATE_LIMIT_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
};

const setReportRateLimitUntil = (timestamp: number): void => {
  if (isBrowser) {
    window.localStorage.setItem(REPORT_RATE_LIMIT_KEY, String(timestamp));
  }
};

let reportRateLimitedUntil = getReportRateLimitUntil();

const ensureNotRateLimited = () => {
  const now = Date.now();
  if (reportRateLimitedUntil > now) {
    throw new Error('Server giới hạn số lần gọi. Vui lòng thử lại sau ít phút.');
  }
};

const handleAdminRequest = async <T>(request: () => Promise<T>): Promise<T> => {
  try {
    ensureNotRateLimited();
    return await request();
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
    if (status === 401) {
      useAuthStore.getState().logout();
      throw new Error(message || 'Token không hợp lệ, vui lòng đăng nhập lại (admin).');
    }
    if (status === 429) {
      reportRateLimitedUntil = Date.now() + 60_000;
      setReportRateLimitUntil(reportRateLimitedUntil);
      throw new Error(message || 'Server giới hạn số lần gọi. Vui lòng thử lại sau ít phút.');
    }
    throw error;
  }
};

export const reportApi = {
  async getDailyReport(date: string): Promise<MonthlyReport> {
    requireAdmin();
    return handleAdminRequest(async () => {
      const response = await apiClient.get<ApiResponse<MonthlyReport>>(`/reports/daily/${date}`);
      return response.data.data;
    });
  },

  async getMonthlyReport(year: number, month: number): Promise<MonthlyReport> {
    requireAdmin();
    return handleAdminRequest(async () => {
      const response = await apiClient.get<ApiResponse<MonthlyReport>>(`/reports/monthly/${year}/${month}`);
      return response.data.data;
    });
  },

  async getYearlyReport(year: number): Promise<YearlyReport> {
    requireAdmin();
    return handleAdminRequest(async () => {
      const response = await apiClient.get<ApiResponse<YearlyReport>>(`/reports/yearly/${year}`);
      return response.data.data;
    });
  },

  async getTopProducts(limit = 5): Promise<TopProductsResponse['products']> {
    requireAdmin();
    return handleAdminRequest(async () => {
      const response = await apiClient.get<ApiResponse<TopProductsResponse>>(`/reports/top-products?limit=${limit}`);
      return response.data.data.products;
    });
  },
};
