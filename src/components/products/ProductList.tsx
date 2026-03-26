import type { FC } from 'react';
import { memo } from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { Product } from '../../types';
import { ProductCard } from './ProductCard';

interface ProductListProps {
  products: Product[];
  loading?: boolean;
  className?: string;
}

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ProductListComponent: FC<ProductListProps> = ({
  products,
  loading = false,
  className,
}) => {
  if (loading) {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: { xs: 1.5, md: 2.5 },
        }}
        className={className}
      >
        {[...Array(8)].map((_, i) => (
          <Box
            key={i}
            sx={{
              bgcolor: '#fff',
              borderRadius: 3.5,
              border: '1px solid #E8ECF0',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                pt: '75%',
                bgcolor: '#F5F5F5',
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 0.5 },
                  '50%': { opacity: 1 },
                },
              }}
            />
            <Box sx={{ p: 2 }}>
              <Box sx={{ height: 10, bgcolor: '#F0F0F0', borderRadius: 1, mb: 1, width: '40%' }} />
              <Box sx={{ height: 14, bgcolor: '#F0F0F0', borderRadius: 1, mb: 0.8 }} />
              <Box sx={{ height: 14, bgcolor: '#F0F0F0', borderRadius: 1, mb: 1.5, width: '70%' }} />
              <Box sx={{ height: 12, bgcolor: '#F0F0F0', borderRadius: 1, mb: 1.5, width: '55%' }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ height: 18, bgcolor: '#F0F0F0', borderRadius: 1, width: '45%' }} />
                <Box sx={{ height: 34, width: 34, bgcolor: '#F0F0F0', borderRadius: 2 }} />
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  if (products.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography sx={{ color: '#8D99A8', fontSize: '1rem' }}>
          Không có sản phẩm nào
        </Typography>
      </Box>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.06 }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: { xs: 1.5, md: 2.5 },
        }}
        className={className}
      >
        {products.map((product) => (
          <motion.div
            key={product.id}
            variants={cardVariant}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </Box>
    </motion.div>
  );
};

export const ProductList = memo(ProductListComponent);
