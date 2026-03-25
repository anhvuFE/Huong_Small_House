import React, { memo } from 'react';
import { Box, Typography, Container } from '@mui/material';
import { motion } from 'framer-motion';
import {
  VerifiedUser,
  LocalShipping,
  Favorite,
  CardGiftcard,
} from '@mui/icons-material';
import { useScrollAnimation, fadeInUp, staggerContainer } from '../../../hooks/useScrollAnimation';
import { palette } from '../../../theme';

const benefits = [
  {
    icon: <VerifiedUser sx={{ fontSize: 28 }} />,
    title: 'Hàng chính hãng',
    desc: 'Cam kết 100% chính hãng, có tem kiểm định',
    color: palette.primary,
    bg: palette.primarySoft,
  },
  {
    icon: <LocalShipping sx={{ fontSize: 28 }} />,
    title: 'Giao hàng nhanh',
    desc: 'Miễn phí giao hàng đơn từ 500K',
    color: palette.secondary,
    bg: palette.secondarySoft,
  },
  {
    icon: <Favorite sx={{ fontSize: 28 }} />,
    title: 'Tư vấn chuyên gia',
    desc: 'Đội ngũ dược sĩ tư vấn 24/7',
    color: '#C62828',
    bg: '#FFEBEE',
  },
  {
    icon: <CardGiftcard sx={{ fontSize: 28 }} />,
    title: 'Ưu đãi hấp dẫn',
    desc: 'Tích điểm đổi quà, giảm đến 30%',
    color: palette.warning,
    bg: palette.warningSoft,
  },
];

const TrustSection: React.FC = () => {
  const { ref, isInView } = useScrollAnimation();

  return (
    <Box
      component="section"
      ref={ref}
      sx={{
        bgcolor: palette.background,
        borderBottom: `1px solid ${palette.border}`,
        py: { xs: 3.5, md: 4.5 },
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: { xs: 2, md: 3 },
            }}
          >
            {benefits.map((item, index) => (
              <motion.div key={index} variants={fadeInUp} transition={{ duration: 0.4 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: { xs: 1.5, md: 2 },
                    borderRadius: 3,
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      bgcolor: '#fff',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: item.bg,
                      color: item.color,
                      p: 1.2,
                      borderRadius: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: '0.82rem', sm: '0.9rem' },
                        color: palette.textPrimary,
                        lineHeight: 1.3,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: { xs: '0.7rem', sm: '0.78rem' },
                        color: palette.textMuted,
                        lineHeight: 1.4,
                        mt: 0.25,
                      }}
                    >
                      {item.desc}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default memo(TrustSection);
