import React from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import { useCartStore } from '../../store/useCartStore';
import { cn } from '../../utils/cn';

export const FloatingCartButton: React.FC = () => {
  const { toggleCart, getTotalItems } = useCartStore();
  const itemCount = getTotalItems();

  // Only show on mobile and when there are items
  if (itemCount === 0) return null;

  return (
    <button
      onClick={toggleCart}
      className={cn(
        "fixed right-6 z-40 bottom-24",
        "bg-primary hover:bg-secondary text-white",
        "w-14 h-14 rounded-full shadow-lg",
        "flex items-center justify-center",
        "transition-all transform hover:scale-110",
        "md:hidden" // Only show on mobile
      )}
      aria-label="Mở giỏ hàng"
    >
      <FiShoppingCart className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
};