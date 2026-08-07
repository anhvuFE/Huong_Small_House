import React, { memo } from 'react';
import { Box, Typography, Container } from '@mui/material';
import { motion } from 'framer-motion';
import {
  VerifiedUser,
  LocalShipping,
  SupportAgent,
  CardGiftcard,
} from '@mui/icons-material';
import { useScrollAnimation, fadeInUp, staggerContainer } from '../../../hooks/useScrollAnimation';
import { palette } from '../../../theme';

const benefits = [
  { icon: <VerifiedUser sx={{ fontSize: 26 }} />, title: 'Hàng chính hãng', desc: 'Cam kết 100% chính hãng, có tem kiểm định' },
  { icon: <LocalShipping sx={{ fontSize: 26 }} />, title: 'Giao hàng nhanh', desc: 'Miễn phí giao hàng đơn từ 500K' },
  { icon: <SupportAgent sx={{ fontSize: 26 }} />, title: 'Tư vấn chuyên gia', desc: 'Đội ngũ dược sĩ tư vấn 24/7' },
  { icon: <CardGiftcard sx={{ fontSize: 26 }} />, title: 'Ưu đãi hấp dẫn', desc: 'Tích điểm đổi quà, giảm đến 30%' },
];

const TrustSection: React.FC = () => {
  const { ref, isInView } = useScrollAnimation();

  return (
    <Box
      component="section"
      ref={ref}
      sx={{
        bgcolor: '#fff',
        borderBottom: `1px solid ${palette.border}`,
        py: { xs: 3.5, md: 4 },
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
              rowGap: { xs: 3, md: 0 },
            }}
          >
            {benefits.map((item, index) => (
              <Box
                key={index}
                component={motion.div}
                variants={fadeInUp}
                transition={{ duration: 0.4 }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: { xs: 1.5, md: 3 },
                  borderLeft: {
                    xs: index % 2 === 0 ? 'none' : `1px solid ${palette.border}`,
                    md: index % 4 === 0 ? 'none' : `1px solid ${palette.border}`,
                  },
                }}
              >
                <Box sx={{ color: palette.primary, flexShrink: 0, display: 'flex' }}>{item.icon}</Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
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
            ))}
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default memo(TrustSection);
