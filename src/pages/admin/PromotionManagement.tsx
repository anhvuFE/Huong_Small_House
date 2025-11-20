import React, { useEffect, useMemo, useState } from 'react';
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiEye,
  FiToggleLeft,
  FiToggleRight,
  FiPercent,
  FiDollarSign,
  FiCalendar,
  FiUsers,
  FiTag,
} from 'react-icons/fi';
import { Select } from '../../components/common/Select';
import { promotionApi } from '../../services/promotionApi';
import { useAuthStore } from '../../store/useAuthStore';
import { mockPromotionCodes } from '../../data/adminData';
import type { PromotionCode } from '../../types/admin';

export const PromotionManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [promotions, setPromotions] = useState<PromotionCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const userRole = useAuthStore((state) => state.user?.role);

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Đang hoạt động' },
    { value: 'inactive', label: 'Không hoạt động' },
    { value: 'expired', label: 'Đã hết hạn' },
  ];

  const typeOptions = [
    { value: '', label: 'Tất cả loại' },
    { value: 'PERCENTAGE', label: 'Giảm theo %' },
    { value: 'FIXED_AMOUNT', label: 'Giảm cố định' },
  ];

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await promotionApi.listPromotions();
        setPromotions(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Không thể tải khuyến mãi. Hiển thị dữ liệu mẫu.';
        setError(message);
        setPromotions(mockPromotionCodes);
      } finally {
        setIsLoading(false);
      }
    };

    if (userRole !== 'ADMIN') {
      setError('Bạn không có quyền truy cập trang quản lý khuyến mãi.');
      setPromotions([]);
      setIsLoading(false);
      return;
    }

    fetchPromotions();
  }, [userRole]);

  const filteredPromotions = useMemo(() => {
    return promotions.filter((promo) => {
      const matchesSearch =
        promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.name.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesStatus = true;
      if (statusFilter === 'active') {
        matchesStatus = promo.isActive && new Date() <= promo.endDate;
      } else if (statusFilter === 'inactive') {
        matchesStatus = !promo.isActive;
      } else if (statusFilter === 'expired') {
        matchesStatus = new Date() > promo.endDate;
      }

      const matchesType = !typeFilter || promo.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [promotions, searchTerm, statusFilter, typeFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getPromotionStatus = (promo: PromotionCode) => {
    const now = new Date();
    if (!promo.isActive) {
      return { text: 'Tạm dừng', color: 'bg-gray-100 text-gray-800' };
    } else if (now > promo.endDate) {
      return { text: 'Đã hết hạn', color: 'bg-red-100 text-red-800' };
    } else if (promo.startDate && now < promo.startDate) {
      return { text: 'Chưa bắt đầu', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { text: 'Đang hoạt động', color: 'bg-green-100 text-green-800' };
    }
  };

  const getUsagePercentage = (promo: PromotionCode) => {
    if (!promo.usageLimit) return null;
    return Math.round((promo.usedCount / promo.usageLimit) * 100);
  };

  const getPromotionStats = () => {
    const total = promotions.length;
    const active = promotions.filter(p =>
      p.isActive && (!p.startDate || new Date() >= p.startDate) && new Date() <= p.endDate
    ).length;
    const expired = promotions.filter(p => new Date() > p.endDate).length;
    const totalUsage = promotions.reduce((sum, p) => sum + (p.usedCount || 0), 0);

    return { total, active, expired, totalUsage };
  };

  const stats = getPromotionStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Quản lý khuyến mãi</h1>
          <p className="text-sm lg:text-base text-gray-600">
            Tạo và quản lý các mã giảm giá cho khách hàng
          </p>
        </div>
        <button className="inline-flex items-center px-3 lg:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm lg:text-base">
          <FiPlus className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" />
          <span className="hidden sm:inline">Tạo mã khuyến mãi</span>
          <span className="sm:hidden">Tạo mã</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiTag className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Tổng mã KM</p>
              <p className="text-lg font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiToggleRight className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
              <p className="text-lg font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <FiCalendar className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Đã hết hạn</p>
              <p className="text-lg font-bold text-gray-900">{stats.expired}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiUsers className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Tổng lượt dùng</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalUsage}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm mã hoặc tên khuyến mãi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 lg:pl-10 pr-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              placeholder="Trạng thái"
            />
          </div>

          {/* Type Filter */}
          <div>
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              options={typeOptions}
              placeholder="Loại khuyến mãi"
            />
          </div>
        </div>
      </div>

      {/* Promotions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading && (
          <div className="p-4 text-gray-600 text-sm border-b border-gray-200">Đang tải danh sách khuyến mãi...</div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-2 lg:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã khuyến mãi
                </th>
                <th className="text-left py-3 px-2 lg:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại & Giá trị
                </th>
                <th className="text-left py-3 px-2 lg:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Điều kiện
                </th>
                <th className="text-left py-3 px-2 lg:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Thời gian
                </th>
                <th className="text-left py-3 px-2 lg:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sử dụng
                </th>
                <th className="text-left py-3 px-2 lg:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="text-left py-3 px-2 lg:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPromotions.map((promo) => {
                const status = getPromotionStatus(promo);
                const usagePercentage = getUsagePercentage(promo);

                return (
                  <tr key={promo.id} className="hover:bg-gray-50">
                    <td className="py-3 lg:py-4 px-2 lg:px-4">
                      <div>
                        <p className="text-xs lg:text-sm font-bold text-primary font-mono">
                          {promo.code}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-900 font-medium truncate">
                          {promo.name}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1 lg:block hidden">
                          {promo.description}
                        </p>
                        {/* Mobile: Show conditions and dates */}
                        <div className="md:hidden text-xs text-gray-500 space-y-1 mt-1">
                          {promo.minOrderValue && (
                            <div>Đơn tối thiểu: {formatCurrency(promo.minOrderValue)}</div>
                          )}
                          <div className="lg:hidden flex items-center">
                            <FiCalendar className="w-3 h-3 mr-1" />
                            {promo.startDate.toLocaleDateString('vi-VN')} - {promo.endDate.toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 lg:py-4 px-2 lg:px-4">
                      <div className="flex items-center space-x-1 lg:space-x-2">
                        {promo.type === 'PERCENTAGE' ? (
                          <div className="p-1 lg:p-1.5 bg-blue-100 rounded">
                            <FiPercent className="w-3 h-3 text-blue-600" />
                          </div>
                        ) : (
                          <div className="p-1 lg:p-1.5 bg-green-100 rounded">
                            <FiDollarSign className="w-3 h-3 text-green-600" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs lg:text-sm font-medium text-gray-900">
                            {promo.type === 'PERCENTAGE'
                              ? `${promo.value}%`
                              : formatCurrency(promo.value)}
                          </p>
                          {promo.maxDiscount && (
                            <p className="text-xs text-gray-500 truncate">
                              Tối đa {formatCurrency(promo.maxDiscount)}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 lg:py-4 px-2 lg:px-4 hidden md:table-cell">
                      <div className="text-xs lg:text-sm text-gray-900">
                        {promo.minOrderValue && (
                          <p>Đơn tối thiểu: {formatCurrency(promo.minOrderValue)}</p>
                        )}
                        {promo.applicableCategories && promo.applicableCategories.length > 0 && (
                          <p className="text-xs text-gray-500 truncate">
                            Áp dụng: {promo.applicableCategories.join(', ')}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 lg:py-4 px-2 lg:px-4 hidden lg:table-cell">
                      <div className="text-xs lg:text-sm text-gray-900">
                        <p className="flex items-center">
                          <FiCalendar className="w-3 h-3 mr-1" />
                          {promo.startDate.toLocaleDateString('vi-VN')}
                        </p>
                        <p className="text-xs text-gray-500">
                          đến {promo.endDate.toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 lg:py-4 px-2 lg:px-4">
                      <div>
                        <div className="flex items-center justify-between text-xs lg:text-sm">
                          <span className="text-gray-900 font-medium">
                            {promo.usedCount}
                          </span>
                          {promo.usageLimit && (
                            <span className="text-gray-500">
                              / {promo.usageLimit}
                            </span>
                          )}
                        </div>
                        {usagePercentage !== null && (
                          <div className="mt-1">
                            <div className="w-full bg-gray-200 rounded-full h-1.5 lg:h-2">
                              <div
                                className={`h-1.5 lg:h-2 rounded-full ${
                                  usagePercentage >= 90
                                    ? 'bg-red-500'
                                    : usagePercentage >= 70
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {usagePercentage}% đã sử dụng
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 lg:py-4 px-2 lg:px-4">
                      <span className={`inline-flex items-center px-1.5 lg:px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="py-3 lg:py-4 px-2 lg:px-4">
                      <div className="flex items-center space-x-1 lg:space-x-2">
                        <button className="p-1 lg:p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                          <FiEye className="w-3 h-3 lg:w-4 lg:h-4" />
                        </button>
                        <button className="p-1 lg:p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
                          <FiEdit className="w-3 h-3 lg:w-4 lg:h-4" />
                        </button>
                        <button className="inline-flex items-center">
                          {promo.isActive ? (
                            <FiToggleRight className="w-6 h-6 lg:w-8 lg:h-8 text-green-500" />
                          ) : (
                            <FiToggleLeft className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" />
                          )}
                        </button>
                        <button className="p-1 lg:p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                          <FiTrash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredPromotions.length === 0 && (
          <div className="text-center py-12">
            <FiTag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy mã khuyến mãi nào
            </h3>
            <p className="text-gray-500">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredPromotions.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs lg:text-sm text-gray-700">
            Hiển thị <span className="font-medium">1</span> đến{' '}
            <span className="font-medium">{filteredPromotions.length}</span> trong tổng số{' '}
            <span className="font-medium">{filteredPromotions.length}</span> mã khuyến mãi
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
