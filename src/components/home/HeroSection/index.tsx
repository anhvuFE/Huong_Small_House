import React, { useState, useEffect, useCallback, memo } from 'react';
import { Box, Typography, Container, IconButton, Stack, Chip } from '@mui/material';
import { Button } from 'antd';
import { ArrowForward, ArrowBack } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { palette } from '../../../theme';

interface Slide {
  id: number;
  bgColor: string;
  chipLabel: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  cta: string;
  link: string;
}

const slides: Slide[] = [
  {
    id: 1,
    bgColor: palette.primary,
    chipLabel: 'Chính hãng 100%',
    title: 'Thực phẩm chức năng',
    titleHighlight: 'chính hãng',
    subtitle:
      'Cam kết 100% hàng chính hãng nhập khẩu trực tiếp từ Mỹ, Úc, Canada. Nâng cao sức khỏe mỗi ngày cùng Hương Small House.',
    cta: 'Khám phá ngay',
    link: '/products',
  },
  {
    id: 2,
    bgColor: palette.warning,
    chipLabel: 'Ưu đãi đặc biệt',
    title: 'Giảm giá lên đến',
    titleHighlight: '30%',
    subtitle:
      'Chương trình khuyến mãi dành riêng cho khách hàng mới. Đừng bỏ lỡ cơ hội sở hữu sản phẩm chất lượng với giá tốt nhất.',
    cta: 'Mua sắm ngay',
    link: '/products?featured=true',
  },
  {
    id: 3,
    bgColor: palette.secondary,
    chipLabel: 'Sức khỏe toàn diện',
    title: 'Chăm sóc sức khỏe',
    titleHighlight: 'toàn diện',
    subtitle:
      'Đa dạng sản phẩm từ vitamin, khoáng chất đến collagen, omega-3. Giải pháp dinh dưỡng cho mọi nhu cầu.',
    cta: 'Xem thêm',
    link: '/categories',
  },
];

const textVariants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const slide = slides[currentSlide];

  return (
    <Box
      component="section"
      sx={{
        bgcolor: slide.bgColor,
        transition: 'background-color 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: { xs: 380, sm: 440, md: 500 },
      }}
    >
      {/* Subtle decorative shapes */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 350,
          height: 350,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -80,
          left: '30%',
          width: 250,
          height: 250,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.03)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            minHeight: { xs: 380, sm: 440, md: 500 },
            py: { xs: 6, md: 8 },
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial="enter"
              animate="center"
              exit="exit"
              variants={textVariants}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ maxWidth: 580 }}
            >
              <Chip
                label={slide.chipLabel}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontSize: '0.78rem',
                  mb: 2.5,
                  height: 30,
                  backdropFilter: 'blur(4px)',
                }}
              />

              <Typography
                variant="h2"
                sx={{
                  color: '#fff',
                  fontSize: { xs: '1.9rem', sm: '2.5rem', md: '3.1rem' },
                  lineHeight: 1.15,
                  mb: 2,
                }}
              >
                {slide.title}{' '}
                <Box component="span" sx={{ color: '#FFD54F' }}>
                  {slide.titleHighlight}
                </Box>
              </Typography>

              <Typography
                sx={{
                  color: 'rgba(255,255,255,0.82)',
                  fontSize: { xs: '0.92rem', md: '1.05rem' },
                  lineHeight: 1.75,
                  mb: 4,
                  maxWidth: 480,
                }}
              >
                {slide.subtitle}
              </Typography>

              <Link to={slide.link}>
                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowForward style={{ fontSize: 17 }} />}
                  iconPosition="end"
                  style={{
                    backgroundColor: palette.accent,
                    borderColor: palette.accent,
                    height: 48,
                    paddingInline: 32,
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    borderRadius: 10,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    boxShadow: '0 4px 14px rgba(125,175,24,0.35)',
                  }}
                >
                  {slide.cta}
                </Button>
              </Link>
            </motion.div>
          </AnimatePresence>
        </Box>
      </Container>

      {/* Navigation */}
      <IconButton
        onClick={goToPrevious}
        aria-label="Slide trước"
        sx={{
          position: 'absolute',
          left: { xs: 10, md: 28 },
          top: '50%',
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(255,255,255,0.1)',
          color: '#fff',
          backdropFilter: 'blur(4px)',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
          transition: 'all 0.2s',
        }}
      >
        <ArrowBack />
      </IconButton>
      <IconButton
        onClick={goToNext}
        aria-label="Slide tiếp"
        sx={{
          position: 'absolute',
          right: { xs: 10, md: 28 },
          top: '50%',
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(255,255,255,0.1)',
          color: '#fff',
          backdropFilter: 'blur(4px)',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
          transition: 'all 0.2s',
        }}
      >
        <ArrowForward />
      </IconButton>

      {/* Dots */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        {slides.map((_, index) => (
          <Box
            key={index}
            onClick={() => setCurrentSlide(index)}
            component={motion.div}
            animate={{
              width: index === currentSlide ? 32 : 10,
              backgroundColor: index === currentSlide ? '#fff' : 'rgba(255,255,255,0.4)',
            }}
            transition={{ duration: 0.3 }}
            sx={{
              height: 10,
              borderRadius: 5,
              cursor: 'pointer',
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default memo(HeroSection);
