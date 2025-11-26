import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import type { CreatePromotionPayload, UpdatePromotionPayload } from '../../services/promotionApi';
import { useAuthStore } from '../../store/useAuthStore';
import { mockPromotionCodes } from '../../data/adminData';
import type { PromotionCode } from '../../types/admin';
import { Loader } from '../../components/common/Loader';
import { useToast } from '../../components/common/Toast';

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDefaultFormData = () => {
  const today = new Date();
  const end = new Date();
  end.setDate(today.getDate() + 30);
  return {
    name: '',
    code: '',
    type: 'PERCENTAGE' as PromotionCode['type'],
    value: 0,
    minOrderValue: '',
    maxDiscount: '',
    usageLimit: '',
    startDate: formatDateInput(today),
    endDate: formatDateInput(end),
    description: '',
  };
};

export const PromotionManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [promotions, setPromotions] = useState<PromotionCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingPromotionId, setUpdatingPromotionId] = useState<string | null>(null);
  const [viewingPromotionId, setViewingPromotionId] = useState<string | null>(null);
  const [editingPromotionId, setEditingPromotionId] = useState<string | null>(null);
  const [savingPromotion, setSavingPromotion] = useState(false);
  const [deletingPromotionId, setDeletingPromotionId] = useState<string | null>(null);
  const [deleteConfirmPromotion, setDeleteConfirmPromotion] = useState<PromotionCode | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create' | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionCode | null>(null);
  const [formData, setFormData] = useState(getDefaultFormData());
  const userRole = useAuthStore((state) => state.user?.role);
  const { showToast } = useToast();

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

  const fetchPromotions = useCallback(async () => {
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
      showToast({ title: 'Không thể tải khuyến mãi', variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const hydrateForm = (promotion: PromotionCode) => {
    setFormData({
      name: promotion.name,
      code: promotion.code,
      type: promotion.type,
      value: promotion.value,
      minOrderValue: promotion.minOrderValue?.toString() ?? '',
      maxDiscount: promotion.maxDiscount?.toString() ?? '',
      usageLimit: promotion.usageLimit?.toString() ?? '',
      startDate: formatDateInput(promotion.startDate),
      endDate: formatDateInput(promotion.endDate),
      description: promotion.description ?? '',
    });
  };

  const openCreateModal = () => {
    setFormData(getDefaultFormData());
    setSelectedPromotion(null);
    setModalMode('create');
  };

  const autoFillMaxDiscount = useCallback(
    (nextType: PromotionCode['type'], nextValue: string | number, nextMinOrder: string | number) => {
      const valueNum = Number(nextValue);
      const minOrderNum = Number(nextMinOrder);
      if (!nextMinOrder || Number.isNaN(minOrderNum)) return;
      if (Number.isNaN(valueNum)) return;

      if (nextType === 'PERCENTAGE') {
        const autoCap = Math.round((minOrderNum * valueNum) / 100);
        setFormData((prev) => ({ ...prev, maxDiscount: autoCap ? autoCap.toString() : '' }));
      } else {
        setFormData((prev) => ({ ...prev, maxDiscount: valueNum ? valueNum.toString() : '' }));
      }
    },
    [],
  );

  useEffect(() => {
    if (userRole !== 'ADMIN') {
      setError('Bạn không có quyền truy cập trang quản lý khuyến mãi.');
      setPromotions([]);
      setIsLoading(false);
      return;
    }

    fetchPromotions();
  }, [userRole, fetchPromotions]);

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

  const handleToggleStatus = async (promo: PromotionCode) => {
    if (!promo.id) return;
    setUpdatingPromotionId(promo.id);
    try {
      const updated = await promotionApi.updateStatus(promo.id, !promo.isActive);
      setPromotions((prev) => prev.map((item) => (item.id === promo.id ? updated : item)));
      showToast({
        title: !promo.isActive ? 'Đã bật khuyến mãi' : 'Đã tạm dừng khuyến mãi',
        variant: 'success',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể cập nhật trạng thái.';
      showToast({ title: message, variant: 'error' });
    } finally {
      setUpdatingPromotionId(null);
    }
  };

  const handleViewDetail = async (promo: PromotionCode) => {
    if (!promo.id) return;
    setViewingPromotionId(promo.id);
    setModalMode('view');
    try {
      const detail = await promotionApi.getById(promo.id);
      setSelectedPromotion(detail);
      hydrateForm(detail);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải chi tiết khuyến mãi.';
      showToast({ title: message, variant: 'error' });
      setSelectedPromotion(null);
      setModalMode(null);
    } finally {
      setViewingPromotionId(null);
    }
  };

  const handleEditPrepare = async (promo: PromotionCode) => {
    if (!promo.id) return;
    setEditingPromotionId(promo.id);
    setModalMode('edit');
    try {
      const detail = await promotionApi.getById(promo.id);
      setSelectedPromotion(detail);
      hydrateForm(detail);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể lấy dữ liệu để chỉnh sửa.';
      showToast({ title: message, variant: 'error' });
      setSelectedPromotion(null);
      setModalMode(null);
    } finally {
      setEditingPromotionId(null);
    }
  };

  const closeModal = () => {
    setSelectedPromotion(null);
    setModalMode(null);
    setSavingPromotion(false);
  };

  const handleSubmitPromotion = async () => {
    if (modalMode === 'view') return;
    setSavingPromotion(true);
    try {
      const validFromIso = formData.startDate ? new Date(formData.startDate).toISOString() : undefined;
      const validUntilIso = formData.endDate ? new Date(formData.endDate).toISOString() : new Date().toISOString();

      const basePayload: CreatePromotionPayload & UpdatePromotionPayload = {
        name: formData.name.trim() || formData.code.trim(),
        description: formData.description,
        code: formData.code.trim(),
        type: formData.type === 'PERCENTAGE' ? 'percent' : 'fixed',
        value: formData.value ? Number(formData.value) : 0,
        minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : undefined,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        validFrom: validFromIso,
        validUntil: validUntilIso,
      };

      if (modalMode === 'create') {
        const created = await promotionApi.create(basePayload);
        setPromotions((prev) => [created, ...prev]);
        fetchPromotions();
        setFormData(getDefaultFormData());
        closeModal();
        showToast({ title: 'Đã tạo khuyến mãi', variant: 'success' });
      } else if (selectedPromotion?.id) {
        const updated = await promotionApi.update(selectedPromotion.id, basePayload);
        setPromotions((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setSelectedPromotion(updated);
        hydrateForm(updated);
        // Refresh list from backend to ensure the latest data is reflected everywhere
        fetchPromotions();
        setModalMode('view');
        showToast({ title: 'Đã cập nhật khuyến mãi', variant: 'success' });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể cập nhật khuyến mãi.';
      showToast({ title: message, variant: 'error' });
    } finally {
      setSavingPromotion(false);
    }
  };

  const handleDelete = (promo: PromotionCode) => {
    if (!promo.id) return;
    setDeleteConfirmPromotion(promo);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmPromotion?.id) return;
    setDeletingPromotionId(deleteConfirmPromotion.id);
    try {
      await promotionApi.delete(deleteConfirmPromotion.id);
      setPromotions((prev) => prev.filter((item) => item.id !== deleteConfirmPromotion.id));
      showToast({ title: 'Đã xóa khuyến mãi', variant: 'success' });
      setDeleteConfirmPromotion(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể xóa khuyến mãi.';
      showToast({ title: message, variant: 'error' });
    } finally {
      setDeletingPromotionId(null);
    }
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
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-3 lg:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm lg:text-base"
        >
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
        <div className="p-4">
          <Loader />
        </div>
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
                        <button
                          className={`p-1 lg:p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors ${
                            viewingPromotionId === promo.id ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                          onClick={() => handleViewDetail(promo)}
                          disabled={viewingPromotionId === promo.id}
                          aria-label="Xem chi tiết khuyến mãi"
                        >
                          <FiEye className="w-3 h-3 lg:w-4 lg:h-4" />
                        </button>
                        <button
                          className={`p-1 lg:p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors ${
                            editingPromotionId === promo.id ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                          onClick={() => handleEditPrepare(promo)}
                          disabled={editingPromotionId === promo.id}
                          aria-label="Chuẩn bị chỉnh sửa khuyến mãi"
                        >
                          <FiEdit className="w-3 h-3 lg:w-4 lg:h-4" />
                        </button>
                        <button
                          className={`inline-flex items-center transition-opacity ${
                            updatingPromotionId === promo.id ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                          onClick={() => handleToggleStatus(promo)}
                          disabled={updatingPromotionId === promo.id}
                          aria-label={promo.isActive ? 'Tạm dừng khuyến mãi' : 'Kích hoạt khuyến mãi'}
                        >
                          {promo.isActive ? (
                            <FiToggleRight className="w-6 h-6 lg:w-8 lg:h-8 text-green-500" />
                          ) : (
                            <FiToggleLeft className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" />
                          )}
                        </button>
                        <button
                          className={`p-1 lg:p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors ${
                            deletingPromotionId === promo.id ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                          onClick={() => handleDelete(promo)}
                          disabled={deletingPromotionId === promo.id}
                          aria-label="Xóa khuyến mãi"
                        >
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

      {modalMode && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  {modalMode === 'view'
                    ? 'Chi tiết khuyến mãi'
                    : modalMode === 'edit'
                    ? 'Chỉnh sửa khuyến mãi'
                    : 'Tạo khuyến mãi'}
                </p>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedPromotion?.name || formData.name || 'Khuyến mãi mới'}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 rounded-full p-2 hover:bg-gray-100"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>
            {modalMode === 'view' && selectedPromotion && (
              <div className="px-5 py-4 space-y-3 text-sm text-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Mã</span>
                  <span className="font-semibold font-mono text-primary">{selectedPromotion.code}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Loại & giá trị</span>
                  <span className="font-semibold">
                    {selectedPromotion.type === 'PERCENTAGE'
                      ? `${selectedPromotion.value}%`
                      : formatCurrency(selectedPromotion.value)}
                    {selectedPromotion.maxDiscount
                      ? ` (tối đa ${formatCurrency(selectedPromotion.maxDiscount)})`
                      : ''}
                  </span>
                </div>
                {selectedPromotion.minOrderValue && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Đơn tối thiểu</span>
                    <span className="font-semibold">{formatCurrency(selectedPromotion.minOrderValue)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Thời gian</span>
                  <span className="font-semibold">
                    {selectedPromotion.startDate.toLocaleDateString('vi-VN')} -{' '}
                    {selectedPromotion.endDate.toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Trạng thái</span>
                  <span className="font-semibold">
                    {selectedPromotion.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Mô tả</p>
                  <p className="text-gray-800">{selectedPromotion.description || 'Chưa có mô tả.'}</p>
                </div>
              </div>
            )}

            {modalMode !== 'view' && (
              <div className="px-5 py-4 space-y-4 text-sm text-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Tên</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Mã</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.code}
                      onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    />
                  </div>
                  <div>
                    <Select
                      label="Loại"
                      value={formData.type}
                      onChange={(next) => {
                        const nextType = next as PromotionCode['type'];
                        setFormData((prev) => ({ ...prev, type: nextType }));
                        autoFillMaxDiscount(nextType, formData.value, formData.minOrderValue);
                      }}
                      options={[
                        { value: 'PERCENTAGE', label: 'Giảm theo %' },
                        { value: 'FIXED_AMOUNT', label: 'Giảm cố định' },
                      ]}
                      className="mt-[6px]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Giá trị</label>
                    <input
                      type="number"
                      min={0}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.value}
                      onChange={(e) => {
                        const nextValue = e.target.value;
                        setFormData((prev) => ({ ...prev, value: Number(nextValue) }));
                        autoFillMaxDiscount(formData.type, nextValue, formData.minOrderValue);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Đơn tối thiểu</label>
                    <input
                      type="number"
                      min={0}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.minOrderValue}
                      onChange={(e) => {
                        const nextMinOrder = e.target.value;
                        setFormData((prev) => ({ ...prev, minOrderValue: nextMinOrder }));
                        autoFillMaxDiscount(formData.type, formData.value, nextMinOrder);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Giảm tối đa</label>
                    <input
                      type="number"
                      min={0}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, maxDiscount: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Ngày bắt đầu</label>
                    <input
                      type="date"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.startDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Ngày kết thúc</label>
                    <input
                      type="date"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.endDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Giới hạn lượt dùng</label>
                    <input
                      type="number"
                      min={0}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData((prev) => ({ ...prev, usageLimit: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Mô tả</label>
                  <textarea
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Đóng
              </button>
              {modalMode === 'view' && (
                <button
                  onClick={() => {
                    setModalMode('edit');
                  }}
                  className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark"
                >
                  Chỉnh sửa
                </button>
              )}
              {modalMode !== 'view' && (
                <button
                  onClick={handleSubmitPromotion}
                  disabled={savingPromotion}
                  className={`px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark ${
                    savingPromotion ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {savingPromotion
                    ? 'Đang lưu...'
                    : modalMode === 'create'
                    ? 'Tạo khuyến mãi'
                    : 'Lưu thay đổi'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {deleteConfirmPromotion && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-xs uppercase tracking-wide text-gray-500">Xóa khuyến mãi</p>
              <h3 className="text-lg font-semibold text-gray-900 mt-1">
                {deleteConfirmPromotion.code}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Bạn có chắc muốn xóa mã này? Hành động không thể hoàn tác.
              </p>
            </div>
            <div className="px-5 py-4 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmPromotion(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={Boolean(deletingPromotionId)}
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                disabled={Boolean(deletingPromotionId)}
                className={`px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 ${
                  deletingPromotionId ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {deletingPromotionId ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
