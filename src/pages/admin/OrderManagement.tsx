import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  InputBase,
  Avatar,
} from '@mui/material';
import {
  Search,
  Visibility,
  Edit,
  Download,
  ShoppingCart,
  LocalShipping,
  CheckCircle,
  HourglassEmpty,
  Receipt,
} from '@mui/icons-material';
import { Button, Select as AntSelect, Modal } from 'antd';
import { orderApi } from '../../services/orderApi';
import type { Order as AdminOrder, OrderStatus, PaymentStatus } from '../../types/admin';
import { useAuthStore } from '../../store/useAuthStore';
import { Loader } from '../../components/common/Loader';
import { getProductImage } from '../../utils/productImage';
import { useToast } from '../../components/common/Toast';
import { Pagination } from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';

const palette = {
  accent: '#7daf18',
  accentLight: '#EDF7D5',
  textPrimary: '#1A2332',
  textSecondary: '#5A6B7F',
  textMuted: '#8D99A8',
  border: '#E8ECF0',
  background: '#FAFBFC',
};

const statusConfig: Record<string, { name: string; color: string; bg: string }> = {
  PENDING: { name: 'Chờ xác nhận', color: '#F59E0B', bg: '#FFFBEB' },
  CONFIRMED: { name: 'Đã xác nhận', color: '#3B82F6', bg: '#EFF6FF' },
  PROCESSING: { name: 'Đang xử lý', color: '#6366F1', bg: '#EEF2FF' },
  SHIPPING: { name: 'Đang giao', color: '#8B5CF6', bg: '#F5F3FF' },
  DELIVERED: { name: 'Đã giao', color: '#10B981', bg: '#ECFDF5' },
  CANCELLED: { name: 'Đã hủy', color: '#EF4444', bg: '#FEF2F2' },
  RETURNED: { name: 'Đã trả', color: '#6B7280', bg: '#F9FAFB' },
};

const paymentConfig: Record<string, { name: string; color: string; bg: string }> = {
  PENDING: { name: 'Chờ thanh toán', color: '#F59E0B', bg: '#FFFBEB' },
  PAID: { name: 'Đã thanh toán', color: '#10B981', bg: '#ECFDF5' },
  FAILED: { name: 'Thất bại', color: '#EF4444', bg: '#FEF2F2' },
  REFUNDED: { name: 'Đã hoàn tiền', color: '#6B7280', bg: '#F9FAFB' },
};

const paymentMethodText: Record<string, string> = {
  COD: 'Thanh toán khi nhận',
  BANK_TRANSFER: 'Chuyển khoản',
  CARD: 'Thẻ tín dụng',
  WALLET: 'Ví điện tử',
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const statusOptions = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'PROCESSING', label: 'Đang xử lý' },
  { value: 'SHIPPING', label: 'Đang giao' },
  { value: 'DELIVERED', label: 'Đã giao' },
  { value: 'CANCELLED', label: 'Đã hủy' },
  { value: 'RETURNED', label: 'Đã trả' },
];

const paymentStatusOptions = [
  { value: '', label: 'Tất cả thanh toán' },
  { value: 'PENDING', label: 'Chờ thanh toán' },
  { value: 'PAID', label: 'Đã thanh toán' },
  { value: 'FAILED', label: 'Thất bại' },
  { value: 'REFUNDED', label: 'Đã hoàn tiền' },
];

const orderedStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'RETURNED'];
const orderedPaymentStatuses: PaymentStatus[] = ['PENDING', 'PAID', 'REFUNDED', 'FAILED'];

const quickStats = [
  { key: 'pending', label: 'Chờ xác nhận', icon: <HourglassEmpty sx={{ fontSize: 22 }} />, color: '#F59E0B', bg: '#FFFBEB', filter: (o: AdminOrder) => o.status === 'PENDING' },
  { key: 'processing', label: 'Đang xử lý', icon: <Receipt sx={{ fontSize: 22 }} />, color: '#6366F1', bg: '#EEF2FF', filter: (o: AdminOrder) => ['CONFIRMED', 'PROCESSING'].includes(o.status) },
  { key: 'shipping', label: 'Đang giao', icon: <LocalShipping sx={{ fontSize: 22 }} />, color: '#8B5CF6', bg: '#F5F3FF', filter: (o: AdminOrder) => o.status === 'SHIPPING' },
  { key: 'delivered', label: 'Hoàn thành', icon: <CheckCircle sx={{ fontSize: 22 }} />, color: '#10B981', bg: '#ECFDF5', filter: (o: AdminOrder) => o.status === 'DELIVERED' },
];

export const OrderManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [orderDetail, setOrderDetail] = useState<AdminOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<OrderStatus>('PENDING');
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>('PENDING');
  const [isUpdating, setIsUpdating] = useState(false);
  const userRole = useAuthStore((s) => s.user?.role);
  const { showToast } = useToast();
  const { currentPage, pageSize, handlePageChange, handlePageSizeChange, getPaginatedData } = usePagination(1, 10);

  const isStatusDisabled = (target: OrderStatus, current: OrderStatus) => {
    const ci = orderedStatuses.indexOf(current);
    const ti = orderedStatuses.indexOf(target);
    if (ti < ci) return true;
    if (target === 'CANCELLED' && ['SHIPPING', 'DELIVERED', 'RETURNED'].includes(current)) return true;
    if (target === 'RETURNED' && current !== 'RETURNED') return true;
    if (['CANCELLED', 'RETURNED'].includes(current) && target !== current) return true;
    return false;
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true); setError('');
        setOrders(await orderApi.listAdminOrders());
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Không thể tải đơn hàng.';
        setError(msg); setOrders([]);
        showToast({ title: 'Không thể tải đơn hàng', message: msg, variant: 'error' });
      } finally { setIsLoading(false); }
    };
    if (userRole !== 'ADMIN') { setError('Không có quyền truy cập.'); setIsLoading(false); return; }
    fetch();
  }, [userRole, showToast]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = searchTerm.toLowerCase();
      const matchSearch = o.orderNumber.toLowerCase().includes(q) || o.user.fullName.toLowerCase().includes(q) || o.user.email.toLowerCase().includes(q);
      return matchSearch && (!selectedStatus || o.status === selectedStatus) && (!selectedPaymentStatus || o.paymentStatus === selectedPaymentStatus);
    });
  }, [orders, searchTerm, selectedStatus, selectedPaymentStatus]);

  const paginatedData = useMemo(() => getPaginatedData(filteredOrders), [filteredOrders, getPaginatedData]);

  const handleViewOrder = async (order: AdminOrder) => {
    setSelectedOrder(order); setIsDetailOpen(true); setIsFetchingDetail(true);
    try { setOrderDetail(await orderApi.getAdminOrder(order.id)); } catch { setOrderDetail(null); } finally { setIsFetchingDetail(false); }
  };

  const handleOpenEdit = (order: AdminOrder) => {
    setSelectedOrder(order); setEditStatus(order.status); setEditPaymentStatus(order.paymentStatus); setIsEditOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      setIsUpdating(true);
      const updated = await orderApi.updateAdminOrderStatus(selectedOrder.id, editStatus, editPaymentStatus);
      setOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o));
      setOrderDetail((prev) => prev && prev.id === updated.id ? updated : prev);
      showToast({ title: 'Đã cập nhật đơn hàng', variant: 'success' });
      setIsEditOpen(false);
    } catch (err) {
      showToast({ title: 'Cập nhật thất bại', message: err instanceof Error ? err.message : '', variant: 'error' });
    } finally { setIsUpdating(false); }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: palette.textPrimary }}>Quản lý đơn hàng</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>{orders.length} đơn hàng</Typography>
        </Box>
        <Button icon={<Download style={{ fontSize: 16 }} />} style={{ height: 40, borderRadius: 10, fontFamily: 'Inter, system-ui, sans-serif' }}>
          Xuất Excel
        </Button>
      </Box>

      {error && <Paper elevation={0} sx={{ p: 2, border: '1px solid #FCA5A5', bgcolor: '#FEF2F2', borderRadius: 2 }}><Typography sx={{ color: '#B91C1C', fontSize: '0.88rem' }}>{error}</Typography></Paper>}

      {/* Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
        {quickStats.map((s) => (
          <Paper key={s.key} elevation={0} sx={{ p: 2, border: `1px solid ${palette.border}`, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 42, height: 42, borderRadius: 2.5, bgcolor: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</Box>
            <Box>
              <Typography sx={{ fontSize: '0.75rem', color: palette.textMuted }}>{s.label}</Typography>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: palette.textPrimary }}>{orders.filter(s.filter).length}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {isLoading && <Paper elevation={0} sx={{ p: 4, border: `1px solid ${palette.border}`, borderRadius: 3, display: 'flex', justifyContent: 'center' }}><Loader /></Paper>}

      {/* Filters */}
      {!isLoading && (
        <Paper elevation={0} sx={{ p: 2, border: `1px solid ${palette.border}`, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 1.5 }}>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', bgcolor: palette.background, borderRadius: 2.5, border: `1px solid ${palette.border}`, px: 1.5, '&:focus-within': { borderColor: palette.accent } }}>
              <Search sx={{ fontSize: 20, color: palette.textMuted, mr: 1 }} />
              <InputBase value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm theo mã đơn, tên, email..." sx={{ flex: 1, fontSize: '0.88rem', py: 0.8 }} />
            </Box>
            <AntSelect value={selectedStatus || undefined} onChange={(v) => setSelectedStatus(v || '')} allowClear placeholder="Trạng thái" options={statusOptions.filter((s) => s.value)} style={{ width: 180, height: 40, fontFamily: 'Inter, system-ui, sans-serif' }} />
            <AntSelect value={selectedPaymentStatus || undefined} onChange={(v) => setSelectedPaymentStatus(v || '')} allowClear placeholder="Thanh toán" options={paymentStatusOptions.filter((s) => s.value)} style={{ width: 180, height: 40, fontFamily: 'Inter, system-ui, sans-serif' }} />
          </Box>
        </Paper>
      )}

      {/* Table */}
      {!isLoading && (
        <Paper elevation={0} sx={{ border: `1px solid ${palette.border}`, borderRadius: 3, overflow: 'hidden' }}>
          {/* Desktop */}
          <Box sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <Box component="thead">
                <Box component="tr" sx={{ bgcolor: palette.background }}>
                  {['Đơn hàng', 'Khách hàng', 'Tổng tiền', 'Thanh toán', 'Trạng thái', 'Ngày tạo', ''].map((h) => (
                    <Box key={h} component="th" sx={{ py: 1.5, px: 2, textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {paginatedData.items.map((order) => (
                  <Box key={order.id} component="tr" sx={{ borderBottom: `1px solid ${palette.border}`, '&:hover': { bgcolor: palette.background }, transition: 'background 0.15s' }}>
                    <Box component="td" sx={{ py: 1.5, px: 2 }}>
                      <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: palette.accent }}>{order.orderNumber}</Typography>
                      {order.trackingNumber && <Typography sx={{ fontSize: '0.7rem', color: palette.textMuted }}>VĐ: {order.trackingNumber}</Typography>}
                    </Box>
                    <Box component="td" sx={{ py: 1.5, px: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#E3F2FD', color: '#1565C0', fontSize: '0.75rem', fontWeight: 700 }}>{order.user.fullName[0]}</Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.84rem', fontWeight: 500, color: palette.textPrimary }}>{order.user.fullName}</Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: palette.textMuted }}>{order.user.email}</Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box component="td" sx={{ py: 1.5, px: 2 }}>
                      <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: palette.textPrimary }}>{formatCurrency(order.total)}</Typography>
                      {order.discount > 0 && <Typography sx={{ fontSize: '0.7rem', color: '#10B981' }}>-{formatCurrency(order.discount)}</Typography>}
                    </Box>
                    <Box component="td" sx={{ py: 1.5, px: 2 }}>
                      <Chip label={paymentConfig[order.paymentStatus]?.name} size="small" sx={{ bgcolor: paymentConfig[order.paymentStatus]?.bg, color: paymentConfig[order.paymentStatus]?.color, fontWeight: 600, fontSize: '0.7rem', height: 24 }} />
                      <Typography sx={{ fontSize: '0.68rem', color: palette.textMuted, mt: 0.3 }}>{paymentMethodText[order.paymentMethod] ?? order.paymentMethod}</Typography>
                    </Box>
                    <Box component="td" sx={{ py: 1.5, px: 2 }}>
                      <Chip label={statusConfig[order.status]?.name} size="small" sx={{ bgcolor: statusConfig[order.status]?.bg, color: statusConfig[order.status]?.color, fontWeight: 600, fontSize: '0.7rem', height: 24 }} />
                    </Box>
                    <Box component="td" sx={{ py: 1.5, px: 2 }}>
                      <Typography sx={{ fontSize: '0.82rem', color: palette.textMuted }}>{order.createdAt.toLocaleDateString('vi-VN')}</Typography>
                    </Box>
                    <Box component="td" sx={{ py: 1.5, px: 2 }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => handleViewOrder(order)} sx={{ color: palette.textMuted, '&:hover': { bgcolor: '#E3F2FD', color: '#1565C0' } }}><Visibility sx={{ fontSize: 18 }} /></IconButton>
                        <IconButton size="small" onClick={() => handleOpenEdit(order)} sx={{ color: palette.textMuted, '&:hover': { bgcolor: '#E8F5E9', color: '#2E7D32' } }}><Edit sx={{ fontSize: 18 }} /></IconButton>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Mobile cards */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column' }}>
            {paginatedData.items.map((order) => (
              <Box key={order.id} sx={{ p: 2, borderBottom: `1px solid ${palette.border}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: palette.accent }}>{order.orderNumber}</Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: palette.textPrimary }}>{order.user.fullName}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => handleViewOrder(order)} sx={{ color: '#1565C0' }}><Visibility sx={{ fontSize: 16 }} /></IconButton>
                    <IconButton size="small" onClick={() => handleOpenEdit(order)} sx={{ color: '#2E7D32' }}><Edit sx={{ fontSize: 16 }} /></IconButton>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: palette.textPrimary }}>{formatCurrency(order.total)}</Typography>
                  <Chip label={statusConfig[order.status]?.name} size="small" sx={{ bgcolor: statusConfig[order.status]?.bg, color: statusConfig[order.status]?.color, fontWeight: 600, fontSize: '0.68rem', height: 22 }} />
                  <Chip label={paymentConfig[order.paymentStatus]?.name} size="small" sx={{ bgcolor: paymentConfig[order.paymentStatus]?.bg, color: paymentConfig[order.paymentStatus]?.color, fontWeight: 600, fontSize: '0.68rem', height: 22 }} />
                </Box>
              </Box>
            ))}
          </Box>

          {paginatedData.totalItems === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <ShoppingCart sx={{ fontSize: 48, color: palette.border, mb: 1.5 }} />
              <Typography sx={{ fontWeight: 600, color: palette.textPrimary }}>Không tìm thấy đơn hàng</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: palette.textMuted }}>Thử thay đổi bộ lọc</Typography>
            </Box>
          )}
        </Paper>
      )}

      {!isLoading && filteredOrders.length > 0 && (
        <Pagination currentPage={currentPage} totalPages={paginatedData.totalPages} totalItems={paginatedData.totalItems} itemsPerPage={pageSize} onPageChange={handlePageChange} showPageSizeSelect onPageSizeChange={handlePageSizeChange} />
      )}

      {/* View Detail Modal */}
      <Modal open={isDetailOpen} onCancel={() => setIsDetailOpen(false)} title={`Chi tiết: ${selectedOrder?.orderNumber}`} footer={<Button onClick={() => setIsDetailOpen(false)} style={{ borderRadius: 10 }}>Đóng</Button>} width={700} centered>
        {isFetchingDetail && <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}><Loader /></Box>}
        {!isFetchingDetail && selectedOrder && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Chip label={statusConfig[(orderDetail ?? selectedOrder).status]?.name} sx={{ bgcolor: statusConfig[(orderDetail ?? selectedOrder).status]?.bg, color: statusConfig[(orderDetail ?? selectedOrder).status]?.color, fontWeight: 600 }} />
              <Chip label={paymentConfig[(orderDetail ?? selectedOrder).paymentStatus]?.name} sx={{ bgcolor: paymentConfig[(orderDetail ?? selectedOrder).paymentStatus]?.bg, color: paymentConfig[(orderDetail ?? selectedOrder).paymentStatus]?.color, fontWeight: 600 }} />
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: palette.textPrimary, ml: 'auto' }}>{formatCurrency((orderDetail ?? selectedOrder).total)}</Typography>
            </Box>
            <Paper elevation={0} sx={{ p: 2, bgcolor: palette.background, borderRadius: 2 }}>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: palette.textPrimary, mb: 1.5 }}>Sản phẩm ({(orderDetail ?? selectedOrder).items.length})</Typography>
              {(orderDetail ?? selectedOrder).items.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, borderBottom: `1px solid ${palette.border}`, '&:last-child': { borderBottom: 'none' } }}>
                  <Avatar src={getProductImage(item.product)} variant="rounded" sx={{ width: 40, height: 40, bgcolor: '#fff' }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.84rem', fontWeight: 500, color: palette.textPrimary }}>{item.product.name}</Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: palette.textMuted }}>SL: {item.quantity} × {formatCurrency(item.price)}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: palette.textPrimary }}>{formatCurrency(item.total)}</Typography>
                </Box>
              ))}
            </Paper>
          </Box>
        )}
      </Modal>

      {/* Edit Status Modal */}
      <Modal open={isEditOpen} onCancel={() => setIsEditOpen(false)} title={`Cập nhật: ${selectedOrder?.orderNumber}`} footer={null} width={520} centered>
        {selectedOrder && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: palette.textPrimary, mb: 0.5 }}>Trạng thái đơn hàng</Typography>
                <AntSelect value={editStatus} onChange={(v) => setEditStatus(v)} options={statusOptions.filter((s) => s.value && !['CANCELLED', 'RETURNED'].includes(s.value)).map((s) => ({ ...s, disabled: isStatusDisabled(s.value as OrderStatus, selectedOrder.status) }))} style={{ width: '100%', height: 40, fontFamily: 'Inter, system-ui, sans-serif' }} />
                <Typography sx={{ fontSize: '0.7rem', color: palette.textMuted, mt: 0.5 }}>Chỉ tiến tới, không lùi</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: palette.textPrimary, mb: 0.5 }}>Huỷ / Trả hàng</Typography>
                <AntSelect value={editStatus} onChange={(v) => setEditStatus(v)} options={statusOptions.filter((s) => ['CANCELLED', 'RETURNED'].includes(s.value)).map((s) => ({ ...s, disabled: isStatusDisabled(s.value as OrderStatus, selectedOrder.status) }))} style={{ width: '100%', height: 40, fontFamily: 'Inter, system-ui, sans-serif' }} />
              </Box>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: palette.textPrimary, mb: 0.5 }}>Thanh toán</Typography>
                <AntSelect value={editPaymentStatus} onChange={(v) => setEditPaymentStatus(v)} options={paymentStatusOptions.filter((p) => ['PENDING', 'PAID'].includes(p.value)).map((p) => ({ ...p, disabled: orderedPaymentStatuses.indexOf(p.value as PaymentStatus) < orderedPaymentStatuses.indexOf(selectedOrder.paymentStatus) }))} style={{ width: '100%', height: 40, fontFamily: 'Inter, system-ui, sans-serif' }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: palette.textPrimary, mb: 0.5 }}>Hoàn tiền / Thất bại</Typography>
                <AntSelect value={editPaymentStatus} onChange={(v) => setEditPaymentStatus(v)} options={paymentStatusOptions.filter((p) => ['REFUNDED', 'FAILED'].includes(p.value)).map((p) => ({ ...p, disabled: orderedPaymentStatuses.indexOf(p.value as PaymentStatus) < orderedPaymentStatuses.indexOf(selectedOrder.paymentStatus) }))} style={{ width: '100%', height: 40, fontFamily: 'Inter, system-ui, sans-serif' }} />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
              <Button onClick={() => setIsEditOpen(false)} style={{ height: 40, borderRadius: 10, fontFamily: 'Inter, system-ui, sans-serif' }}>Hủy</Button>
              <Button type="primary" loading={isUpdating} onClick={handleUpdateStatus} style={{ backgroundColor: palette.accent, borderColor: palette.accent, height: 40, borderRadius: 10, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}>
                {isUpdating ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </Box>
          </Box>
        )}
      </Modal>
    </Box>
  );
};
