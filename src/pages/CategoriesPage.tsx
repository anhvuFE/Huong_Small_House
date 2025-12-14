import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiHeart,
  FiActivity,
  FiBattery,
  FiSun,
  FiShield,
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiFeather,
  FiEye,
  FiSmile,
  FiDroplet,
  FiGrid,
  FiPackage,
  FiTarget,
  FiCommand,
  FiLayers,
} from 'react-icons/fi';
import { productApi } from '../services/productApi';
import type { Category } from '../types';
import { Pagination } from '../components/common/Pagination';
import { usePagination } from '../hooks/usePagination';
import logo from '../assets/logo.png';

const ICON_MAP: Record<string, React.JSX.Element> = {
  heart: <FiHeart className="w-8 h-8" />,
  activity: <FiActivity className="w-8 h-8" />,
  battery: <FiBattery className="w-8 h-8" />,
  sun: <FiSun className="w-8 h-8" />,
  shield: <FiShield className="w-8 h-8" />,
  trending: <FiTrendingUp className="w-8 h-8" />,
  users: <FiUsers className="w-8 h-8" />,
  award: <FiAward className="w-8 h-8" />,
  feather: <FiFeather className="w-8 h-8" />,
  eye: <FiEye className="w-8 h-8" />,
  smile: <FiSmile className="w-8 h-8" />,
  droplet: <FiDroplet className="w-8 h-8" />,
  grid: <FiGrid className="w-8 h-8" />,
  package: <FiPackage className="w-8 h-8" />,
  target: <FiTarget className="w-8 h-8" />,
  command: <FiCommand className="w-8 h-8" />,
  layers: <FiLayers className="w-8 h-8" />,
};

const COLORS = [
  'bg-orange-500',
  'bg-red-500',
  'bg-green-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-yellow-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-emerald-500',
];

const FALLBACK_IMAGE = logo;

const getIconBySlug = (slug?: string) => {
  if (!slug) return ICON_MAP.package;
  const key = slug.split('-')[0];
  return ICON_MAP[key] ?? ICON_MAP.package;
};

export const CategoriesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination hook
  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    getPaginatedData,
  } = usePagination(1, 6); // 6 categories per page for mobile optimization

  useEffect(() => {
    const fetchCategoriesWithCount = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Fetch categories first
        const categoriesData = await productApi.listCategories('customer');

        // Then fetch products with categories for mapping
        const productsData = await productApi.listProducts(categoriesData).catch(() => []);

        // Count products per category
        const productCountMap = new Map<number, number>();
        productsData.forEach(product => {
          if (product.categoryId !== undefined) {
            const count = productCountMap.get(product.categoryId) || 0;
            productCountMap.set(product.categoryId, count + 1);
          }
        });

        // Add product count to each category
        const categoriesWithCount = categoriesData.map(category => ({
          ...category,
          productCount: category.categoryId !== undefined ? (productCountMap.get(category.categoryId) || 0) : 0
        }));

        setCategories(categoriesWithCount);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Không thể tải danh mục. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoriesWithCount();
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      (category.name ?? '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (category.description ?? '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const stats = useMemo(() => {
    const totalProducts = categories.reduce((sum, category) => sum + (category.productCount ?? 0), 0);
    return {
      totalCategories: categories.length,
      totalProducts,
      averageProducts: categories.length ? Math.round(totalProducts / categories.length) : 0,
    };
  }, [categories]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative bg-gradient-to-br from-primary to-secondary py-12 sm:py-16 md:py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${logo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              Danh mục sản phẩm
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 px-4">
              Khám phá đa dạng các sản phẩm chăm sóc sức khỏe
            </p>

            {/* Search Bar */}
            <div className="max-w-md sm:max-w-xl md:max-w-2xl mx-auto px-2 sm:px-0">
              <input
                type="text"
                placeholder="Tìm kiếm danh mục..."
                className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-full text-sm sm:text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-white/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-gray-50 to-white py-6 sm:py-8 md:py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-gray-100 opacity-5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                <FiGrid className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary" />
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1 sm:mb-2">
                {stats.totalCategories}
              </div>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">Danh mục</p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-secondary/10 to-secondary/20 rounded-full mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                <FiPackage className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-secondary" />
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-1 sm:mb-2">
                {stats.totalProducts.toLocaleString()}
              </div>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">Sản phẩm</p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                <FiTarget className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-orange-500" />
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-orange-600 mb-1 sm:mb-2">
                {stats.averageProducts}
              </div>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">SP/danh mục</p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                <FiAward className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-emerald-600" />
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-emerald-600 mb-1 sm:mb-2">
                {categories.filter((cat) => cat.isActive !== false).length}
              </div>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">Đang hiển thị</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
        {error && <p className="text-center text-red-600 mb-4 sm:mb-6 text-sm sm:text-base">{error}</p>}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-48 sm:h-56 md:h-60 bg-gray-100 rounded-xl sm:rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {getPaginatedData(filteredCategories).items.map((category, index) => {
              const color = COLORS[index % COLORS.length];
              const slug = category.slug ?? `category-${category.categoryId}`;
              return (
                <div
                  key={category.id}
                  className="relative group bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => window.location.href = `/products?category=${slug}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="p-4 sm:p-5 md:p-6 relative z-10">
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className={`p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl ${color} text-white shadow-lg flex-shrink-0`}>
                        {getIconBySlug(category.icon ?? category.slug) ?? <FiGrid className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">{category.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">
                          {category.description || 'Danh mục sản phẩm Small House'}
                        </p>
                      </div>
                    </div>

                    <div className="h-32 sm:h-36 md:h-40 rounded-lg sm:rounded-xl overflow-hidden mb-3 sm:mb-4">
                      <img
                        src={category.image || FALLBACK_IMAGE}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">
                        {category.productCount ?? 0} sản phẩm
                      </span>
                      <Link
                        to={`/products?category=${slug}`}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 text-primary text-xs sm:text-sm font-medium rounded-full hover:bg-primary hover:text-white transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Xem ngay
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {!filteredCategories.length && (
              <div className="col-span-full text-center text-gray-600 py-8 text-sm sm:text-base">
                Không tìm thấy danh mục nào phù hợp.
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredCategories.length > 0 && (
            <div className="mt-6 sm:mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredCategories.length / pageSize)}
                itemsPerPage={pageSize}
                totalItems={filteredCategories.length}
                onPageChange={handlePageChange}
                showPageSizeSelect={true}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[6, 9, 12, 18]}
              />
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
};
