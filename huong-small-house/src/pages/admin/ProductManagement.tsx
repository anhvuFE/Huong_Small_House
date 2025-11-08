import React, { useState, useMemo } from 'react';
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiEye,
  FiToggleLeft,
  FiToggleRight,
  FiPackage,
} from 'react-icons/fi';
import { mockProducts, categories, brands } from '../../data/products';
import { Select } from '../../components/common/Select';
import { Pagination } from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';

export const ProductManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    getPaginatedData,
  } = usePagination(1, 10);

  const filteredProducts = useMemo(() => {
    return mockProducts.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      const matchesBrand = !selectedBrand || product.brand === selectedBrand;

      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [searchTerm, selectedCategory, selectedBrand]);

  const paginatedData = useMemo(() => {
    return getPaginatedData(filteredProducts);
  }, [filteredProducts, getPaginatedData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Hết hàng', color: 'bg-red-100 text-red-800' };
    if (stock < 20) return { text: 'Sắp hết', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Còn hàng', color: 'bg-green-100 text-green-800' };
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-sm lg:text-base text-gray-600">
            Quản lý thông tin và trạng thái các sản phẩm
          </p>
        </div>
        <button className="inline-flex items-center px-3 lg:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm lg:text-base">
          <FiPlus className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
          <span className="hidden sm:inline">Thêm sản phẩm</span>
          <span className="sm:hidden">Thêm</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 lg:pl-10 pr-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="w-full lg:w-48">
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={[
                { value: '', label: 'Tất cả danh mục' },
                ...categories.map(cat => ({ value: cat.id, label: cat.name }))
              ]}
              placeholder="Chọn danh mục"
            />
          </div>

          {/* Brand Filter */}
          <div className="w-full lg:w-48">
            <Select
              value={selectedBrand}
              onChange={setSelectedBrand}
              options={[
                { value: '', label: 'Tất cả thương hiệu' },
                ...brands.map(brand => ({ value: brand, label: brand }))
              ]}
              placeholder="Chọn thương hiệu"
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-2 lg:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="text-left py-3 px-2 lg:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Danh mục
                </th>
                <th className="text-left py-3 px-2 lg:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Thương hiệu
                </th>
                <th className="text-left py-3 px-2 lg:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá
                </th>
                <th className="text-left py-3 px-2 lg:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tồn kho
                </th>
                <th className="text-left py-3 px-2 lg:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Đã bán
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
              {paginatedData.items.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="py-3 lg:py-4 px-2 lg:px-4">
                      <div className="flex items-center space-x-2 lg:space-x-3">
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="w-10 h-10 lg:w-12 lg:h-12 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs lg:text-sm font-medium text-gray-900 line-clamp-2">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500 lg:block hidden">
                            ID: {product.id}
                          </p>
                          {/* Mobile: Show category and brand */}
                          <div className="md:hidden text-xs text-gray-500 space-y-1">
                            <div>{getCategoryName(product.category)}</div>
                            <div className="lg:hidden">{product.brand}</div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 lg:py-4 px-2 lg:px-4 hidden md:table-cell">
                      <span className="text-xs lg:text-sm text-gray-900">
                        {getCategoryName(product.category)}
                      </span>
                    </td>
                    <td className="py-3 lg:py-4 px-2 lg:px-4 hidden lg:table-cell">
                      <span className="text-xs lg:text-sm text-gray-900">
                        {product.brand}
                      </span>
                    </td>
                    <td className="py-3 lg:py-4 px-2 lg:px-4">
                      <div>
                        <p className="text-xs lg:text-sm font-medium text-gray-900">
                          {formatCurrency(product.price)}
                        </p>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <p className="text-xs text-gray-500 line-through">
                            {formatCurrency(product.originalPrice)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 lg:py-4 px-2 lg:px-4">
                      <div>
                        <p className="text-xs lg:text-sm font-medium text-gray-900">
                          {product.stock}
                        </p>
                        <span className={`inline-flex items-center px-1.5 lg:px-2 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 lg:py-4 px-2 lg:px-4 hidden sm:table-cell">
                      <span className="text-xs lg:text-sm text-gray-900">
                        {product.soldCount}
                      </span>
                    </td>
                    <td className="py-3 lg:py-4 px-2 lg:px-4">
                      <button className="inline-flex items-center">
                        {product.stock > 0 ? (
                          <FiToggleRight className="w-6 h-6 lg:w-8 lg:h-8 text-green-500" />
                        ) : (
                          <FiToggleLeft className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 lg:py-4 px-2 lg:px-4">
                      <div className="flex items-center space-x-1 lg:space-x-2">
                        <button className="p-1 lg:p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                          <FiEye className="w-3 h-3 lg:w-4 lg:h-4" />
                        </button>
                        <button className="p-1 lg:p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
                          <FiEdit className="w-3 h-3 lg:w-4 lg:h-4" />
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
        {paginatedData.totalItems === 0 && (
          <div className="text-center py-12">
            <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy sản phẩm nào
            </h3>
            <p className="text-gray-500">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={paginatedData.totalPages}
        totalItems={paginatedData.totalItems}
        itemsPerPage={pageSize}
        onPageChange={handlePageChange}
        showPageSizeSelect={true}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};
