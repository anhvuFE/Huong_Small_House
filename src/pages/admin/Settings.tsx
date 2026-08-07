import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  Avatar,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Save,
  Settings as SettingsIcon,
  Person,
  Email,
  Notifications,
  Security,
  Storage,
  CameraAlt,
} from '@mui/icons-material';
import { Button, Input, Select as AntSelect } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { profileApi } from '../../services/profileApi';
import { getErrorMessage } from '../../utils/error';
import { palette } from '../../theme';

const { TextArea } = Input;


const inputStyle = { borderRadius: 10, height: 40, fontFamily: 'Inter, system-ui, sans-serif' };

const tabs = [
  { id: 'general', label: 'Tổng quan', icon: <SettingsIcon sx={{ fontSize: 20 }} /> },
  { id: 'profile', label: 'Hồ sơ', icon: <Person sx={{ fontSize: 20 }} /> },
  { id: 'email', label: 'Email', icon: <Email sx={{ fontSize: 20 }} /> },
  { id: 'notifications', label: 'Thông báo', icon: <Notifications sx={{ fontSize: 20 }} /> },
  { id: 'security', label: 'Bảo mật', icon: <Security sx={{ fontSize: 20 }} /> },
  { id: 'system', label: 'Hệ thống', icon: <Storage sx={{ fontSize: 20 }} /> },
];

const ToggleRow: React.FC<{ label: string; desc: string; checked: boolean; onChange: () => void; danger?: boolean }> = ({ label, desc, checked, onChange, danger }) => (
  <Paper elevation={0} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: `1px solid ${palette.border}`, borderRadius: 2.5 }}>
    <Box>
      <Typography sx={{ fontSize: '0.88rem', fontWeight: 500, color: palette.textPrimary }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.78rem', color: palette.textMuted }}>{desc}</Typography>
    </Box>
    <Switch checked={checked} onChange={onChange} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: danger ? '#EF4444' : palette.accent }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: danger ? '#EF4444' : palette.accent } }} />
  </Paper>
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.5 }}>{children}</Typography>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: palette.textPrimary, mb: 2 }}>{children}</Typography>
);

export const Settings: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('general');
  const [feedback, setFeedback] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Hương Small House', siteDescription: 'Cửa hàng thực phẩm chức năng uy tín', siteUrl: 'https://huongsmallhouse.com',
    timezone: 'Asia/Ho_Chi_Minh', language: 'vi', currency: 'VND',
    adminName: 'Admin Hương Small House', adminEmail: 'admin@huongsmallhouse.com', adminPhone: '0336064040',
    emailProvider: 'smtp', smtpHost: 'smtp.gmail.com', smtpPort: '587', smtpUsername: '', smtpPassword: '', emailFrom: 'noreply@huongsmallhouse.com',
    emailNotifications: true, orderNotifications: true, stockNotifications: true, reviewNotifications: false, marketingEmails: true,
    twoFactorAuth: false, sessionTimeout: '60', passwordPolicy: 'medium', loginAttempts: '5',
    enableCache: true, enableLogs: true, logLevel: 'info', backupFrequency: 'daily', maintenanceMode: false,
  });

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tabs.some((t) => t.id === tab)) setActiveTab(tab);
  }, [searchParams]);

  const handleSelectTab = (id: string) => { setActiveTab(id); setSearchParams({ tab: id }); };
  const handleToggle = (key: string) => setSettings((p) => ({ ...p, [key]: !p[key as keyof typeof p] }));
  const handleInput = (key: string, value: string) => setSettings((p) => ({ ...p, [key]: value }));

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setPasswordError(''); setPasswordSuccess('');
    if (!passwordForm.current || !passwordForm.next || !passwordForm.confirm) { setPasswordError('Vui lòng nhập đầy đủ.'); return; }
    if (passwordForm.next !== passwordForm.confirm) { setPasswordError('Mật khẩu mới không khớp.'); return; }
    setIsChangingPassword(true);
    try {
      const msg = await profileApi.changePassword({ currentPassword: passwordForm.current, newPassword: passwordForm.next });
      setPasswordSuccess(msg || 'Đổi mật khẩu thành công.'); setPasswordForm({ current: '', next: '', confirm: '' });
    } catch (err) { setPasswordError(getErrorMessage(err, 'Không thể đổi mật khẩu.')); }
    finally { setIsChangingPassword(false); }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'general': return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <SectionTitle>Thông tin website</SectionTitle>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
            <Box><Label>Tên website</Label><Input value={settings.siteName} onChange={(e) => handleInput('siteName', e.target.value)} style={inputStyle} /></Box>
            <Box><Label>URL website</Label><Input value={settings.siteUrl} onChange={(e) => handleInput('siteUrl', e.target.value)} style={inputStyle} /></Box>
          </Box>
          <Box><Label>Mô tả website</Label><TextArea rows={3} value={settings.siteDescription} onChange={(e) => handleInput('siteDescription', e.target.value)} style={{ borderRadius: 10, fontFamily: 'Inter, system-ui, sans-serif' }} /></Box>
          <SectionTitle>Cài đặt khu vực</SectionTitle>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            <Box><Label>Múi giờ</Label><AntSelect value={settings.timezone} onChange={(v) => handleInput('timezone', v)} options={[{ value: 'Asia/Ho_Chi_Minh', label: 'Việt Nam (GMT+7)' }, { value: 'Asia/Bangkok', label: 'Bangkok (GMT+7)' }, { value: 'Asia/Singapore', label: 'Singapore (GMT+8)' }]} style={{ width: '100%', height: 40 }} /></Box>
            <Box><Label>Ngôn ngữ</Label><AntSelect value={settings.language} onChange={(v) => handleInput('language', v)} options={[{ value: 'vi', label: 'Tiếng Việt' }, { value: 'en', label: 'English' }]} style={{ width: '100%', height: 40 }} /></Box>
            <Box><Label>Tiền tệ</Label><AntSelect value={settings.currency} onChange={(v) => handleInput('currency', v)} options={[{ value: 'VND', label: 'VND' }, { value: 'USD', label: 'USD' }]} style={{ width: '100%', height: 40 }} /></Box>
          </Box>
        </Box>
      );
      case 'profile': return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: palette.background, color: palette.textMuted }}><Person sx={{ fontSize: 32 }} /></Avatar>
              <Box sx={{ position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: '50%', bgcolor: palette.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><CameraAlt sx={{ fontSize: 14 }} /></Box>
            </Box>
            <Box><Typography sx={{ fontWeight: 600, color: palette.textPrimary }}>Ảnh đại diện</Typography><Typography sx={{ fontSize: '0.78rem', color: palette.textMuted }}>JPG, PNG tối đa 2MB</Typography></Box>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
            <Box><Label>Họ và tên</Label><Input value={settings.adminName} onChange={(e) => handleInput('adminName', e.target.value)} style={inputStyle} /></Box>
            <Box><Label>Email</Label><Input value={settings.adminEmail} onChange={(e) => handleInput('adminEmail', e.target.value)} style={inputStyle} /></Box>
            <Box><Label>Số điện thoại</Label><Input value={settings.adminPhone} onChange={(e) => handleInput('adminPhone', e.target.value)} style={inputStyle} /></Box>
          </Box>
          <SectionTitle>Đổi mật khẩu</SectionTitle>
          <Box component="form" onSubmit={handleChangePassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
              <Box><Label>Mật khẩu hiện tại</Label><Input.Password value={passwordForm.current} onChange={(e) => { setPasswordForm((p) => ({ ...p, current: e.target.value })); setPasswordError(''); }} style={inputStyle} /></Box>
              <Box><Label>Mật khẩu mới</Label><Input.Password value={passwordForm.next} onChange={(e) => { setPasswordForm((p) => ({ ...p, next: e.target.value })); setPasswordError(''); }} style={inputStyle} /></Box>
              <Box><Label>Xác nhận</Label><Input.Password value={passwordForm.confirm} onChange={(e) => { setPasswordForm((p) => ({ ...p, confirm: e.target.value })); setPasswordError(''); }} style={inputStyle} /></Box>
            </Box>
            {passwordError && <Alert severity="error" sx={{ borderRadius: 2 }}>{passwordError}</Alert>}
            {passwordSuccess && <Alert severity="success" sx={{ borderRadius: 2 }}>{passwordSuccess}</Alert>}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="primary" htmlType="submit" loading={isChangingPassword} style={{ backgroundColor: palette.accent, borderColor: palette.accent, height: 40, borderRadius: 10, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}>
                Cập nhật mật khẩu
              </Button>
            </Box>
          </Box>
        </Box>
      );
      case 'notifications': return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <SectionTitle>Thông báo email</SectionTitle>
          {[
            { key: 'emailNotifications', label: 'Nhận thông báo qua email', desc: 'Nhận tất cả thông báo quan trọng' },
            { key: 'orderNotifications', label: 'Thông báo đơn hàng', desc: 'Khi có đơn hàng mới' },
            { key: 'stockNotifications', label: 'Thông báo tồn kho', desc: 'Khi sản phẩm sắp hết' },
            { key: 'reviewNotifications', label: 'Thông báo đánh giá', desc: 'Khi có đánh giá mới' },
            { key: 'marketingEmails', label: 'Email marketing', desc: 'Các chiến dịch marketing' },
          ].map((item) => (
            <ToggleRow key={item.key} label={item.label} desc={item.desc} checked={!!settings[item.key as keyof typeof settings]} onChange={() => handleToggle(item.key)} />
          ))}
        </Box>
      );
      case 'security': return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <SectionTitle>Bảo mật tài khoản</SectionTitle>
          <ToggleRow label="Xác thực 2 yếu tố" desc="Thêm lớp bảo mật cho tài khoản" checked={settings.twoFactorAuth} onChange={() => handleToggle('twoFactorAuth')} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
            <Box><Label>Thời gian hết hạn phiên (phút)</Label><Input type="number" value={settings.sessionTimeout} onChange={(e) => handleInput('sessionTimeout', e.target.value)} style={inputStyle} /></Box>
            <Box><Label>Số lần đăng nhập sai tối đa</Label><Input type="number" value={settings.loginAttempts} onChange={(e) => handleInput('loginAttempts', e.target.value)} style={inputStyle} /></Box>
          </Box>
          <Box><Label>Chính sách mật khẩu</Label><AntSelect value={settings.passwordPolicy} onChange={(v) => handleInput('passwordPolicy', v)} options={[{ value: 'weak', label: 'Yếu (6+ ký tự)' }, { value: 'medium', label: 'Trung bình (8+ ký tự)' }, { value: 'strong', label: 'Mạnh (12+ ký tự, đặc biệt)' }]} style={{ width: '100%', maxWidth: 400, height: 40 }} /></Box>
        </Box>
      );
      case 'system': return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <SectionTitle>Hiệu suất hệ thống</SectionTitle>
          <ToggleRow label="Bật cache" desc="Cải thiện tốc độ tải trang" checked={settings.enableCache} onChange={() => handleToggle('enableCache')} />
          <ToggleRow label="Chế độ bảo trì" desc="Tạm thời tắt website" checked={settings.maintenanceMode} onChange={() => handleToggle('maintenanceMode')} danger />
          <SectionTitle>Logs và Backup</SectionTitle>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
            <Box><Label>Mức độ log</Label><AntSelect value={settings.logLevel} onChange={(v) => handleInput('logLevel', v)} options={[{ value: 'error', label: 'Chỉ lỗi' }, { value: 'warning', label: 'Cảnh báo + lỗi' }, { value: 'info', label: 'Thông tin + cảnh báo + lỗi' }, { value: 'debug', label: 'Debug (tất cả)' }]} style={{ width: '100%', height: 40 }} /></Box>
            <Box><Label>Tần suất backup</Label><AntSelect value={settings.backupFrequency} onChange={(v) => handleInput('backupFrequency', v)} options={[{ value: 'hourly', label: 'Mỗi giờ' }, { value: 'daily', label: 'Hàng ngày' }, { value: 'weekly', label: 'Hàng tuần' }, { value: 'monthly', label: 'Hàng tháng' }]} style={{ width: '100%', height: 40 }} /></Box>
          </Box>
        </Box>
      );
      default: return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: palette.textPrimary }}>Cài đặt hệ thống</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>Quản lý cấu hình và tùy chọn</Typography>
        </Box>
        <Button type="primary" icon={<Save style={{ fontSize: 16 }} />} onClick={() => setFeedback(true)} style={{ backgroundColor: palette.accent, borderColor: palette.accent, height: 40, borderRadius: 10, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}>
          Lưu cài đặt
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2.5 }}>
        {/* Sidebar */}
        <Paper elevation={0} sx={{ width: { lg: 240 }, flexShrink: 0, border: `1px solid ${palette.border}`, borderRadius: 3, p: 1, height: 'fit-content' }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'row', lg: 'column' }, gap: 0.5, overflowX: { xs: 'auto', lg: 'visible' } }}>
            {tabs.map((tab) => (
              <Box
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.2,
                  px: 2,
                  py: 1.2,
                  borderRadius: 2,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  bgcolor: activeTab === tab.id ? palette.accent : 'transparent',
                  color: activeTab === tab.id ? '#fff' : palette.textSecondary,
                  '&:hover': { bgcolor: activeTab === tab.id ? palette.accent : palette.background },
                }}
              >
                {tab.icon}
                <Typography sx={{ fontSize: '0.88rem', fontWeight: activeTab === tab.id ? 600 : 500 }}>{tab.label}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Content */}
        <Paper elevation={0} sx={{ flex: 1, p: { xs: 2.5, md: 3 }, border: `1px solid ${palette.border}`, borderRadius: 3 }}>
          {renderContent()}
        </Paper>
      </Box>

      <Snackbar open={feedback} autoHideDuration={2500} onClose={() => setFeedback(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" onClose={() => setFeedback(false)} sx={{ borderRadius: 2 }}>
          Cài đặt đã được lưu thành công!
        </Alert>
      </Snackbar>
    </Box>
  );
};
