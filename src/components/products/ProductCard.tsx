import type { FC, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import type { Product } from '../../types';
import { formatCurrency, calculateDiscount } from '../../utils/format';
import { useCartStore } from '../../store/useCartStore';
import { cn } from '../../utils/cn';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: FC<ProductCardProps> = ({ product, className }) => {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
  };

  const discountPercent = product.originalPrice
    ? calculateDiscount(product.price, product.originalPrice)
    : 0;

  return (
    <Link
      to={`/products/${product.slug}`}
      className={cn(
        'block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group',
        className
      )}
    >
      <div className="relative">
        <img
          src={product.thumbnail}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-sm font-semibold rounded">
            -{discountPercent}%
          </span>
        )}

        {product.isNew && (
          <span className="absolute top-2 right-2 bg-primary text-white px-2 py-1 text-sm font-semibold rounded">
            Mới
          </span>
        )}

        {product.isBestSeller && (
          <span className="absolute top-10 right-2 bg-orange-500 text-white px-2 py-1 text-sm font-semibold rounded">
            Bán chạy
          </span>
        )}

        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleAddToCart}
            className="bg-primary hover:bg-secondary text-white p-2 rounded-full shadow-lg transition-colors"
            aria-label="Add to cart"
          >
            <FiShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        <p className="text-sm text-gray-600 mb-2">{product.brand}</p>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                className={cn(
                  'w-4 h-4',
                  i < Math.floor(product.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                )}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">({product.reviewCount})</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-primary">
              {formatCurrency(product.price)}
            </div>
            {product.originalPrice && (
              <div className="text-sm text-gray-500 line-through">
                {formatCurrency(product.originalPrice)}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </Link>
  );
};
