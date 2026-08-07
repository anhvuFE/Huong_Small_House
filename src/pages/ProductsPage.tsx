import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Paper,
  IconButton,
  Chip,
  Breadcrumbs,
  Slider,
} from '@mui/material';
import {
  FilterList,
  Close,
  Sort,
  Home,
  NavigateNext,
  DeleteOutline,
} from '@mui/icons-material';
import { Select as AntSelect } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductList } from '../components/products/ProductList';
import { Pagination } from '../components/common/Pagination';
import { usePagination } from '../hooks/usePagination';
import { productApi } from '../services/productApi';
import type { Category, Product } from '../types';
import { mockProducts } from '../data/productData';
import { mockCategories } from '../data/categoryData';
import { formatCurrency } from '../utils/format';
import { palette } from '../theme';


const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'best-selling', label: 'Bán chạy' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'price-asc', label: 'Giá thấp → cao' },
  { value: 'price-desc', label: 'Giá cao → thấp' },
];

const mobileOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const mobilePanel = {
  hidden: { x: '-100%' },
  visible: { x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } },
  exit: { x: '-100%', transition: { duration: 0.25 } },
};

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [maxPriceLimit, setMaxPriceLimit] = useState(2000000);

  const { currentPage, pageSize, handlePageChange, handlePageSizeChange, getPaginatedData } =
    usePagination(1, 12);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
  });

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);

  useEffect(() => {
    let cancelled = false;
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setError('');
        const categoryData = await productApi.listCategories('customer');
        const productData = await productApi.listProducts(categoryData);
        if (cancelled) return;
        setCategories(categoryData);
        setProducts(productData);
        const brandSet = new Set(productData.map((p) => p.brand));
        setBrands([...brandSet]);
        if (productData.length > 0) {
          const prices = productData.map((p) => p.price);
          const maxP = Math.max(...prices);
          setMaxPriceLimit(maxP);
          setPriceRange([
            filters.minPrice ? Number(filters.minPrice) : 0,
            filters.maxPrice ? Number(filters.maxPrice) : maxP,
          ]);
        }
      } catch {
        if (cancelled) return;
        setCategories(mockCategories);
        setProducts(mockProducts);
        const brandSet = new Set(mockProducts.map((p) => p.brand));
        setBrands([...brandSet]);
        if (mockProducts.length > 0) {
          const prices = mockProducts.map((p) => p.price);
          const maxP = Math.max(...prices);
          setMaxPriceLimit(maxP);
          setPriceRange([
            filters.minPrice ? Number(filters.minPrice) : 0,
            filters.maxPrice ? Number(filters.maxPrice) : maxP,
          ]);
        }
        setError('');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchInitialData();
    return () => { cancelled = true; };
  }, [filters.maxPrice, filters.minPrice]);

  useEffect(() => {
    const calc = () => {
      const main = document.getElementById('main-header');
      const top = document.getElementById('top-bar');
      setHeaderHeight((main?.offsetHeight ?? 0) + (top?.offsetHeight ?? 0) || 96);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  useEffect(() => {
    document.body.style.overflow = showFilters ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showFilters]);

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (filters.category) {
      const cat = categories.find((c) => c.slug === filters.category);
      if (cat) {
        list = list.filter((p) => p.categoryId === cat.categoryId);
      } else {
        list = list.filter(
          (p) =>
            p.categoryId?.toString() === filters.category ||
            p.category === filters.category ||
            p.slug === filters.category
        );
      }
    }
    if (filters.brand) list = list.filter((p) => p.brand === filters.brand);
    if (filters.minPrice) list = list.filter((p) => p.price >= Number(filters.minPrice));
    if (filters.maxPrice) list = list.filter((p) => p.price <= Number(filters.maxPrice));
    const search = searchParams.get('search');
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    switch (filters.sortBy) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'rating': list.sort((a, b) => b.rating - a.rating); break;
      case 'best-selling': list.sort((a, b) => b.soldCount - a.soldCount); break;
      default: list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    return list;
  }, [products, filters, searchParams, categories]);

  const paginatedData = useMemo(() => getPaginatedData(filteredProducts), [filteredProducts, getPaginatedData]);

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      const params = new URLSearchParams(searchParams);
      if (value) params.set(key, value);
      else params.delete(key);
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  const clearFilters = useCallback(() => {
    setFilters({ category: '', brand: '', minPrice: '', maxPrice: '', sortBy: 'newest' });
    setPriceRange([0, maxPriceLimit]);
    setSearchParams({});
  }, [maxPriceLimit, setSearchParams]);

  const activeFilterCount = [filters.category, filters.brand, filters.minPrice, filters.maxPrice].filter(Boolean).length;

  const searchQuery = searchParams.get('search');

  // Shared filter sidebar content
  const filterContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Sort */}
      <Box>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: palette.textPrimary, mb: 1, display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <Sort sx={{ fontSize: 16, color: palette.accent }} />
          Sắp xếp
        </Typography>
        <AntSelect
          value={filters.sortBy}
          onChange={(v) => handleFilterChange('sortBy', v)}
          options={SORT_OPTIONS}
          style={{ width: '100%', fontFamily: 'Inter, system-ui, sans-serif' }}
          size="middle"
        />
      </Box>

      {/* Category */}
      <Box>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: palette.textPrimary, mb: 1 }}>
          Danh mục
        </Typography>
        <AntSelect
          value={filters.category || undefined}
          onChange={(v) => handleFilterChange('category', v || '')}
          allowClear
          placeholder="Tất cả danh mục"
          options={categories.map((c) => ({ value: c.slug, label: c.name }))}
          style={{ width: '100%', fontFamily: 'Inter, system-ui, sans-serif' }}
          size="middle"
        />
      </Box>

      {/* Brand */}
      <Box>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: palette.textPrimary, mb: 1 }}>
          Thương hiệu
        </Typography>
        <AntSelect
          value={filters.brand || undefined}
          onChange={(v) => handleFilterChange('brand', v || '')}
          allowClear
          placeholder="Tất cả thương hiệu"
          options={brands.map((b) => ({ value: b, label: b }))}
          style={{ width: '100%', fontFamily: 'Inter, system-ui, sans-serif' }}
          size="middle"
        />
      </Box>

      {/* Price Range */}
      <Box>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: palette.textPrimary, mb: 1.5 }}>
          Khoảng giá
        </Typography>
        <Slider
          value={priceRange}
          onChange={(_, val) => setPriceRange(val as [number, number])}
          onChangeCommitted={(_, val) => {
            const v = val as [number, number];
            handleFilterChange('minPrice', v[0].toString());
            handleFilterChange('maxPrice', v[1].toString());
          }}
          min={0}
          max={maxPriceLimit}
          step={50000}
          valueLabelDisplay="auto"
          valueLabelFormat={(v) => formatCurrency(v)}
          sx={{
            color: palette.accent,
            '& .MuiSlider-thumb': {
              width: 18,
              height: 18,
              bgcolor: '#fff',
              border: `2px solid ${palette.accent}`,
              '&:hover': { boxShadow: `0 0 0 6px rgba(125,175,24,0.15)` },
            },
            '& .MuiSlider-track': { height: 4 },
            '& .MuiSlider-rail': { height: 4, bgcolor: '#E0E0E0' },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: palette.accent }}>
            {formatCurrency(priceRange[0])}
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: palette.accent }}>
            {formatCurrency(priceRange[1])}
          </Typography>
        </Box>
      </Box>

      {/* Clear */}
      <Box
        component="button"
        type="button"
        onClick={clearFilters}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.8,
          py: 1.2,
          borderRadius: 2.5,
          border: `1px solid ${palette.border}`,
          bgcolor: 'transparent',
          color: palette.textSecondary,
          fontSize: '0.85rem',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': { borderColor: '#C62828', color: '#C62828', bgcolor: '#FFF5F5' },
        }}
      >
        <DeleteOutline sx={{ fontSize: 17 }} />
        Xóa bộ lọc
      </Box>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: palette.background, minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
        {/* Breadcrumb */}
        <Breadcrumbs separator={<NavigateNext sx={{ fontSize: 16 }} />} sx={{ mb: 3 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Home sx={{ fontSize: 16, color: palette.textMuted }} />
            <Typography sx={{ fontSize: '0.82rem', color: palette.textMuted, '&:hover': { color: palette.accent } }}>
              Trang chủ
            </Typography>
          </Link>
          <Typography sx={{ fontSize: '0.82rem', color: palette.textPrimary, fontWeight: 600 }}>
            Sản phẩm
          </Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: palette.textPrimary, fontSize: { xs: '1.3rem', md: '1.6rem' } }}>
              {searchQuery ? `Kết quả tìm kiếm "${searchQuery}"` : 'Tất cả sản phẩm'}
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted, mt: 0.5 }}>
              {paginatedData.totalItems} sản phẩm
            </Typography>
          </Box>

          {/* Mobile filter toggle */}
          <Box
            component="button"
            type="button"
            onClick={() => setShowFilters(true)}
            sx={{
              display: { xs: 'flex', lg: 'none' },
              alignItems: 'center',
              gap: 0.8,
              border: `1px solid ${palette.border}`,
              borderRadius: 2.5,
              px: 2,
              py: 1,
              bgcolor: '#fff',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: palette.textSecondary,
              transition: 'all 0.2s',
              position: 'relative',
              '&:hover': { borderColor: palette.accent, color: palette.accent },
            }}
          >
            <FilterList sx={{ fontSize: 18 }} />
            Bộ lọc
            {activeFilterCount > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  bgcolor: palette.accent,
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {activeFilterCount}
              </Box>
            )}
          </Box>
        </Box>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
            {filters.category && (
              <Chip
                label={`Danh mục: ${categories.find((c) => c.slug === filters.category)?.name || filters.category}`}
                size="small"
                onDelete={() => handleFilterChange('category', '')}
                sx={{ bgcolor: palette.accentLight, color: palette.accent, fontWeight: 500, fontSize: '0.78rem' }}
              />
            )}
            {filters.brand && (
              <Chip
                label={`Thương hiệu: ${filters.brand}`}
                size="small"
                onDelete={() => handleFilterChange('brand', '')}
                sx={{ bgcolor: palette.accentLight, color: palette.accent, fontWeight: 500, fontSize: '0.78rem' }}
              />
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <Chip
                label={`Giá: ${formatCurrency(Number(filters.minPrice) || 0)} - ${formatCurrency(Number(filters.maxPrice) || maxPriceLimit)}`}
                size="small"
                onDelete={() => {
                  handleFilterChange('minPrice', '');
                  handleFilterChange('maxPrice', '');
                  setPriceRange([0, maxPriceLimit]);
                }}
                sx={{ bgcolor: palette.accentLight, color: palette.accent, fontWeight: 500, fontSize: '0.78rem' }}
              />
            )}
          </Box>
        )}

        {error && (
          <Typography sx={{ textAlign: 'center', color: '#C62828', py: 2, fontSize: '0.9rem' }}>{error}</Typography>
        )}

        {/* Main layout */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Desktop sidebar */}
          <Box
            component="aside"
            sx={{
              display: { xs: 'none', lg: 'block' },
              width: 260,
              flexShrink: 0,
              position: 'sticky',
              top: `${headerHeight + 16}px`,
              maxHeight: `calc(100vh - ${headerHeight + 32}px)`,
              overflowY: 'auto',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: `1px solid ${palette.border}`,
                borderRadius: 3,
              }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: palette.textPrimary, mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterList sx={{ fontSize: 18, color: palette.accent }} />
                Bộ lọc
              </Typography>
              {filterContent}
            </Paper>
          </Box>

          {/* Product grid */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <ProductList products={paginatedData.items} loading={isLoading} />

            <Box sx={{ mt: 3 }}>
              <Pagination
                currentPage={currentPage}
                totalPages={paginatedData.totalPages}
                totalItems={paginatedData.totalItems}
                itemsPerPage={pageSize}
                onPageChange={handlePageChange}
                showPageSizeSelect
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[12, 24, 36, 48]}
              />
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Mobile filter panel */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              variants={mobileOverlay}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.25 }}
              onClick={() => setShowFilters(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 45,
                backgroundColor: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(2px)',
              }}
            />
            <motion.aside
              variants={mobilePanel}
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 2, borderBottom: `1px solid ${palette.border}` }}>
                <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: palette.textPrimary, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterList sx={{ fontSize: 20, color: palette.accent }} />
                  Bộ lọc
                </Typography>
                <IconButton onClick={() => setShowFilters(false)} size="small" sx={{ border: `1px solid ${palette.border}`, borderRadius: 2 }}>
                  <Close sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
              <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2.5 }}>
                {filterContent}
              </Box>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </Box>
  );
};
