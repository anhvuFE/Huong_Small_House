import React, { memo } from 'react';
import { Box, Typography, Container, Paper, Avatar, Rating } from '@mui/material';
import { Divider } from 'antd';
import { motion } from 'framer-motion';
import { FormatQuote } from '@mui/icons-material';
import { useScrollAnimation, fadeInUp, staggerContainer } from '../../../hooks/useScrollAnimation';
import { palette } from '../../../theme';

interface Testimonial {
  name: string;
  initials: string;
  rating: number;
  text: string;
  product: string;
  date: string;
  avatarColor: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Nguyễn Thu Hương',
    initials: 'H',
    rating: 5,
    text: 'Sản phẩm chất lượng, giao hàng nhanh chóng. Tôi đã mua vitamin D3 và Omega-3, rất hài lòng với kết quả sau 1 tháng sử dụng. Sẽ tiếp tục ủng hộ!',
    product: 'Vitamin D3 + Omega-3',
    date: '2 tuần trước',
    avatarColor: palette.primary,
  },
  {
    name: 'Trần Minh Đức',
    initials: 'Đ',
    rating: 5,
    text: 'Đội ngũ tư vấn rất nhiệt tình và chuyên nghiệp. Được tư vấn đúng sản phẩm phù hợp, hiệu quả thấy rõ sau 2 tuần. Đặc biệt giá cả rất cạnh tranh.',
    product: 'Collagen Peptide',
    date: '1 tháng trước',
    avatarColor: palette.secondary,
  },
  {
    name: 'Lê Thị Mai Anh',
    initials: 'A',
    rating: 5,
    text: 'Hàng chính hãng có tem kiểm định rõ ràng. Gia đình tôi đã chuyển sang mua hàng ở đây thường xuyên. Ship nhanh, đóng gói cẩn thận.',
    product: 'Multivitamin tổng hợp',
    date: '3 tuần trước',
    avatarColor: palette.warning,
  },
];

const TestimonialSection: React.FC = () => {
  const { ref, isInView } = useScrollAnimation();

  return (
    <Box component="section" ref={ref} sx={{ py: { xs: 6, md: 8 }, bgcolor: palette.background }}>
      <Container maxWidth="lg">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}>
            <Typography
              sx={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: palette.accent,
                textTransform: 'uppercase',
                letterSpacing: 2,
                mb: 1,
              }}
            >
              Đánh giá từ khách hàng
            </Typography>
            <Typography
              variant="h3"
              sx={{
                color: palette.textPrimary,
                fontSize: { xs: '1.5rem', md: '2rem' },
                mb: 1,
              }}
            >
              Khách hàng nói gì về chúng tôi
            </Typography>
            <Typography sx={{ color: palette.textSecondary, fontSize: '0.95rem' }}>
              Hơn 10.000 khách hàng đã tin tưởng sử dụng sản phẩm
            </Typography>
          </Box>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={staggerContainer(0.12)}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 3,
            }}
          >
            {testimonials.map((t, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                transition={{ duration: 0.45 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 3.5 },
                    border: `1px solid ${palette.border}`,
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                      borderColor: palette.primarySoft,
                    },
                  }}
                >
                  <FormatQuote
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      fontSize: 36,
                      color: palette.primarySoft,
                    }}
                  />

                  <Rating
                    value={t.rating}
                    readOnly
                    size="small"
                    sx={{ mb: 2, color: '#FFB300' }}
                  />

                  <Typography
                    sx={{
                      color: palette.textSecondary,
                      fontSize: '0.9rem',
                      lineHeight: 1.75,
                      mb: 'auto',
                      pb: 2.5,
                    }}
                  >
                    &ldquo;{t.text}&rdquo;
                  </Typography>

                  <Divider style={{ margin: '0 0 16px' }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        bgcolor: palette.primarySoft,
                        color: palette.primary,
                        width: 42,
                        height: 42,
                        fontSize: '0.95rem',
                        fontWeight: 700,
                      }}
                    >
                      {t.initials}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.88rem',
                          color: palette.textPrimary,
                        }}
                      >
                        {t.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.73rem', color: palette.textMuted }}>
                        Đã mua: {t.product} &middot; {t.date}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            ))}
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default memo(TestimonialSection);
