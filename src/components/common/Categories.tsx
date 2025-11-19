import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../data/products';
import { cn } from '../../utils/cn';
import {
  FiActivity,
  FiFeather,
  FiShield,
  FiHeart,
  FiSun,
  FiMoon,
  FiStar,
  FiTrendingDown,
} from 'react-icons/fi';

interface CategoriesProps {
  className?: string;
}

const iconComponents = {
  vitamin: FiActivity,
  collagen: FiFeather,
  bone: FiActivity,
  scale: FiTrendingDown,
  shield: FiShield,
  leaf: FiFeather,
  heart: FiHeart,
  beauty: FiStar,
  energy: FiSun,
  sleep: FiMoon,
} as const;

type CategoryIconKey = keyof typeof iconComponents;

const Icon: FC<{ icon: string }> = ({ icon }) => {
  const Component = iconComponents[icon as CategoryIconKey] ?? FiActivity;
  return <Component className="w-10 h-10 mx-auto text-primary" />;
};

export const Categories: FC<CategoriesProps> = ({ className }) => {
  return (
    <section className={cn('py-12', className)}>
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Danh mục sản phẩm
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="group"
            >
              <div className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Icon icon={category.icon} />
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
