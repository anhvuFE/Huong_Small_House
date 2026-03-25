import React, { memo } from 'react';
import { Box, Typography, Container } from '@mui/material';
import { Button } from 'antd';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowForward } from '@mui/icons-material';
import type { Product } from '../../../types';
import { ProductList } from '../../products/ProductList';
import { useScrollAnimation, fadeInUp, staggerContainer } from '../../../hooks/useScrollAnimation';
import { palette } from '../../../theme';

interface ProductHighlightProps {
  tag: string;
  title: string;
  link: string;
  cta?: string;
  products: Product[];
  isLoading: boolean;
  error: string;
  bgColor?: string;
}

// Loading skeleton for product grid
const ProductSkeleton: React.FC = () => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
      gap: 2.5,
    }}
  >
    {Array.from({ length: 4 }).map((_, i) => (
      <Box
        key={i}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${palette.border}`,
          bgcolor: '#fff',
        }}
      >
        <Box
          sx={{
            height: 180,
            bgcolor: '#F5F5F5',
            animation: 'pulse 1.5s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 0.5 },
              '50%': { opacity: 1 },
            },
          }}
        />
        <Box sx={{ p: 2 }}>
          <Box sx={{ height: 14, bgcolor: '#F0F0F0', borderRadius: 1, mb: 1.5 }} />
          <Box sx={{ height: 12, bgcolor: '#F0F0F0', borderRadius: 1, width: '65%', mb: 1.5 }} />
          <Box sx={{ height: 18, bgcolor: '#F0F0F0', borderRadius: 1, width: '45%' }} />
        </Box>
      </Box>
    ))}
  </Box>
);

const ProductHighlight: React.FC<ProductHighlightProps> = ({
  tag,
  title,
  link,
  cta = 'Xem tất cả',
  products,
  isLoading,
  error,
  bgColor = '#fff',
}) => {
  const { ref, isInView } = useScrollAnimation();

  return (
    <Box component="section" ref={ref} sx={{ py: { xs: 6, md: 8 }, bgcolor: bgColor }}>
      <Container maxWidth="lg">
        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Section Header */}
          <motion.div variants={fadeInUp} transition={{ duration: 0.45 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                mb: { xs: 3, md: 4 },
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: palette.accent,
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                    mb: 0.5,
                  }}
                >
                  {tag}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    color: palette.textPrimary,
                    fontSize: { xs: '1.35rem', md: '1.75rem' },
                  }}
                >
                  {title}
                </Typography>
              </Box>
              <Link to={link} style={{ textDecoration: 'none' }}>
                <Button
                  type="link"
                  icon={<ArrowForward style={{ fontSize: 15 }} />}
                  iconPosition="end"
                  style={{
                    color: palette.accent,
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    padding: '4px 0',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}
                >
                  {cta}
                </Button>
              </Link>
            </Box>
          </motion.div>

          {/* Content */}
          <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
            {error && (
              <Typography sx={{ textAlign: 'center', color: palette.error, py: 3 }}>
                {error}
              </Typography>
            )}
            {isLoading ? <ProductSkeleton /> : <ProductList products={products} />}
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
};

export default memo(ProductHighlight);
