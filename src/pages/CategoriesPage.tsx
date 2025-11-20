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

const FALLBACK_IMAGE = 'https://placehold.co/400x300?text=Small+House';

const getIconBySlug = (slug?: string) => {
  if (!slug) return ICON_MAP.package;
  const key = slug.split('-')[0];
  return ICON_MAP[key] ?? ICON_MAP.package;
};

export const CategoriesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await productApi.listCategories('customer');
        setCategories(data);
      } catch {
        setError('Không thể tải danh mục. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
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
        className="relative bg-gradient-to-br from-primary to-secondary py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=1920&h=400&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Danh mục sản phẩm
            </h1>
            <p className="text-xl mb-8">
              Khám phá đa dạng các sản phẩm chăm sóc sức khỏe
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Tìm kiếm danh mục..."
                className="w-full px-6 py-4 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-gray-50 to-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-gray-100 opacity-5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <FiGrid className="w-10 h-10 text-primary" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                {stats.totalCategories}
              </div>
              <p className="text-gray-600">Danh mục</p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-secondary/10 to-secondary/20 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <FiPackage className="w-10 h-10 text-secondary" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-2">
                {stats.totalProducts.toLocaleString()}
              </div>
              <p className="text-gray-600">Sản phẩm</p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <FiTarget className="w-10 h-10 text-orange-500" />
              </div>
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {stats.averageProducts}
              </div>
              <p className="text-gray-600">SP trung bình/danh mục</p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <FiAward className="w-10 h-10 text-emerald-600" />
              </div>
              <div className="text-4xl font-bold text-emerald-600 mb-2">
                {categories.filter((cat) => cat.isActive !== false).length}
              </div>
              <p className="text-gray-600">Đang hiển thị</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-12">
        {error && <p className="text-center text-red-600 mb-6">{error}</p>}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-60 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category, index) => {
              const color = COLORS[index % COLORS.length];
              const slug = category.slug ?? `category-${category.categoryId}`;
              return (
                <div
                  key={category.id}
                  className="relative group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  onMouseEnter={() => setSelectedCategory(slug)}
                  onMouseLeave={() => setSelectedCategory(null)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="p-6 relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-xl ${color} text-white shadow-lg`}>
                        {getIconBySlug(category.icon ?? category.slug) ?? <FiGrid className="w-8 h-8" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {category.description || 'Danh mục sản phẩm Small House'}
                        </p>
                      </div>
                    </div>

                    <div className="h-40 rounded-xl overflow-hidden mb-4">
                      <img
                        src={category.image || FALLBACK_IMAGE}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{category.productCount ?? 0} sản phẩm</span>
                      <span>Slug: {slug}</span>
                    </div>
                  </div>

                  {selectedCategory === slug && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                      <Link
                        to={`/products?category=${slug}`}
                        className="px-5 py-3 bg-white text-primary font-semibold rounded-full shadow-lg hover:shadow-xl transition-shadow"
                      >
                        Xem sản phẩm
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}

            {!filteredCategories.length && (
              <div className="col-span-full text-center text-gray-600">
                Không tìm thấy danh mục nào phù hợp.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
