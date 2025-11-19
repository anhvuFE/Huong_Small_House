import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiX,
  FiPhone,
  FiMapPin,
  FiMail,
  FiLogIn,
  FiLogOut,
  FiChevronDown,
  FiHome,
  FiPackage,
  FiGrid,
  FiInfo,
  FiMessageCircle,
} from 'react-icons/fi';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../utils/cn';
import logo from '../../assets/logo.png';

const navItems = [
  { label: 'Trang chủ', href: '/', icon: FiHome },
  { label: 'Sản phẩm', href: '/products', icon: FiPackage },
  { label: 'Danh mục', href: '/categories', icon: FiGrid },
  { label: 'Giới thiệu', href: '/about', icon: FiInfo },
  { label: 'Liên hệ', href: '/contact', icon: FiMessageCircle },
];

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const { getTotalItems, toggleCart } = useCartStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const cartItemsCount = getTotalItems();

  const initials = useMemo(() => {
    if (!user?.fullName) return 'KH';
    return user.fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }, [user?.fullName]);

  const isActiveNav = (href: string): boolean => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = () => {
    logout();
    setIsAccountMenuOpen(false);
  };

  useEffect(() => {
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsAccountMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="fixed top-0 left-0 right-0 z-40">
      <div className="bg-gradient-to-r from-primary to-secondary text-white" id="top-bar">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 py-2 text-sm">
            <div className="flex items-center gap-5">
              <a href="tel:0336064040" className="flex items-center gap-2 hover:text-gray-100">
                <FiPhone className="w-4 h-4" />
                <span>0336 064 040</span>
              </a>
              <a
                href="mailto:vuquynhhuong171298@gmail.com"
                className="hidden md:flex items-center gap-2 hover:text-gray-100"
              >
                <FiMail className="w-4 h-4" />
                <span>vuquynhhuong171298@gmail.com</span>
              </a>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <FiMapPin className="w-4 h-4" />
              <span>120 Hoàng Quốc Việt, Hà Nội</span>
            </div>
          </div>
        </div>
      </div>

      <header className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-lg border-b border-primary/10" id="main-header">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-6 h-20">
            <div className="flex items-center gap-6">
              <button
                className="lg:hidden rounded-full border border-gray-200 p-2 text-gray-600 hover:text-primary"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </button>

              <Link to="/" className="flex items-center gap-2" aria-label="Trang chủ Hương Small House">
                <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10">
                  <img src={logo} alt="Hương Small House" width={48} height={48} className="object-contain" />
                </div>
                <div className="hidden sm:flex flex-col leading-tight">
                  <span className="text-xs uppercase tracking-[0.3em] text-primary">Hương</span>
                  <span className="text-base font-semibold text-gray-900">Small House</span>
                </div>
              </Link>

              <nav className="hidden lg:flex items-center gap-1 rounded-full bg-gray-50 p-1 border border-gray-100">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-full transition-colors',
                      isActiveNav(item.href)
                        ? 'bg-white text-primary shadow'
                        : 'text-gray-600 hover:text-primary'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3 flex-1 justify-end">
              <form
                onSubmit={handleSearch}
                className="hidden md:flex items-center gap-2 flex-1 max-w-md bg-gray-50 rounded-full border border-gray-200 px-4 py-2"
              >
                <FiSearch className="w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="flex-1 bg-transparent outline-none text-sm text-gray-700"
                />
                <button type="submit" className="text-sm font-medium text-primary">
                  Tìm kiếm
                </button>
              </form>

              <button
                className="md:hidden rounded-full border border-gray-200 p-2 text-gray-600 hover:text-primary"
                onClick={() => setIsSearchOpen((prev) => !prev)}
                aria-label="Toggle search"
              >
                <FiSearch className="w-5 h-5" />
              </button>

              {isAuthenticated ? (
                <div className="relative" ref={accountMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                    className="flex items-center gap-3 rounded-full border border-gray-200 py-2 pr-4 pl-2 hover:border-primary/40 transition"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold">
                      {initials}
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-500">Xin chào</p>
                      <p className="text-sm font-semibold text-gray-800 max-w-[120px] truncate">{user?.fullName}</p>
                    </div>
                    <FiChevronDown
                      className={cn('w-4 h-4 text-gray-500 transition-transform', isAccountMenuOpen && 'rotate-180')}
                    />
                  </button>
                  {isAccountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-100 bg-white shadow-xl p-2">
                      <Link
                        to="/account"
                        className="block px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-primary/10"
                        onClick={() => setIsAccountMenuOpen(false)}
                      >
                        Quản lý tài khoản
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full px-4 py-2 rounded-xl text-sm font-medium text-left text-red-600 hover:bg-red-50"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-primary text-primary px-4 py-2 text-sm font-semibold hover:bg-primary/10"
                >
                  <FiLogIn /> Đăng nhập
                </Link>
              )}

              <button
                onClick={toggleCart}
                className="relative h-12 w-12 rounded-full border border-gray-200 text-gray-700 hover:border-primary/40 hover:text-primary transition"
                aria-label="Shopping cart"
              >
                <FiShoppingCart className="w-5 h-5 mx-auto mt-3" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-xs font-semibold bg-primary text-white rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {isSearchOpen && (
          <div className="border-t border-gray-100 bg-white lg:hidden">
            <form onSubmit={handleSearch} className="container mx-auto px-4 py-3 flex items-center gap-3">
              <FiSearch className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="flex-1 bg-transparent outline-none text-sm text-gray-700"
              />
              <button type="submit" className="text-sm font-medium text-primary">
                Tìm kiếm
              </button>
            </form>
          </div>
        )}
      </header>

      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50">
          <nav className="absolute top-0 left-0 bottom-0 w-80 max-w-full bg-white shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Menu chính</p>
                <p className="text-lg font-semibold text-gray-900">Hương Small House</p>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="rounded-full border border-gray-200 p-2 text-gray-600 hover:text-primary"
                aria-label="Đóng menu"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 py-3 px-3 rounded-2xl border border-transparent hover:border-primary/20 hover:bg-primary/5 text-gray-700 font-medium"
                >
                  <item.icon className="w-5 h-5 text-primary" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="p-4 border-t border-gray-100 space-y-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/account"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 py-3 px-3 rounded-2xl border border-gray-200 text-gray-700 font-medium"
                  >
                    <FiUser className="w-5 h-5" />
                    <span>{user?.fullName || 'Tài khoản'}</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 py-3 px-3 rounded-2xl border border-red-100 text-red-600 font-medium"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span>Đăng xuất</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-3 py-3 px-3 rounded-2xl bg-primary text-white font-medium"
                >
                  <FiLogIn className="w-5 h-5" />
                  <span>Đăng nhập</span>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
};
