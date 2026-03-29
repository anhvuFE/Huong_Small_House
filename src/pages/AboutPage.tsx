import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Paper,
  Avatar,
  Breadcrumbs,
  Divider,
} from '@mui/material';
import { Button } from 'antd';
import {
  Home,
  NavigateNext,
  ArrowForward,
  CheckCircle,
  Shield,
  Favorite,
  EmojiEvents,
  Visibility,
  TrackChanges,
  Inventory2,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../hooks/useScrollAnimation';
import logo from '../assets/logo.png';

const palette = {
  accent: '#7daf18',
  accentLight: '#EDF7D5',
  primary: '#2E7D32',
  primarySoft: '#E8F5E9',
  secondary: '#1565C0',
  secondarySoft: '#E3F2FD',
  textPrimary: '#1A2332',
  textSecondary: '#5A6B7F',
  textMuted: '#8D99A8',
  border: '#E8ECF0',
  background: '#FAFBFC',
};

const coreValues = [
  { icon: <CheckCircle sx={{ fontSize: 28 }} />, title: 'Chính hãng', desc: '100% sản phẩm nhập khẩu chính hãng, có tem kiểm định', color: '#2E7D32', bg: '#E8F5E9' },
  { icon: <Shield sx={{ fontSize: 28 }} />, title: 'Uy tín', desc: 'Cam kết bảo hành, đổi trả theo chính sách chính hãng', color: '#1565C0', bg: '#E3F2FD' },
  { icon: <Favorite sx={{ fontSize: 28 }} />, title: 'Tận tâm', desc: 'Tư vấn nhiệt tình bởi đội ngũ dược sĩ, hỗ trợ 24/7', color: '#C62828', bg: '#FFEBEE' },
  { icon: <EmojiEvents sx={{ fontSize: 28 }} />, title: 'Chuyên nghiệp', desc: 'Đội ngũ chuyên môn cao, quy trình chuẩn quốc tế', color: '#E65100', bg: '#FFF3E0' },
];

const teamMembers = [
  { name: 'Vũ Quỳnh Hương', role: 'Founder & CEO', desc: 'Dược sĩ với 10 năm kinh nghiệm trong ngành dược phẩm', color: '#2E7D32' },
  { name: 'Phạm Thế Vượng', role: 'Co-Founder & CTO', desc: 'Chuyên gia công nghệ và phát triển hệ thống', color: '#1565C0' },
  { name: 'Vũ Xuân Anh', role: 'Co-Founder & COO', desc: 'Chuyên gia vận hành và quản lý chuỗi cung ứng', color: '#E65100' },
];

const commitments = [
  {
    icon: <CheckCircle sx={{ fontSize: 24 }} />,
    title: 'Kiểm định chất lượng',
    desc: 'Mỗi sản phẩm đều được kiểm tra nguồn gốc, hạn sử dụng và tem chính hãng trước khi đến tay khách hàng.',
  },
  {
    icon: <Shield sx={{ fontSize: 24 }} />,
    title: 'Đổi trả miễn phí',
    desc: 'Hoàn tiền hoặc đổi sản phẩm trong 7 ngày nếu hàng không đúng mô tả hoặc bị lỗi.',
  },
  {
    icon: <Favorite sx={{ fontSize: 24 }} />,
    title: 'Tư vấn bởi dược sĩ',
    desc: 'Đội ngũ dược sĩ có chuyên môn sẵn sàng tư vấn sản phẩm phù hợp với tình trạng sức khỏe của bạn.',
  },
  {
    icon: <Inventory2 sx={{ fontSize: 24 }} />,
    title: 'Nguồn hàng minh bạch',
    desc: 'Nhập khẩu trực tiếp từ nhà sản xuất tại Mỹ, Úc, Canada — không qua trung gian.',
  },
];

export const AboutPage: React.FC = () => {
  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh' }}>
      {/* Hero */}
      <Box sx={{ bgcolor: palette.primary, py: { xs: 5, md: 7 }, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -50, left: '40%', width: 180, height: 180, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Breadcrumbs separator={<NavigateNext sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />} sx={{ mb: 3 }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Home sx={{ fontSize: 16, color: 'rgba(255,255,255,0.6)' }} />
              <Typography sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>Trang chủ</Typography>
            </Link>
            <Typography sx={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>Giới thiệu</Typography>
          </Breadcrumbs>

          <Box sx={{ maxWidth: 600 }}>
            <Typography variant="h3" sx={{ color: '#fff', fontSize: { xs: '1.6rem', md: '2.4rem' }, mb: 2 }}>
              Về Hương Small House
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: { xs: '0.92rem', md: '1.05rem' }, lineHeight: 1.7 }}>
              Hơn 10 năm đồng hành cùng sức khỏe người Việt với các sản phẩm thực phẩm chức năng chính hãng từ các thương hiệu uy tín trên thế giới.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Mission & Vision */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: palette.background }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 0, borderRadius: 4, overflow: 'hidden', border: `1px solid ${palette.border}` }}>
            {/* Mission */}
            <Box
              sx={{
                p: { xs: 4, md: 5 },
                bgcolor: palette.primary,
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrackChanges sx={{ fontSize: 22 }} />
                  </Box>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.6)' }}>
                    Sứ mệnh
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: { xs: '1.3rem', md: '1.6rem' }, lineHeight: 1.3, mb: 2 }}>
                  Nâng cao sức khỏe người Việt
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', lineHeight: 1.8 }}>
                  Mang đến sản phẩm thực phẩm chức năng chất lượng cao, chính hãng 100% với giá cả hợp lý nhất. Tư vấn chuyên nghiệp, tận tâm để mỗi khách hàng tìm được sản phẩm phù hợp nhất với nhu cầu sức khỏe.
                </Typography>
              </Box>
            </Box>

            {/* Vision */}
            <Box
              sx={{
                p: { xs: 4, md: 5 },
                bgcolor: '#fff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: palette.secondarySoft, color: palette.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Visibility sx={{ fontSize: 22 }} />
                </Box>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: palette.textMuted }}>
                  Tầm nhìn
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: '1.3rem', md: '1.6rem' }, lineHeight: 1.3, mb: 2, color: palette.textPrimary }}>
                Đơn vị phân phối hàng đầu
              </Typography>
              <Typography sx={{ color: palette.textSecondary, fontSize: '0.9rem', lineHeight: 1.8 }}>
                Trở thành đơn vị phân phối thực phẩm chức năng hàng đầu Việt Nam, được khách hàng tin tưởng lựa chọn đầu tiên. Xây dựng hệ sinh thái sức khỏe toàn diện với dịch vụ tư vấn chuyên sâu.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Core Values */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: palette.accent, textTransform: 'uppercase', letterSpacing: 2, mb: 1 }}>
              Giá trị cốt lõi
            </Typography>
            <Typography variant="h4" sx={{ color: palette.textPrimary, fontSize: { xs: '1.4rem', md: '1.8rem' } }}>
              Nền tảng xây dựng niềm tin
            </Typography>
          </Box>

          <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="visible">
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 2, md: 3 } }}>
              {coreValues.map((v, i) => (
                <motion.div key={i} variants={fadeInUp} transition={{ duration: 0.4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2.5, md: 3 },
                      border: `1px solid ${palette.border}`,
                      borderRadius: 3,
                      textAlign: 'center',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': { borderColor: v.color, boxShadow: `0 4px 20px rgba(0,0,0,0.06)` },
                    }}
                  >
                    <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: v.bg, color: v.color, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                      {v.icon}
                    </Box>
                    <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: palette.textPrimary, mb: 0.8 }}>{v.title}</Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: palette.textMuted, lineHeight: 1.6 }}>{v.desc}</Typography>
                  </Paper>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Team */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: palette.accent, textTransform: 'uppercase', letterSpacing: 2, mb: 1 }}>
              Đội ngũ
            </Typography>
            <Typography variant="h4" sx={{ color: palette.textPrimary, fontSize: { xs: '1.4rem', md: '1.8rem' }, mb: 1 }}>
              Đội ngũ của chúng tôi
            </Typography>
            <Typography sx={{ color: palette.textSecondary, fontSize: '0.92rem' }}>
              Đội ngũ chuyên gia giàu kinh nghiệm, luôn sẵn sàng hỗ trợ
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3, maxWidth: 800, mx: 'auto' }}>
            {teamMembers.map((m, i) => (
              <Paper
                key={i}
                elevation={0}
                sx={{
                  p: 3,
                  border: `1px solid ${palette.border}`,
                  borderRadius: 3,
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': { boxShadow: '0 8px 25px rgba(0,0,0,0.06)', borderColor: m.color },
                }}
              >
                <Avatar
                  src={logo}
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: palette.background,
                    border: `3px solid ${palette.border}`,
                    '& img': { objectFit: 'contain', p: 0.5 },
                  }}
                />
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: palette.textPrimary, mb: 0.3 }}>
                  {m.name}
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: m.color, mb: 1.5 }}>
                  {m.role}
                </Typography>
                <Divider sx={{ mb: 1.5 }} />
                <Typography sx={{ fontSize: '0.82rem', color: palette.textMuted, lineHeight: 1.6 }}>
                  {m.desc}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Commitments */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: palette.primary, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 250, height: 250, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 2, mb: 1 }}>
              Cam kết
            </Typography>
            <Typography variant="h4" sx={{ color: '#fff', fontSize: { xs: '1.4rem', md: '1.8rem' } }}>
              Cam kết của chúng tôi với bạn
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2.5 }}>
            {commitments.map((c, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  gap: 2,
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.11)' },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFD54F',
                    flexShrink: 0,
                  }}
                >
                  {c.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff', mb: 0.5 }}>
                    {c.title}
                  </Typography>
                  <Typography sx={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65 }}>
                    {c.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: palette.background }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ color: palette.textPrimary, fontSize: { xs: '1.3rem', md: '1.7rem' }, mb: 1.5 }}>
            Bắt đầu hành trình sức khỏe
          </Typography>
          <Typography sx={{ color: palette.textSecondary, fontSize: '0.92rem', mb: 4, lineHeight: 1.7 }}>
            Hãy để Hương Small House đồng hành cùng bạn trong việc chăm sóc sức khỏe gia đình
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Link to="/products">
              <Button
                type="primary"
                size="large"
                icon={<ArrowForward style={{ fontSize: 16 }} />}
                iconPosition="end"
                style={{
                  backgroundColor: palette.accent,
                  borderColor: palette.accent,
                  height: 46,
                  paddingInline: 28,
                  fontWeight: 600,
                  borderRadius: 10,
                  fontSize: '0.9rem',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                Khám phá sản phẩm
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                size="large"
                style={{
                  height: 46,
                  paddingInline: 28,
                  fontWeight: 600,
                  borderRadius: 10,
                  fontSize: '0.9rem',
                  borderColor: palette.accent,
                  color: palette.accent,
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                Liên hệ tư vấn
              </Button>
            </Link>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
