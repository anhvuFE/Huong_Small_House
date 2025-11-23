import React, { useEffect, useMemo, useState } from 'react';
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiEye,
  FiPackage,
  FiToggleLeft,
  FiToggleRight,
  FiSave,
  FiX,
  FiAlertTriangle,
} from 'react-icons/fi';
import { productApi } from '../../services/productApi';
import type { Category } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';
import { Loader } from '../../components/common/Loader';
import { useToast } from '../../components/common/Toast';

const defaultFormState = {
  name: '',
  nameEn: '',
  description: '',
  icon: '',
  isActive: true,
};

export const CategoryManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ ...defaultFormState });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const userRole = useAuthStore((state) => state.user?.role);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setStatusMessage('');
        const data = await productApi.listCategories('admin');
        setCategories(data);
      } catch {
        setStatusMessage('Không thể tải danh mục. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    if (userRole !== 'ADMIN') {
      setStatusMessage('Chỉ quản trị viên mới có thể quản lý danh mục.');
      setIsLoading(false);
      return;
    }

    fetchCategories();
  }, [userRole]);

  const filteredCategories = useMemo(() => {
    return categories
      .filter((category) =>
        (category.name ?? '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (category.description ?? '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const orderA = a.order ?? 0;
        const orderB = b.order ?? 0;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name ?? '').localeCompare(b.name ?? '');
      });
  }, [categories, searchTerm]);

  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((c) => c.isActive !== false).length;
    const totalProducts = categories.reduce((sum, c) => sum + (c.productCount ?? 0), 0);
    const avgProducts = total ? Math.round(totalProducts / total) : 0;
    return { total, active, totalProducts, avgProducts };
  }, [categories]);

  const handleAddCategory = () => {
    setFormData({ ...defaultFormState });
    setEditingCategory(null);
    setShowAddModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setFormData({
      name: category.name,
      nameEn: category.nameEn ?? '',
      description: category.description ?? '',
      icon: category.icon ?? '',
      isActive: category.isActive ?? true,
    });
    setEditingCategory(category);
    setShowAddModal(true);
  };

  const handleSaveCategory = async () => {
    if (!formData.name.trim()) return;
    if (userRole !== 'ADMIN') {
      setStatusMessage('Chỉ admin mới có thể tạo danh mục.');
      return;
    }

    if (editingCategory) {
      setStatusMessage('Tính năng cập nhật danh mục sẽ được bổ sung khi có API.');
      setShowAddModal(false);
      setEditingCategory(null);
      return;
    }

    try {
      setIsSubmitting(true);
      const category = await productApi.createCategory({ name: formData.name });
      setCategories((prev) => [...prev, category]);
      setStatusMessage('Tạo danh mục thành công.');
      setShowAddModal(false);
      setFormData({ ...defaultFormState });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể lưu danh mục. Vui lòng thử lại.';
      setStatusMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;
    setDeleteTarget(category);
  };

  const toggleCategoryStatus = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId ? { ...category, isActive: category.isActive === false ? true : false } : category
      )
    );
    setStatusMessage('Đã cập nhật trạng thái danh mục (cục bộ).');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Loader />
      </div>
    );
  }

  if (userRole !== 'ADMIN') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-red-600">
        Bạn không có quyền truy cập trang này.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
          <p className="text-gray-600">
            Quản lý các danh mục sản phẩm và phân loại
          </p>
        </div>
        <button
          onClick={handleAddCategory}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <FiPlus className="w-5 h-5 mr-2" />
          Thêm danh mục
        </button>
      </div>

      {statusMessage && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <FiAlertTriangle className="w-4 h-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiPackage className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Tổng danh mục</p>
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
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiPackage className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FiPackage className="w-5 h-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">TB SP/danh mục</p>
              <p className="text-lg font-bold text-gray-900">{stats.avgProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FiPackage className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.name}
                  </h3>
                  {category.nameEn && <p className="text-sm text-gray-500">{category.nameEn}</p>}
                </div>
              </div>
              <button onClick={() => toggleCategoryStatus(category.id)}>
                {category.isActive ? (
                  <FiToggleRight className="w-8 h-8 text-green-500" />
                ) : (
                  <FiToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {category.description || 'Chưa có mô tả cho danh mục này.'}
            </p>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <FiPackage className="w-4 h-4 mr-1" />
                <span>{category.productCount ?? 0} sản phẩm</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span>Thứ tự: {category.order ?? 0}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Cập nhật: {category.updatedAt ? category.updatedAt.toLocaleDateString('vi-VN') : '--/--/----'}
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                  <FiEye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEditCategory(category)}
                  className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                >
                  <FiEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {!filteredCategories.length && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center col-span-full text-gray-600">
            Không tìm thấy danh mục nào.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên danh mục (Tiếng Việt) *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ví dụ: Vitamin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên danh mục (Tiếng Anh)
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ví dụ: Vitamins"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Mô tả ngắn về danh mục..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Tên icon hoặc URL ảnh"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Kích hoạt danh mục</h4>
                  <p className="text-sm text-gray-500">Hiển thị danh mục trên website</p>
                </div>
                <button onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}>
                  {formData.isActive ? (
                    <FiToggleRight className="w-8 h-8 text-green-500" />
                  ) : (
                    <FiToggleLeft className="w-8 h-8 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60"
              >
                <FiSave className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Đang lưu...' : editingCategory ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="absolute inset-0" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900">Xóa danh mục</h3>
              <p className="text-sm text-gray-600 mt-2">
                Tính năng xóa sẽ gắn API khi có. Bạn muốn ẩn tạm danh mục “{deleteTarget.name}” khỏi danh sách?
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-white transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
      setCategories((prev) => prev.filter((category) => category.id !== deleteTarget.id));
      setDeleteTarget(null);
      setStatusMessage('Đã ẩn danh mục khỏi danh sách (chưa gọi API).');
      showToast({ title: 'Đã ẩn danh mục', variant: 'info' });
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700"
              >
                Ẩn tạm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
