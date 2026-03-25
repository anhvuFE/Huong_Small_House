import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, IconButton, Stack, Chip } from '@mui/material';
import { Button } from 'antd';
import { ArrowForward, ArrowBack, VerifiedUser, LocalShipping, Favorite, CardGiftcard } from '@mui/icons-material';
import { Link } from 'react-router-dom';
const slides = [
  {
    id: 1,
    bgColor: '#1B5E20',
    chipLabel: 'Chính hãng 100%',
    title: 'Thực phẩm chức năng',
    titleHighlight: 'chính hãng',
    subtitle: 'Cam kết 100% hàng chính hãng nhập khẩu trực tiếp từ Mỹ, Úc, Canada. Nâng cao sức khỏe mỗi ngày cùng Hương Small House.',
    cta: 'Khám phá ngay',
    link: '/products',
  },
  {
    id: 2,
    bgColor: '#E65100',
    chipLabel: 'Ưu đãi đặc biệt',
    title: 'Giảm giá lên đến',
    titleHighlight: '30%',
    subtitle: 'Chương trình khuyến mãi dành riêng cho khách hàng mới. Đừng bỏ lỡ cơ hội sở hữu sản phẩm chất lượng với giá tốt nhất.',
    cta: 'Mua sắm ngay',
    link: '/products?featured=true',
  },
  {
    id: 3,
    bgColor: '#0D47A1',
    chipLabel: 'Sức khỏe toàn diện',
    title: 'Chăm sóc sức khỏe',
    titleHighlight: 'toàn diện',
    subtitle: 'Đa dạng sản phẩm từ vitamin, khoáng chất đến collagen, omega-3. Giải pháp dinh dưỡng cho mọi nhu cầu của bạn.',
    cta: 'Xem thêm',
    link: '/categories',
  },
];

const benefits = [
  { icon: <VerifiedUser />, title: 'Hàng chính hãng', desc: 'Cam kết 100% chính hãng' },
  { icon: <LocalShipping />, title: 'Giao hàng nhanh', desc: 'Giao hàng trong 24h' },
  { icon: <Favorite />, title: 'Tư vấn miễn phí', desc: 'Hỗ trợ 24/7' },
  { icon: <CardGiftcard />, title: 'Ưu đãi hấp dẫn', desc: 'Giảm giá lên đến 30%' },
];

export const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const slide = slides[currentSlide];

  return (
    <div>
      {/* Hero Banner */}
      <Box
        sx={{
          bgcolor: slide.bgColor,
          transition: 'background-color 0.6s ease-in-out',
          position: 'relative',
          overflow: 'hidden',
          minHeight: { xs: 360, sm: 420, md: 480 },
        }}
      >
        {/* Decorative circles */}
        <Box
          sx={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.06)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.04)',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              minHeight: { xs: 360, sm: 420, md: 480 },
              py: { xs: 5, md: 6 },
            }}
          >
            <Box sx={{ maxWidth: 600 }}>
              <Chip
                label={slide.chipLabel}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  mb: 2.5,
                  px: 1,
                  height: 32,
                  '& .MuiChip-label': { px: 1.5 },
                }}
              />
              <Typography
                variant="h2"
                sx={{
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: { xs: '1.8rem', sm: '2.4rem', md: '3rem' },
                  lineHeight: 1.2,
                  mb: 2,
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                {slide.title}{' '}
                <Box
                  component="span"
                  sx={{
                    color: '#FFD54F',
                  }}
                >
                  {slide.titleHighlight}
                </Box>
              </Typography>
              <Typography
                sx={{
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: { xs: '0.95rem', md: '1.1rem' },
                  lineHeight: 1.7,
                  mb: 4,
                  maxWidth: 500,
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                {slide.subtitle}
              </Typography>
              <Link to={slide.link}>
                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowForward style={{ fontSize: 18 }} />}
                  style={{
                    backgroundColor: '#7daf18',
                    borderColor: '#7daf18',
                    height: 48,
                    paddingInline: 32,
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderRadius: 8,
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}
                >
                  {slide.cta}
                </Button>
              </Link>
            </Box>
          </Box>
        </Container>

        {/* Navigation arrows */}
        <IconButton
          onClick={goToPrevious}
          sx={{
            position: 'absolute',
            left: { xs: 8, md: 24 },
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'rgba(255,255,255,0.12)',
            color: '#fff',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
          }}
        >
          <ArrowBack />
        </IconButton>
        <IconButton
          onClick={goToNext}
          sx={{
            position: 'absolute',
            right: { xs: 8, md: 24 },
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'rgba(255,255,255,0.12)',
            color: '#fff',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
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
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {slides.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentSlide(index)}
              sx={{
                width: index === currentSlide ? 28 : 10,
                height: 10,
                borderRadius: 5,
                bgcolor: index === currentSlide ? '#fff' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* Benefits Bar */}
      <Box sx={{ bgcolor: '#FAFAFA', borderBottom: '1px solid #E0E0E0' }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: { xs: 2, md: 3 },
              py: { xs: 3, md: 4 },
            }}
          >
            {benefits.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    bgcolor: '#EDF7D5',
                    color: '#7daf18',
                    p: 1.2,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      color: '#1a1a1a',
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: '0.7rem', sm: '0.8rem' },
                      color: '#757575',
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                  >
                    {item.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    </div>
  );
};
