import React, { memo } from 'react';
import { Box, Typography, Container } from '@mui/material';
import { Button, Input } from 'antd';
import { motion } from 'framer-motion';
import { Send } from '@mui/icons-material';
import { useScrollAnimation, fadeInUp } from '../../../hooks/useScrollAnimation';
import { palette } from '../../../theme';

const CTASection: React.FC = () => {
  const { ref, isInView } = useScrollAnimation();

  return (
    <Box
      component="section"
      ref={ref}
      sx={{
        py: { xs: 7, md: 9 },
        bgcolor: palette.primary,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative shapes */}
      <Box
        sx={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 250,
          height: 250,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -80,
          left: -40,
          width: 300,
          height: 300,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.03)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '40%',
          left: '60%',
          width: 120,
          height: 120,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.02)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          transition={{ duration: 0.55 }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <Send sx={{ color: '#fff', fontSize: 28, transform: 'rotate(-20deg)' }} />
            </Box>

            <Typography
              variant="h3"
              sx={{
                color: '#fff',
                fontSize: { xs: '1.5rem', md: '2rem' },
                mb: 1.5,
              }}
            >
              Nhận ưu đãi độc quyền
            </Typography>

            <Typography
              sx={{
                color: 'rgba(255,255,255,0.75)',
                fontSize: { xs: '0.9rem', md: '1rem' },
                mb: 4,
                lineHeight: 1.65,
              }}
            >
              Đăng ký nhận bản tin để được giảm <strong style={{ color: '#FFD54F' }}>10%</strong>{' '}
              cho đơn hàng đầu tiên và cập nhật chương trình khuyến mãi mới nhất.
            </Typography>

            <Box
              component="form"
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 1.5,
                maxWidth: 460,
                mx: 'auto',
              }}
              onSubmit={(e: React.FormEvent) => e.preventDefault()}
            >
              <Input
                placeholder="Nhập email của bạn"
                size="large"
                style={{
                  flex: 1,
                  borderRadius: 10,
                  height: 48,
                  fontSize: '0.92rem',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  border: 'none',
                }}
              />
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                style={{
                  backgroundColor: palette.accent,
                  borderColor: palette.accent,
                  height: 48,
                  paddingInline: 28,
                  fontWeight: 700,
                  borderRadius: 10,
                  fontSize: '0.92rem',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 14px rgba(125,175,24,0.35)',
                }}
              >
                Đăng ký ngay
              </Button>
            </Box>

            <Typography
              sx={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '0.72rem',
                mt: 2,
              }}
            >
              Chúng tôi tôn trọng quyền riêng tư của bạn. Hủy đăng ký bất cứ lúc nào.
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default memo(CTASection);
