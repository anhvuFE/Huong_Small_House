import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Badge,
  Avatar,
  InputBase,
  Divider,
} from '@mui/material';
import {
  Search,
  ShoppingCartOutlined,
  MenuRounded,
  Close,
  Phone,
  Email,
  LocationOn,
  Person,
  Logout,
  Login,
  KeyboardArrowDown,
  Home,
  Inventory2Outlined,
  CategoryOutlined,
  InfoOutlined,
  ContactMailOutlined,
  ArticleOutlined,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../utils/cn';
import logo from '../../assets/logo.png';

const palette = {
  primary: '#2E7D32',
  accent: '#7daf18',
  textPrimary: '#1A2332',
  textSecondary: '#5A6B7F',
  textMuted: '#8D99A8',
  border: '#E8ECF0',
  background: '#FAFBFC',
};

const navItems = [
  { label: 'Trang chủ', href: '/', icon: Home },
  { label: 'Sản phẩm', href: '/products', icon: Inventory2Outlined },
  { label: 'Danh mục', href: '/categories', icon: CategoryOutlined },
  { label: 'Giới thiệu', href: '/about', icon: InfoOutlined },
  { label: 'Liên hệ', href: '/contact', icon: ContactMailOutlined },
  { label: 'Blog', href: '/blog', icon: ArticleOutlined },
];

// Framer motion variants
const mobileMenuOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const mobileMenuPanel = {
  hidden: { x: '-100%' },
  visible: { x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } },
  exit: { x: '-100%', transition: { duration: 0.25 } },
};

const mobileNavItem = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0 },
};

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const { getTotalItems, toggleCart } = useCartStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const cartItemsCount = getTotalItems();

  const isActiveNav = (href: string): boolean => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = useCallback(() => {
    logout();
    setIsAccountMenuOpen(false);
  }, [logout]);

  // Track scroll for shadow effect
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Header height calculation for App.tsx
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

  // Close account menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsAccountMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const displayName = (() => {
    const name = user?.fullName || user?.email || 'User';
    return name.includes('@') ? name.split('@')[0] : name;
  })();

  return (
    <Box
      component="div"
      sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40 }}
    >
      {/* ===== Top Bar ===== */}
      <Box
        id="top-bar"
        sx={{
          bgcolor: palette.primary,
          color: '#fff',
          py: 0.8,
          fontSize: '0.8rem',
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: 'auto',
            px: { xs: 2, sm: 3, lg: 5 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 3 } }}>
            <Box
              component="a"
              href="tel:0336064040"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.7,
                color: '#fff',
                textDecoration: 'none',
                '&:hover': { color: 'rgba(255,255,255,0.85)' },
                transition: 'color 0.2s',
              }}
            >
              <Phone sx={{ fontSize: 15 }} />
              <span>0336 064 040</span>
            </Box>
            <Box
              component="a"
              href="mailto:vuquynhhuong171298@gmail.com"
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 0.7,
                color: '#fff',
                textDecoration: 'none',
                '&:hover': { color: 'rgba(255,255,255,0.85)' },
                transition: 'color 0.2s',
              }}
            >
              <Email sx={{ fontSize: 15 }} />
              <span>vuquynhhuong171298@gmail.com</span>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.7,
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            <LocationOn sx={{ fontSize: 15 }} />
            <Typography sx={{ fontSize: '0.8rem' }}>120 Hoàng Quốc Việt, Hà Nội</Typography>
          </Box>
        </Box>
      </Box>

      {/* ===== Main Header ===== */}
      <Box
        component="header"
        id="main-header"
        sx={{
          bgcolor: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${isScrolled ? palette.border : 'transparent'}`,
          boxShadow: isScrolled ? '0 2px 16px rgba(0,0,0,0.06)' : 'none',
          transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: 'auto',
            px: { xs: 2, sm: 3, lg: 5 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 1.5, md: 3 },
            height: { xs: 64, md: 72 },
          }}
        >
          {/* Left: Hamburger + Logo + Nav */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2.5 } }}>
            {/* Mobile menu toggle */}
            <IconButton
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              sx={{
                display: { xs: 'flex', xl: 'none' },
                border: `1px solid ${palette.border}`,
                borderRadius: 2.5,
                p: 0.8,
                color: palette.textSecondary,
                '&:hover': { color: palette.accent, borderColor: palette.accent },
                transition: 'all 0.2s',
              }}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <Close sx={{ fontSize: 22 }} /> : <MenuRounded sx={{ fontSize: 22 }} />}
            </IconButton>

            {/* Logo */}
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 3,
                  bgcolor: '#EDF7D5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <img src={logo} alt="Hương Small House" width={40} height={40} style={{ objectFit: 'contain' }} />
              </Box>
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', lineHeight: 1.1 }}>
                <Typography
                  sx={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 3,
                    color: palette.accent,
                  }}
                >
                  Hương
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: palette.textPrimary,
                  }}
                >
                  Small House
                </Typography>
              </Box>
            </Link>

            {/* Desktop Navigation */}
            <Box
              component="nav"
              sx={{
                display: { xs: 'none', xl: 'flex' },
                alignItems: 'center',
                gap: 0.3,
                ml: 1,
                bgcolor: palette.background,
                borderRadius: 3,
                p: 0.5,
                border: `1px solid ${palette.border}`,
              }}
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'px-3.5 py-2 text-[0.84rem] font-medium rounded-[10px] transition-all duration-200 whitespace-nowrap',
                    isActiveNav(item.href)
                      ? 'bg-white text-[#7daf18] shadow-sm'
                      : 'text-[#5A6B7F] hover:text-[#2E7D32] hover:bg-white/60'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </Box>
          </Box>

          {/* Right: Search + Auth + Cart */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1.5 }, flex: { md: 1 }, justifyContent: 'flex-end' }}>
            {/* Desktop Search */}
            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                flex: 1,
                maxWidth: 360,
                bgcolor: palette.background,
                borderRadius: 3,
                border: `1px solid ${palette.border}`,
                px: 1.5,
                py: 0.6,
                transition: 'border-color 0.2s, box-shadow 0.2s',
                '&:focus-within': {
                  borderColor: palette.accent,
                  boxShadow: `0 0 0 3px rgba(125,175,24,0.1)`,
                },
              }}
            >
              <Search sx={{ fontSize: 20, color: palette.textMuted, mr: 1 }} />
              <InputBase
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                sx={{
                  flex: 1,
                  fontSize: '0.88rem',
                  color: palette.textPrimary,
                  '& input::placeholder': { color: palette.textMuted, opacity: 1 },
                }}
              />
              {searchQuery && (
                <IconButton size="small" onClick={() => setSearchQuery('')} sx={{ p: 0.3 }}>
                  <Close sx={{ fontSize: 16, color: palette.textMuted }} />
                </IconButton>
              )}
            </Box>

            {/* Mobile search toggle */}
            <IconButton
              onClick={() => setIsSearchOpen((prev) => !prev)}
              sx={{
                display: { xs: 'flex', md: 'none' },
                border: `1px solid ${palette.border}`,
                borderRadius: 2.5,
                p: 0.8,
                color: palette.textSecondary,
                '&:hover': { color: palette.accent },
              }}
              aria-label="Toggle search"
            >
              <Search sx={{ fontSize: 22 }} />
            </IconButton>

            {/* Auth Section */}
            {isAuthenticated ? (
              <Box ref={accountMenuRef} sx={{ position: 'relative' }}>
                <Box
                  component="button"
                  type="button"
                  onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    border: `1px solid ${palette.border}`,
                    borderRadius: 3,
                    py: 0.6,
                    pr: 1.5,
                    pl: 0.6,
                    bgcolor: 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: palette.accent },
                  }}
                >
                  <Avatar
                    src={logo}
                    sx={{
                      width: 34,
                      height: 34,
                      bgcolor: '#EDF7D5',
                      '& img': { objectFit: 'contain', p: 0.3 },
                    }}
                  />
                  <Box sx={{ textAlign: 'left', display: { xs: 'none', lg: 'block' } }}>
                    <Typography sx={{ fontSize: '0.68rem', color: palette.textMuted, lineHeight: 1.2 }}>
                      Xin chào
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: palette.textPrimary,
                        maxWidth: 110,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.3,
                      }}
                    >
                      {displayName}
                    </Typography>
                  </Box>
                  <KeyboardArrowDown
                    sx={{
                      fontSize: 18,
                      color: palette.textMuted,
                      transition: 'transform 0.2s',
                      transform: isAccountMenuOpen ? 'rotate(180deg)' : 'none',
                      display: { xs: 'none', lg: 'block' },
                    }}
                  />
                </Box>

                {/* Account dropdown */}
                <AnimatePresence>
                  {isAccountMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 8px)',
                        width: 220,
                        zIndex: 50,
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: '#fff',
                          borderRadius: 3,
                          border: `1px solid ${palette.border}`,
                          boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                          overflow: 'hidden',
                          p: 0.8,
                        }}
                      >
                        <Link
                          to="/account"
                          onClick={() => setIsAccountMenuOpen(false)}
                          style={{ textDecoration: 'none' }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.2,
                              px: 1.5,
                              py: 1.2,
                              borderRadius: 2,
                              transition: 'background 0.15s',
                              '&:hover': { bgcolor: '#EDF7D5' },
                            }}
                          >
                            <Person sx={{ fontSize: 19, color: palette.textSecondary }} />
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: palette.textPrimary }}>
                              Quản lý tài khoản
                            </Typography>
                          </Box>
                        </Link>
                        <Divider sx={{ my: 0.5 }} />
                        <Box
                          component="button"
                          type="button"
                          onClick={handleLogout}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.2,
                            px: 1.5,
                            py: 1.2,
                            borderRadius: 2,
                            width: '100%',
                            border: 'none',
                            bgcolor: 'transparent',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                            '&:hover': { bgcolor: '#FFEBEE' },
                          }}
                        >
                          <Logout sx={{ fontSize: 19, color: '#C62828' }} />
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#C62828' }}>
                            Đăng xuất
                          </Typography>
                        </Box>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            ) : (
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.8,
                    border: `1.5px solid ${palette.accent}`,
                    borderRadius: 3,
                    px: { xs: 1.5, md: 2 },
                    py: 0.8,
                    color: palette.accent,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      bgcolor: '#EDF7D5',
                    },
                  }}
                >
                  <Login sx={{ fontSize: 18 }} />
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    Đăng nhập
                  </Box>
                </Box>
              </Link>
            )}

            {/* Cart Button */}
            <IconButton
              onClick={toggleCart}
              sx={{
                border: `1px solid ${palette.border}`,
                borderRadius: 2.5,
                p: 1,
                color: palette.textSecondary,
                transition: 'all 0.2s',
                '&:hover': {
                  color: palette.accent,
                  borderColor: palette.accent,
                },
              }}
              aria-label="Shopping cart"
            >
              <Badge
                badgeContent={cartItemsCount}
                sx={{
                  '& .MuiBadge-badge': {
                    bgcolor: palette.accent,
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    minWidth: 18,
                    height: 18,
                  },
                }}
              >
                <ShoppingCartOutlined sx={{ fontSize: 22 }} />
              </Badge>
            </IconButton>
          </Box>
        </Box>

        {/* Mobile Search Expanded */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <Box sx={{ borderTop: `1px solid ${palette.border}`, bgcolor: '#fff' }}>
                <Box
                  component="form"
                  onSubmit={handleSearch}
                  sx={{
                    maxWidth: 1200,
                    mx: 'auto',
                    px: 2,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Search sx={{ fontSize: 20, color: palette.textMuted }} />
                  <InputBase
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm sản phẩm..."
                    sx={{
                      flex: 1,
                      fontSize: '0.9rem',
                      color: palette.textPrimary,
                    }}
                  />
                  <Box
                    component="button"
                    type="submit"
                    sx={{
                      bgcolor: 'transparent',
                      border: 'none',
                      color: palette.accent,
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Tìm kiếm
                  </Box>
                </Box>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* ===== Mobile Side Menu ===== */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              variants={mobileMenuOverlay}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.25 }}
              onClick={() => setIsMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 45,
                backgroundColor: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(2px)',
              }}
            />

            {/* Panel */}
            <motion.nav
              variants={mobileMenuPanel}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: 300,
                maxWidth: '85vw',
                zIndex: 50,
                backgroundColor: '#fff',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '4px 0 30px rgba(0,0,0,0.1)',
              }}
            >
              {/* Menu Header */}
              <Box
                sx={{
                  px: 3,
                  py: 2.5,
                  borderBottom: `1px solid ${palette.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: '0.72rem', color: palette.textMuted, mb: 0.2 }}>
                    Menu
                  </Typography>
                  <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: palette.textPrimary }}>
                    Hương Small House
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => setIsMenuOpen(false)}
                  sx={{
                    border: `1px solid ${palette.border}`,
                    borderRadius: 2,
                    p: 0.6,
                    color: palette.textSecondary,
                  }}
                  aria-label="Đóng menu"
                >
                  <Close sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>

              {/* Nav items */}
              <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2 }}>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  transition={{ staggerChildren: 0.04, delayChildren: 0.1 }}
                >
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActiveNav(item.href);
                    return (
                      <motion.div key={item.href} variants={mobileNavItem} transition={{ duration: 0.25 }}>
                        <Link
                          to={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          style={{ textDecoration: 'none' }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              py: 1.4,
                              px: 1.5,
                              mb: 0.5,
                              borderRadius: 2.5,
                              bgcolor: active ? '#EDF7D5' : 'transparent',
                              border: `1px solid ${active ? 'rgba(125,175,24,0.2)' : 'transparent'}`,
                              transition: 'all 0.2s',
                              '&:hover': {
                                bgcolor: active ? '#EDF7D5' : palette.background,
                              },
                            }}
                          >
                            <Icon
                              sx={{
                                fontSize: 20,
                                color: active ? palette.accent : palette.textMuted,
                              }}
                            />
                            <Typography
                              sx={{
                                fontSize: '0.92rem',
                                fontWeight: active ? 600 : 500,
                                color: active ? palette.accent : palette.textPrimary,
                              }}
                            >
                              {item.label}
                            </Typography>
                          </Box>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </Box>

              {/* Footer actions */}
              <Box sx={{ px: 2, py: 2, borderTop: `1px solid ${palette.border}` }}>
                {isAuthenticated ? (
                  <>
                    <Link to="/account" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          py: 1.3,
                          px: 1.5,
                          mb: 1,
                          borderRadius: 2.5,
                          border: `1px solid ${palette.border}`,
                          transition: 'all 0.2s',
                          '&:hover': { borderColor: palette.accent },
                        }}
                      >
                        <Person sx={{ fontSize: 20, color: palette.textSecondary }} />
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 500, color: palette.textPrimary }}>
                          {user?.fullName || 'Tài khoản'}
                        </Typography>
                      </Box>
                    </Link>
                    <Box
                      component="button"
                      type="button"
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        py: 1.3,
                        px: 1.5,
                        width: '100%',
                        borderRadius: 2.5,
                        border: '1px solid #FFCDD2',
                        bgcolor: 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: '#FFEBEE' },
                      }}
                    >
                      <Logout sx={{ fontSize: 20, color: '#C62828' }} />
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 500, color: '#C62828' }}>
                        Đăng xuất
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        py: 1.4,
                        borderRadius: 2.5,
                        bgcolor: palette.accent,
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.92rem',
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: '#6B9E12' },
                      }}
                    >
                      <Login sx={{ fontSize: 20 }} />
                      <span>Đăng nhập</span>
                    </Box>
                  </Link>
                )}
              </Box>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </Box>
  );
};
