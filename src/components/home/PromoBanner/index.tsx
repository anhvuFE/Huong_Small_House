import React, { memo, useState, useEffect } from 'react';
import { Box, Typography, Container } from '@mui/material';
import { Button } from 'antd';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowForward, LocalOffer } from '@mui/icons-material';
import { useScrollAnimation, fadeInUp } from '../../../hooks/useScrollAnimation';
import { palette } from '../../../theme';

function getTimeRemaining() {
  const end = new Date();
  end.setDate(end.getDate() + 3);
  end.setHours(23, 59, 59, 0);
  const diff = end.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const TimeBox: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <Box sx={{ textAlign: 'center' }}>
    <Box
      sx={{
        bgcolor: '#fff',
        borderRadius: '50%',
        width: { xs: 50, md: 58 },
        height: { xs: 50, md: 58 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <Typography
        sx={{
          color: palette.primary,
          fontWeight: 800,
          fontSize: { xs: '1.15rem', md: '1.35rem' },
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}
      >
        {String(value).padStart(2, '0')}
      </Typography>
    </Box>
    <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', mt: 0.6, fontWeight: 500 }}>
      {label}
    </Typography>
  </Box>
);

const PromoBanner: React.FC = () => {
  const { ref, isInView } = useScrollAnimation();
  const [time, setTime] = useState(getTimeRemaining);

  useEffect(() => {
    const timer = setInterval(() => setTime(getTimeRemaining()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box
      component="section"
      ref={ref}
      sx={{
        bgcolor: palette.primary,
        py: { xs: 4, md: 0 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              minHeight: { md: 100 },
              gap: { xs: 3, md: 4 },
            }}
          >
            {/* Left: Icon + Text */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.12)',
                  flexShrink: 0,
                }}
              >
                <LocalOffer sx={{ color: '#FFD54F', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    lineHeight: 1.3,
                  }}
                >
                  Flash Sale — Giảm đến <Box component="span" sx={{ color: '#FFD54F' }}>30%</Box>
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.84rem', mt: 0.3 }}>
                  Vitamin & Thực phẩm chức năng · Đơn từ 500K · Số lượng có hạn
                </Typography>
              </Box>
            </Box>

            {/* Center: Countdown */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                flexShrink: 0,
              }}
            >
              <TimeBox value={time.days} label="Ngày" />
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: '1.1rem', mt: -2 }}>:</Typography>
              <TimeBox value={time.hours} label="Giờ" />
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: '1.1rem', mt: -2 }}>:</Typography>
              <TimeBox value={time.minutes} label="Phút" />
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: '1.1rem', mt: -2 }}>:</Typography>
              <TimeBox value={time.seconds} label="Giây" />
            </Box>

            {/* Right: CTA */}
            <Box sx={{ flexShrink: 0 }}>
              <Link to="/products?featured=true">
                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowForward style={{ fontSize: 15 }} />}
                  iconPosition="end"
                  style={{
                    backgroundColor: palette.accent,
                    borderColor: palette.accent,
                    color: '#fff',
                    height: 44,
                    paddingInline: 24,
                    fontWeight: 700,
                    borderRadius: 10,
                    fontSize: '0.88rem',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    boxShadow: '0 4px 14px rgba(125,175,24,0.3)',
                  }}
                >
                  Mua ngay
                </Button>
              </Link>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default memo(PromoBanner);
