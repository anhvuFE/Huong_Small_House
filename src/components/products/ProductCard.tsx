import type { FC, MouseEvent } from 'react';
import { memo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Rating, IconButton, Chip } from '@mui/material';
import { ShoppingCartOutlined, FiberNew, LocalFireDepartment } from '@mui/icons-material';
import { motion } from 'framer-motion';
import type { Product } from '../../types';
import { formatCurrency, calculateDiscount } from '../../utils/format';
import { useCartStore } from '../../store/useCartStore';
import logo from '../../assets/logo.png';

const palette = {
  accent: '#7daf18',
  accentDark: '#6B9E12',
  textPrimary: '#1A2332',
  textSecondary: '#5A6B7F',
  textMuted: '#8D99A8',
  border: '#E8ECF0',
  background: '#FAFBFC',
};

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCardComponent: FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCartStore();
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      addItem(product, 1);
    },
    [addItem, product]
  );

  const discountPercent = product.originalPrice
    ? calculateDiscount(product.price, product.originalPrice)
    : 0;

  const hasValidImage =
    product.thumbnail &&
    !product.thumbnail.includes('placeholder') &&
    !product.thumbnail.includes('placehold') &&
    !product.thumbnail.includes('/images/products/') &&
    product.thumbnail.startsWith('http') &&
    !imageError;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Link to={`/products/${product.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
        <Box
          sx={{
            bgcolor: '#fff',
            borderRadius: 3.5,
            border: `1px solid ${palette.border}`,
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            '&:hover': {
              boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
              borderColor: 'rgba(125,175,24,0.3)',
            },
            '&:hover .product-image': {
              transform: 'scale(1.05)',
            },
            '&:hover .cart-btn': {
              bgcolor: palette.accent,
              color: '#fff',
              borderColor: palette.accent,
            },
          }}
        >
          {/* Image */}
          <Box
            sx={{
              position: 'relative',
              pt: '75%', // 4:3 aspect ratio
              bgcolor: palette.background,
              overflow: 'hidden',
            }}
          >
            <Box
              component="img"
              className="product-image"
              src={hasValidImage ? product.thumbnail : logo}
              alt={product.name}
              onError={() => setImageError(true)}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: hasValidImage ? 'cover' : 'contain',
                transition: 'transform 0.35s ease',
              }}
            />

            {/* Badges */}
            <Box sx={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 0.7 }}>
              {discountPercent > 0 && (
                <Chip
                  label={`-${discountPercent}%`}
                  size="small"
                  sx={{
                    bgcolor: '#C62828',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    height: 24,
                    borderRadius: 1.5,
                  }}
                />
              )}
            </Box>

            <Box sx={{ position: 'absolute', top: 10, right: 10, display: 'flex', flexDirection: 'column', gap: 0.7 }}>
              {product.isNew && (
                <Chip
                  icon={<FiberNew sx={{ fontSize: 14, color: '#fff !important' }} />}
                  label="Mới"
                  size="small"
                  sx={{
                    bgcolor: '#1565C0',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 24,
                    borderRadius: 1.5,
                    '& .MuiChip-icon': { ml: 0.5 },
                  }}
                />
              )}
              {product.isBestSeller && (
                <Chip
                  icon={<LocalFireDepartment sx={{ fontSize: 14, color: '#fff !important' }} />}
                  label="Bán chạy"
                  size="small"
                  sx={{
                    bgcolor: '#E65100',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 24,
                    borderRadius: 1.5,
                    '& .MuiChip-icon': { ml: 0.5 },
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Content */}
          <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Brand */}
            <Typography
              sx={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: palette.accent,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                mb: 0.5,
              }}
            >
              {product.brand}
            </Typography>

            {/* Name */}
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: '0.9rem',
                color: palette.textPrimary,
                lineHeight: 1.4,
                mb: 1,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: '2.52em',
                transition: 'color 0.2s',
                '&:hover': { color: palette.accent },
              }}
            >
              {product.name}
            </Typography>

            {/* Rating */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mb: 1.5 }}>
              <Rating
                value={product.rating}
                readOnly
                precision={0.5}
                size="small"
                sx={{
                  fontSize: '0.95rem',
                  color: '#FFB300',
                }}
              />
              <Typography sx={{ fontSize: '0.73rem', color: palette.textMuted }}>
                ({product.reviewCount})
              </Typography>
            </Box>

            {/* Price + Cart — pushed to bottom */}
            <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    color: palette.accent,
                    lineHeight: 1.2,
                  }}
                >
                  {formatCurrency(product.price)}
                </Typography>
                {product.originalPrice && product.originalPrice > product.price && (
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      color: palette.textMuted,
                      textDecoration: 'line-through',
                      mt: 0.2,
                    }}
                  >
                    {formatCurrency(product.originalPrice)}
                  </Typography>
                )}
              </Box>

              <IconButton
                className="cart-btn"
                onClick={handleAddToCart}
                aria-label="Thêm vào giỏ hàng"
                sx={{
                  border: `1.5px solid ${palette.border}`,
                  borderRadius: 2.5,
                  p: 0.9,
                  color: palette.textSecondary,
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    bgcolor: palette.accent,
                    color: '#fff',
                    borderColor: palette.accent,
                    boxShadow: '0 4px 12px rgba(125,175,24,0.3)',
                  },
                  '&:active': {
                    transform: 'scale(0.93)',
                  },
                }}
              >
                <ShoppingCartOutlined sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Link>
    </motion.div>
  );
};

export const ProductCard = memo(ProductCardComponent);
