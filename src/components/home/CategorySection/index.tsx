import React, { memo, useEffect, useState } from 'react';
import { Box, Typography, Container } from '@mui/material';
import { Card } from 'antd';
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
  FiTrendingDown,
  FiBox,
} from 'react-icons/fi';
import { productApi } from '../../../services/productApi';
import type { Category } from '../../../types';
import { mockCategories } from '../../../data/categoryData';
import { useScrollAnimation, fadeInUp, staggerContainer } from '../../../hooks/useScrollAnimation';
import { palette } from '../../../theme';

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

const colorMap: Record<string, { icon: string; bg: string }> = {
  vitamin: { icon: '#E65100', bg: '#FFF3E0' },
  digestive: { icon: '#2E7D32', bg: '#E8F5E9' },
  immunity: { icon: '#1565C0', bg: '#E3F2FD' },
  heart: { icon: '#C62828', bg: '#FFEBEE' },
  beauty: { icon: '#AD1457', bg: '#FCE4EC' },
  energy: { icon: '#F9A825', bg: '#FFFDE7' },
  sleep: { icon: '#4527A0', bg: '#EDE7F6' },
  collagen: { icon: '#00838F', bg: '#E0F7FA' },
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
                  const colors = colorMap[key] ?? { icon: palette.accent, bg: palette.accentLight };

                  return (
                    <motion.div
                      key={cat.id}
                      variants={fadeInUp}
                      transition={{ duration: 0.35 }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    >
                      <Link to={`/products?category=${cat.slug}`} style={{ textDecoration: 'none' }}>
                        <Card
                          hoverable
                          style={{
                            borderRadius: 14,
                            border: `1px solid ${palette.border}`,
                            textAlign: 'center',
                            height: '100%',
                          }}
                          styles={{
                            body: {
                              padding: '28px 16px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: 10,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 56,
                              height: 56,
                              borderRadius: '50%',
                              bgcolor: colors.bg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'transform 0.25s ease',
                              '.ant-card:hover &': { transform: 'scale(1.06)' },
                            }}
                          >
                            <Icon style={{ width: 26, height: 26, color: colors.icon }} />
                          </Box>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.88rem',
                              color: palette.textPrimary,
                            }}
                          >
                            {cat.name}
                          </Typography>
                          {(cat.productCount ?? 0) > 0 && (
                            <Typography sx={{ fontSize: '0.73rem', color: palette.textMuted }}>
                              {cat.productCount} sản phẩm
                            </Typography>
                          )}
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default memo(CategorySection);
