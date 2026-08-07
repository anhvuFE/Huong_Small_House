import React, { memo } from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { Science, EmojiEvents, Groups, WorkspacePremium } from '@mui/icons-material';
import { useScrollAnimation, fadeInUp, staggerContainer } from '../../../hooks/useScrollAnimation';
import { palette } from '../../../theme';

interface StatItem {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  decimals?: number;
  label: string;
  color: string;
  bg: string;
}

const stats: StatItem[] = [
  {
    icon: <Science sx={{ fontSize: 30 }} />,
    value: 500,
    suffix: '+',
    label: 'Sản phẩm chính hãng',
    color: palette.secondary,
    bg: palette.secondarySoft,
  },
  {
    icon: <Groups sx={{ fontSize: 30 }} />,
    value: 10000,
    suffix: '+',
    label: 'Khách hàng tin tưởng',
    color: palette.primary,
    bg: palette.primarySoft,
  },
  {
    icon: <EmojiEvents sx={{ fontSize: 30 }} />,
    value: 50,
    suffix: '+',
    label: 'Thương hiệu quốc tế',
    color: palette.warning,
    bg: palette.warningSoft,
  },
  {
    icon: <WorkspacePremium sx={{ fontSize: 30 }} />,
    value: 99.5,
    suffix: '%',
    decimals: 1,
    label: 'Khách hàng hài lòng',
    color: '#7B1FA2',
    bg: '#F3E5F5',
  },
];

const StatsSection: React.FC = () => {
  const { ref, isInView } = useScrollAnimation();

  return (
    <Box
      component="section"
      ref={ref}
      sx={{ py: { xs: 5, md: 7 }, bgcolor: palette.background }}
    >
      <Container maxWidth="lg">
        <motion.div
          variants={staggerContainer(0.1)}
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
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                transition={{ duration: 0.45 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, md: 3.5 },
                    textAlign: 'center',
                    border: `1px solid ${palette.border}`,
                    transition: 'all 0.3s ease',
                    cursor: 'default',
                    '&:hover': {
                      borderColor: stat.color,
                      boxShadow: `0 4px 20px ${stat.color}20`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: stat.bg,
                      color: stat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1.5,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '1.6rem', md: '2rem' },
                      color: palette.textPrimary,
                      lineHeight: 1.2,
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
                  <Typography
                    sx={{
                      color: palette.textSecondary,
                      fontSize: { xs: '0.78rem', md: '0.88rem' },
                      mt: 0.5,
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Paper>
              </motion.div>
            ))}
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default memo(StatsSection);
