import React, { useEffect, useMemo, useState } from 'react';
import {
  FiSearch,
  FiFilter,
  FiEye,
  FiEdit,
  FiDownload,
  FiPackage,
  FiUser,
  FiCalendar,
} from 'react-icons/fi';
import { Select } from '../../components/common/Select';
import { orderApi } from '../../services/orderApi';
import type { Order as AdminOrder, OrderStatus, PaymentStatus } from '../../types/admin';
import { useAuthStore } from '../../store/useAuthStore';
import { Loader } from '../../components/common/Loader';
import { useToast } from '../../components/common/Toast';
import { Portal } from '../../components/common/Portal';

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
  const userRole = useAuthStore((state) => state.user?.role);
  const { showToast } = useToast();
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

  const isStatusDisabled = (target: OrderStatus, current: OrderStatus) => {
    const currentIndex = orderedStatuses.indexOf(current);
    const targetIndex = orderedStatuses.indexOf(target);
    if (targetIndex < currentIndex) return true; // không lùi trạng thái

    // Không thể hủy khi đã giao/đã trả
    if (target === 'CANCELLED' && ['SHIPPING', 'DELIVERED', 'RETURNED'].includes(current)) {
      return true;
    }

    // Không cho chuyển sang ĐÃ TRẢ trừ khi đã ở trạng thái đó (tránh đổi sau khi đã giao)
    if (target === 'RETURNED' && current !== 'RETURNED') {
      return true;
    }

    // Khi đã hủy/đã trả rồi thì khóa các trạng thái khác
    if (['CANCELLED', 'RETURNED'].includes(current) && target !== current) {
      return true;
    }

    return false;
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await orderApi.listAdminOrders();
        setOrders(data);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Không thể tải đơn hàng từ API. Hiển thị dữ liệu mẫu.';

        // Nếu token hết hạn/không hợp lệ, yêu cầu đăng nhập lại và không gắn mock để tránh hiểu nhầm.
        setError(message);
        setOrders([]);
        showToast({ title: 'Không thể tải đơn hàng', message, variant: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    if (userRole !== 'ADMIN') {
      setError('Bạn không có quyền truy cập trang quản lý đơn hàng.');
      setIsLoading(false);
      return;
    }

    fetchOrders();
  }, [userRole, showToast]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !selectedStatus || order.status === selectedStatus;
      const matchesPaymentStatus = !selectedPaymentStatus || order.paymentStatus === selectedPaymentStatus;

      return matchesSearch && matchesStatus && matchesPaymentStatus;
    });
  }, [orders, searchTerm, selectedStatus, selectedPaymentStatus]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getOrderStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      PENDING: { text: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { text: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
      PROCESSING: { text: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-800' },
      SHIPPING: { text: 'Đang giao', color: 'bg-purple-100 text-purple-800' },
      DELIVERED: { text: 'Đã giao', color: 'bg-green-100 text-green-800' },
      CANCELLED: { text: 'Đã hủy', color: 'bg-red-100 text-red-800' },
      RETURNED: { text: 'Đã trả', color: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const statusConfig = {
      PENDING: { text: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800' },
      PAID: { text: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
      FAILED: { text: 'Thất bại', color: 'bg-red-100 text-red-800' },
      REFUNDED: { text: 'Đã hoàn tiền', color: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getPaymentMethodText = (method: string) => {
    const methods = {
      COD: 'Thanh toán khi nhận hàng',
      BANK_TRANSFER: 'Chuyển khoản ngân hàng',
      CARD: 'Thẻ tín dụng',
      WALLET: 'Ví điện tử',
    };
    return methods[method as keyof typeof methods] || method;
  };

  const handleViewOrder = async (order: AdminOrder) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
    setIsFetchingDetail(true);
    try {
      const detail = await orderApi.getAdminOrder(order.id);
      setOrderDetail(detail);
    } catch {
      // Giữ modal mở nhưng không hiển thị toast để tránh gây khó chịu
      setOrderDetail(null);
    } finally {
      setIsFetchingDetail(false);
    }
  };

  const handleOpenEdit = (order: AdminOrder) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setEditPaymentStatus(order.paymentStatus);
    setIsEditOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      setIsUpdating(true);
      const updated = await orderApi.updateAdminOrderStatus(selectedOrder.id, editStatus, editPaymentStatus);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setOrderDetail((prev) => (prev && prev.id === updated.id ? updated : prev));
      showToast({ title: 'Đã cập nhật đơn hàng', variant: 'success' });
      setIsEditOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể cập nhật trạng thái đơn hàng.';
      showToast({ title: 'Cập nhật thất bại', message, variant: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-sm lg:text-base text-gray-600">
            Theo dõi và xử lý các đơn hàng từ khách hàng
          </p>
        </div>
        <div className="flex items-center gap-2 lg:gap-3">
          <button className="inline-flex items-center px-3 lg:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm lg:text-base">
            <FiDownload className="w-4 h-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Xuất Excel</span>
            <span className="sm:hidden">Excel</span>
          </button>
          <button className="inline-flex items-center px-3 lg:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm lg:text-base">
            <FiFilter className="w-4 h-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Bộ lọc nâng cao</span>
            <span className="sm:hidden">Lọc</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* View Order Modal */}
      {isDetailOpen && selectedOrder && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="absolute inset-0" onClick={() => setIsDetailOpen(false)} />
            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden max-h-[90vh]">
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-gray-400 font-semibold">Chi tiết đơn hàng</p>
                <h3 className="text-2xl font-semibold text-gray-900 mt-1">{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-gray-500 mt-1">Khách: {selectedOrder.user.fullName}</p>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-4 space-y-4 overflow-y-auto">
              {isFetchingDetail && <Loader />}
              {!isFetchingDetail && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Trạng thái</p>
                      {getOrderStatusBadge(orderDetail?.status ?? selectedOrder.status)}
                    </div>
                    <div>
                      <p className="text-gray-500">Thanh toán</p>
                      {getPaymentStatusBadge(orderDetail?.paymentStatus ?? selectedOrder.paymentStatus)}
                    </div>
                    <div>
                      <p className="text-gray-500">Tổng tiền</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(orderDetail?.total ?? selectedOrder.total)}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-2">Sản phẩm ({orderDetail?.items.length ?? selectedOrder.items.length})</p>
                    <div className="divide-y divide-gray-200">
                      {(orderDetail?.items ?? selectedOrder.items).map((item) => (
                        <div key={item.id} className="py-2 flex items-center gap-3">
                          <img src={item.product.thumbnail} alt={item.product.name} className="w-12 h-12 rounded-lg object-cover" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                            <p className="text-xs text-gray-500">SL: {item.quantity} × {formatCurrency(item.price)}</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.total)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

              <div className="px-6 py-4 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-white transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Edit Status Modal */}
      {isEditOpen && selectedOrder && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="absolute inset-0" onClick={() => setIsEditOpen(false)} />
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-gray-400 font-semibold">Cập nhật trạng thái</p>
                <h3 className="text-xl font-semibold text-gray-900 mt-1">{selectedOrder.orderNumber}</h3>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 overflow-y-auto">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Trạng thái đơn hàng</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1 uppercase">Luồng chính</p>
                    <Select
                      value={editStatus}
                      onChange={(val) => setEditStatus(val as OrderStatus)}
                      options={statusOptions
                        .filter((s) => s.value && !['CANCELLED', 'RETURNED'].includes(s.value))
                        .map((s) => ({
                          ...s,
                          disabled: isStatusDisabled(s.value as OrderStatus, selectedOrder.status),
                        }))}
                      placeholder="Chọn trạng thái"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Chỉ đi tới các bước tiếp theo, không thể lùi.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1 uppercase">Huỷ / Trả</p>
                    <Select
                      value={editStatus}
                      onChange={(val) => setEditStatus(val as OrderStatus)}
                      options={statusOptions
                        .filter((s) => ['CANCELLED', 'RETURNED'].includes(s.value))
                        .map((s) => ({
                          ...s,
                          disabled: isStatusDisabled(s.value as OrderStatus, selectedOrder.status),
                        }))}
                      placeholder="Chọn trạng thái"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Chỉ dùng cho huỷ/hoàn đơn, tùy thuộc trạng thái hiện tại.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Trạng thái thanh toán</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1 uppercase">Luồng chính</p>
                    <Select
                      value={editPaymentStatus}
                      onChange={(val) => setEditPaymentStatus(val as PaymentStatus)}
                      options={paymentStatusOptions
                        .filter((p) => ['PENDING', 'PAID'].includes(p.value))
                        .map((p) => ({
                          ...p,
                          disabled:
                            orderedPaymentStatuses.indexOf(p.value as PaymentStatus) <
                            orderedPaymentStatuses.indexOf(selectedOrder.paymentStatus),
                        }))}
                      placeholder="Chọn trạng thái thanh toán"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Tiến trình chính (chờ thanh toán → đã thanh toán), không thể lùi.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1 uppercase">Hoàn tiền / Thất bại</p>
                    <Select
                      value={editPaymentStatus}
                      onChange={(val) => setEditPaymentStatus(val as PaymentStatus)}
                      options={paymentStatusOptions
                        .filter((p) => ['REFUNDED', 'FAILED'].includes(p.value))
                        .map((p) => ({
                          ...p,
                          disabled:
                            orderedPaymentStatuses.indexOf(p.value as PaymentStatus) <
                            orderedPaymentStatuses.indexOf(selectedOrder.paymentStatus),
                        }))}
                      placeholder="Chọn trạng thái thanh toán"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Dùng khi hoàn tiền hoặc thất bại, theo thứ tự tiến lên.
                    </p>
                  </div>
                </div>
              </div>
            </div>

              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-white transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark disabled:opacity-60"
                >
                  {isUpdating ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <Loader />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã đơn, tên khách hàng, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 lg:pl-10 pr-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Order Status Filter */}
          <div>
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={statusOptions}
              placeholder="Trạng thái đơn hàng"
            />
          </div>

          {/* Payment Status Filter */}
          <div>
            <Select
              value={selectedPaymentStatus}
              onChange={setSelectedPaymentStatus}
              options={paymentStatusOptions}
              placeholder="Trạng thái thanh toán"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FiPackage className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Chờ xác nhận</p>
              <p className="text-lg font-bold text-gray-900">
                {orders.filter(o => o.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiPackage className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Đang xử lý</p>
              <p className="text-lg font-bold text-gray-900">
                {orders.filter(o => ['CONFIRMED', 'PROCESSING'].includes(o.status)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiPackage className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Đang giao</p>
              <p className="text-lg font-bold text-gray-900">
                {orders.filter(o => o.status === 'SHIPPING').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiPackage className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
              <p className="text-lg font-bold text-gray-900">
                {orders.filter(o => o.status === 'DELIVERED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Cards (mobile) */}
      <div className="space-y-3 md:hidden">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">{order.orderNumber}</p>
                <p className="text-sm font-medium text-gray-900">{order.user.fullName}</p>
                <p className="text-xs text-gray-500">{order.user.phone}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewOrder(order)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  aria-label="Xem đơn"
                >
                  <FiEye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenEdit(order)}
                  className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  aria-label="Sửa đơn"
                >
                  <FiEdit className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Sản phẩm</span>
              <span className="font-medium text-gray-900">{order.items.length} sản phẩm</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Tổng tiền</span>
              <span className="font-semibold text-gray-900">{formatCurrency(order.total)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Thanh toán</span>
              {getPaymentStatusBadge(order.paymentStatus)}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Trạng thái</span>
              {getOrderStatusBadge(order.status)}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <FiCalendar className="w-4 h-4" />
                {order.createdAt.toLocaleDateString('vi-VN')}
              </div>
              <span>{getPaymentMethodText(order.paymentMethod)}</span>
            </div>
          </div>
        ))}

        {!filteredOrders.length && (
          <div className="text-center py-8 text-gray-600 bg-white border border-gray-200 rounded-xl">
            Không tìm thấy đơn hàng nào.
          </div>
        )}
      </div>

      {/* Orders Table (desktop) */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-2 lg:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đơn hàng
                </th>
                <th className="text-left py-3 px-2 lg:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="text-left py-3 px-2 lg:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Sản phẩm
                </th>
                <th className="text-left py-3 px-2 lg:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="text-left py-3 px-2 lg:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Thanh toán
                </th>
                <th className="text-left py-3 px-2 lg:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="text-left py-3 px-2 lg:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Ngày tạo
                </th>
                <th className="text-left py-3 px-2 lg:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-3 lg:py-4 px-2 lg:px-4">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-primary">
                        {order.orderNumber}
                      </p>
                      {order.trackingNumber && (
                        <p className="text-xs text-gray-500">
                          Mã vận đơn: {order.trackingNumber}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 lg:py-4 px-2 lg:px-4">
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <FiUser className="w-3 h-3 lg:w-4 lg:h-4 text-gray-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs lg:text-sm font-medium text-gray-900 truncate">
                          {order.user.fullName}
                        </p>
                        <p className="text-xs text-gray-500 truncate lg:block hidden">{order.user.email}</p>
                        <p className="text-xs text-gray-500 lg:hidden">{order.user.phone}</p>
                        {/* Mobile: Show product count and payment info */}
                        <div className="md:hidden text-xs text-gray-500 space-y-1">
                          <div>{order.items.length} sản phẩm</div>
                          <div className="lg:hidden">{getPaymentMethodText(order.paymentMethod)}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 lg:py-4 px-2 lg:px-4 hidden md:table-cell">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <img
                          key={item.id}
                          src={item.product.thumbnail}
                          alt={item.product.name}
                          className="w-6 h-6 lg:w-8 lg:h-8 rounded-full border-2 border-white object-cover"
                          style={{ zIndex: order.items.length - index }}
                        />
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            +{order.items.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {order.items.length} sản phẩm
                    </p>
                  </td>
                  <td className="py-3 lg:py-4 px-2 lg:px-4">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-gray-900">
                        {formatCurrency(order.total)}
                      </p>
                      {order.discount > 0 && (
                        <p className="text-xs text-green-600">
                          Giảm {formatCurrency(order.discount)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 lg:py-4 px-2 lg:px-4 hidden lg:table-cell">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">
                        {getPaymentMethodText(order.paymentMethod)}
                      </p>
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </div>
                  </td>
                  <td className="py-3 lg:py-4 px-2 lg:px-4">
                    <div className="space-y-1">
                      {getOrderStatusBadge(order.status)}
                      {/* Mobile: Show payment status */}
                      <div className="lg:hidden">
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 lg:py-4 px-2 lg:px-4 hidden sm:table-cell">
                    <div className="flex items-center text-xs lg:text-sm text-gray-500">
                      <FiCalendar className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                      <span className="truncate">{order.createdAt.toLocaleDateString('vi-VN')}</span>
                    </div>
                  </td>
                  <td className="py-3 lg:py-4 px-2 lg:px-4">
                    <div className="flex items-center space-x-1 lg:space-x-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="p-1 lg:p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <FiEye className="w-3 h-3 lg:w-4 lg:h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(order)}
                        className="p-1 lg:p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                      >
                        <FiEdit className="w-3 h-3 lg:w-4 lg:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy đơn hàng nào
            </h3>
            <p className="text-gray-500">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs lg:text-sm text-gray-700">
            Hiển thị <span className="font-medium">1</span> đến{' '}
            <span className="font-medium">{filteredOrders.length}</span> trong tổng số{' '}
            <span className="font-medium">{filteredOrders.length}</span> đơn hàng
          </div>
          <div className="flex items-center space-x-1 lg:space-x-2">
            <button className="px-2 lg:px-3 py-1 border border-gray-300 rounded text-xs lg:text-sm text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50">
              Trước
            </button>
            <button className="px-2 lg:px-3 py-1 bg-primary text-white rounded text-xs lg:text-sm">
              1
            </button>
            <button className="px-2 lg:px-3 py-1 border border-gray-300 rounded text-xs lg:text-sm text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50">
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
