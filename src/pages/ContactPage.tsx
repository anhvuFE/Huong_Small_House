import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Paper,
  Breadcrumbs,
  IconButton,
  Alert,
} from '@mui/material';
import { Input, Button, Select as AntSelect } from 'antd';
import { motion } from 'framer-motion';
import {
  Home,
  NavigateNext,
  LocationOn,
  Phone,
  Email,
  AccessTime,
  Send,
  Facebook,
  Instagram,
  YouTube,
  Chat,
  HelpOutline,
} from '@mui/icons-material';
import { fadeInUp, staggerContainer } from '../hooks/useScrollAnimation';

const { TextArea } = Input;

const palette = {
  accent: '#7daf18',
  accentLight: '#EDF7D5',
  primary: '#2E7D32',
  primarySoft: '#E8F5E9',
  textPrimary: '#1A2332',
  textSecondary: '#5A6B7F',
  textMuted: '#8D99A8',
  border: '#E8ECF0',
  background: '#FAFBFC',
};

interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const contactInfo = [
  { icon: <LocationOn sx={{ fontSize: 22 }} />, label: 'Địa chỉ', value: 'Chung cư nhà A 9 tầng, Ngõ 120 Hoàng Quốc Việt, Bắc Từ Liêm, Hà Nội', color: '#2E7D32', bg: '#E8F5E9' },
  { icon: <Phone sx={{ fontSize: 22 }} />, label: 'Điện thoại', value: '0336 064 040', href: 'tel:0336064040', color: '#1565C0', bg: '#E3F2FD' },
  { icon: <Email sx={{ fontSize: 22 }} />, label: 'Email', value: 'vuquynhhuong171298@gmail.com', href: 'mailto:vuquynhhuong171298@gmail.com', color: '#7B1FA2', bg: '#F3E5F5' },
  { icon: <AccessTime sx={{ fontSize: 22 }} />, label: 'Giờ làm việc', value: '8:00 - 22:00 (Tất cả các ngày)', color: '#E65100', bg: '#FFF3E0' },
];

const socials = [
  { icon: <Facebook sx={{ fontSize: 22 }} />, href: 'https://facebook.com', label: 'Facebook', color: '#1877F2', bg: '#E3F2FD' },
  { icon: <Instagram sx={{ fontSize: 22 }} />, href: 'https://instagram.com', label: 'Instagram', color: '#E4405F', bg: '#FCE4EC' },
  { icon: <YouTube sx={{ fontSize: 22 }} />, href: 'https://youtube.com', label: 'YouTube', color: '#FF0000', bg: '#FFEBEE' },
  { icon: <Chat sx={{ fontSize: 22 }} />, href: 'https://zalo.me/0336064040', label: 'Zalo', color: '#0068FF', bg: '#E3F2FD' },
];

const faqs = [
  { q: 'Thời gian giao hàng là bao lâu?', a: 'Thời gian giao hàng từ 1-3 ngày cho khu vực nội thành Hà Nội và 3-5 ngày cho các tỉnh thành khác.' },
  { q: 'Tôi có thể đổi trả sản phẩm không?', a: 'Bạn có thể đổi trả sản phẩm trong vòng 7 ngày nếu còn nguyên tem, mác và chưa qua sử dụng.' },
  { q: 'Làm sao để được tư vấn miễn phí?', a: 'Gọi hotline 0336 064 040 hoặc nhắn tin qua Zalo, Facebook để được tư vấn miễn phí 24/7.' },
  { q: 'Có chính sách giảm giá cho khách hàng thân thiết?', a: 'Có, khách hàng thân thiết sẽ được giảm 5-15% tùy theo cấp độ thành viên.' },
];

const subjectOptions = [
  { value: 'tu-van-san-pham', label: 'Tư vấn sản phẩm' },
  { value: 'dat-hang', label: 'Đặt hàng' },
  { value: 'khieu-nai', label: 'Khiếu nại' },
  { value: 'hop-tac', label: 'Hợp tác' },
  { value: 'khac', label: 'Khác' },
];

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '', email: '', phone: '', subject: '', message: '',
  });
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateForm = () => {
    const e: Partial<ContactFormData> = {};
    if (!formData.fullName.trim()) e.fullName = 'Họ tên là bắt buộc';
    if (!formData.email.trim()) e.email = 'Email là bắt buộc';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Email không hợp lệ';
    if (!formData.phone.trim()) e.phone = 'Số điện thoại là bắt buộc';
    else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) e.phone = 'Số điện thoại không hợp lệ';
    if (!formData.subject) e.subject = 'Chủ đề là bắt buộc';
    if (!formData.message.trim()) e.message = 'Nội dung là bắt buộc';
    else if (formData.message.trim().length < 10) e.message = 'Nội dung phải có ít nhất 10 ký tự';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (name: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setSubmitSuccess(true);
      setIsSubmitting(false);
      setFormData({ fullName: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 2000);
  };

  const inputStyle = { borderRadius: 10, height: 44, fontFamily: 'Inter, system-ui, sans-serif' };

  return (
    <Box sx={{ bgcolor: palette.background, minHeight: '100vh' }}>
      {/* Hero */}
      <Box sx={{ bgcolor: palette.primary, py: { xs: 5, md: 6 }, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Breadcrumbs separator={<NavigateNext sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />} sx={{ mb: 3 }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Home sx={{ fontSize: 16, color: 'rgba(255,255,255,0.6)' }} />
              <Typography sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>Trang chủ</Typography>
            </Link>
            <Typography sx={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>Liên hệ</Typography>
          </Breadcrumbs>
          <Typography variant="h3" sx={{ color: '#fff', fontSize: { xs: '1.6rem', md: '2.2rem' }, mb: 1 }}>
            Liên hệ với chúng tôi
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', maxWidth: 480 }}>
            Đội ngũ tư vấn chuyên nghiệp luôn sẵn sàng hỗ trợ bạn 24/7
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '5fr 7fr' }, gap: 3 }}>
          {/* Left: Contact Info */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Paper elevation={0} sx={{ p: 3, border: `1px solid ${palette.border}`, borderRadius: 3 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: palette.textPrimary, mb: 2.5 }}>
                Thông tin liên hệ
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {contactInfo.map((c, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1.5 }}>
                    <Box sx={{ width: 42, height: 42, borderRadius: 2.5, bgcolor: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {c.icon}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: palette.textMuted, mb: 0.2 }}>
                        {c.label}
                      </Typography>
                      {c.href ? (
                        <Typography
                          component="a"
                          href={c.href}
                          sx={{
                            fontSize: '0.88rem',
                            color: palette.textPrimary,
                            textDecoration: 'none',
                            wordBreak: 'break-all',
                            '&:hover': { color: palette.accent },
                            transition: 'color 0.2s',
                          }}
                        >
                          {c.value}
                        </Typography>
                      ) : (
                        <Typography sx={{ fontSize: '0.88rem', color: palette.textPrimary }}>
                          {c.value}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>

            {/* Socials */}
            <Paper elevation={0} sx={{ p: 3, border: `1px solid ${palette.border}`, borderRadius: 3 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: palette.textPrimary, mb: 2 }}>
                Kết nối với chúng tôi
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {socials.map((s, i) => (
                  <IconButton
                    key={i}
                    component="a"
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    sx={{
                      border: `1px solid ${palette.border}`,
                      borderRadius: 2.5,
                      color: s.color,
                      p: 1,
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: s.bg, borderColor: s.color },
                    }}
                  >
                    {s.icon}
                  </IconButton>
                ))}
              </Box>
            </Paper>
          </Box>

          {/* Right: Form */}
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, border: `1px solid ${palette.border}`, borderRadius: 3 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', color: palette.textPrimary, mb: 0.5 }}>
              Gửi tin nhắn
            </Typography>
            <Typography sx={{ fontSize: '0.84rem', color: palette.textMuted, mb: 3 }}>
              Điền thông tin bên dưới, chúng tôi sẽ phản hồi trong 24 giờ
            </Typography>

            {submitSuccess && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2.5 }}>
                Tin nhắn đã được gửi thành công! Chúng tôi sẽ phản hồi sớm nhất.
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.7 }}>
                    Họ và tên <Box component="span" sx={{ color: '#C62828' }}>*</Box>
                  </Typography>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder="Nhập họ tên"
                    status={errors.fullName ? 'error' : undefined}
                    style={inputStyle}
                  />
                  {errors.fullName && <Typography sx={{ fontSize: '0.75rem', color: '#C62828', mt: 0.5 }}>{errors.fullName}</Typography>}
                </Box>

                <Box>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.7 }}>
                    Email <Box component="span" sx={{ color: '#C62828' }}>*</Box>
                  </Typography>
                  <Input
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="email@example.com"
                    status={errors.email ? 'error' : undefined}
                    style={inputStyle}
                  />
                  {errors.email && <Typography sx={{ fontSize: '0.75rem', color: '#C62828', mt: 0.5 }}>{errors.email}</Typography>}
                </Box>

                <Box>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.7 }}>
                    Số điện thoại <Box component="span" sx={{ color: '#C62828' }}>*</Box>
                  </Typography>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="0336 064 040"
                    status={errors.phone ? 'error' : undefined}
                    style={inputStyle}
                  />
                  {errors.phone && <Typography sx={{ fontSize: '0.75rem', color: '#C62828', mt: 0.5 }}>{errors.phone}</Typography>}
                </Box>

                <Box>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.7 }}>
                    Chủ đề <Box component="span" sx={{ color: '#C62828' }}>*</Box>
                  </Typography>
                  <AntSelect
                    value={formData.subject || undefined}
                    onChange={(v) => handleChange('subject', v)}
                    placeholder="Chọn chủ đề"
                    options={subjectOptions}
                    status={errors.subject ? 'error' : undefined}
                    style={{ width: '100%', height: 44, borderRadius: 10, fontFamily: 'Inter, system-ui, sans-serif' }}
                  />
                  {errors.subject && <Typography sx={{ fontSize: '0.75rem', color: '#C62828', mt: 0.5 }}>{errors.subject}</Typography>}
                </Box>
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.7 }}>
                  Nội dung <Box component="span" sx={{ color: '#C62828' }}>*</Box>
                </Typography>
                <TextArea
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="Nhập nội dung tin nhắn..."
                  rows={5}
                  status={errors.message ? 'error' : undefined}
                  style={{ borderRadius: 10, fontFamily: 'Inter, system-ui, sans-serif', resize: 'none' }}
                />
                {errors.message && <Typography sx={{ fontSize: '0.75rem', color: '#C62828', mt: 0.5 }}>{errors.message}</Typography>}
              </Box>

              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                icon={<Send style={{ fontSize: 16 }} />}
                size="large"
                style={{
                  backgroundColor: palette.accent,
                  borderColor: palette.accent,
                  height: 46,
                  paddingInline: 32,
                  fontWeight: 600,
                  borderRadius: 10,
                  fontSize: '0.92rem',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  alignSelf: 'flex-start',
                }}
              >
                Gửi tin nhắn
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* Map */}
        <Paper
          elevation={0}
          sx={{
            mt: 4,
            border: `1px solid ${palette.border}`,
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d931.0173569775983!2d105.79179686950405!3d21.04532629870902!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab3ae8c77e2b%3A0x8e14d9f462a3b70f!2zTmfDtSAxMjAgSG_DoG5nIFF14buRYyBWaeG7h3Q!5e0!3m2!1svi!2s!4v1702872345678!5m2!1svi!2s"
            width="100%"
            height="350"
            style={{ border: 0, display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Maps"
          />
        </Paper>

        {/* FAQ */}
        <Box sx={{ mt: { xs: 5, md: 6 } }}>
          <motion.div variants={staggerContainer(0.06)} initial="hidden" animate="visible">
            <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: palette.accent, textTransform: 'uppercase', letterSpacing: 2, mb: 1 }}>
                FAQ
              </Typography>
              <Typography variant="h4" sx={{ color: palette.textPrimary, fontSize: { xs: '1.4rem', md: '1.8rem' } }}>
                Câu hỏi thường gặp
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2.5 }}>
              {faqs.map((faq, i) => (
                <motion.div key={i} variants={fadeInUp} transition={{ duration: 0.35 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      border: `1px solid ${palette.border}`,
                      borderRadius: 3,
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.05)', borderColor: palette.accent },
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 1.2, mb: 1.5 }}>
                      <HelpOutline sx={{ fontSize: 20, color: palette.accent, mt: 0.2, flexShrink: 0 }} />
                      <Typography sx={{ fontWeight: 600, fontSize: '0.92rem', color: palette.textPrimary }}>
                        {faq.q}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.85rem', color: palette.textSecondary, lineHeight: 1.7, pl: 4 }}>
                      {faq.a}
                    </Typography>
                  </Paper>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};
