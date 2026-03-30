import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Avatar,
} from '@mui/material';
import {
  AttachMoney,
  ShoppingCart,
  Inventory2,
  Groups,
  TrendingUp,
  TrendingDown,
  Visibility,
  ArrowForward,
} from '@mui/icons-material';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveLine } from '@nivo/line';
import { mockDashboardStats } from '../../data/adminData';
import { orderApi } from '../../services/orderApi';
import { reportApi } from '../../services/reportApi';
import { productApi } from '../../services/productApi';
import { userApi } from '../../services/userApi';
import { useAuthStore } from '../../store/useAuthStore';
import type { OrderStatus } from '../../types/admin';
import { Loader } from '../../components/common/Loader';
import logo from '../../assets/logo.png';

const palette = {
  accent: '#7daf18',
  accentLight: '#EDF7D5',
  textPrimary: '#1A2332',
  textSecondary: '#5A6B7F',
  textMuted: '#8D99A8',
  border: '#E8ECF0',
  background: '#FAFBFC',
};

interface DashboardCache {
  stats: typeof mockDashboardStats;
  error: string;
  revenueChart: { month: string; revenue: number; orders: number }[];
}

let dashboardCache: DashboardCache | null = null;

const STATUS_ORDER: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'RETURNED'];
const FALLBACK_REVENUE = Array.from({ length: 12 }, (_, i) => ({ month: `T${i + 1}`, revenue: 0, orders: 0 }));

const statusConfig: Record<string, { name: string; color: string; bg: string }> = {
  PENDING: { name: 'Chờ xác nhận', color: '#F59E0B', bg: '#FFFBEB' },
  CONFIRMED: { name: 'Đã xác nhận', color: '#3B82F6', bg: '#EFF6FF' },
  PROCESSING: { name: 'Đang xử lý', color: '#6366F1', bg: '#EEF2FF' },
  SHIPPING: { name: 'Đang giao', color: '#8B5CF6', bg: '#F5F3FF' },
  DELIVERED: { name: 'Đã giao', color: '#10B981', bg: '#ECFDF5' },
  CANCELLED: { name: 'Đã hủy', color: '#EF4444', bg: '#FEF2F2' },
  RETURNED: { name: 'Đã trả', color: '#6B7280', bg: '#F9FAFB' },
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatNumber = (num: number) => new Intl.NumberFormat('vi-VN').format(num);

// Stat card
const StatCard: React.FC<{
  title: string;
  value: string;
  growth: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}> = ({ title, value, growth, icon, iconBg, iconColor }) => (
  <Paper elevation={0} sx={{ p: 2.5, border: `1px solid ${palette.border}`, borderRadius: 3 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 500, color: palette.textMuted, mb: 0.5 }}>{title}</Typography>
        <Typography sx={{ fontSize: '1.4rem', fontWeight: 700, color: palette.textPrimary }}>{value}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          {growth >= 0 ? (
            <TrendingUp sx={{ fontSize: 16, color: '#10B981' }} />
          ) : (
            <TrendingDown sx={{ fontSize: 16, color: '#EF4444' }} />
          )}
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: growth >= 0 ? '#10B981' : '#EF4444' }}>
            {growth >= 0 ? '+' : ''}{growth}%
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: palette.textMuted, display: { xs: 'none', sm: 'inline' } }}>
            vs tháng trước
          </Typography>
        </Box>
      </Box>
      <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </Box>
    </Box>
  </Paper>
);

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<typeof mockDashboardStats | null>(null);
  const [error, setError] = useState('');
  const [, setIsLoading] = useState(true);
  const [revenueChart, setRevenueChart] = useState<{ month: string; revenue: number; orders: number }[]>([]);
  const userRole = useAuthStore((state) => state.user?.role);
  const hasFetched = useRef(false);

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
        setError('');
        const year = new Date().getFullYear();
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
            const s = order.status as OrderStatus;
            acc[s] = (acc[s] ?? 0) + 1;
            return acc;
          },
          { PENDING: 0, CONFIRMED: 0, PROCESSING: 0, SHIPPING: 0, DELIVERED: 0, CANCELLED: 0, RETURNED: 0 }
        );

        const ordersByStatus = STATUS_ORDER.filter((s) => statusCounts[s] !== undefined).map((s) => ({ status: s, count: statusCounts[s] ?? 0 }));
        const productMap = new Map(products.map((p) => [p.productId ?? p.id, p]));

        const topSellingProducts = topProducts.map((item, index) => {
          const product = productMap.get(item.productId) || productMap.get(Number(item.productId)) || productMap.get(String(item.productId));
          const price = product?.price ?? 0;
          const thumbnail = product?.thumbnail || (Array.isArray(product?.images) ? product?.images[0] : undefined) || '';
          return {
            product: { id: String(item.productId ?? index), name: product?.name || item.name, thumbnail },
            quantity: item.totalSold,
            revenue: price > 0 ? price * item.totalSold : item.totalSold,
          };
        });

        const chartData = yearly.monthlyBreakdown?.map((item) => ({ month: item.month, revenue: item.totalRevenue, orders: item.totalOrders })) ?? FALLBACK_REVENUE;

        const nextStats = {
          totalRevenue: yearly.totalRevenue ?? mockDashboardStats.totalRevenue,
          totalOrders: yearly.totalOrders ?? orders.length ?? mockDashboardStats.totalOrders,
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
        dashboardCache = { stats: nextStats, error: '', revenueChart: chartData.length ? chartData : FALLBACK_REVENUE };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Không thể tải dashboard.';
        setError(message);
        setStats(mockDashboardStats);
        setRevenueChart(FALLBACK_REVENUE);
        dashboardCache = { stats: mockDashboardStats, error: message, revenueChart: FALLBACK_REVENUE };
      } finally {
        setIsLoading(false);
      }
    };

    if (userRole !== 'ADMIN') {
      setError('Bạn không có quyền xem dashboard admin.');
      setIsLoading(false);
      return;
    }
    fetchDashboard();
  }, [userRole]);

  if (!stats) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && (
          <Paper elevation={0} sx={{ p: 2, border: '1px solid #FCA5A5', bgcolor: '#FEF2F2', borderRadius: 2 }}>
            <Typography sx={{ color: '#B91C1C', fontSize: '0.88rem' }}>{error}</Typography>
          </Paper>
        )}
        <Paper elevation={0} sx={{ p: 4, border: `1px solid ${palette.border}`, borderRadius: 3, display: 'flex', justifyContent: 'center' }}>
          <Loader />
        </Paper>
      </Box>
    );
  }

  // Nivo data transforms
  const barData = revenueChart.map((d) => ({ month: d.month, 'Doanh thu': d.revenue }));

  const lineData = [
    {
      id: 'Đơn hàng',
      data: revenueChart.map((d) => ({ x: d.month, y: d.orders })),
    },
  ];

  const hasOrderData = revenueChart.some((d) => d.orders > 0);

  const pieData = stats.ordersByStatus
    .filter((o) => o.count > 0)
    .map((o) => ({
      id: statusConfig[o.status]?.name ?? o.status,
      label: statusConfig[o.status]?.name ?? o.status,
      value: o.count,
      color: statusConfig[o.status]?.color ?? '#6B7280',
    }));

  const hasValidImage = (url?: string) =>
    url && url.startsWith('http') && !url.includes('placeholder') && !url.includes('placehold');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {error && (
        <Paper elevation={0} sx={{ p: 2, border: '1px solid #FCA5A5', bgcolor: '#FEF2F2', borderRadius: 2 }}>
          <Typography sx={{ color: '#B91C1C', fontSize: '0.88rem' }}>{error}</Typography>
        </Paper>
      )}

      {/* Header */}
      <Box>
        <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: palette.textPrimary }}>Dashboard</Typography>
        <Typography sx={{ fontSize: '0.88rem', color: palette.textMuted }}>Tổng quan hoạt động kinh doanh</Typography>
      </Box>

      {/* Stat Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
        <StatCard title="Tổng doanh thu" value={formatCurrency(stats.totalRevenue)} growth={stats.revenueGrowth} icon={<AttachMoney sx={{ fontSize: 24 }} />} iconBg="#E3F2FD" iconColor="#1565C0" />
        <StatCard title="Tổng đơn hàng" value={formatNumber(stats.totalOrders)} growth={stats.ordersGrowth} icon={<ShoppingCart sx={{ fontSize: 24 }} />} iconBg="#E8F5E9" iconColor="#2E7D32" />
        <StatCard title="Tổng sản phẩm" value={formatNumber(stats.totalProducts)} growth={stats.productsGrowth} icon={<Inventory2 sx={{ fontSize: 24 }} />} iconBg="#F3E5F5" iconColor="#7B1FA2" />
        <StatCard title="Tổng người dùng" value={formatNumber(stats.totalUsers)} growth={stats.usersGrowth} icon={<Groups sx={{ fontSize: 24 }} />} iconBg="#FFF3E0" iconColor="#E65100" />
      </Box>

      {/* Charts Row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 2 }}>
        {/* Revenue Bar Chart */}
        <Paper elevation={0} sx={{ p: 2.5, border: `1px solid ${palette.border}`, borderRadius: 3 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: palette.textPrimary, mb: 2 }}>
            Doanh thu theo tháng
          </Typography>
          <Box sx={{ height: 300 }}>
            {barData.every((d) => d['Doanh thu'] === 0) ? (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <AttachMoney sx={{ fontSize: 40, color: palette.border, mb: 1 }} />
                <Typography sx={{ fontSize: '0.88rem', color: palette.textMuted }}>Chưa có dữ liệu doanh thu</Typography>
                <Typography sx={{ fontSize: '0.78rem', color: palette.textMuted }}>Dữ liệu sẽ hiển thị khi có đơn hàng</Typography>
              </Box>
            ) : (
              <ResponsiveBar
                data={barData}
                keys={['Doanh thu']}
                indexBy="month"
                margin={{ top: 10, right: 10, bottom: 40, left: 70 }}
                padding={0.35}
                colors={[palette.accent]}
                borderRadius={4}
                axisBottom={{ tickSize: 0, tickPadding: 8 }}
                axisLeft={{
                  tickSize: 0,
                  tickPadding: 8,
                  format: (v) => `${(Number(v) / 1000000).toFixed(1)}M`,
                }}
                enableGridY
                gridYValues={5}
                enableLabel={false}
                tooltip={({ data, value }) => (
                  <Paper sx={{ px: 1.5, py: 1, fontSize: '0.78rem' }}>
                    <strong>{data.month}</strong>: {formatCurrency(value as number)}
                  </Paper>
                )}
                theme={{
                  axis: { ticks: { text: { fontSize: 11, fill: palette.textMuted } } },
                  grid: { line: { stroke: '#F0F0F0' } },
                }}
              />
            )}
          </Box>
        </Paper>

        {/* Order Status Pie */}
        <Paper elevation={0} sx={{ p: 2.5, border: `1px solid ${palette.border}`, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: palette.textPrimary }}>
              Trạng thái đơn hàng
            </Typography>
            <Link to="/admin/orders" style={{ textDecoration: 'none' }}>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: palette.accent }}>Xem tất cả</Typography>
            </Link>
          </Box>
          <Box sx={{ height: 220 }}>
            {pieData.length === 0 ? (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingCart sx={{ fontSize: 36, color: palette.border, mb: 1 }} />
                <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>Chưa có đơn hàng</Typography>
              </Box>
            ) : (
              <ResponsivePie
                data={pieData}
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                innerRadius={0.55}
                padAngle={2}
                cornerRadius={4}
                colors={{ datum: 'data.color' }}
                enableArcLinkLabels={false}
                arcLabel={(d) => `${d.value}`}
                arcLabelsTextColor="#fff"
                arcLabelsSkipAngle={20}
                tooltip={({ datum }) => (
                  <Paper sx={{ px: 1.5, py: 1, fontSize: '0.78rem' }}>
                    <strong>{datum.label}</strong>: {datum.value} đơn
                  </Paper>
                )}
                theme={{ labels: { text: { fontSize: 11, fontWeight: 600 } } }}
              />
            )}
          </Box>
          {/* Legend */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
            {stats.ordersByStatus.filter((o) => o.count > 0).map((o) => (
              <Chip
                key={o.status}
                label={`${statusConfig[o.status]?.name}: ${o.count}`}
                size="small"
                sx={{
                  bgcolor: statusConfig[o.status]?.bg,
                  color: statusConfig[o.status]?.color,
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 24,
                  border: `1px solid ${statusConfig[o.status]?.color}20`,
                }}
              />
            ))}
          </Box>
        </Paper>
      </Box>

      {/* Orders Line + Top Products */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 2 }}>
        {/* Orders Line Chart */}
        <Paper elevation={0} sx={{ p: 2.5, border: `1px solid ${palette.border}`, borderRadius: 3 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: palette.textPrimary, mb: 2 }}>
            Số đơn hàng theo tháng
          </Typography>
          <Box sx={{ height: 260 }}>
            {!hasOrderData ? (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingCart sx={{ fontSize: 40, color: palette.border, mb: 1 }} />
                <Typography sx={{ fontSize: '0.88rem', color: palette.textMuted }}>Chưa có dữ liệu đơn hàng</Typography>
                <Typography sx={{ fontSize: '0.78rem', color: palette.textMuted }}>Dữ liệu sẽ hiển thị khi có đơn hàng mới</Typography>
              </Box>
            ) : (
              <ResponsiveLine
                data={lineData}
                margin={{ top: 10, right: 20, bottom: 40, left: 45 }}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 0, max: 'auto' }}
                curve="monotoneX"
                colors={['#1565C0']}
                lineWidth={2.5}
                pointSize={8}
                pointColor="#fff"
                pointBorderWidth={2.5}
                pointBorderColor="#1565C0"
                enableArea
                areaOpacity={0.08}
                axisBottom={{ tickSize: 0, tickPadding: 8 }}
                axisLeft={{ tickSize: 0, tickPadding: 8 }}
                enableGridX={false}
                gridYValues={5}
                tooltip={({ point }) => (
                  <Paper sx={{ px: 1.5, py: 1, fontSize: '0.78rem' }}>
                    <strong>{String(point.data.x)}</strong>: {String(point.data.y)} đơn
                  </Paper>
                )}
                theme={{
                  axis: { ticks: { text: { fontSize: 11, fill: palette.textMuted } } },
                  grid: { line: { stroke: '#F0F0F0' } },
                }}
              />
            )}
          </Box>
        </Paper>

        {/* Top Products */}
        <Paper elevation={0} sx={{ p: 2.5, border: `1px solid ${palette.border}`, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: palette.textPrimary }}>
              Sản phẩm bán chạy
            </Typography>
            <Link to="/admin/products" style={{ textDecoration: 'none' }}>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: palette.accent }}>Xem tất cả</Typography>
            </Link>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {stats.topSellingProducts.slice(0, 5).map((item, index) => (
              <Box
                key={item.product.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.2,
                  borderRadius: 2,
                  transition: 'background 0.2s',
                  '&:hover': { bgcolor: palette.background },
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: index < 3 ? palette.accentLight : palette.background,
                    color: index < 3 ? palette.accent : palette.textMuted,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </Box>
                <Avatar
                  src={hasValidImage(item.product.thumbnail) ? item.product.thumbnail : logo}
                  variant="rounded"
                  sx={{ width: 40, height: 40, bgcolor: palette.background, '& img': { objectFit: 'contain', p: 0.3 } }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.84rem', fontWeight: 500, color: palette.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.product.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: palette.textMuted }}>
                    Đã bán: {formatNumber(item.quantity)}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: palette.textPrimary, flexShrink: 0 }}>
                  {formatCurrency(item.revenue)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>

      {/* Recent Orders */}
      <Paper elevation={0} sx={{ border: `1px solid ${palette.border}`, borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 2, borderBottom: `1px solid ${palette.border}` }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: palette.textPrimary }}>
            Đơn hàng gần đây
          </Typography>
          <Link to="/admin/orders" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: palette.accent }}>Xem tất cả</Typography>
            <ArrowForward sx={{ fontSize: 14, color: palette.accent }} />
          </Link>
        </Box>
        <Box sx={{ overflowX: 'auto' }}>
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
            <Box component="thead">
              <Box component="tr" sx={{ bgcolor: palette.background }}>
                {['Mã đơn', 'Khách hàng', 'Trạng thái', 'Tổng tiền', 'Ngày tạo', ''].map((h) => (
                  <Box key={h} component="th" sx={{ py: 1.5, px: 2, textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {h}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {stats.recentOrders.map((order) => (
                <Box key={order.id} component="tr" sx={{ borderBottom: `1px solid ${palette.border}`, '&:hover': { bgcolor: palette.background } }}>
                  <Box component="td" sx={{ py: 1.5, px: 2 }}>
                    <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: palette.accent }}>{order.orderNumber}</Typography>
                  </Box>
                  <Box component="td" sx={{ py: 1.5, px: 2 }}>
                    <Typography sx={{ fontSize: '0.84rem', fontWeight: 500, color: palette.textPrimary }}>{order.user.fullName}</Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: palette.textMuted }}>{order.user.email}</Typography>
                  </Box>
                  <Box component="td" sx={{ py: 1.5, px: 2 }}>
                    <Chip
                      label={statusConfig[order.status]?.name ?? order.status}
                      size="small"
                      sx={{
                        bgcolor: statusConfig[order.status]?.bg,
                        color: statusConfig[order.status]?.color,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 24,
                      }}
                    />
                  </Box>
                  <Box component="td" sx={{ py: 1.5, px: 2 }}>
                    <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: palette.textPrimary }}>{formatCurrency(order.total)}</Typography>
                  </Box>
                  <Box component="td" sx={{ py: 1.5, px: 2 }}>
                    <Typography sx={{ fontSize: '0.82rem', color: palette.textMuted }}>{order.createdAt.toLocaleDateString('vi-VN')}</Typography>
                  </Box>
                  <Box component="td" sx={{ py: 1.5, px: 2 }}>
                    <Link to={`/admin/orders/${order.id}`}>
                      <Visibility sx={{ fontSize: 18, color: palette.textMuted, '&:hover': { color: palette.accent }, transition: 'color 0.2s' }} />
                    </Link>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
