import type { FC } from 'react';
import { useState } from 'react';
import { FiX, FiPlus, FiMinus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { formatCurrency } from '../../utils/format';
import { ProductImageFallback } from '../common/ProductImageFallback';

export const ShoppingCart: FC = () => {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const totalPrice = getTotalPrice();
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={toggleCart}
      />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <FiShoppingBag className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">Giỏ hàng ({items.length})</h2>
            </div>
            <button
              onClick={toggleCart}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close cart"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <FiShoppingBag className="w-20 h-20 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">Giỏ hàng của bạn đang trống</p>
            <button
              onClick={toggleCart}
              className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg transition-colors"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 mb-4 pb-4 border-b last:border-b-0"
                >
                  {item.product.thumbnail && !imageLoadErrors[item.product.id] ? (
                    <img
                      src={item.product.thumbnail}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={() => {
                        setImageLoadErrors(prev => ({ ...prev, [item.product.id]: true }));
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg overflow-hidden">
                      <ProductImageFallback name={item.product.name} size="sm" />
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 line-clamp-1">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{item.product.brand}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          aria-label="Increase quantity"
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-primary">
                          {formatCurrency(item.product.price * item.quantity)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(item.product.price)}/sp
                        </div>
                      </div>
                    </div>
                  </div>

                <button
                  onClick={() => removeItem(item.product.id)}
                  className="p-2 hover:bg-red-50 rounded transition-colors"
                  aria-label="Remove item"
                >
                  <FiTrash2 className="w-4 h-4 text-red-500" />
                </button>
                </div>
              ))}
            </div>

            <div className="border-t p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Tổng cộng:</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(totalPrice)}
                </span>
              </div>

              <div className="space-y-2">
                <Link
                  to="/checkout"
                  onClick={toggleCart}
                  className="block w-full bg-primary hover:bg-secondary text-white text-center py-3 rounded-lg font-semibold transition-colors"
                >
                  Thanh toán
                </Link>
                <button
                  onClick={toggleCart}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
                >
                  Tiếp tục mua sắm
                </button>
                <button
                  onClick={clearCart}
                  className="w-full text-red-500 hover:text-red-600 py-2 text-sm transition-colors"
                >
                  Xóa tất cả
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};
