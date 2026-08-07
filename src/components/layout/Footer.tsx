import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Container, IconButton, Divider } from '@mui/material';
import {
  Phone,
  Email,
  LocationOn,
  AccessTime,
  Facebook,
  Instagram,
  YouTube,
  ArrowForward,
} from '@mui/icons-material';
import { Input, Button } from 'antd';
import { motion } from 'framer-motion';
import { useScrollAnimation, fadeInUp, staggerContainer } from '../../hooks/useScrollAnimation';
import logo from '../../assets/logo.png';
import { palette } from '../../theme';


const quickLinks = [
  { label: 'Giới thiệu', href: '/about' },
  { label: 'Sản phẩm', href: '/products' },
  { label: 'Danh mục', href: '/categories' },
  { label: 'Blog', href: '/blog' },
  { label: 'Liên hệ', href: '/contact' },
];

const policyLinks = [
  { label: 'Chính sách bảo mật', href: '/privacy' },
  { label: 'Điều khoản sử dụng', href: '/terms' },
  { label: 'Chính sách vận chuyển', href: '/shipping' },
  { label: 'Chính sách đổi trả', href: '/return' },
];

const contactInfo = [
  {
    icon: <LocationOn sx={{ fontSize: 18 }} />,
    text: '120 Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
    href: undefined,
  },
  {
    icon: <Phone sx={{ fontSize: 18 }} />,
    text: '0336 064 040',
    href: 'tel:0336064040',
  },
  {
    icon: <Email sx={{ fontSize: 18 }} />,
    text: 'vuquynhhuong171298@gmail.com',
    href: 'mailto:vuquynhhuong171298@gmail.com',
  },
  {
    icon: <AccessTime sx={{ fontSize: 18 }} />,
    text: '8:00 - 22:00 (Tất cả các ngày)',
    href: undefined,
  },
];

const socials = [
  { icon: <Facebook sx={{ fontSize: 20 }} />, href: 'https://facebook.com', label: 'Facebook' },
  { icon: <Instagram sx={{ fontSize: 20 }} />, href: 'https://instagram.com', label: 'Instagram' },
  { icon: <YouTube sx={{ fontSize: 20 }} />, href: 'https://youtube.com', label: 'YouTube' },
];

const paymentMethods = ['VISA', 'MASTERCARD', 'VNPAY', 'COD'];

const LinkItem: React.FC<{ label: string; href: string }> = ({ label, href }) => (
  <li>
    <Link to={href} style={{ textDecoration: 'none' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.8,
          py: 0.5,
          color: palette.footerText,
          fontSize: '0.88rem',
          transition: 'all 0.2s',
          '&:hover': {
            color: palette.accent,
            pl: 0.5,
          },
        }}
      >
        <ArrowForward sx={{ fontSize: 13, opacity: 0 , transition: 'opacity 0.2s' }} className="footer-arrow" />
        <span>{label}</span>
      </Box>
    </Link>
    <style>{`.footer-arrow { opacity: 0; } *:hover > .footer-arrow { opacity: 1; }`}</style>
  </li>
);

export const Footer: React.FC = () => {
  const { ref, isInView } = useScrollAnimation({ amount: 0.1 });

  return (
    <Box component="footer" ref={ref} sx={{ bgcolor: palette.footerBg, mt: 'auto' }}>
      {/* Mini newsletter strip */}
      <Box sx={{ bgcolor: palette.footerCard, borderBottom: `1px solid ${palette.footerBorder}` }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { md: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              py: { xs: 3, md: 3.5 },
            }}
          >
            <Box>
              <Typography sx={{ color: '#F8FAFC', fontWeight: 700, fontSize: '1.05rem', mb: 0.3 }}>
                Đăng ký nhận tin khuyến mãi
              </Typography>
              <Typography sx={{ color: '#94A3B8', fontSize: '0.84rem' }}>
                Giảm ngay 10% cho đơn hàng đầu tiên khi đăng ký
              </Typography>
            </Box>
            <Box
              component="form"
              onSubmit={(e: React.FormEvent) => e.preventDefault()}
              sx={{
                display: 'flex',
                gap: 1,
                width: { xs: '100%', md: 380 },
                flexShrink: 0,
              }}
            >
              <Input
                placeholder="Nhập email của bạn"
                size="large"
                styles={{
                  input: {
                    backgroundColor: 'transparent',
                    color: '#fff',
                  },
                }}
                style={{
                  flex: 1,
                  borderRadius: 10,
                  height: 44,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderColor: palette.footerBorder,
                  color: '#fff',
                  fontSize: '0.88rem',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              />
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                style={{
                  backgroundColor: palette.accent,
                  borderColor: palette.accent,
                  height: 44,
                  paddingInline: 20,
                  fontWeight: 600,
                  borderRadius: 10,
                  fontSize: '0.88rem',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  whiteSpace: 'nowrap',
                }}
              >
                Đăng ký
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main footer content */}
      <Container maxWidth="lg">
        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: '1.3fr 0.8fr 0.8fr 1.1fr' },
              gap: { xs: 4, lg: 5 },
              py: { xs: 5, md: 6 },
            }}
          >
            {/* Column 1: Brand */}
            <motion.div variants={fadeInUp} transition={{ duration: 0.4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2.5,
                    bgcolor: palette.accentLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <img src={logo} alt="Logo" width={34} height={34} style={{ objectFit: 'contain' }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: 2.5, color: palette.accent, textTransform: 'uppercase' }}>
                    Hương
                  </Typography>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>
                    Small House
                  </Typography>
                </Box>
              </Box>

              <Typography sx={{ color: palette.footerText, fontSize: '0.88rem', lineHeight: 1.7, mb: 2.5, maxWidth: 320 }}>
                Chuyên cung cấp thực phẩm chức năng chính hãng nhập khẩu, cam kết chất lượng với giá tốt nhất thị trường.
              </Typography>

              {/* Social links */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                {socials.map((s) => (
                  <IconButton
                    key={s.label}
                    component="a"
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    sx={{
                      border: `1px solid ${palette.footerBorder}`,
                      borderRadius: 2.5,
                      color: palette.footerMuted,
                      p: 0.9,
                      transition: 'all 0.2s',
                      '&:hover': {
                        color: palette.accent,
                        borderColor: palette.accent,
                        bgcolor: 'rgba(125,175,24,0.08)',
                      },
                    }}
                  >
                    {s.icon}
                  </IconButton>
                ))}
              </Box>
            </motion.div>

            {/* Column 2: Quick links */}
            <motion.div variants={fadeInUp} transition={{ duration: 0.4 }}>
              <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', mb: 2 }}>
                Liên kết nhanh
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {quickLinks.map((link) => (
                  <LinkItem key={link.href} {...link} />
                ))}
              </Box>
            </motion.div>

            {/* Column 3: Policies */}
            <motion.div variants={fadeInUp} transition={{ duration: 0.4 }}>
              <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', mb: 2 }}>
                Chính sách
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {policyLinks.map((link) => (
                  <LinkItem key={link.href} {...link} />
                ))}
              </Box>
            </motion.div>

            {/* Column 4: Contact */}
            <motion.div variants={fadeInUp} transition={{ duration: 0.4 }}>
              <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', mb: 2 }}>
                Thông tin liên hệ
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {contactInfo.map((item, i) => {
                  const content = (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.2,
                      }}
                    >
                      <Box
                        sx={{
                          color: palette.accent,
                          bgcolor: 'rgba(125,175,24,0.12)',
                          borderRadius: 2,
                          width: 32,
                          height: 32,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Typography
                        sx={{
                          color: palette.footerText,
                          fontSize: '0.86rem',
                          lineHeight: 1.5,
                          wordBreak: 'break-all',
                          transition: 'color 0.2s',
                          ...(item.href && {
                            '&:hover': { color: palette.accent },
                          }),
                        }}
                      >
                        {item.text}
                      </Typography>
                    </Box>
                  );

                  if (item.href) {
                    return (
                      <a key={i} href={item.href} style={{ textDecoration: 'none' }}>
                        {content}
                      </a>
                    );
                  }
                  return <React.Fragment key={i}>{content}</React.Fragment>;
                })}
              </Box>
            </motion.div>
          </Box>
        </motion.div>

        {/* Bottom bar */}
        <Divider sx={{ borderColor: palette.footerBorder }} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            py: 3,
          }}
        >
          <Typography sx={{ color: palette.footerMuted, fontSize: '0.82rem', textAlign: { xs: 'center', md: 'left' } }}>
            © 2025 Hương Small House. Tất cả quyền được bảo lưu.
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ color: palette.footerMuted, fontSize: '0.8rem', mr: 0.5 }}>
              Thanh toán:
            </Typography>
            {paymentMethods.map((method) => (
              <Box
                key={method}
                sx={{
                  px: 1.2,
                  py: 0.4,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${palette.footerBorder}`,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: palette.footerText,
                  letterSpacing: 0.8,
                }}
              >
                {method}
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
