import React, { useState, useMemo } from 'react';
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
import { mockOrders } from '../../data/adminData';
import { Select } from '../../components/common/Select';
import type { OrderStatus, PaymentStatus } from '../../types/admin';

export const OrderManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');
  const [dateFilter, setDateFilter] = useState('');

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

  const filteredOrders = useMemo(() => {
    return mockOrders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !selectedStatus || order.status === selectedStatus;
      const matchesPaymentStatus = !selectedPaymentStatus || order.paymentStatus === selectedPaymentStatus;

      return matchesSearch && matchesStatus && matchesPaymentStatus;
    });
  }, [searchTerm, selectedStatus, selectedPaymentStatus]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-gray-600">
            Theo dõi và xử lý các đơn hàng từ khách hàng
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FiDownload className="w-4 h-4 mr-2" />
            Xuất Excel
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
            <FiFilter className="w-4 h-4 mr-2" />
            Bộ lọc nâng cao
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã đơn, tên khách hàng, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FiPackage className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Chờ xác nhận</p>
              <p className="text-lg font-bold text-gray-900">
                {mockOrders.filter(o => o.status === 'PENDING').length}
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
                {mockOrders.filter(o => ['CONFIRMED', 'PROCESSING'].includes(o.status)).length}
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
                {mockOrders.filter(o => o.status === 'SHIPPING').length}
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
                {mockOrders.filter(o => o.status === 'DELIVERED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đơn hàng
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thanh toán
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-sm font-medium text-primary">
                        {order.orderNumber}
                      </p>
                      {order.trackingNumber && (
                        <p className="text-xs text-gray-500">
                          Mã vận đơn: {order.trackingNumber}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <FiUser className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {order.user.fullName}
                        </p>
                        <p className="text-xs text-gray-500">{order.user.email}</p>
                        <p className="text-xs text-gray-500">{order.user.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <img
                          key={item.id}
                          src={item.product.thumbnail}
                          alt={item.product.name}
                          className="w-8 h-8 rounded-full border-2 border-white object-cover"
                          style={{ zIndex: order.items.length - index }}
                        />
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
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
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.total)}
                      </p>
                      {order.discount > 0 && (
                        <p className="text-xs text-green-600">
                          Giảm {formatCurrency(order.discount)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">
                        {getPaymentMethodText(order.paymentMethod)}
                      </p>
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {getOrderStatusBadge(order.status)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiCalendar className="w-4 h-4 mr-1" />
                      {order.createdAt.toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
                        <FiEdit className="w-4 h-4" />
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
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-700">
            Hiển thị <span className="font-medium">1</span> đến{' '}
            <span className="font-medium">{filteredOrders.length}</span> trong tổng số{' '}
            <span className="font-medium">{filteredOrders.length}</span> đơn hàng
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50">
              Trước
            </button>
            <button className="px-3 py-1 bg-primary text-white rounded text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50">
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};