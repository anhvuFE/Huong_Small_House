import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  InputBase,
  Avatar,
} from '@mui/material';
import {
  Search,
  Visibility,
  Lock,
  LockOpen,
  Groups,
  VerifiedUser,
  Schedule,
  PersonAdd,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
} from '@mui/icons-material';
import { Button, Select as AntSelect, Modal } from 'antd';
import { userApi } from '../../services/userApi';
import { getErrorMessage } from '../../utils/error';
import type { User } from '../../types';
import { Loader } from '../../components/common/Loader';
import { useToast } from '../../components/common/Toast';
import { Pagination } from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import logo from '../../assets/logo.png';
import { palette } from '../../theme';


const getDaysSinceLogin = (lastLogin?: Date) => {
  if (!lastLogin) return Infinity;
  return Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
};

const getVerificationChip = (user: User) => {
  if (user.isEmailVerified && user.isPhoneVerified) return { text: 'Đã xác minh', color: '#10B981', bg: '#ECFDF5' };
  if (!user.isEmailVerified && !user.isPhoneVerified) return { text: 'Chưa xác minh', color: '#EF4444', bg: '#FEF2F2' };
  return { text: 'Một phần', color: '#F59E0B', bg: '#FFFBEB' };
};

const getActivityText = (lastLogin?: Date) => {
  if (!lastLogin) return { text: 'Chưa đăng nhập', color: palette.textMuted };
  const d = getDaysSinceLogin(lastLogin);
  if (d <= 1) return { text: 'Hôm nay', color: '#10B981' };
  if (d <= 7) return { text: `${d} ngày trước`, color: '#3B82F6' };
  if (d <= 30) return { text: `${d} ngày trước`, color: '#F59E0B' };
  return { text: `${d} ngày trước`, color: '#EF4444' };
};

const verificationOptions = [
  { value: 'verified', label: 'Đã xác minh' },
  { value: 'unverified', label: 'Chưa xác minh' },
  { value: 'partial', label: 'Một phần' },
];

const activityOptions = [
  { value: 'active', label: 'Hoạt động gần đây' },
  { value: 'inactive', label: 'Không hoạt động' },
];

const quickStats = [
  { key: 'total', label: 'Tổng người dùng', icon: <Groups sx={{ fontSize: 22 }} />, color: '#1565C0', bg: '#E3F2FD' },
  { key: 'verified', label: 'Đã xác minh', icon: <VerifiedUser sx={{ fontSize: 22 }} />, color: '#2E7D32', bg: '#E8F5E9' },
  { key: 'active', label: 'Hoạt động tuần', icon: <Schedule sx={{ fontSize: 22 }} />, color: '#7B1FA2', bg: '#F3E5F5' },
  { key: 'new', label: 'Mới tháng này', icon: <PersonAdd sx={{ fontSize: 22 }} />, color: '#E65100', bg: '#FFF3E0' },
];

export const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [lockedUsers, setLockedUsers] = useState<Record<string, boolean>>({});
  const { showToast } = useToast();
  const { currentPage, pageSize, handlePageChange, handlePageSizeChange, getPaginatedData } = usePagination(1, 10);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true); setError('');
      try {
        const list = await userApi.listUsers();
        setUsers(list);
        // Khởi tạo trạng thái khóa từ dữ liệu thật (status = 'locked').
        setLockedUsers(
          list.reduce<Record<string, boolean>>((acc, u) => {
            acc[u.id] = u.status === 'locked';
            return acc;
          }, {}),
        );
      } catch (err) { setError(getErrorMessage(err, 'Không thể tải người dùng.')); } finally { setIsLoading(false); }
    };
    fetch();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchTerm.toLowerCase();
      const matchSearch = u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(searchTerm);
      let matchVerify = true;
      if (verificationFilter === 'verified') matchVerify = u.isEmailVerified && u.isPhoneVerified;
      else if (verificationFilter === 'unverified') matchVerify = !u.isEmailVerified && !u.isPhoneVerified;
      else if (verificationFilter === 'partial') matchVerify = u.isEmailVerified !== u.isPhoneVerified;
      let matchActivity = true;
      if (activityFilter === 'active') matchActivity = getDaysSinceLogin(u.lastLogin) <= 7;
      else if (activityFilter === 'inactive') matchActivity = getDaysSinceLogin(u.lastLogin) > 30;
      return matchSearch && matchVerify && matchActivity;
    });
  }, [users, searchTerm, verificationFilter, activityFilter]);

  const paginatedData = useMemo(() => getPaginatedData(filteredUsers), [filteredUsers, getPaginatedData]);

  const stats = useMemo(() => {
    const total = users.length;
    const verified = users.filter((u) => u.isEmailVerified && u.isPhoneVerified).length;
    const active = users.filter((u) => getDaysSinceLogin(u.lastLogin) <= 7).length;
    const newU = users.filter((u) => Math.floor((Date.now() - u.createdAt.getTime()) / (1000 * 60 * 60 * 24)) <= 30).length;
    return { total, verified, active, new: newU } as Record<string, number>;
  }, [users]);

  const handleToggleLock = async (userId: string) => {
    const next = !lockedUsers[userId];
    // Optimistic: cập nhật ngay, revert nếu API lỗi.
    setLockedUsers((prev) => ({ ...prev, [userId]: next }));
    try {
      if (next) await userApi.lockUser(userId);
      else await userApi.unlockUser(userId);
      showToast({ title: next ? 'Đã khóa tài khoản' : 'Đã mở khóa', variant: next ? 'error' : 'success' });
    } catch (err) {
      setLockedUsers((prev) => ({ ...prev, [userId]: !next }));
      showToast({ title: getErrorMessage(err, 'Thao tác thất bại'), variant: 'error' });
    }
  };

  const handleViewDetail = (user: User) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
    // Lấy bản chi tiết mới nhất từ API (không chặn hiển thị).
    userApi.getUser(user.id).then(setSelectedUser).catch(() => {});
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: palette.textPrimary }}>Quản lý người dùng</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>{users.length} người dùng</Typography>
        </Box>
        <Button icon={<Search style={{ fontSize: 16 }} />} style={{ height: 40, borderRadius: 10, fontFamily: 'Inter, system-ui, sans-serif' }}>Xuất Excel</Button>
      </Box>

      {error && <Paper elevation={0} sx={{ p: 2, border: '1px solid #FCA5A5', bgcolor: '#FEF2F2', borderRadius: 2 }}><Typography sx={{ color: '#B91C1C', fontSize: '0.88rem' }}>{error}</Typography></Paper>}

      {/* Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
        {quickStats.map((s) => (
          <Paper key={s.key} elevation={0} sx={{ p: 2, border: `1px solid ${palette.border}`, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 42, height: 42, borderRadius: 2.5, bgcolor: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</Box>
            <Box>
              <Typography sx={{ fontSize: '0.75rem', color: palette.textMuted }}>{s.label}</Typography>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: palette.textPrimary }}>{stats[s.key]}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {isLoading && <Paper elevation={0} sx={{ p: 4, border: `1px solid ${palette.border}`, borderRadius: 3, display: 'flex', justifyContent: 'center' }}><Loader /></Paper>}

      {/* Filters */}
      {!isLoading && (
        <Paper elevation={0} sx={{ p: 2, border: `1px solid ${palette.border}`, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1.5 }}>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', bgcolor: palette.background, borderRadius: 2.5, border: `1px solid ${palette.border}`, px: 1.5, '&:focus-within': { borderColor: palette.accent } }}>
              <Search sx={{ fontSize: 20, color: palette.textMuted, mr: 1 }} />
              <InputBase value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm theo tên, email, SĐT..." sx={{ flex: 1, fontSize: '0.88rem', py: 0.8 }} />
            </Box>
            <AntSelect value={verificationFilter || undefined} onChange={(v) => setVerificationFilter(v || '')} allowClear placeholder="Xác minh" options={verificationOptions} style={{ width: 170, height: 40, fontFamily: 'Inter, system-ui, sans-serif' }} />
            <AntSelect value={activityFilter || undefined} onChange={(v) => setActivityFilter(v || '')} allowClear placeholder="Hoạt động" options={activityOptions} style={{ width: 180, height: 40, fontFamily: 'Inter, system-ui, sans-serif' }} />
          </Box>
        </Paper>
      )}

      {/* Table */}
      {!isLoading && (
        <Paper elevation={0} sx={{ border: `1px solid ${palette.border}`, borderRadius: 3, overflow: 'hidden' }}>
          {/* Desktop */}
          <Box sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <Box component="thead">
                <Box component="tr" sx={{ bgcolor: palette.background }}>
                  {['Người dùng', 'Liên hệ', 'Xác minh', 'Hoạt động', 'Ngày tham gia', ''].map((h) => (
                    <Box key={h} component="th" sx={{ py: 1.5, px: 2, textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {paginatedData.items.map((user) => {
                  const v = getVerificationChip(user);
                  const a = getActivityText(user.lastLogin);
                  return (
                    <Box key={user.id} component="tr" sx={{ borderBottom: `1px solid ${palette.border}`, '&:hover': { bgcolor: palette.background }, transition: 'background 0.15s' }}>
                      <Box component="td" sx={{ py: 1.5, px: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar src={user.avatar || logo} sx={{ width: 38, height: 38, bgcolor: palette.background, '& img': { objectFit: 'contain', p: 0.3 } }} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: '0.88rem', fontWeight: 500, color: palette.textPrimary }}>{user.fullName}</Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: palette.textMuted }}>ID: {user.id}</Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box component="td" sx={{ py: 1.5, px: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Email sx={{ fontSize: 14, color: palette.textMuted }} />
                            <Typography sx={{ fontSize: '0.82rem', color: palette.textSecondary }}>{user.email}</Typography>
                            {user.isEmailVerified && <VerifiedUser sx={{ fontSize: 12, color: '#10B981' }} />}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Phone sx={{ fontSize: 14, color: palette.textMuted }} />
                            <Typography sx={{ fontSize: '0.82rem', color: palette.textSecondary }}>{user.phone || '---'}</Typography>
                            {user.isPhoneVerified && <VerifiedUser sx={{ fontSize: 12, color: '#10B981' }} />}
                          </Box>
                        </Box>
                      </Box>
                      <Box component="td" sx={{ py: 1.5, px: 2 }}>
                        <Chip label={v.text} size="small" sx={{ bgcolor: v.bg, color: v.color, fontWeight: 600, fontSize: '0.7rem', height: 24 }} />
                      </Box>
                      <Box component="td" sx={{ py: 1.5, px: 2 }}>
                        <Typography sx={{ fontSize: '0.84rem', fontWeight: 500, color: a.color }}>{a.text}</Typography>
                      </Box>
                      <Box component="td" sx={{ py: 1.5, px: 2 }}>
                        <Typography sx={{ fontSize: '0.82rem', color: palette.textMuted }}>{user.createdAt.toLocaleDateString('vi-VN')}</Typography>
                      </Box>
                      <Box component="td" sx={{ py: 1.5, px: 2 }}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton size="small" onClick={() => handleViewDetail(user)} sx={{ color: palette.textMuted, '&:hover': { bgcolor: '#E3F2FD', color: '#1565C0' } }}><Visibility sx={{ fontSize: 18 }} /></IconButton>
                          <IconButton size="small" onClick={() => handleToggleLock(user.id)} sx={{ color: lockedUsers[user.id] ? '#EF4444' : palette.textMuted, '&:hover': { bgcolor: lockedUsers[user.id] ? '#FEF2F2' : '#E8F5E9', color: lockedUsers[user.id] ? '#EF4444' : '#2E7D32' } }}>
                            {lockedUsers[user.id] ? <LockOpen sx={{ fontSize: 18 }} /> : <Lock sx={{ fontSize: 18 }} />}
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>

          {/* Mobile cards */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column' }}>
            {paginatedData.items.map((user) => {
              const v = getVerificationChip(user);
              const a = getActivityText(user.lastLogin);
              return (
                <Box key={user.id} sx={{ p: 2, borderBottom: `1px solid ${palette.border}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <Avatar src={user.avatar || logo} sx={{ width: 36, height: 36, bgcolor: palette.background }} />
                      <Box>
                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: palette.textPrimary }}>{user.fullName}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: palette.textMuted }}>{user.email}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.3 }}>
                      <IconButton size="small" onClick={() => handleViewDetail(user)} sx={{ color: '#1565C0' }}><Visibility sx={{ fontSize: 16 }} /></IconButton>
                      <IconButton size="small" onClick={() => handleToggleLock(user.id)} sx={{ color: lockedUsers[user.id] ? '#EF4444' : '#2E7D32' }}>
                        {lockedUsers[user.id] ? <LockOpen sx={{ fontSize: 16 }} /> : <Lock sx={{ fontSize: 16 }} />}
                      </IconButton>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Chip label={v.text} size="small" sx={{ bgcolor: v.bg, color: v.color, fontWeight: 600, fontSize: '0.68rem', height: 22 }} />
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 500, color: a.color }}>{a.text}</Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: palette.textMuted, ml: 'auto' }}>{user.createdAt.toLocaleDateString('vi-VN')}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {paginatedData.totalItems === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Groups sx={{ fontSize: 48, color: palette.border, mb: 1.5 }} />
              <Typography sx={{ fontWeight: 600, color: palette.textPrimary }}>Không tìm thấy người dùng</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: palette.textMuted }}>Thử thay đổi bộ lọc</Typography>
            </Box>
          )}
        </Paper>
      )}

      {!isLoading && filteredUsers.length > 0 && (
        <Pagination currentPage={currentPage} totalPages={paginatedData.totalPages} totalItems={paginatedData.totalItems} itemsPerPage={pageSize} onPageChange={handlePageChange} showPageSizeSelect onPageSizeChange={handlePageSizeChange} />
      )}

      {/* Detail Modal */}
      <Modal open={isDetailOpen} onCancel={() => setIsDetailOpen(false)} title={`Chi tiết: ${selectedUser?.fullName}`} footer={<Button onClick={() => setIsDetailOpen(false)} style={{ borderRadius: 10 }}>Đóng</Button>} width={560} centered>
        {selectedUser && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={selectedUser.avatar || logo} sx={{ width: 56, height: 56, bgcolor: palette.background, border: `2px solid ${palette.border}`, '& img': { objectFit: 'contain', p: 0.3 } }} />
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: '1.05rem', color: palette.textPrimary }}>{selectedUser.fullName}</Typography>
                <Typography sx={{ fontSize: '0.78rem', color: palette.textMuted }}>ID: {selectedUser.id}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                  <Email sx={{ fontSize: 14, color: palette.textMuted }} />
                  <Typography sx={{ fontSize: '0.75rem', color: palette.textMuted }}>Email</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.88rem', color: palette.textPrimary, wordBreak: 'break-all' }}>{selectedUser.email}</Typography>
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                  <Phone sx={{ fontSize: 14, color: palette.textMuted }} />
                  <Typography sx={{ fontSize: '0.75rem', color: palette.textMuted }}>SĐT</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.88rem', color: palette.textPrimary }}>{selectedUser.phone || 'Chưa có'}</Typography>
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                  <CalendarToday sx={{ fontSize: 14, color: palette.textMuted }} />
                  <Typography sx={{ fontSize: '0.75rem', color: palette.textMuted }}>Ngày tham gia</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.88rem', color: palette.textPrimary }}>{selectedUser.createdAt?.toLocaleDateString('vi-VN') ?? '---'}</Typography>
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                  <Schedule sx={{ fontSize: 14, color: palette.textMuted }} />
                  <Typography sx={{ fontSize: '0.75rem', color: palette.textMuted }}>Hoạt động cuối</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.88rem', color: palette.textPrimary }}>{selectedUser.lastLogin?.toLocaleString('vi-VN') ?? 'Chưa xác định'}</Typography>
              </Box>
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                <LocationOn sx={{ fontSize: 14, color: palette.textMuted }} />
                <Typography sx={{ fontSize: '0.75rem', color: palette.textMuted }}>Địa chỉ</Typography>
              </Box>
              {selectedUser.addresses?.length ? (
                <Box>
                  <Typography sx={{ fontSize: '0.88rem', color: palette.textPrimary }}>{selectedUser.addresses[0].street}</Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: palette.textMuted }}>
                    {[selectedUser.addresses[0].ward, selectedUser.addresses[0].district, selectedUser.addresses[0].province].filter(Boolean).join(', ')}
                  </Typography>
                </Box>
              ) : (
                <Typography sx={{ fontSize: '0.88rem', color: palette.textMuted }}>Chưa có địa chỉ</Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label={getVerificationChip(selectedUser).text} size="small" sx={{ bgcolor: getVerificationChip(selectedUser).bg, color: getVerificationChip(selectedUser).color, fontWeight: 600 }} />
              {lockedUsers[selectedUser.id] && <Chip label="Đã khóa" size="small" sx={{ bgcolor: '#FEF2F2', color: '#EF4444', fontWeight: 600 }} />}
            </Box>
          </Box>
        )}
      </Modal>
    </Box>
  );
};
