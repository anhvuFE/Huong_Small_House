import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Box, Typography, Container, Paper, Breadcrumbs } from '@mui/material';
import { Home, NavigateNext, CheckCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { fadeInUp } from '../hooks/useScrollAnimation';
import { policies, type Policy } from '../data/policyContent';

const palette = {
  accent: '#7daf18',
  primary: '#14532D',
  textPrimary: '#1A2332',
  textSecondary: '#5A6B7F',
  textMuted: '#8D99A8',
  border: '#E8ECF0',
  background: '#FAFBFC',
};

export const PolicyPage: React.FC = () => {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\//, '').split('/')[0] as Policy['slug'];
  const policy = policies[slug];

  if (!policy) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Không tìm thấy trang
        </Typography>
        <Link to="/" style={{ color: palette.accent }}>
          Về trang chủ
        </Link>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: palette.background, minHeight: '70vh', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="md">
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
          <Link
            to="/"
            style={{ display: 'flex', alignItems: 'center', gap: 4, color: palette.textSecondary, textDecoration: 'none' }}
          >
            <Home sx={{ fontSize: 16 }} /> Trang chủ
          </Link>
          <Typography sx={{ color: palette.textPrimary, fontSize: '0.88rem' }}>{policy.title}</Typography>
        </Breadcrumbs>

        <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ duration: 0.4 }}>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, border: `1px solid ${palette.border}`, borderRadius: 4 }}>
            <Typography
              component="p"
              sx={{ color: palette.accent, fontWeight: 700, fontSize: '0.78rem', letterSpacing: 2, textTransform: 'uppercase', mb: 1 }}
            >
              Chính sách
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.7rem', md: '2.2rem' }, color: palette.textPrimary }}>
              {policy.title}
            </Typography>
            <Typography sx={{ color: palette.textMuted, fontSize: '0.82rem', mt: 1 }}>
              Cập nhật: {policy.updated}
            </Typography>

            <Typography sx={{ color: palette.textSecondary, fontSize: '1rem', lineHeight: 1.8, mt: 3 }}>
              {policy.intro}
            </Typography>

            {policy.sections.map((section) => (
              <Box key={section.heading} sx={{ mt: 4 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, fontSize: '1.05rem', color: palette.textPrimary, mb: 1.5 }}
                >
                  {section.heading}
                </Typography>

                {section.paragraphs?.map((p, i) => (
                  <Typography
                    key={i}
                    sx={{ color: palette.textSecondary, fontSize: '0.95rem', lineHeight: 1.8, mb: 1.5 }}
                  >
                    {p}
                  </Typography>
                ))}

                {section.bullets && (
                  <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                    {section.bullets.map((b, i) => (
                      <Box component="li" key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                        <CheckCircle sx={{ fontSize: 18, color: palette.accent, mt: 0.3, flexShrink: 0 }} />
                        <Typography sx={{ color: palette.textSecondary, fontSize: '0.95rem', lineHeight: 1.7 }}>
                          {b}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ))}

            <Box sx={{ mt: 5, pt: 3, borderTop: `1px solid ${palette.border}` }}>
              <Typography sx={{ color: palette.textMuted, fontSize: '0.88rem' }}>
                Cần hỗ trợ thêm? Liên hệ{' '}
                <Link to="/contact" style={{ color: palette.accent, fontWeight: 600 }}>
                  bộ phận CSKH
                </Link>{' '}
                hoặc hotline 0336 064 040.
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default PolicyPage;
