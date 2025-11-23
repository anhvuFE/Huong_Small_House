import React, { useEffect, useMemo, useState } from 'react';
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiEye,
  FiPackage,
} from 'react-icons/fi';
import { Select } from '../../components/common/Select';
import { Pagination } from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { productApi } from '../../services/productApi';
import type { Category, Product } from '../../types';
import { formatCurrency } from '../../utils/format';
import { Loader } from '../../components/common/Loader';
import { useToast } from '../../components/common/Toast';

interface ProductFormState {
  name: string;
  brand: string;
  categoryId: string;
  description: string;
  price: string;
  stock: string;
  images: string;
}

const defaultFormState: ProductFormState = {
  name: '',
  brand: '',
  categoryId: '',
  description: '',
  price: '',
  stock: '',
  images: '',
};

export const ProductManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formState, setFormState] = useState<ProductFormState>(defaultFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryStatus, setCategoryStatus] = useState('');
  const { showToast } = useToast();

  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    getPaginatedData,
  } = usePagination(1, 10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError('');
        const [categoryData, productData] = await Promise.all([
          productApi.listCategories('admin'),
          productApi.listProducts(),
        ]);
        setCategories(categoryData);
        setProducts(productData);
        const brandSet = new Set(productData.map((product) => product.brand));
        setBrands([...brandSet]);
      } catch {
        setError('Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.categoryId?.toString() === selectedCategory;
      const matchesBrand = !selectedBrand || product.brand === selectedBrand;
      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [products, searchTerm, selectedCategory, selectedBrand]);

  const paginatedData = useMemo(() => getPaginatedData(filteredProducts), [filteredProducts, getPaginatedData]);

  const openCreateModal = () => {
    setFormState(defaultFormState);
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormState({
      name: product.name,
      brand: product.brand,
      categoryId: product.categoryId?.toString() ?? '',
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      images: product.images.join('\n'),
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.categoryId) return;
    try {
      setIsSubmitting(true);
      const payload = {
        name: formState.name,
        brand: formState.brand,
        categoryId: Number(formState.categoryId),
        description: formState.description,
        price: Number(formState.price),
        stock: Number(formState.stock),
        images: formState.images
          .split('\n')
          .map((url) => url.trim())
          .filter(Boolean)
          .map((url) => ({ url })),
      };

      if (editingProduct?.productId) {
        await productApi.updateProduct(editingProduct.productId, payload);
      } else {
        await productApi.createProduct(payload);
      }

      const [categoryData, productData] = await Promise.all([
        productApi.listCategories('admin'),
        productApi.listProducts(),
      ]);
      setCategories(categoryData);
      setProducts(productData);
      setBrands([...new Set(productData.map((product) => product.brand))]);
      setIsFormOpen(false);
      setEditingProduct(null);
      setFormState(defaultFormState);
      showToast({ title: editingProduct ? 'Đã cập nhật sản phẩm' : 'Đã tạo sản phẩm', variant: 'success' });
    } catch {
      setError('Không thể lưu sản phẩm. Vui lòng thử lại.');
      showToast({ title: 'Lưu sản phẩm thất bại', variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [deleteProductTarget, setDeleteProductTarget] = useState<Product | null>(null);

  const handleDeleteProduct = async (product: Product) => {
    if (!product.productId) return;
    setDeleteProductTarget(product);
  };

  const handleCreateCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!categoryName.trim()) return;
    try {
      const category = await productApi.createCategory({ name: categoryName });
      setCategories((prev) => [...prev, category]);
      setCategoryStatus('Tạo danh mục thành công');
      setCategoryName('');
    } catch {
      setCategoryStatus('Không thể tạo danh mục. Vui lòng thử lại.');
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Hết hàng', color: 'bg-red-100 text-red-800' };
    if (stock < 20) return { text: 'Sắp hết', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Còn hàng', color: 'bg-green-100 text-green-800' };
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-sm lg:text-base text-gray-600">Quản lý thông tin và trạng thái các sản phẩm</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-3 lg:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm lg:text-base"
        >
          <FiPlus className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
          <span className="hidden sm:inline">Thêm sản phẩm</span>
          <span className="sm:hidden">Thêm</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
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

          <div className="w-full lg:w-48">
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={[
                { value: '', label: 'Tất cả danh mục' },
                ...categories.map((cat) => ({ value: cat.categoryId.toString(), label: cat.name })),
              ]}
              placeholder="Chọn danh mục"
            />
          </div>

          <div className="w-full lg:w-48">
            <Select
              value={selectedBrand}
              onChange={setSelectedBrand}
              options={[
                { value: '', label: 'Tất cả thương hiệu' },
                ...brands.map((brand) => ({ value: brand, label: brand })),
              ]}
              placeholder="Chọn thương hiệu"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto hidden lg:block">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tồn kho</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.items.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img src={product.thumbnail} alt={product.name} className="w-16 h-16 rounded-lg object-cover mr-4" />
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(product.price)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                        {stockStatus.text}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">Còn {product.stock} sản phẩm</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                        aria-label="Xem chi tiết"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden divide-y divide-gray-200 border-t border-gray-200">
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product.stock);
            return (
              <div
                key={product.id}
                className="p-4 bg-white flex gap-3"
              >
                <img src={product.thumbnail} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900 leading-snug text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.brand}</p>
                    </div>
                    <button
                      onClick={() => openEditModal(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg shrink-0"
                      aria-label="Chỉnh sửa"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                      {product.category}
                    </span>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(product.price)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${stockStatus.color}`}>
                      {stockStatus.text}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                        aria-label="Xem chi tiết"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        aria-label="Xóa"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {paginatedData.totalItems === 0 && (
          <div className="text-center py-12">
            <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm nào</h3>
            <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={paginatedData.totalPages}
        totalItems={paginatedData.totalItems}
        itemsPerPage={pageSize}
        onPageChange={handlePageChange}
        showPageSizeSelect={true}
        onPageSizeChange={handlePageSizeChange}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Thêm danh mục</h3>
        <form onSubmit={handleCreateCategory} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Tên danh mục"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-primary"
          >
            Tạo danh mục
          </button>
        </form>
        {categoryStatus && <p className="text-sm text-gray-600 mt-2">{categoryStatus}</p>}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                  <input
                    type="text"
                    value={formState.name}
                    onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu</label>
                  <input
                    type="text"
                    value={formState.brand}
                    onChange={(e) => setFormState((prev) => ({ ...prev, brand: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <Select
                    label="Danh mục"
                    value={formState.categoryId}
                    onChange={(val) => setFormState((prev) => ({ ...prev, categoryId: val }))}
                    options={[
                      { value: '', label: 'Chọn danh mục' },
                      ...categories.map((cat) => ({
                        value: cat.categoryId.toString(),
                        label: cat.name,
                      })),
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá</label>
                  <input
                    type="number"
                    min={0}
                    value={formState.price}
                    onChange={(e) => setFormState((prev) => ({ ...prev, price: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho</label>
                  <input
                    type="number"
                    min={0}
                    value={formState.stock}
                    onChange={(e) => setFormState((prev) => ({ ...prev, stock: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  rows={3}
                  value={formState.description}
                  onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh sản phẩm (mỗi dòng một URL)</label>
                <textarea
                  rows={3}
                  value={formState.images}
                  onChange={(e) => setFormState((prev) => ({ ...prev, images: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingProduct(null);
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteProductTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="absolute inset-0" onClick={() => setDeleteProductTarget(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900">Xóa sản phẩm</h3>
              <p className="text-sm text-gray-600 mt-2">
                Bạn có chắc muốn xóa “{deleteProductTarget.name}”? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setDeleteProductTarget(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-white transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  if (!deleteProductTarget?.productId) return;
                  try {
                    await productApi.deleteProduct(deleteProductTarget.productId);
                    setProducts((prev) => prev.filter((item) => item.productId !== deleteProductTarget.productId));
                    showToast({ title: 'Đã xóa sản phẩm', variant: 'error' });
                  } catch {
                    setError('Không thể xóa sản phẩm. Vui lòng thử lại.');
                    showToast({ title: 'Xóa sản phẩm thất bại', variant: 'error' });
                  } finally {
                    setDeleteProductTarget(null);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
