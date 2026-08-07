import type { FC } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Stack,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Button, ConfigProvider, Empty, Popconfirm } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiMinus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useCartStore } from '../../store/useCartStore';
import { formatCurrency } from '../../utils/format';
import { getProductImage } from '../../utils/productImage';
import { palette } from '../../theme';
import logo from '../../assets/logo.png';

const ITEM_IMAGE_SIZE = 80;

export const ShoppingCart: FC = () => {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, getTotalPrice, clearCart } =
    useCartStore();
  const totalPrice = getTotalPrice();
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={toggleCart}
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: isMobile ? '100%' : 460,
          borderTopLeftRadius: { xs: 0, sm: 16 },
          borderBottomLeftRadius: { xs: 0, sm: 16 },
        },
      }}
    >
      <ConfigProvider theme={{ token: { colorPrimary: palette.accent } }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${palette.border}` }}
        >
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: palette.primarySoft,
                color: palette.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiShoppingBag size={20} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Giỏ hàng ({items.length})
            </Typography>
          </Stack>
          <IconButton onClick={toggleCart} aria-label="Đóng giỏ hàng">
            <FiX />
          </IconButton>
        </Stack>

        {items.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              px: 3,
            }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Typography color="text.secondary">Giỏ hàng của bạn đang trống</Typography>
              }
            >
              <Button type="primary" size="large" onClick={toggleCart}>
                Tiếp tục mua sắm
              </Button>
            </Empty>
          </Box>
        ) : (
          <>
            <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2 }}>
              <Stack spacing={2} divider={<Divider flexItem />}>
                <AnimatePresence initial={false}>
                  {items.map((item) => {
                    const showFallback = imageLoadErrors[item.product.id];
                    return (
                      <motion.div
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Stack direction="row" spacing={1.5}>
                          <Box
                            sx={{
                              width: ITEM_IMAGE_SIZE,
                              height: ITEM_IMAGE_SIZE,
                              borderRadius: 2,
                              overflow: 'hidden',
                              bgcolor: palette.background,
                              flexShrink: 0,
                              border: `1px solid ${palette.border}`,
                            }}
                          >
                            <img
                              src={showFallback ? logo : getProductImage(item.product)}
                              alt={item.product.name}
                              onError={() =>
                                setImageLoadErrors((prev) => ({
                                  ...prev,
                                  [item.product.id]: true,
                                }))
                              }
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: showFallback ? 'contain' : 'cover',
                              }}
                            />
                          </Box>

                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontWeight: 600,
                                color: palette.textPrimary,
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {item.product.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {item.product.brand}
                            </Typography>
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              spacing={1}
                            >
                              <Stack
                                direction="row"
                                alignItems="center"
                                sx={{
                                  border: `1px solid ${palette.border}`,
                                  borderRadius: 999,
                                  overflow: 'hidden',
                                  bgcolor: palette.surface,
                                }}
                              >
                                <IconButton
                                  size="small"
                                  disabled={item.quantity <= 1}
                                  onClick={() =>
                                    updateQuantity(item.product.id, item.quantity - 1)
                                  }
                                  sx={{ borderRadius: 0, width: 30, height: 30 }}
                                  aria-label="Giảm số lượng"
                                >
                                  <FiMinus size={14} />
                                </IconButton>
                                <Typography
                                  sx={{
                                    minWidth: 32,
                                    textAlign: 'center',
                                    fontWeight: 600,
                                    fontSize: 14,
                                    userSelect: 'none',
                                  }}
                                >
                                  {item.quantity}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    updateQuantity(item.product.id, item.quantity + 1)
                                  }
                                  sx={{ borderRadius: 0, width: 30, height: 30 }}
                                  aria-label="Tăng số lượng"
                                >
                                  <FiPlus size={14} />
                                </IconButton>
                              </Stack>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography sx={{ fontWeight: 700, color: palette.primary }}>
                                  {formatCurrency(item.product.price * item.quantity)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatCurrency(item.product.price)}/sp
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>

                          <IconButton
                            size="small"
                            onClick={() => removeItem(item.product.id)}
                            aria-label="Xóa sản phẩm"
                            sx={{ alignSelf: 'flex-start', color: palette.error }}
                          >
                            <FiTrash2 size={16} />
                          </IconButton>
                        </Stack>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </Stack>
            </Box>

            <Box sx={{ borderTop: `1px solid ${palette.border}`, p: 2.5 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2 }}
              >
                <Typography sx={{ fontWeight: 600 }}>Tổng cộng:</Typography>
                <Typography sx={{ fontSize: 22, fontWeight: 800, color: palette.primary }}>
                  {formatCurrency(totalPrice)}
                </Typography>
              </Stack>

              <Stack spacing={1.25}>
                <Link to="/checkout" onClick={toggleCart} style={{ textDecoration: 'none' }}>
                  <Button type="primary" size="large" block>
                    Thanh toán
                  </Button>
                </Link>
                <Button size="large" block onClick={toggleCart}>
                  Tiếp tục mua sắm
                </Button>
                <Popconfirm
                  title="Xóa tất cả sản phẩm?"
                  description="Hành động này không thể hoàn tác."
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                  onConfirm={clearCart}
                >
                  <Button type="text" danger block>
                    Xóa tất cả
                  </Button>
                </Popconfirm>
              </Stack>
            </Box>
          </>
        )}
      </Box>
      </ConfigProvider>
    </Drawer>
  );
};
