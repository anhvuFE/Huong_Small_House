import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiActivity,
  FiFeather,
  FiShield,
  FiHeart,
  FiSun,
  FiMoon,
  FiStar,
  FiTrendingDown,
  FiBox,
} from 'react-icons/fi';
import { cn } from '../../utils/cn';
import { productApi } from '../../services/productApi';
import type { Category } from '../../types';

interface CategoriesProps {
  className?: string;
}

const iconComponents = {
  vitamin: FiActivity,
  digestive: FiTrendingDown,
  immunity: FiShield,
  heart: FiHeart,
  beauty: FiStar,
  energy: FiSun,
  sleep: FiMoon,
  collagen: FiFeather,
} as const;

const getIcon = (slug: string) => {
  const normalized = slug.replace(/-.*$/, '');
  return iconComponents[normalized as keyof typeof iconComponents] ?? FiBox;
};

export const Categories: FC<CategoriesProps> = ({ className }) => {
  const [items, setItems] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await productApi.listCategories('customer');
        setItems(data);
      } catch {
        setError('Không thể tải danh mục.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className={cn('py-12', className)}>
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Danh mục sản phẩm
        </h2>
        {error && <p className="text-center text-red-600 mb-6">{error}</p>}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
              ))
            : items.map((category) => {
                const Icon = getIcon(category.slug);
                return (
                  <Link
                    key={category.id}
                    to={`/products?category=${category.slug}`}
                    className="group"
                  >
                    <div className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300 text-primary">
                        <Icon className="w-10 h-10 mx-auto" />
                      </div>
                      <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                    </div>
                  </Link>
                );
              })}
        </div>
      </div>
    </section>
  );
};
