import React, { useEffect, useRef, useState } from "react";
import {
  FiDollarSign,
  FiShoppingCart,
  FiPackage,
  FiUsers,
  FiTrendingUp,
  FiTrendingDown,
  FiEye,
  FiBarChart,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { mockDashboardStats } from "../../data/adminData";
import { orderApi } from "../../services/orderApi";
import { reportApi } from "../../services/reportApi";
import { productApi } from "../../services/productApi";
import { userApi } from "../../services/userApi";
import { useAuthStore } from "../../store/useAuthStore";
import type { OrderStatus } from "../../types/admin";
import { Loader } from "../../components/common/Loader";

interface DashboardCache {
  stats: typeof mockDashboardStats;
  error: string;
  revenueChart: { month: string; revenue: number; orders: number }[];
}

let dashboardCache: DashboardCache | null = null;

const STATUS_ORDER: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];
const FALLBACK_REVENUE = [
  { month: "T1", revenue: 0, orders: 0 },
  { month: "T2", revenue: 0, orders: 0 },
  { month: "T3", revenue: 0, orders: 0 },
  { month: "T4", revenue: 0, orders: 0 },
  { month: "T5", revenue: 0, orders: 0 },
  { month: "T6", revenue: 0, orders: 0 },
  { month: "T7", revenue: 0, orders: 0 },
  { month: "T8", revenue: 0, orders: 0 },
  { month: "T9", revenue: 0, orders: 0 },
  { month: "T10", revenue: 0, orders: 0 },
  { month: "T11", revenue: 0, orders: 0 },
  { month: "T12", revenue: 0, orders: 0 },
];

const StatCard: React.FC<{
  title: string;
  value: string;
  growth: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = ({ title, value, growth, icon: Icon, color }) => {
  const isPositive = growth >= 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <div className="flex items-center mt-2">
            {isPositive ? (
              <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <FiTrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span
              className={`text-sm font-medium ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? "+" : ""}
              {growth}%
            </span>
            <span className="text-sm text-gray-500 ml-1">
              so với tháng trước
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const OrderStatusCard: React.FC<{
  status: string;
  count: number;
  color: string;
}> = ({ status, count, color }) => {
  const statusNames = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    PROCESSING: "Đang xử lý",
    SHIPPING: "Đang giao",
    DELIVERED: "Đã giao",
    CANCELLED: "Đã hủy",
    RETURNED: "Đã trả",
  };

  return (
    <div className={`p-4 rounded-lg ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">
            {statusNames[status as keyof typeof statusNames]}
          </p>
          <p className="text-xl font-bold text-gray-900 mt-1">{count}</p>
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<typeof mockDashboardStats | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [revenueChart, setRevenueChart] = useState<
    { month: string; revenue: number; orders: number }[]
  >([]);
  const userRole = useAuthStore((state) => state.user?.role);
  const hasFetched = useRef(false);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    if (dashboardCache) {
      setStats(dashboardCache.stats);
      setError(dashboardCache.error);
      setRevenueChart(dashboardCache.revenueChart);
      setIsLoading(false);
      return;
    }

    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setError("");
        const now = new Date();
        const year = now.getFullYear();
        const yearly = await reportApi.getYearlyReport(year);
        await sleep(300);
        const topProducts = await reportApi.getTopProducts(5);
        await sleep(300);
        const orders = await orderApi.listAdminOrders();
        await sleep(300);
        const products = await productApi.listProducts();
        await sleep(300);
        const users = await userApi.listUsers();

        const statusCounts = orders.reduce<Record<OrderStatus, number>>(
          (acc, order) => {
            const status = order.status as OrderStatus;
            acc[status] = (acc[status] ?? 0) + 1;
            return acc;
          },
          {
            PENDING: 0,
            CONFIRMED: 0,
            PROCESSING: 0,
            SHIPPING: 0,
            DELIVERED: 0,
            CANCELLED: 0,
            RETURNED: 0,
          }
        );

        const ordersByStatus = STATUS_ORDER.filter(
          (status) => statusCounts[status] !== undefined
        ).map((status) => ({ status, count: statusCounts[status] ?? 0 }));

        const productMap = new Map(
          products.map((p) => [p.productId ?? p.id, p])
        );

        const topSellingProducts = topProducts.map((item, index) => {
          const product =
            productMap.get(item.productId) ||
            productMap.get(Number(item.productId)) ||
            productMap.get(String(item.productId));
          const price = product?.price ?? 0;
          const thumbnail =
            product?.thumbnail ||
            (Array.isArray(product?.images) ? product?.images[0] : undefined) ||
            "https://placehold.co/80x80?text=Product";
          return {
            product: {
              id: String(item.productId ?? index),
              name: product?.name || item.name,
              thumbnail,
            },
            quantity: item.totalSold,
            revenue: price > 0 ? price * item.totalSold : item.totalSold,
          };
        });

        const chartData =
          yearly.monthlyBreakdown?.map((item) => ({
            month: item.month,
            revenue: item.totalRevenue,
            orders: item.totalOrders,
          })) ?? FALLBACK_REVENUE;

        const nextStats = {
          totalRevenue: yearly.totalRevenue ?? mockDashboardStats.totalRevenue,
          totalOrders:
            yearly.totalOrders ??
            orders.length ??
            mockDashboardStats.totalOrders,
          totalProducts: products.length ?? mockDashboardStats.totalProducts,
          totalUsers: users.length ?? mockDashboardStats.totalUsers,
          revenueGrowth: mockDashboardStats.revenueGrowth,
          ordersGrowth: mockDashboardStats.ordersGrowth,
          productsGrowth: mockDashboardStats.productsGrowth,
          usersGrowth: mockDashboardStats.usersGrowth,
          topSellingProducts,
          recentOrders: orders.slice(0, 5),
          ordersByStatus,
          revenueByMonth: chartData,
        };
        setStats(nextStats);
        setRevenueChart(chartData);
        dashboardCache = {
          stats: nextStats,
          error: "",
          revenueChart: chartData.length ? chartData : FALLBACK_REVENUE,
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Không thể tải dashboard.";
        setError(message);
        setStats(mockDashboardStats);
        setRevenueChart(FALLBACK_REVENUE);
        dashboardCache = {
          stats: mockDashboardStats,
          error: message,
          revenueChart: FALLBACK_REVENUE,
        };
      } finally {
        setIsLoading(false);
      }
    };

    if (userRole !== "ADMIN") {
      setError(
        "Bạn không có quyền xem dashboard admin. Vui lòng đăng nhập admin."
      );
      setIsLoading(false);
      return;
    }

    fetchDashboard();
  }, [userRole]);

  if (!stats) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {isLoading && !stats && (
        <Loader className="bg-white rounded-lg border border-gray-200" />
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Tổng quan về hoạt động kinh doanh</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng doanh thu"
          value={formatCurrency(stats.totalRevenue)}
          growth={stats.revenueGrowth}
          icon={FiDollarSign}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <StatCard
          title="Tổng đơn hàng"
          value={formatNumber(stats.totalOrders)}
          growth={stats.ordersGrowth}
          icon={FiShoppingCart}
          color="bg-gradient-to-r from-green-500 to-green-600"
        />
        <StatCard
          title="Tổng sản phẩm"
          value={formatNumber(stats.totalProducts)}
          growth={stats.productsGrowth}
          icon={FiPackage}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
        />
        <StatCard
          title="Tổng người dùng"
          value={formatNumber(stats.totalUsers)}
          growth={stats.usersGrowth}
          icon={FiUsers}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Trạng thái đơn hàng
            </h2>
            <Link
              to="/admin/orders"
              className="text-sm text-primary hover:text-primary-dark font-medium"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-3">
            {stats.ordersByStatus.map((order) => (
              <OrderStatusCard
                key={order.status}
                status={order.status}
                count={order.count}
                color={
                  order.status === "PENDING"
                    ? "bg-yellow-50 border border-yellow-200"
                    : order.status === "CONFIRMED" ||
                      order.status === "PROCESSING"
                    ? "bg-blue-50 border border-blue-200"
                    : order.status === "SHIPPING"
                    ? "bg-purple-50 border border-purple-200"
                    : order.status === "DELIVERED"
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }
              />
            ))}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Sản phẩm bán chạy
            </h2>
            <Link
              to="/admin/products"
              className="text-sm text-primary hover:text-primary-dark font-medium"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-4">
            {stats.topSellingProducts.map((item, index) => (
              <div
                key={item.product.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-primary text-white text-sm font-medium rounded-full">
                      {index + 1}
                    </span>
                  </div>
                  <img
                    src={item.product.thumbnail}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Đã bán: {formatNumber(item.quantity)} sản phẩm
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(item.revenue)}
                  </p>
                  <p className="text-xs text-gray-500">Doanh thu</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Doanh thu theo tháng
          </h2>
          <FiBarChart className="w-5 h-5 text-gray-500" />
        </div>
        <div className="grid grid-cols-12 gap-3 items-end h-56">
          {revenueChart.map((item, index) => {
            const maxRevenue = Math.max(
              ...revenueChart.map((d) => d.revenue || 0),
              1
            );
            const value = item.revenue || 0;
            const barHeight = Math.max((value / maxRevenue) * 180, 24); // px, ensure visible even khi 0
            return (
              <div
                key={`${item.month}-${index}`}
                className="flex flex-col items-center justify-end space-y-2"
              >
                <div
                  className="w-full bg-gradient-to-t from-primary/20 to-primary rounded-md transition-all"
                  style={{ height: `${barHeight}px` }}
                  title={`${item.month}: ${formatCurrency(value)}`}
                />
                <span className="text-xs text-gray-600">{item.month}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-sm text-gray-600 flex items-center justify-between">
          <span>Tổng doanh thu: {formatCurrency(stats.totalRevenue)}</span>
          <span>Tổng đơn hàng: {formatNumber(stats.totalOrders)}</span>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Đơn hàng gần đây
          </h2>
          <Link
            to="/admin/orders"
            className="text-sm text-primary hover:text-primary-dark font-medium"
          >
            Xem tất cả
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <span className="text-sm font-medium text-primary">
                      {order.orderNumber}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.user.fullName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.user.email}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "CONFIRMED"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "SHIPPING"
                          ? "bg-purple-100 text-purple-800"
                          : order.status === "DELIVERED"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.status === "PENDING"
                        ? "Chờ xác nhận"
                        : order.status === "CONFIRMED"
                        ? "Đã xác nhận"
                        : order.status === "SHIPPING"
                        ? "Đang giao"
                        : order.status === "DELIVERED"
                        ? "Đã giao"
                        : "Đã hủy"}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.total)}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-sm text-gray-500">
                      {order.createdAt.toLocaleDateString("vi-VN")}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="text-primary hover:text-primary-dark"
                    >
                      <FiEye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
