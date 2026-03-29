import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Paper,
  Breadcrumbs,
  InputBase,
  Chip,
} from '@mui/material';
import {
  Home,
  NavigateNext,
  Search,
  ArrowForward,
  Category,
  Inventory2,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  FiActivity,
  FiFeather,
  FiShield,
  FiHeart,
  FiSun,
  FiMoon,
  FiStar,
  FiTrendingDown,
  FiBox,
} from 'react-icons/fi';
import { productApi } from '../services/productApi';
import type { Category as CategoryType } from '../types';
import { Pagination } from '../components/common/Pagination';
import { usePagination } from '../hooks/usePagination';
import { fadeInUp, staggerContainer } from '../hooks/useScrollAnimation';

const palette = {
  accent: '#7daf18',
  accentLight: '#EDF7D5',
  primary: '#2E7D32',
  primarySoft: '#E8F5E9',
  textPrimary: '#1A2332',
  textSecondary: '#5A6B7F',
  textMuted: '#8D99A8',
  border: '#E8ECF0',
  background: '#FAFBFC',
};

const iconMap: Record<string, React.ElementType> = {
  vitamin: FiActivity,
  digestive: FiTrendingDown,
  immunity: FiShield,
  heart: FiHeart,
  beauty: FiStar,
  energy: FiSun,
  sleep: FiMoon,
  collagen: FiFeather,
};

const colorMap: Record<string, { icon: string; bg: string; soft: string }> = {
  vitamin: { icon: '#E65100', bg: '#FFF3E0', soft: '#E65100' },
  digestive: { icon: '#2E7D32', bg: '#E8F5E9', soft: '#2E7D32' },
  immunity: { icon: '#1565C0', bg: '#E3F2FD', soft: '#1565C0' },
  heart: { icon: '#C62828', bg: '#FFEBEE', soft: '#C62828' },
  beauty: { icon: '#AD1457', bg: '#FCE4EC', soft: '#AD1457' },
  energy: { icon: '#F9A825', bg: '#FFFDE7', soft: '#F9A825' },
  sleep: { icon: '#4527A0', bg: '#EDE7F6', soft: '#4527A0' },
  collagen: { icon: '#00838F', bg: '#E0F7FA', soft: '#00838F' },
};

function getSlugKey(slug: string) {
  return slug.replace(/-.*$/, '');
}

export const CategoriesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const { currentPage, pageSize, handlePageChange, handlePageSizeChange, getPaginatedData } =
    usePagination(1, 8);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError('');
        const catData = await productApi.listCategories('customer');
        const prodData = await productApi.listProducts(catData).catch(() => []);
        if (cancelled) return;

        const countMap = new Map<number, number>();
        prodData.forEach((p) => {
          if (p.categoryId !== undefined) {
            countMap.set(p.categoryId, (countMap.get(p.categoryId) || 0) + 1);
          }
        });

        setCategories(
          catData.map((c) => ({
            ...c,
            productCount: c.categoryId !== undefined ? (countMap.get(c.categoryId) || 0) : 0,
          }))
        );
      } catch {
        if (!cancelled) setError('Không thể tải danh mục. Vui lòng thử lại sau.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    const q = searchTerm.toLowerCase();
    return categories.filter(
      (c) =>
        (c.name ?? '').toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q)
    );
  }, [categories, searchTerm]);

  const paginatedData = getPaginatedData(filteredCategories);
  const totalProducts = categories.reduce((sum, c) => sum + (c.productCount ?? 0), 0);

  return (
    <Box sx={{ bgcolor: palette.background, minHeight: '100vh' }}>
      {/* Page Header */}
      <Box sx={{ bgcolor: palette.primary, py: { xs: 5, md: 6 }, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -40, left: '30%', width: 150, height: 150, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Breadcrumbs separator={<NavigateNext sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />} sx={{ mb: 3 }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Home sx={{ fontSize: 16, color: 'rgba(255,255,255,0.6)' }} />
              <Typography sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>Trang chủ</Typography>
            </Link>
            <Typography sx={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>Danh mục</Typography>
          </Breadcrumbs>

          <Typography variant="h3" sx={{ color: '#fff', fontSize: { xs: '1.6rem', md: '2.2rem' }, mb: 1 }}>
            Danh mục sản phẩm
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', mb: 3.5, maxWidth: 500 }}>
            Khám phá {categories.length} danh mục với {totalProducts}+ sản phẩm chăm sóc sức khỏe
          </Typography>

          {/* Search */}
          <Box
            component="form"
            onSubmit={(e: React.FormEvent) => e.preventDefault()}
            sx={{
              display: 'flex',
              alignItems: 'center',
              maxWidth: 460,
              bgcolor: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
              borderRadius: 3,
              px: 2,
              py: 0.8,
              border: '1px solid rgba(255,255,255,0.15)',
              transition: 'all 0.2s',
              '&:focus-within': {
                bgcolor: 'rgba(255,255,255,0.18)',
                borderColor: 'rgba(255,255,255,0.3)',
              },
            }}
          >
            <Search sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 20, mr: 1 }} />
            <InputBase
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm danh mục..."
              sx={{
                flex: 1,
                color: '#fff',
                fontSize: '0.9rem',
                '& input::placeholder': { color: 'rgba(255,255,255,0.5)', opacity: 1 },
              }}
            />
          </Box>
        </Container>
      </Box>

      {/* Quick stats */}
      <Box sx={{ bgcolor: '#fff', borderBottom: `1px solid ${palette.border}`, py: { xs: 2, md: 2.5 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 4 }, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Category sx={{ fontSize: 18, color: palette.accent }} />
              <Typography sx={{ fontSize: '0.85rem', color: palette.textSecondary }}>
                <Box component="span" sx={{ fontWeight: 700, color: palette.textPrimary }}>{categories.length}</Box> danh mục
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Inventory2 sx={{ fontSize: 18, color: palette.accent }} />
              <Typography sx={{ fontSize: '0.85rem', color: palette.textSecondary }}>
                <Box component="span" sx={{ fontWeight: 700, color: palette.textPrimary }}>{totalProducts}</Box> sản phẩm
              </Typography>
            </Box>
            {searchTerm && (
              <Chip
                label={`Tìm: "${searchTerm}" · ${filteredCategories.length} kết quả`}
                size="small"
                onDelete={() => setSearchTerm('')}
                sx={{ bgcolor: palette.accentLight, color: palette.accent, fontWeight: 500, fontSize: '0.78rem' }}
              />
            )}
          </Box>
        </Container>
      </Box>

      {/* Categories Grid */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
        {error && (
          <Typography sx={{ textAlign: 'center', color: '#C62828', py: 2, mb: 3 }}>{error}</Typography>
        )}

        {isLoading ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: 2.5,
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  height: 180,
                  bgcolor: '#fff',
                  borderRadius: 3,
                  border: `1px solid ${palette.border}`,
                  animation: 'pulse 1.5s ease-in-out infinite',
                  '@keyframes pulse': { '0%, 100%': { opacity: 0.5 }, '50%': { opacity: 1 } },
                }}
              />
            ))}
          </Box>
        ) : (
          <>
            <motion.div
              variants={staggerContainer(0.05)}
              initial="hidden"
              animate="visible"
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
                  gap: 2.5,
                }}
              >
                {paginatedData.items.map((category) => {
                  const key = getSlugKey(category.slug);
                  const Icon = iconMap[key] ?? FiBox;
                  const colors = colorMap[key] ?? { icon: palette.accent, bg: palette.accentLight, soft: palette.accent };
                  const slug = category.slug ?? `category-${category.categoryId}`;

                  return (
                    <motion.div
                      key={category.id}
                      variants={fadeInUp}
                      transition={{ duration: 0.35 }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    >
                      <Link to={`/products?category=${slug}`} style={{ textDecoration: 'none' }}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            border: `1px solid ${palette.border}`,
                            borderRadius: 3,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            '&:hover': {
                              borderColor: colors.soft,
                              boxShadow: `0 8px 25px rgba(0,0,0,0.06)`,
                            },
                            '&:hover .cat-icon': {
                              transform: 'scale(1.1)',
                            },
                            '&:hover .cat-arrow': {
                              color: colors.soft,
                              transform: 'translateX(3px)',
                            },
                          }}
                        >
                          {/* Icon */}
                          <Box
                            className="cat-icon"
                            sx={{
                              width: 52,
                              height: 52,
                              borderRadius: 3,
                              bgcolor: colors.bg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mb: 2,
                              transition: 'transform 0.25s ease',
                            }}
                          >
                            <Icon style={{ width: 26, height: 26, color: colors.icon }} />
                          </Box>

                          {/* Name */}
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: '1rem',
                              color: palette.textPrimary,
                              mb: 0.5,
                            }}
                          >
                            {category.name}
                          </Typography>

                          {/* Description */}
                          <Typography
                            sx={{
                              fontSize: '0.82rem',
                              color: palette.textMuted,
                              lineHeight: 1.5,
                              mb: 2,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              flex: 1,
                            }}
                          >
                            {category.description || 'Sản phẩm chăm sóc sức khỏe'}
                          </Typography>

                          {/* Footer */}
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Chip
                              label={`${category.productCount ?? 0} sản phẩm`}
                              size="small"
                              sx={{
                                bgcolor: colors.bg,
                                color: colors.icon,
                                fontWeight: 600,
                                fontSize: '0.72rem',
                                height: 24,
                              }}
                            />
                            <ArrowForward
                              className="cat-arrow"
                              sx={{
                                fontSize: 18,
                                color: palette.textMuted,
                                transition: 'all 0.25s ease',
                              }}
                            />
                          </Box>
                        </Paper>
                      </Link>
                    </motion.div>
                  );
                })}

                {filteredCategories.length === 0 && (
                  <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 6 }}>
                    <Typography sx={{ color: palette.textMuted, fontSize: '0.95rem' }}>
                      Không tìm thấy danh mục nào phù hợp.
                    </Typography>
                  </Box>
                )}
              </Box>
            </motion.div>

            {filteredCategories.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={paginatedData.totalPages}
                  itemsPerPage={pageSize}
                  totalItems={paginatedData.totalItems}
                  onPageChange={handlePageChange}
                  showPageSizeSelect
                  onPageSizeChange={handlePageSizeChange}
                  pageSizeOptions={[8, 12, 16, 24]}
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};
