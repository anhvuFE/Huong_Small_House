import React, { useState, useMemo } from 'react';
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiEye,
  FiPackage,
  FiToggleLeft,
  FiToggleRight,
  FiImage,
  FiSave,
  FiX,
} from 'react-icons/fi';
import { categories } from '../../data/products';

interface Category {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  image?: string;
  isActive: boolean;
  productCount: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const mockCategories: Category[] = [
  {
    id: 'VITAMIN',
    name: 'Vitamin',
    nameEn: 'Vitamins',
    description: 'Các loại vitamin tổng hợp và vitamin đơn lẻ',
    icon: 'vitamin',
    isActive: true,
    productCount: 3,
    order: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'COLLAGEN',
    name: 'Collagen',
    nameEn: 'Collagen',
    description: 'Sản phẩm collagen cho sức khỏe da và xương khớp',
    icon: 'collagen',
    isActive: true,
    productCount: 2,
    order: 2,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'BONE_SUPPORT',
    name: 'Xương khớp',
    nameEn: 'Bone Support',
    description: 'Hỗ trợ xương khớp và sụn khớp',
    icon: 'bone',
    isActive: true,
    productCount: 1,
    order: 3,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'WEIGHT_LOSS',
    name: 'Giảm cân',
    nameEn: 'Weight Loss',
    description: 'Sản phẩm hỗ trợ giảm cân an toàn',
    icon: 'scale',
    isActive: true,
    productCount: 1,
    order: 4,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'IMMUNITY',
    name: 'Tăng đề kháng',
    nameEn: 'Immunity',
    description: 'Tăng cường hệ miễn dịch',
    icon: 'shield',
    isActive: true,
    productCount: 1,
    order: 5,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'DIGESTIVE',
    name: 'Tiêu hóa',
    nameEn: 'Digestive',
    description: 'Hỗ trợ hệ tiêu hóa khỏe mạnh',
    icon: 'leaf',
    isActive: true,
    productCount: 1,
    order: 6,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'HEART_HEALTH',
    name: 'Tim mạch',
    nameEn: 'Heart Health',
    description: 'Bảo vệ sức khỏe tim mạch',
    icon: 'heart',
    isActive: true,
    productCount: 2,
    order: 7,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'BEAUTY',
    name: 'Làm đẹp',
    nameEn: 'Beauty',
    description: 'Sản phẩm làm đẹp da, tóc, móng',
    icon: 'beauty',
    isActive: true,
    productCount: 1,
    order: 8,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'SLEEP',
    name: 'Giấc ngủ',
    nameEn: 'Sleep',
    description: 'Hỗ trợ giấc ngủ ngon',
    icon: 'sleep',
    isActive: true,
    productCount: 1,
    order: 9,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

export const CategoryManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    icon: '',
    isActive: true,
  });

  const filteredCategories = useMemo(() => {
    return mockCategories
      .filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.order - b.order);
  }, [searchTerm]);

  const handleAddCategory = () => {
    setFormData({
      name: '',
      nameEn: '',
      description: '',
      icon: '',
      isActive: true,
    });
    setEditingCategory(null);
    setShowAddModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setFormData({
      name: category.name,
      nameEn: category.nameEn,
      description: category.description,
      icon: category.icon,
      isActive: category.isActive,
    });
    setEditingCategory(category);
    setShowAddModal(true);
  };

  const handleSaveCategory = () => {
    // In real app, would call API to save category
    console.log('Saving category:', formData);
    setShowAddModal(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      // In real app, would call API to delete category
      console.log('Deleting category:', categoryId);
    }
  };

  const toggleCategoryStatus = (categoryId: string) => {
    // In real app, would call API to toggle status
    console.log('Toggling status for category:', categoryId);
  };

  const getCategoryStats = () => {
    const total = mockCategories.length;
    const active = mockCategories.filter(c => c.isActive).length;
    const totalProducts = mockCategories.reduce((sum, c) => sum + c.productCount, 0);
    const avgProducts = Math.round(totalProducts / total);

    return { total, active, totalProducts, avgProducts };
  };

  const stats = getCategoryStats();

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
                  <p className="text-sm text-gray-500">{category.nameEn}</p>
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
              {category.description}
            </p>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <FiPackage className="w-4 h-4 mr-1" />
                <span>{category.productCount} sản phẩm</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span>Thứ tự: {category.order}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Cập nhật: {category.updatedAt.toLocaleDateString('vi-VN')}
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
                  Tên danh mục (Tiếng Anh) *
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
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                <FiSave className="w-4 h-4 mr-2" />
                {editingCategory ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};