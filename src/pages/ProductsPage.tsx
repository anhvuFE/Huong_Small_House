import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX } from 'react-icons/fi';
import { ProductList } from '../components/products/ProductList';
import { PriceRangeSlider } from '../components/common/PriceRangeSlider';
import { Select } from '../components/common/Select';
import { Pagination } from '../components/common/Pagination';
import { usePagination } from '../hooks/usePagination';
import { cn } from '../utils/cn';
import { productApi } from '../services/productApi';
import type { Category, Product } from '../types';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'best-selling', label: 'Bán chạy' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'price-asc', label: 'Giá thấp đến cao' },
  { value: 'price-desc', label: 'Giá cao đến thấp' },
];

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    getPaginatedData,
  } = usePagination(1, 12);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
  });

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setError('');
        const [categoryData, productData] = await Promise.all([
          productApi.listCategories('customer'),
          productApi.listProducts(),
        ]);
        setCategories(categoryData);
        setProducts(productData);
        const brandSet = new Set(productData.map((product) => product.brand));
        setBrands([...brandSet]);
        if (productData.length > 0) {
          const prices = productData.map((product) => product.price);
          const maxPrice = Math.max(...prices);
          const minPrice = Math.min(...prices);
          setPriceRange([
            filters.minPrice ? Number(filters.minPrice) : minPrice,
            filters.maxPrice ? Number(filters.maxPrice) : maxPrice,
          ]);
        }
      } catch {
        setError('Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [filters.maxPrice, filters.minPrice]);

  useEffect(() => {
    const calculateHeaderHeight = () => {
      const mainHeader = document.getElementById('main-header');
      const topBar = document.getElementById('top-bar');
      if (!mainHeader || !topBar) {
        setHeaderHeight(96);
        return;
      }
      const totalHeight = mainHeader.offsetHeight + topBar.offsetHeight;
      setHeaderHeight(totalHeight);
    };
    calculateHeaderHeight();
    setTimeout(calculateHeaderHeight, 100);
    window.addEventListener('resize', calculateHeaderHeight);
    return () => window.removeEventListener('resize', calculateHeaderHeight);
  }, []);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (filters.category) {
      list = list.filter(
        (product) =>
          product.categoryId?.toString() === filters.category ||
          product.category === filters.category
      );
    }

    if (filters.brand) {
      list = list.filter((product) => product.brand === filters.brand);
    }

    if (filters.minPrice) {
      list = list.filter((product) => product.price >= Number(filters.minPrice));
    }

    if (filters.maxPrice) {
      list = list.filter((product) => product.price <= Number(filters.maxPrice));
    }

    const search = searchParams.get('search');
    if (search) {
      const searchLower = search.toLowerCase();
      list = list.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.brand.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower)
      );
    }

    switch (filters.sortBy) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'best-selling':
        list.sort((a, b) => b.soldCount - a.soldCount);
        break;
      default:
        list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return list;
  }, [products, filters, searchParams]);

  const paginatedData = useMemo(() => getPaginatedData(filteredProducts), [filteredProducts, getPaginatedData]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setFilters({ category: '', brand: '', minPrice: '', maxPrice: '', sortBy: 'newest' });
    setPriceRange([0, priceRange[1]]);
    setSearchParams({});
  };

  const renderFilterBody = ({ showHeader = true }: { showHeader?: boolean } = {}) => (
    <>
      {showHeader && (
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Bộ lọc</h2>
          <button
            onClick={() => setShowFilters(false)}
            className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}

      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
          <span className="w-1 h-4 bg-primary mr-2 rounded-full"></span>
          Sắp xếp
        </h3>
        <Select value={filters.sortBy} onChange={(value) => handleFilterChange('sortBy', value)} options={SORT_OPTIONS} />
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
          <span className="w-1 h-4 bg-primary mr-2 rounded-full"></span>
          Danh mục
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          <label className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
            <input
              type="radio"
              name="category"
              value=""
              checked={filters.category === ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
            />
            <span className="ml-3 text-gray-700">Tất cả</span>
          </label>
          {categories.map((category) => (
            <label key={category.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              <input
                type="radio"
                name="category"
                value={category.categoryId.toString()}
                checked={filters.category === category.categoryId.toString()}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
              />
              <span className="ml-3 text-gray-700">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
          <span className="w-1 h-4 bg-primary mr-2 rounded-full"></span>
          Thương hiệu
        </h3>
        <Select
          value={filters.brand}
          onChange={(value) => handleFilterChange('brand', value)}
          options={[
            { value: '', label: 'Tất cả' },
            ...brands.map((brand) => ({ value: brand, label: brand })),
          ]}
          placeholder="Chọn thương hiệu"
        />
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
          <span className="w-1 h-4 bg-primary mr-2 rounded-full"></span>
          Khoảng giá
        </h3>
        <PriceRangeSlider
          min={0}
          max={Math.max(priceRange[1], 2000000)}
          step={50000}
          value={priceRange}
          onChange={(value) => {
            setPriceRange(value);
            handleFilterChange('minPrice', value[0].toString());
            handleFilterChange('maxPrice', value[1].toString());
          }}
        />
      </div>

      <button
        onClick={clearFilters}
        className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-medium py-3 rounded-lg transition-all shadow-sm hover:shadow"
      >
        Xóa bộ lọc
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">
            Tất cả sản phẩm ({paginatedData.totalItems})
          </h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 bg-white px-4 py-2 rounded-lg border"
          >
            <FiFilter className="w-4 h-4" />
            Bộ lọc
          </button>
        </div>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        {showFilters && (
          <div
            className="fixed z-20 bg-black/40 lg:hidden"
            style={{ top: `${headerHeight}px`, left: 0, right: 0, bottom: 0 }}
            onClick={() => setShowFilters(false)}
          />
        )}

        <aside
          className={cn(
            'lg:hidden fixed left-0 w-64 max-w-[80vw] bg-white shadow-lg transition-transform duration-300 ease-in-out z-30 flex flex-col',
            showFilters ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'
          )}
          style={{ top: `${headerHeight}px`, height: `calc(100vh - ${headerHeight}px)` }}
          aria-hidden={!showFilters}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-2 text-base font-semibold text-primary">
              <FiFilter className="w-5 h-5" />
              <span>Bộ lọc</span>
            </div>
            <button
              onClick={() => setShowFilters(false)}
              className="p-1 rounded-lg text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors"
              aria-label="Đóng bộ lọc"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">{renderFilterBody({ showHeader: false })}</div>
        </aside>

        <div className="flex gap-6">
          <aside
            className="hidden lg:block w-64 flex-shrink-0 lg:sticky"
            style={{ top: `${headerHeight}px`, maxHeight: `calc(100vh - ${headerHeight}px)` }}
          >
            <div className="bg-white p-6 rounded-xl shadow-lg h-full overflow-y-auto border border-gray-100">
              {renderFilterBody()}
            </div>
          </aside>

          <div className="flex-1 space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="h-72 bg-white rounded-xl shadow animate-pulse" />
                ))}
              </div>
            ) : (
              <ProductList products={paginatedData.items} />
            )}
            <Pagination
              currentPage={currentPage}
              totalPages={paginatedData.totalPages}
              totalItems={paginatedData.totalItems}
              itemsPerPage={pageSize}
              onPageChange={handlePageChange}
              showPageSizeSelect={true}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[12, 24, 36, 48]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
