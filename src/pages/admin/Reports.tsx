import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  AttachMoney,
  ShoppingCart,
  Groups,
  TrendingUp,
  Download,
  CalendarMonth,
  Inventory2,
} from '@mui/icons-material';
import { Button, Select as AntSelect } from 'antd';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { reportApi } from '../../services/reportApi';
import { useAuthStore } from '../../store/useAuthStore';
import { Loader } from '../../components/common/Loader';

const palette = {
  accent: '#7daf18',
  accentLight: '#EDF7D5',
  textPrimary: '#1A2332',
  textSecondary: '#5A6B7F',
  textMuted: '#8D99A8',
  border: '#E8ECF0',
  background: '#FAFBFC',
};

interface ReportsCache {
  monthlyRevenue: number;
  monthlyOrders: number;
  yearlyRevenueData: { month: string; revenue: number; orders: number }[];
  topProductsData: { name: string; revenue: number; quantity: number }[];
  error: string;
}

let reportsCache: ReportsCache | null = null;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const dateRangeOpts = [
  { value: '7days', label: '7 ngày qua' },
  { value: '30days', label: '30 ngày qua' },
  { value: '90days', label: '3 tháng qua' },
  { value: '1year', label: '1 năm qua' },
];

const reportTypeOpts = [
  { value: 'overview', label: 'Tổng quan' },
  { value: 'revenue', label: 'Doanh thu' },
  { value: 'products', label: 'Sản phẩm' },
  { value: 'orders', label: 'Đơn hàng' },
];

const customerStats = [
  { metric: 'Khách hàng mới', value: '245', growth: 18.2, color: '#1565C0', bg: '#E3F2FD' },
  { metric: 'Khách quay lại', value: '156', growth: 12.5, color: '#2E7D32', bg: '#E8F5E9' },
  { metric: 'Tỷ lệ chuyển đổi', value: '3.2%', growth: 8.7, color: '#E65100', bg: '#FFF3E0' },
  { metric: 'Giá trị đơn TB', value: '850K', growth: 5.3, color: '#7B1FA2', bg: '#F3E5F5' },
];

export const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState('30days');
  const [reportType, setReportType] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [monthlyOrders, setMonthlyOrders] = useState(0);
  const [yearlyRevenueData, setYearlyRevenueData] = useState<{ month: string; revenue: number; orders: number }[]>([]);
  const [topProductsData, setTopProductsData] = useState<{ name: string; revenue: number; quantity: number }[]>([]);
  const userRole = useAuthStore((s) => s.user?.role);
  const hasFetched = useRef(false);

  useEffect(() => {
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

    const fetch = async () => {
      try {
        setIsLoading(true); setError('');
        const now = new Date();
        const monthly = await reportApi.getMonthlyReport(now.getFullYear(), now.getMonth() + 1);
        await sleep(300);
        const yearly = await reportApi.getYearlyReport(now.getFullYear());
        await sleep(300);
        const topRes = await reportApi.getTopProducts(5);

        setMonthlyRevenue(monthly.totalRevenue ?? 0);
        setMonthlyOrders(monthly.totalOrders ?? 0);
        const yd = (yearly.monthlyBreakdown ?? []).map((i) => ({ month: i.month, revenue: i.totalRevenue, orders: i.totalOrders }));
        setYearlyRevenueData(yd);
        const tp = topRes.map((i) => ({ name: i.name, revenue: i.totalSold, quantity: i.totalSold }));
        setTopProductsData(tp);
        reportsCache = { monthlyRevenue: monthly.totalRevenue ?? 0, monthlyOrders: monthly.totalOrders ?? 0, yearlyRevenueData: yd, topProductsData: tp, error: '' };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Không thể tải báo cáo.';
        setError(msg);
        reportsCache = { monthlyRevenue: 0, monthlyOrders: 0, yearlyRevenueData: [], topProductsData: [], error: msg };
      } finally { setIsLoading(false); }
    };

    if (userRole !== 'ADMIN') { setError('Không có quyền xem báo cáo.'); setIsLoading(false); return; }
    fetch();
  }, [userRole]);

  const barData = useMemo(() => yearlyRevenueData.map((d) => ({ month: d.month, 'Doanh thu': d.revenue })), [yearlyRevenueData]);
  const hasBarData = barData.some((d) => d['Doanh thu'] > 0);

  const pieData = useMemo(() => {
    if (!topProductsData.length) return [];
    const colors = ['#7daf18', '#1565C0', '#E65100', '#7B1FA2', '#C62828'];
    return topProductsData.map((p, i) => ({ id: p.name, label: p.name, value: p.quantity, color: colors[i % colors.length] }));
  }, [topProductsData]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {error && <Paper elevation={0} sx={{ p: 2, border: '1px solid #FCA5A5', bgcolor: '#FEF2F2', borderRadius: 2 }}><Typography sx={{ color: '#B91C1C', fontSize: '0.88rem' }}>{error}</Typography></Paper>}
      {isLoading && <Paper elevation={0} sx={{ p: 4, border: `1px solid ${palette.border}`, borderRadius: 3, display: 'flex', justifyContent: 'center' }}><Loader /></Paper>}

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: palette.textPrimary }}>Báo cáo & Thống kê</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>Phân tích doanh thu và hiệu suất kinh doanh</Typography>
        </Box>
        <Button icon={<Download style={{ fontSize: 16 }} />} style={{ height: 40, borderRadius: 10, fontFamily: 'Inter, system-ui, sans-serif' }}>Xuất báo cáo</Button>
      </Box>

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 2, border: `1px solid ${palette.border}`, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1.5 }}>
          <AntSelect value={dateRange} onChange={setDateRange} options={dateRangeOpts} style={{ width: 180, height: 40, fontFamily: 'Inter, system-ui, sans-serif' }} />
          <AntSelect value={reportType} onChange={setReportType} options={reportTypeOpts} style={{ width: 160, height: 40, fontFamily: 'Inter, system-ui, sans-serif' }} />
        </Box>
      </Paper>

      {/* Key Metrics */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
        {[
          { label: 'Doanh thu tháng', value: formatCurrency(monthlyRevenue), icon: <AttachMoney sx={{ fontSize: 22 }} />, color: '#1565C0', bg: '#E3F2FD' },
          { label: 'Đơn hàng tháng', value: String(monthlyOrders), icon: <ShoppingCart sx={{ fontSize: 22 }} />, color: '#2E7D32', bg: '#E8F5E9' },
          { label: 'Khách hàng mới', value: '245', icon: <Groups sx={{ fontSize: 22 }} />, color: '#7B1FA2', bg: '#F3E5F5' },
          { label: 'Tỷ lệ chuyển đổi', value: '3.2%', icon: <TrendingUp sx={{ fontSize: 22 }} />, color: '#E65100', bg: '#FFF3E0' },
        ].map((s, i) => (
          <Paper key={i} elevation={0} sx={{ p: 2.5, border: `1px solid ${palette.border}`, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography sx={{ fontSize: '0.75rem', color: palette.textMuted, mb: 0.5 }}>{s.label}</Typography>
                <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: palette.textPrimary }}>{s.value}</Typography>
              </Box>
              <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</Box>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 2 }}>
        {/* Revenue Bar */}
        <Paper elevation={0} sx={{ p: 2.5, border: `1px solid ${palette.border}`, borderRadius: 3 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: palette.textPrimary, mb: 2 }}>Doanh thu theo tháng</Typography>
          <Box sx={{ height: 300 }}>
            {!hasBarData ? (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <AttachMoney sx={{ fontSize: 40, color: palette.border, mb: 1 }} />
                <Typography sx={{ fontSize: '0.88rem', color: palette.textMuted }}>Chưa có dữ liệu doanh thu</Typography>
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
                axisLeft={{ tickSize: 0, tickPadding: 8, format: (v) => `${(Number(v) / 1000000).toFixed(1)}M` }}
                enableGridY
                gridYValues={5}
                enableLabel={false}
                tooltip={({ data, value }) => (
                  <Paper sx={{ px: 1.5, py: 1, fontSize: '0.78rem' }}>
                    <strong>{data.month}</strong>: {formatCurrency(value as number)}
                  </Paper>
                )}
                theme={{ axis: { ticks: { text: { fontSize: 11, fill: palette.textMuted } } }, grid: { line: { stroke: '#F0F0F0' } } }}
              />
            )}
          </Box>
        </Paper>

        {/* Top Products Pie */}
        <Paper elevation={0} sx={{ p: 2.5, border: `1px solid ${palette.border}`, borderRadius: 3 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: palette.textPrimary, mb: 2 }}>Sản phẩm bán chạy</Typography>
          <Box sx={{ height: 220 }}>
            {pieData.length === 0 ? (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Inventory2 sx={{ fontSize: 36, color: palette.border, mb: 1 }} />
                <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>Chưa có dữ liệu</Typography>
              </Box>
            ) : (
              <ResponsivePie
                data={pieData}
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                innerRadius={0.5}
                padAngle={2}
                cornerRadius={4}
                colors={{ datum: 'data.color' }}
                enableArcLinkLabels={false}
                arcLabel={(d) => `${d.value}`}
                arcLabelsTextColor="#fff"
                arcLabelsSkipAngle={20}
                tooltip={({ datum }) => (
                  <Paper sx={{ px: 1.5, py: 1, fontSize: '0.78rem' }}>
                    <strong>{datum.label}</strong>: {datum.value} đã bán
                  </Paper>
                )}
              />
            )}
          </Box>
          {/* Legend */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mt: 1.5 }}>
            {topProductsData.map((p, i) => {
              const maxQty = Math.max(...topProductsData.map((x) => x.quantity), 1);
              const colors = ['#7daf18', '#1565C0', '#E65100', '#7B1FA2', '#C62828'];
              return (
                <Box key={p.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: palette.accentLight, color: palette.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.78rem', color: palette.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</Typography>
                    <LinearProgress variant="determinate" value={(p.quantity / maxQty) * 100} sx={{ height: 4, borderRadius: 2, bgcolor: '#F0F0F0', '& .MuiLinearProgress-bar': { bgcolor: colors[i % colors.length], borderRadius: 2 }, mt: 0.3 }} />
                  </Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: palette.textSecondary, flexShrink: 0 }}>{p.quantity}</Typography>
                </Box>
              );
            })}
          </Box>
        </Paper>
      </Box>

      {/* Customer Analytics */}
      <Paper elevation={0} sx={{ p: 2.5, border: `1px solid ${palette.border}`, borderRadius: 3 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: palette.textPrimary, mb: 2.5 }}>Phân tích khách hàng</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          {customerStats.map((s) => (
            <Box key={s.metric} sx={{ textAlign: 'center', p: 2, borderRadius: 2.5, bgcolor: palette.background }}>
              <Typography sx={{ fontSize: '0.78rem', color: palette.textMuted, mb: 0.5 }}>{s.metric}</Typography>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: palette.textPrimary, mb: 0.5 }}>{s.value}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                <TrendingUp sx={{ fontSize: 14, color: '#10B981' }} />
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#10B981' }}>+{s.growth}%</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Export */}
      <Paper elevation={0} sx={{ p: 2.5, border: `1px solid ${palette.border}`, borderRadius: 3 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: palette.textPrimary, mb: 2 }}>Xuất báo cáo</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
          {[
            { label: 'Xuất Excel', icon: <Download style={{ fontSize: 18 }} /> },
            { label: 'Xuất PDF', icon: <Download style={{ fontSize: 18 }} /> },
            { label: 'Lập lịch gửi', icon: <CalendarMonth style={{ fontSize: 18 }} /> },
          ].map((btn) => (
            <Button key={btn.label} icon={btn.icon} style={{ height: 44, borderRadius: 10, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500 }}>
              {btn.label}
            </Button>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};
