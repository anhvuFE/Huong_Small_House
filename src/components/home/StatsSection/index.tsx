import React, { memo } from 'react';
import { Box, Typography, Container } from '@mui/material';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useScrollAnimation, fadeInUp, staggerContainer } from '../../../hooks/useScrollAnimation';

interface StatItem {
  value: number;
  suffix: string;
  decimals?: number;
  label: string;
}

const stats: StatItem[] = [
  { value: 500, suffix: '+', label: 'Sản phẩm chính hãng' },
  { value: 10000, suffix: '+', label: 'Khách hàng tin tưởng' },
  { value: 50, suffix: '+', label: 'Thương hiệu quốc tế' },
  { value: 99.5, suffix: '%', decimals: 1, label: 'Khách hàng hài lòng' },
];

const StatsSection: React.FC = () => {
  const { ref, isInView } = useScrollAnimation();

  return (
    <Box component="section" ref={ref} sx={{ bgcolor: '#14532D', color: '#fff' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <motion.div
          variants={staggerContainer(0.12)}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              rowGap: { xs: 5, md: 0 },
            }}
          >
            {stats.map((stat, index) => (
              <Box
                key={index}
                component={motion.div}
                variants={fadeInUp}
                transition={{ duration: 0.45 }}
                sx={{
                  textAlign: 'center',
                  px: { xs: 2, md: 3 },
                  borderLeft: {
                    xs: index % 2 === 0 ? 'none' : '1px solid rgba(255,255,255,0.14)',
                    md: index % 4 === 0 ? 'none' : '1px solid rgba(255,255,255,0.14)',
                  },
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2.2rem', md: '3rem' },
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    color: '#fff',
                  }}
                >
                  {isInView ? (
                    <CountUp
                      end={stat.value}
                      duration={2.5}
                      separator=","
                      decimals={stat.decimals ?? 0}
                      suffix={stat.suffix}
                    />
                  ) : (
                    `0${stat.suffix}`
                  )}
                </Typography>

                {/* Gạch nhấn lime — điểm nhận diện thương hiệu */}
                <Box
                  sx={{
                    width: 32,
                    height: 3,
                    borderRadius: 2,
                    bgcolor: '#7daf18',
                    mx: 'auto',
                    my: 1.5,
                  }}
                />

                <Typography
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: { xs: '0.76rem', md: '0.82rem' },
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    lineHeight: 1.5,
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default memo(StatsSection);
