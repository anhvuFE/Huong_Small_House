import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiDownload,
  FiCalendar,
  FiDollarSign,
  FiShoppingCart,
  FiUsers,
  FiTrendingUp,
  FiTrendingDown,
  FiBarChart,
  FiPieChart,
  FiFilter,
} from 'react-icons/fi';
import { Select } from '../../components/common/Select';
import { reportApi } from '../../services/reportApi';
import { useAuthStore } from '../../store/useAuthStore';
import { Loader } from '../../components/common/Loader';

interface ReportsCache {
  monthlyRevenue: number;
  monthlyOrders: number;
  yearlyRevenueData: { month: string; revenue: number; orders: number }[];
  topProductsData: { name: string; revenue: number; quantity: number; growth: number }[];
  error: string;
}

let reportsCache: ReportsCache | null = null;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState('30days');
  const [reportType, setReportType] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [monthlyOrders, setMonthlyOrders] = useState(0);
  const [yearlyRevenueData, setYearlyRevenueData] = useState<{ month: string; revenue: number; orders: number }[]>([]);
  const [topProductsData, setTopProductsData] = useState<{ name: string; revenue: number; quantity: number; growth: number }[]>([]);
  const userRole = useAuthStore((state) => state.user?.role);
  const hasFetched = useRef(false);

  const dateRangeOptions = [
    { value: '7days', label: '7 ngày qua' },
    { value: '30days', label: '30 ngày qua' },
    { value: '90days', label: '3 tháng qua' },
    { value: '1year', label: '1 năm qua' },
    { value: 'custom', label: 'Tùy chọn' },
  ];

  const reportTypeOptions = [
    { value: 'overview', label: 'Tổng quan' },
    { value: 'revenue', label: 'Doanh thu' },
    { value: 'products', label: 'Sản phẩm' },
    { value: 'customers', label: 'Khách hàng' },
    { value: 'orders', label: 'Đơn hàng' },
  ];

  const revenueData = useMemo(() => yearlyRevenueData, [yearlyRevenueData]);

  const topProducts = useMemo(() => topProductsData, [topProductsData]);

  const customerStats = [
    { metric: 'Khách hàng mới', value: 245, growth: 18.2 },
    { metric: 'Khách hàng quay lại', value: 156, growth: 12.5 },
    { metric: 'Tỷ lệ chuyển đổi', value: '3.2%', growth: 8.7 },
    { metric: 'Giá trị đơn TB', value: '850.000đ', growth: 5.3 },
  ];

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    if (hasFetched.current) return;
    hasFetched.current = true;

    if (reportsCache) {
      setMonthlyRevenue(reportsCache.monthlyRevenue);
      setMonthlyOrders(reportsCache.monthlyOrders);
      setYearlyRevenueData(reportsCache.yearlyRevenueData);
      setTopProductsData(reportsCache.topProductsData);
      setError(reportsCache.error);
      setIsLoading(false);
      return;
    }

    const fetchReports = async () => {
      try {
        setIsLoading(true);
        setError('');
        const monthly = await reportApi.getMonthlyReport(year, month);
        await sleep(300);
        const yearly = await reportApi.getYearlyReport(year);
        await sleep(300);
        const topProductsRes = await reportApi.getTopProducts(5);

        setMonthlyRevenue(monthly.totalRevenue ?? 0);
        setMonthlyOrders(monthly.totalOrders ?? 0);

        const yearlyData = (yearly.monthlyBreakdown ?? []).map((item) => ({
          month: item.month,
          revenue: item.totalRevenue,
          orders: item.totalOrders,
        }));
        setYearlyRevenueData(yearlyData);

        const topMapped = topProductsRes.map((item) => ({
          name: item.name,
          revenue: item.totalSold, // backend không trả revenue, dùng totalSold làm proxy
          quantity: item.totalSold,
          growth: 0,
        }));
        setTopProductsData(topMapped);
        reportsCache = {
          monthlyRevenue: monthly.totalRevenue ?? 0,
          monthlyOrders: monthly.totalOrders ?? 0,
          yearlyRevenueData: yearlyData,
          topProductsData: topMapped,
          error: '',
        };
      } catch (err) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        const message = err instanceof Error ? err.message : 'Không thể tải báo cáo.';
        // Nếu 401/token lỗi, không hiển thị mock.
        if (message.toLowerCase().includes('đăng nhập') || status === 401) {
          setError(message);
          setYearlyRevenueData([]);
          setTopProductsData([]);
          reportsCache = {
            monthlyRevenue: 0,
            monthlyOrders: 0,
            yearlyRevenueData: [],
            topProductsData: [],
            error: message,
          };
        } else {
          setError(message);
          setYearlyRevenueData([]);
          setTopProductsData([]);
          reportsCache = {
            monthlyRevenue: 0,
            monthlyOrders: 0,
            yearlyRevenueData: [],
            topProductsData: [],
            error: message,
          };
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (userRole !== 'ADMIN') {
      setError('Bạn không có quyền xem báo cáo. Vui lòng đăng nhập admin.');
      setIsLoading(false);
      return;
    }

    fetchReports();
  }, [userRole]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <Loader />
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
          <p className="text-gray-600">
            Phân tích doanh thu, đơn hàng và hiệu suất kinh doanh
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FiDownload className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FiFilter className="w-4 h-4 mr-2" />
            Bộ lọc nâng cao
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khoảng thời gian
            </label>
            <Select
              value={dateRange}
              onChange={setDateRange}
              options={dateRangeOptions}
              placeholder="Chọn khoảng thời gian"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại báo cáo
            </label>
            <Select
              value={reportType}
              onChange={setReportType}
              options={reportTypeOptions}
              placeholder="Chọn loại báo cáo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tùy chọn thời gian
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <span className="text-gray-500">đến</span>
              <input
                type="date"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Doanh thu tháng này</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(monthlyRevenue)}
              </p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <span>so với tháng trước</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <FiDollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đơn hàng tháng này</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{monthlyOrders}</p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <span>so với tháng trước</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <FiShoppingCart className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Khách hàng mới</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">245</p>
              <div className="flex items-center mt-2">
                <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-600">+18.2%</span>
                <span className="text-sm text-gray-500 ml-1">so với tháng trước</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <FiUsers className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tỷ lệ chuyển đổi</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">3.2%</p>
              <div className="flex items-center mt-2">
                <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-600">+0.8%</span>
                <span className="text-sm text-gray-500 ml-1">so với tháng trước</span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <FiBarChart className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Doanh thu theo tháng</h2>
            <FiBarChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {revenueData.slice(-6).map((item) => (
              <div key={item.month} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600 w-8">
                    {item.month}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 w-48">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(item.revenue / Math.max(...revenueData.map(d => d.revenue))) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(item.revenue)}
                  </p>
                  <p className="text-xs text-gray-500">{item.orders} đơn</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Sản phẩm bán chạy</h2>
            <FiPieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-white text-xs font-medium rounded-full">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.quantity} sản phẩm
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(product.revenue)}
                  </p>
                  <div className="flex items-center">
                    {product.growth >= 0 ? (
                      <FiTrendingUp className="w-3 h-3 text-green-500 mr-1" />
                    ) : (
                      <FiTrendingDown className="w-3 h-3 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs font-medium ${
                      product.growth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.growth >= 0 ? '+' : ''}{product.growth}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Analytics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Phân tích khách hàng</h2>
          <button className="text-sm text-primary hover:text-primary-dark font-medium">
            Xem chi tiết
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {customerStats.map((stat) => (
            <div key={stat.metric} className="text-center">
              <p className="text-sm text-gray-600 mb-1">{stat.metric}</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
              <div className="flex items-center justify-center">
                <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-600">
                  +{stat.growth}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Xuất báo cáo</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FiDownload className="w-5 h-5 mr-2 text-gray-600" />
            <span className="font-medium">Xuất Excel</span>
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FiDownload className="w-5 h-5 mr-2 text-gray-600" />
            <span className="font-medium">Xuất PDF</span>
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FiCalendar className="w-5 h-5 mr-2 text-gray-600" />
            <span className="font-medium">Lập lịch gửi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
