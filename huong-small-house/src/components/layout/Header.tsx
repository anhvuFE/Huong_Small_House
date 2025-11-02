import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiX,
  FiPhone,
  FiMapPin,
  FiMail,
} from 'react-icons/fi';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../utils/cn';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { getTotalItems, toggleCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const cartItemsCount = getTotalItems();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      <div className="bg-primary text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between items-center text-sm">
            <div className="flex items-center gap-4">
              <a href="tel:0336064040" className="flex items-center gap-1 hover:text-gray-200">
                <FiPhone className="w-4 h-4" />
                <span>0336 064 040</span>
              </a>
              <a href="mailto:vuquynhhuong171298@gmail.com" className="hidden md:flex items-center gap-1 hover:text-gray-200">
                <FiMail className="w-4 h-4" />
                <span>vuquynhhuong171298@gmail.com</span>
              </a>
            </div>
            <div className="flex items-center gap-1">
              <FiMapPin className="w-4 h-4" />
              <span>120 Hoàng Quốc Việt, Hà Nội</span>
            </div>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <button
                className="lg:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>

              <Link to="/" className="flex items-center">
                <div className="text-xl font-bold text-primary">
                  Hương Small House
                </div>
              </Link>

              <nav className="hidden lg:flex items-center gap-6">
                <Link to="/" className="text-gray-700 hover:text-primary font-medium transition-colors">
                  Trang chủ
                </Link>
                <Link to="/products" className="text-gray-700 hover:text-primary font-medium transition-colors">
                  Sản phẩm
                </Link>
                <Link to="/categories" className="text-gray-700 hover:text-primary font-medium transition-colors">
                  Danh mục
                </Link>
                <Link to="/about" className="text-gray-700 hover:text-primary font-medium transition-colors">
                  Giới thiệu
                </Link>
                <Link to="/contact" className="text-gray-700 hover:text-primary font-medium transition-colors">
                  Liên hệ
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <button
                className="lg:hidden"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Toggle search"
              >
                <FiSearch className="w-6 h-6 text-gray-700 hover:text-primary" />
              </button>

              <form
                onSubmit={handleSearch}
                className="hidden lg:flex items-center bg-gray-100 rounded-full px-4 py-2 w-80"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="bg-transparent outline-none flex-1 text-sm"
                />
                <button type="submit" aria-label="Search">
                  <FiSearch className="w-5 h-5 text-gray-600 hover:text-primary" />
                </button>
              </form>

              <Link
                to={isAuthenticated ? '/account' : '/login'}
                className="flex items-center gap-1 text-gray-700 hover:text-primary"
              >
                <FiUser className="w-6 h-6" />
                {isAuthenticated && user && (
                  <span className="hidden md:inline text-sm">{user.fullName}</span>
                )}
              </Link>

              <button
                onClick={toggleCart}
                className="relative flex items-center gap-1 text-gray-700 hover:text-primary"
                aria-label="Shopping cart"
              >
                <FiShoppingCart className="w-6 h-6" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {isSearchOpen && (
            <form
              onSubmit={handleSearch}
              className="lg:hidden py-3 border-t border-gray-200"
            >
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="bg-transparent outline-none flex-1 text-sm"
                />
                <button type="submit" aria-label="Search">
                  <FiSearch className="w-5 h-5 text-gray-600 hover:text-primary" />
                </button>
              </div>
            </form>
          )}
        </div>

        <div
          className={cn(
            'lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity',
            isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          )}
          onClick={() => setIsMenuOpen(false)}
        >
          <nav
            className={cn(
              'fixed left-0 top-0 h-full w-64 bg-white shadow-lg transition-transform',
              isMenuOpen ? 'translate-x-0' : '-translate-x-full'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200">
              <div className="text-xl font-bold text-primary">
                Hương Small House
              </div>
            </div>
            <div className="p-4">
              <Link
                to="/"
                className="block py-2 text-gray-700 hover:text-primary font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Trang chủ
              </Link>
              <Link
                to="/products"
                className="block py-2 text-gray-700 hover:text-primary font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Sản phẩm
              </Link>
              <Link
                to="/categories"
                className="block py-2 text-gray-700 hover:text-primary font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Danh mục
              </Link>
              <Link
                to="/about"
                className="block py-2 text-gray-700 hover:text-primary font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Giới thiệu
              </Link>
              <Link
                to="/contact"
                className="block py-2 text-gray-700 hover:text-primary font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Liên hệ
              </Link>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
};
