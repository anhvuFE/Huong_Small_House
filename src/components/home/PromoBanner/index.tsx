import React, { memo, useState, useEffect } from 'react';
import { Box, Typography, Container, Chip } from '@mui/material';
import { Button } from 'antd';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowForward, AccessTime } from '@mui/icons-material';
import { useScrollAnimation, fadeInUp } from '../../../hooks/useScrollAnimation';
import { palette } from '../../../theme';

// Countdown target: 3 days from now (simulated flash sale)
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
        bgcolor: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(4px)',
        borderRadius: 2,
        px: { xs: 1.5, md: 2 },
        py: { xs: 0.8, md: 1 },
        minWidth: { xs: 48, md: 56 },
      }}
    >
      <Typography
        sx={{
          color: '#fff',
          fontWeight: 800,
          fontSize: { xs: '1.2rem', md: '1.5rem' },
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {String(value).padStart(2, '0')}
      </Typography>
    </Box>
    <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.68rem', mt: 0.5 }}>
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
        bgcolor: palette.warning,
        py: { xs: 4, md: 5 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative circle */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.06)',
          pointerEvents: 'none',
        }}
      />

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
              justifyContent: 'space-between',
              gap: 3,
            }}
          >
            {/* Left: Text */}
            <Box>
              <Chip
                icon={<AccessTime sx={{ fontSize: 16, color: '#fff !important' }} />}
                label="Flash Sale"
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.18)',
                  color: '#fff',
                  mb: 1.5,
                  fontSize: '0.75rem',
                }}
              />
              <Typography
                variant="h4"
                sx={{
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: { xs: '1.4rem', md: '1.8rem' },
                  mb: 0.5,
                }}
              >
                Giảm đến 30% Vitamin & Thực phẩm chức năng
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.92rem' }}>
                Áp dụng cho đơn hàng từ 500.000đ. Số lượng có hạn!
              </Typography>
            </Box>

            {/* Center: Countdown */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, md: 1.5 },
                flexShrink: 0,
              }}
            >
              <TimeBox value={time.days} label="Ngày" />
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem', mt: -2 }}>
                :
              </Typography>
              <TimeBox value={time.hours} label="Giờ" />
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem', mt: -2 }}>
                :
              </Typography>
              <TimeBox value={time.minutes} label="Phút" />
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem', mt: -2 }}>
                :
              </Typography>
              <TimeBox value={time.seconds} label="Giây" />
            </Box>

            {/* Right: CTA */}
            <Box sx={{ flexShrink: 0 }}>
              <Link to="/products?featured=true">
                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowForward style={{ fontSize: 16 }} />}
                  iconPosition="end"
                  style={{
                    backgroundColor: '#fff',
                    borderColor: '#fff',
                    color: palette.warning,
                    height: 46,
                    paddingInline: 28,
                    fontWeight: 700,
                    borderRadius: 10,
                    fontSize: '0.92rem',
                    fontFamily: 'Inter, system-ui, sans-serif',
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
