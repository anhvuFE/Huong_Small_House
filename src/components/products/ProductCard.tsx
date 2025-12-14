import type { FC, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import type { Product } from '../../types';
import { formatCurrency, calculateDiscount } from '../../utils/format';
import { useCartStore } from '../../store/useCartStore';
import { cn } from '../../utils/cn';
import { useState } from 'react';
import logo from '../../assets/logo.png';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: FC<ProductCardProps> = ({ product, className }) => {
  const { addItem } = useCartStore();
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = (e: MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
  };

  const discountPercent = product.originalPrice
    ? calculateDiscount(product.price, product.originalPrice)
    : 0;

  // Check if thumbnail exists and is a valid URL (not a placeholder or mock path)
  const hasValidImage = product.thumbnail &&
    product.thumbnail !== null &&
    !product.thumbnail.includes('placeholder') &&
    !product.thumbnail.includes('placehold') &&
    !product.thumbnail.includes('/images/products/') &&
    product.thumbnail.startsWith('http') &&
    !imageError;

  return (
    <Link
      to={`/products/${product.slug}`}
      className={cn(
        'block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group',
        className
      )}
    >
      <div className="relative h-48 overflow-hidden bg-gray-50">
        {hasValidImage ? (
          <img
            src={product.thumbnail}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <img
            src={logo}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}

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
      </div>

      <div className="p-4">
        <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        <p className="text-sm text-gray-600 mb-2">{product.brand}</p>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                className={cn(
                  'w-3.5 h-3.5',
                  i < Math.floor(product.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                )}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600">({product.reviewCount})</span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-lg font-bold text-primary">
              {formatCurrency(product.price)}
            </div>
            {product.originalPrice && (
              <div className="text-xs text-gray-500 line-through">
                {formatCurrency(product.originalPrice)}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="bg-primary hover:bg-secondary text-white p-2.5 rounded-full transition-all hover:shadow-md active:scale-95"
            aria-label="Thêm vào giỏ hàng"
          >
            <FiShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Link>
  );
};
