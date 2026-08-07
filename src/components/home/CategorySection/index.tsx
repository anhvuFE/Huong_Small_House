import React, { memo, useEffect, useState } from 'react';
import { Box, Typography, Container } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiActivity,
  FiFeather,
  FiShield,
  FiHeart,
  FiSun,
  FiMoon,
  FiStar,
  FiDroplet,
  FiBox,
  FiArrowRight,
} from 'react-icons/fi';
import { productApi } from '../../../services/productApi';
import type { Category } from '../../../types';
import { mockCategories } from '../../../data/categoryData';
import { useScrollAnimation, fadeInUp, staggerContainer } from '../../../hooks/useScrollAnimation';
import { palette } from '../../../theme';

const iconMap: Record<string, React.ElementType> = {
  vitamin: FiActivity,
  digestive: FiDroplet,
  immunity: FiShield,
  heart: FiHeart,
  beauty: FiStar,
  energy: FiSun,
  sleep: FiMoon,
  collagen: FiFeather,
};

function getSlugKey(slug: string) {
  return slug.replace(/-.*$/, '');
}

const CategorySection: React.FC = () => {
  const [items, setItems] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { ref, isInView } = useScrollAnimation();

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      try {
        setIsLoading(true);
        const data = await productApi.listCategories('customer');
        if (!cancelled) setItems(data);
      } catch {
        if (!cancelled) setItems(mockCategories);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, []);

  return (
    <Box component="section" ref={ref} sx={{ py: { xs: 6, md: 8 }, bgcolor: '#fff' }}>
      <Container maxWidth="lg">
        {/* Section header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}>
            <Typography
              sx={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: palette.accent,
                textTransform: 'uppercase',
                letterSpacing: 2,
                mb: 1,
              }}
            >
              Danh mục sản phẩm
            </Typography>
            <Typography
              variant="h3"
              sx={{
                color: palette.textPrimary,
                fontSize: { xs: '1.5rem', md: '2rem' },
                mb: 1,
              }}
            >
              Khám phá theo nhu cầu sức khỏe
            </Typography>
            <Typography
              sx={{ color: palette.textSecondary, fontSize: '0.95rem', maxWidth: 500, mx: 'auto' }}
            >
              Chọn danh mục phù hợp để tìm sản phẩm nhanh hơn
            </Typography>
          </Box>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={staggerContainer(0.06)}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: { xs: 1.5, md: 2.5 },
            }}
          >
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      height: 140,
                      bgcolor: '#F5F5F5',
                      borderRadius: 3,
                      animation: 'pulse 1.5s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 0.5 },
                        '50%': { opacity: 1 },
                      },
                    }}
                  />
                ))
              : items.map((cat) => {
                  const key = getSlugKey(cat.slug);
                  const Icon = iconMap[key] ?? FiBox;

                  return (
                    <Box
                      key={cat.id}
                      component={motion.div}
                      variants={fadeInUp}
                      transition={{ duration: 0.35 }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    >
                      <Link to={`/products?category=${cat.slug}`} style={{ textDecoration: 'none' }}>
                        <Box
                          sx={{
                            position: 'relative',
                            height: '100%',
                            bgcolor: '#fff',
                            border: `1px solid ${palette.border}`,
                            borderRadius: 3,
                            p: 2.75,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.75,
                            transition: 'all 0.25s ease',
                            '&:hover': {
                              borderColor: palette.accent,
                              boxShadow: '0 10px 26px rgba(125,175,24,0.12)',
                            },
                            '&:hover .cat-arrow': { opacity: 1, transform: 'translateX(0)' },
                            '&:hover .cat-title': { color: palette.accent },
                          }}
                        >
                          <Box sx={{ color: palette.primary, display: 'flex', mb: 1 }}>
                            <Icon style={{ width: 30, height: 30 }} />
                          </Box>
                          <Typography
                            className="cat-title"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.95rem',
                              color: palette.textPrimary,
                              transition: 'color 0.2s ease',
                            }}
                          >
                            {cat.name}
                          </Typography>
                          {(cat.productCount ?? 0) > 0 && (
                            <Typography sx={{ fontSize: '0.78rem', color: palette.textMuted }}>
                              {cat.productCount} sản phẩm
                            </Typography>
                          )}
                          <Box
                            className="cat-arrow"
                            sx={{
                              position: 'absolute',
                              top: 22,
                              right: 22,
                              color: palette.accent,
                              display: 'flex',
                              opacity: 0,
                              transform: 'translateX(-6px)',
                              transition: 'all 0.25s ease',
                            }}
                          >
                            <FiArrowRight style={{ width: 18, height: 18 }} />
                          </Box>
                        </Box>
                      </Link>
                    </Box>
                  );
                })}
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default memo(CategorySection);
