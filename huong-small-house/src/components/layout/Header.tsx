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
  FiHome,
  FiPackage,
  FiGrid,
  FiInfo,
  FiMessageCircle,
  FiLogIn,
  FiLogOut,
} from 'react-icons/fi';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../utils/cn';
import logo from '../../assets/logo.png';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { getTotalItems, toggleCart } = useCartStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const cartItemsCount = getTotalItems();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  React.useEffect(() => {
    const updateHeaderHeight = () => {
      const topBar = document.getElementById('top-bar');
      const mainHeader = document.getElementById('main-header');
      if (topBar && mainHeader) {
        const totalHeight = topBar.offsetHeight + mainHeader.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${totalHeight}px`);
      }
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-40">
      <div className="bg-primary text-white py-2" id="top-bar">
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

      <header className="bg-white shadow-md" id="main-header">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <button
                className="lg:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <FiMenu className="w-6 h-6" />
              </button>

              <Link to="/" className="flex items-center">
                <img
                  src={logo}
                  alt="Hương Small House"
                  className="h-10 w-auto object-contain"
                />
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

        {isMenuOpen && (
          <div
            className="lg:hidden fixed bg-black/50 z-30"
            style={{
              top: 'var(--header-height, 104px)',
              left: 0,
              right: 0,
              bottom: 0
            }}
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        <nav
          className={cn(
            'lg:hidden fixed left-0 w-64 bg-white shadow-lg transition-transform z-40',
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          style={{
            top: 'var(--header-height, 104px)',
            height: 'calc(100vh - var(--header-height, 104px))'
          }}
        >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg font-bold text-primary">
                <FiHome className="w-5 h-5" />
                <span>Menu</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <FiX className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="p-4 space-y-1">
              <Link
                to="/"
                className="flex items-center gap-3 py-3 px-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiHome className="w-5 h-5" />
                <span>Trang chủ</span>
              </Link>
              <Link
                to="/products"
                className="flex items-center gap-3 py-3 px-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiPackage className="w-5 h-5" />
                <span>Sản phẩm</span>
              </Link>
              <Link
                to="/categories"
                className="flex items-center gap-3 py-3 px-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiGrid className="w-5 h-5" />
                <span>Danh mục</span>
              </Link>
              <Link
                to="/about"
                className="flex items-center gap-3 py-3 px-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiInfo className="w-5 h-5" />
                <span>Giới thiệu</span>
              </Link>
              <Link
                to="/contact"
                className="flex items-center gap-3 py-3 px-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiMessageCircle className="w-5 h-5" />
                <span>Liên hệ</span>
              </Link>
            </div>

            <div className="p-4 border-t border-gray-200 mt-auto absolute bottom-0 left-0 right-0">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <Link
                    to="/account"
                    className="flex items-center gap-3 py-3 px-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiUser className="w-5 h-5" />
                    <span>{user?.fullName || 'Tài khoản'}</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 py-3 px-2 w-full text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-medium transition-colors"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-3 py-3 px-2 text-white bg-primary hover:bg-primary-dark rounded-lg font-medium transition-colors justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiLogIn className="w-5 h-5" />
                  <span>Đăng nhập</span>
                </Link>
              )}
            </div>
          </nav>
      </header>
    </div>
  );
};
