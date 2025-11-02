import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX } from 'react-icons/fi';
import { ProductList } from '../components/products/ProductList';
import { mockProducts, categories, brands } from '../data/products';
import { cn } from '../utils/cn';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
  });

  const filteredProducts = useMemo(() => {
    let products = [...mockProducts];

    if (filters.category) {
      products = products.filter(p => p.category === filters.category);
    }

    if (filters.brand) {
      products = products.filter(p => p.brand === filters.brand);
    }

    if (filters.minPrice) {
      products = products.filter(p => p.price >= Number(filters.minPrice));
    }

    if (filters.maxPrice) {
      products = products.filter(p => p.price <= Number(filters.maxPrice));
    }

    const search = searchParams.get('search');
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.brand.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }

    switch (filters.sortBy) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'best-selling':
        products.sort((a, b) => b.soldCount - a.soldCount);
        break;
      default:
        products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return products;
  }, [filters, searchParams]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest',
    });
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">
            Tất cả sản phẩm ({filteredProducts.length})
          </h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 bg-white px-4 py-2 rounded-lg border"
          >
            <FiFilter className="w-4 h-4" />
            Bộ lọc
          </button>
        </div>

        <div className="flex gap-6">
          <aside className={cn(
            'w-64 flex-shrink-0',
            showFilters ? 'fixed inset-0 z-40 lg:static lg:z-auto bg-white lg:bg-transparent' : 'hidden lg:block'
          )}>
            <div className="bg-white p-6 rounded-lg h-full lg:h-auto overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Bộ lọc</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-3">Sắp xếp</h3>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="best-selling">Bán chạy</option>
                  <option value="rating">Đánh giá cao</option>
                  <option value="price-asc">Giá thấp đến cao</option>
                  <option value="price-desc">Giá cao đến thấp</option>
                </select>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-3">Danh mục</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={filters.category === ''}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="mr-2"
                    />
                    <span>Tất cả</span>
                  </label>
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={cat.id}
                        checked={filters.category === cat.id}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="mr-2"
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-3">Thương hiệu</h3>
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Tất cả</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-3">Khoảng giá</h3>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Từ"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Đến"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <button
                onClick={clearFilters}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          </aside>

          <div className="flex-1">
            <ProductList products={filteredProducts} />
          </div>
        </div>
      </div>
    </div>
  );
};
