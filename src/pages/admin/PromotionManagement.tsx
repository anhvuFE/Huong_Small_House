import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  InputBase,
  Switch,
  LinearProgress,
} from '@mui/material';
import {
  Add,
  Search,
  Visibility,
  Edit,
  Delete,
  LocalOffer,
  CheckCircle,
  Timer,
  Groups,
  Percent,
  AttachMoney,
} from '@mui/icons-material';
import { Button, Select as AntSelect, Input, Modal } from 'antd';
import { promotionApi } from '../../services/promotionApi';
import type { CreatePromotionPayload, UpdatePromotionPayload } from '../../services/promotionApi';
import { useAuthStore } from '../../store/useAuthStore';
import { mockPromotionCodes } from '../../data/adminData';
import type { PromotionCode } from '../../types/admin';
import { Loader } from '../../components/common/Loader';
import { useToast } from '../../components/common/Toast';
import { Pagination } from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';

const { TextArea } = Input;

const palette = {
  accent: '#7daf18',
  accentLight: '#EDF7D5',
  textPrimary: '#1A2332',
  textSecondary: '#5A6B7F',
  textMuted: '#8D99A8',
  border: '#E8ECF0',
  background: '#FAFBFC',
};

const formatDateInput = (date: Date) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getDefaultFormData = () => {
  const today = new Date();
  const end = new Date();
  end.setDate(today.getDate() + 30);
  return { name: '', code: '', type: 'PERCENTAGE' as PromotionCode['type'], value: 0, minOrderValue: '', maxDiscount: '', usageLimit: '', startDate: formatDateInput(today), endDate: formatDateInput(end), description: '' };
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const getPromoStatus = (p: PromotionCode) => {
  const now = new Date();
  if (!p.isActive) return { text: 'Tạm dừng', color: '#6B7280', bg: '#F9FAFB' };
  if (now > p.endDate) return { text: 'Hết hạn', color: '#EF4444', bg: '#FEF2F2' };
  if (p.startDate && now < p.startDate) return { text: 'Chưa bắt đầu', color: '#F59E0B', bg: '#FFFBEB' };
  return { text: 'Đang hoạt động', color: '#10B981', bg: '#ECFDF5' };
};

const statusFilterOpts = [
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Tạm dừng' },
  { value: 'expired', label: 'Đã hết hạn' },
];

const typeFilterOpts = [
  { value: 'PERCENTAGE', label: 'Giảm theo %' },
  { value: 'FIXED_AMOUNT', label: 'Giảm cố định' },
];

const quickStats = [
  { key: 'total', label: 'Tổng mã KM', icon: <LocalOffer sx={{ fontSize: 22 }} />, color: '#1565C0', bg: '#E3F2FD' },
  { key: 'active', label: 'Đang hoạt động', icon: <CheckCircle sx={{ fontSize: 22 }} />, color: '#2E7D32', bg: '#E8F5E9' },
  { key: 'expired', label: 'Đã hết hạn', icon: <Timer sx={{ fontSize: 22 }} />, color: '#EF4444', bg: '#FEF2F2' },
  { key: 'totalUsage', label: 'Tổng lượt dùng', icon: <Groups sx={{ fontSize: 22 }} />, color: '#7B1FA2', bg: '#F3E5F5' },
];

const inputStyle = { borderRadius: 10, height: 40, fontFamily: 'Inter, system-ui, sans-serif' };

export const PromotionManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [promotions, setPromotions] = useState<PromotionCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create' | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionCode | null>(null);
  const [formData, setFormData] = useState(getDefaultFormData());
  const [savingPromotion, setSavingPromotion] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PromotionCode | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const userRole = useAuthStore((s) => s.user?.role);
  const { showToast } = useToast();
  const { currentPage, pageSize, handlePageChange, handlePageSizeChange, getPaginatedData } = usePagination(1, 10);

  const fetchPromotions = useCallback(async () => {
    try { setIsLoading(true); setError(''); setPromotions(await promotionApi.listPromotions()); }
    catch { setError('Không thể tải khuyến mãi.'); setPromotions(mockPromotionCodes); }
    finally { setIsLoading(false); }
  }, []);

  const hydrateForm = (p: PromotionCode) => {
    setFormData({ name: p.name, code: p.code, type: p.type, value: p.value, minOrderValue: p.minOrderValue?.toString() ?? '', maxDiscount: p.maxDiscount?.toString() ?? '', usageLimit: p.usageLimit?.toString() ?? '', startDate: formatDateInput(p.startDate), endDate: formatDateInput(p.endDate), description: p.description ?? '' });
  };

  const autoFillMaxDiscount = useCallback((t: PromotionCode['type'], v: string | number, m: string | number) => {
    const val = Number(v), min = Number(m);
    if (!m || isNaN(min) || isNaN(val)) return;
    setFormData((prev) => ({ ...prev, maxDiscount: t === 'PERCENTAGE' ? Math.round((min * val) / 100).toString() : val.toString() }));
  }, []);

  useEffect(() => {
    if (userRole !== 'ADMIN') { setError('Không có quyền truy cập.'); setIsLoading(false); return; }
    fetchPromotions();
  }, [userRole, fetchPromotions]);

  const filteredPromotions = useMemo(() => {
    return promotions.filter((p) => {
      const q = searchTerm.toLowerCase();
      const matchSearch = p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
      let matchStatus = true;
      if (statusFilter === 'active') matchStatus = p.isActive && new Date() <= p.endDate;
      else if (statusFilter === 'inactive') matchStatus = !p.isActive;
      else if (statusFilter === 'expired') matchStatus = new Date() > p.endDate;
      return matchSearch && matchStatus && (!typeFilter || p.type === typeFilter);
    });
  }, [promotions, searchTerm, statusFilter, typeFilter]);

  const paginatedData = useMemo(() => getPaginatedData(filteredPromotions), [filteredPromotions, getPaginatedData]);

  const stats = useMemo(() => {
    const total = promotions.length;
    const active = promotions.filter((p) => p.isActive && new Date() <= p.endDate).length;
    const expired = promotions.filter((p) => new Date() > p.endDate).length;
    const totalUsage = promotions.reduce((s, p) => s + (p.usedCount || 0), 0);
    return { total, active, expired, totalUsage } as Record<string, number>;
  }, [promotions]);

  const handleToggleStatus = async (promo: PromotionCode) => {
    if (!promo.id) return;
    setUpdatingId(promo.id);
    try {
      const updated = await promotionApi.updateStatus(promo.id, !promo.isActive);
      setPromotions((prev) => prev.map((i) => i.id === promo.id ? updated : i));
      showToast({ title: !promo.isActive ? 'Đã bật' : 'Đã tạm dừng', variant: 'success' });
    } catch { showToast({ title: 'Cập nhật thất bại', variant: 'error' }); }
    finally { setUpdatingId(null); }
  };

  const handleViewDetail = async (promo: PromotionCode) => {
    if (!promo.id) return;
    setModalMode('view');
    try { const d = await promotionApi.getById(promo.id); setSelectedPromotion(d); hydrateForm(d); }
    catch { showToast({ title: 'Không thể tải chi tiết', variant: 'error' }); setModalMode(null); }
  };

  const handleEditPrepare = async (promo: PromotionCode) => {
    if (!promo.id) return;
    setModalMode('edit');
    try { const d = await promotionApi.getById(promo.id); setSelectedPromotion(d); hydrateForm(d); }
    catch { showToast({ title: 'Không thể tải dữ liệu', variant: 'error' }); setModalMode(null); }
  };

  const closeModal = () => { setSelectedPromotion(null); setModalMode(null); setSavingPromotion(false); };

  const handleSubmitPromotion = async () => {
    if (modalMode === 'view') return;
    setSavingPromotion(true);
    try {
      const payload: CreatePromotionPayload & UpdatePromotionPayload = {
        name: formData.name.trim() || formData.code.trim(), description: formData.description, code: formData.code.trim(),
        type: formData.type === 'PERCENTAGE' ? 'percent' : 'fixed', value: Number(formData.value) || 0,
        minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : undefined,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        validFrom: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        validUntil: formData.endDate ? new Date(formData.endDate).toISOString() : new Date().toISOString(),
      };
      if (modalMode === 'create') {
        await promotionApi.create(payload); fetchPromotions(); closeModal();
        showToast({ title: 'Đã tạo khuyến mãi', variant: 'success' });
      } else if (selectedPromotion?.id) {
        const updated = await promotionApi.update(selectedPromotion.id, payload);
        setSelectedPromotion(updated); hydrateForm(updated); fetchPromotions(); setModalMode('view');
        showToast({ title: 'Đã cập nhật', variant: 'success' });
      }
    } catch { showToast({ title: 'Lưu thất bại', variant: 'error' }); }
    finally { setSavingPromotion(false); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeletingId(deleteTarget.id);
    try {
      await promotionApi.delete(deleteTarget.id);
      setPromotions((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      showToast({ title: 'Đã xóa', variant: 'success' }); setDeleteTarget(null);
    } catch { showToast({ title: 'Xóa thất bại', variant: 'error' }); }
    finally { setDeletingId(null); }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: palette.textPrimary }}>Quản lý khuyến mãi</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>{promotions.length} mã khuyến mãi</Typography>
        </Box>
        <Button type="primary" icon={<Add style={{ fontSize: 18 }} />} onClick={() => { setFormData(getDefaultFormData()); setSelectedPromotion(null); setModalMode('create'); }} style={{ backgroundColor: palette.accent, borderColor: palette.accent, height: 40, borderRadius: 10, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}>
          Tạo mã KM
        </Button>
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
              <InputBase value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm theo mã hoặc tên..." sx={{ flex: 1, fontSize: '0.88rem', py: 0.8 }} />
            </Box>
            <AntSelect value={statusFilter || undefined} onChange={(v) => setStatusFilter(v || '')} allowClear placeholder="Trạng thái" options={statusFilterOpts} style={{ width: 170, height: 40, fontFamily: 'Inter, system-ui, sans-serif' }} />
            <AntSelect value={typeFilter || undefined} onChange={(v) => setTypeFilter(v || '')} allowClear placeholder="Loại" options={typeFilterOpts} style={{ width: 160, height: 40, fontFamily: 'Inter, system-ui, sans-serif' }} />
          </Box>
        </Paper>
      )}

      {/* Table */}
      {!isLoading && (
        <Paper elevation={0} sx={{ border: `1px solid ${palette.border}`, borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 850 }}>
              <Box component="thead">
                <Box component="tr" sx={{ bgcolor: palette.background }}>
                  {['Mã khuyến mãi', 'Loại & Giá trị', 'Sử dụng', 'Trạng thái', 'Bật/Tắt', ''].map((h) => (
                    <Box key={h} component="th" sx={{ py: 1.5, px: 2, textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {paginatedData.items.map((promo) => {
                  const s = getPromoStatus(promo);
                  const usagePct = promo.usageLimit ? Math.round((promo.usedCount / promo.usageLimit) * 100) : null;
                  return (
                    <Box key={promo.id} component="tr" sx={{ borderBottom: `1px solid ${palette.border}`, '&:hover': { bgcolor: palette.background }, transition: 'background 0.15s' }}>
                      <Box component="td" sx={{ py: 1.5, px: 2 }}>
                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: palette.accent, fontFamily: 'monospace' }}>{promo.code}</Typography>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary }}>{promo.name}</Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: palette.textMuted }}>
                          {promo.startDate.toLocaleDateString('vi-VN')} - {promo.endDate.toLocaleDateString('vi-VN')}
                        </Typography>
                      </Box>
                      <Box component="td" sx={{ py: 1.5, px: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: promo.type === 'PERCENTAGE' ? '#E3F2FD' : '#E8F5E9', color: promo.type === 'PERCENTAGE' ? '#1565C0' : '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {promo.type === 'PERCENTAGE' ? <Percent sx={{ fontSize: 15 }} /> : <AttachMoney sx={{ fontSize: 15 }} />}
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: palette.textPrimary }}>
                              {promo.type === 'PERCENTAGE' ? `${promo.value}%` : formatCurrency(promo.value)}
                            </Typography>
                            {promo.maxDiscount && <Typography sx={{ fontSize: '0.7rem', color: palette.textMuted }}>Tối đa {formatCurrency(promo.maxDiscount)}</Typography>}
                          </Box>
                        </Box>
                      </Box>
                      <Box component="td" sx={{ py: 1.5, px: 2, minWidth: 120 }}>
                        <Typography sx={{ fontSize: '0.84rem', fontWeight: 500, color: palette.textPrimary }}>
                          {promo.usedCount}{promo.usageLimit ? ` / ${promo.usageLimit}` : ''}
                        </Typography>
                        {usagePct !== null && (
                          <Box sx={{ mt: 0.5 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(usagePct, 100)}
                              sx={{
                                height: 5, borderRadius: 3,
                                bgcolor: '#E0E0E0',
                                '& .MuiLinearProgress-bar': { bgcolor: usagePct >= 90 ? '#EF4444' : usagePct >= 70 ? '#F59E0B' : '#10B981', borderRadius: 3 },
                              }}
                            />
                            <Typography sx={{ fontSize: '0.68rem', color: palette.textMuted, mt: 0.3 }}>{usagePct}%</Typography>
                          </Box>
                        )}
                      </Box>
                      <Box component="td" sx={{ py: 1.5, px: 2 }}>
                        <Chip label={s.text} size="small" sx={{ bgcolor: s.bg, color: s.color, fontWeight: 600, fontSize: '0.7rem', height: 24 }} />
                      </Box>
                      <Box component="td" sx={{ py: 1.5, px: 2 }}>
                        <Switch
                          checked={promo.isActive}
                          onChange={() => handleToggleStatus(promo)}
                          disabled={updatingId === promo.id}
                          size="small"
                          sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: palette.accent }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: palette.accent } }}
                        />
                      </Box>
                      <Box component="td" sx={{ py: 1.5, px: 2 }}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton size="small" onClick={() => handleViewDetail(promo)} sx={{ color: palette.textMuted, '&:hover': { bgcolor: '#E3F2FD', color: '#1565C0' } }}><Visibility sx={{ fontSize: 18 }} /></IconButton>
                          <IconButton size="small" onClick={() => handleEditPrepare(promo)} sx={{ color: palette.textMuted, '&:hover': { bgcolor: '#E8F5E9', color: '#2E7D32' } }}><Edit sx={{ fontSize: 18 }} /></IconButton>
                          <IconButton size="small" onClick={() => setDeleteTarget(promo)} sx={{ color: palette.textMuted, '&:hover': { bgcolor: '#FEF2F2', color: '#EF4444' } }}><Delete sx={{ fontSize: 18 }} /></IconButton>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>

          {paginatedData.totalItems === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <LocalOffer sx={{ fontSize: 48, color: palette.border, mb: 1.5 }} />
              <Typography sx={{ fontWeight: 600, color: palette.textPrimary }}>Không tìm thấy mã khuyến mãi</Typography>
            </Box>
          )}
        </Paper>
      )}

      {!isLoading && filteredPromotions.length > 0 && (
        <Pagination currentPage={currentPage} totalPages={paginatedData.totalPages} totalItems={paginatedData.totalItems} itemsPerPage={pageSize} onPageChange={handlePageChange} showPageSizeSelect onPageSizeChange={handlePageSizeChange} />
      )}

      {/* View/Edit/Create Modal */}
      <Modal
        open={!!modalMode}
        onCancel={closeModal}
        title={modalMode === 'view' ? 'Chi tiết khuyến mãi' : modalMode === 'edit' ? 'Chỉnh sửa khuyến mãi' : 'Tạo khuyến mãi mới'}
        footer={null}
        width={560}
        centered
      >
        {modalMode === 'view' && selectedPromotion ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {[
              ['Mã', <Typography key="code" sx={{ fontFamily: 'monospace', fontWeight: 700, color: palette.accent }}>{selectedPromotion.code}</Typography>],
              ['Loại & giá trị', `${selectedPromotion.type === 'PERCENTAGE' ? `${selectedPromotion.value}%` : formatCurrency(selectedPromotion.value)}${selectedPromotion.maxDiscount ? ` (tối đa ${formatCurrency(selectedPromotion.maxDiscount)})` : ''}`],
              ...(selectedPromotion.minOrderValue ? [['Đơn tối thiểu', formatCurrency(selectedPromotion.minOrderValue)]] : []),
              ['Thời gian', `${selectedPromotion.startDate.toLocaleDateString('vi-VN')} - ${selectedPromotion.endDate.toLocaleDateString('vi-VN')}`],
              ['Trạng thái', selectedPromotion.isActive ? 'Đang hoạt động' : 'Tạm dừng'],
              ['Mô tả', selectedPromotion.description || 'Chưa có mô tả'],
            ].map(([label, value], i) => (
              <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>{label as string}</Typography>
                {typeof value === 'string' ? <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: palette.textPrimary }}>{value}</Typography> : value}
              </Box>
            ))}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
              <Button onClick={closeModal} style={{ height: 40, borderRadius: 10, fontFamily: 'Inter, system-ui, sans-serif' }}>Đóng</Button>
              <Button type="primary" onClick={() => setModalMode('edit')} style={{ backgroundColor: palette.accent, borderColor: palette.accent, height: 40, borderRadius: 10, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}>Chỉnh sửa</Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.5 }}>Tên</Typography>
                <Input value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} style={inputStyle} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.5 }}>Mã</Typography>
                <Input value={formData.code} onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }))} style={inputStyle} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.5 }}>Loại</Typography>
                <AntSelect value={formData.type} onChange={(v) => { setFormData((p) => ({ ...p, type: v })); autoFillMaxDiscount(v, formData.value, formData.minOrderValue); }} options={[{ value: 'PERCENTAGE', label: 'Giảm theo %' }, { value: 'FIXED_AMOUNT', label: 'Giảm cố định' }]} style={{ width: '100%', height: 40, fontFamily: 'Inter, system-ui, sans-serif' }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.5 }}>Giá trị</Typography>
                <Input type="number" min={0} value={formData.value} onChange={(e) => { setFormData((p) => ({ ...p, value: Number(e.target.value) })); autoFillMaxDiscount(formData.type, e.target.value, formData.minOrderValue); }} style={inputStyle} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.5 }}>Đơn tối thiểu</Typography>
                <Input type="number" min={0} value={formData.minOrderValue} onChange={(e) => { setFormData((p) => ({ ...p, minOrderValue: e.target.value })); autoFillMaxDiscount(formData.type, formData.value, e.target.value); }} style={inputStyle} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.5 }}>Giảm tối đa</Typography>
                <Input type="number" min={0} value={formData.maxDiscount} onChange={(e) => setFormData((p) => ({ ...p, maxDiscount: e.target.value }))} style={inputStyle} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.5 }}>Ngày bắt đầu</Typography>
                <Input type="date" value={formData.startDate} onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))} style={inputStyle} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.5 }}>Ngày kết thúc</Typography>
                <Input type="date" value={formData.endDate} onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value }))} style={inputStyle} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.5 }}>Giới hạn lượt</Typography>
                <Input type="number" min={0} value={formData.usageLimit} onChange={(e) => setFormData((p) => ({ ...p, usageLimit: e.target.value }))} style={inputStyle} />
              </Box>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.5 }}>Mô tả</Typography>
              <TextArea rows={3} value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} style={{ borderRadius: 10, fontFamily: 'Inter, system-ui, sans-serif' }} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
              <Button onClick={closeModal} style={{ height: 40, borderRadius: 10, fontFamily: 'Inter, system-ui, sans-serif' }}>Hủy</Button>
              <Button type="primary" loading={savingPromotion} onClick={handleSubmitPromotion} style={{ backgroundColor: palette.accent, borderColor: palette.accent, height: 40, borderRadius: 10, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}>
                {savingPromotion ? 'Đang lưu...' : modalMode === 'create' ? 'Tạo' : 'Lưu'}
              </Button>
            </Box>
          </Box>
        )}
      </Modal>

      {/* Delete */}
      <Modal open={!!deleteTarget} onCancel={() => setDeleteTarget(null)} title="Xóa khuyến mãi" footer={null} width={440} centered>
        <Typography sx={{ fontSize: '0.9rem', color: palette.textSecondary, py: 2 }}>
          Xóa mã &quot;{deleteTarget?.code}&quot;? Hành động không thể hoàn tác.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={!!deletingId} style={{ height: 40, borderRadius: 10, fontFamily: 'Inter, system-ui, sans-serif' }}>Hủy</Button>
          <Button type="primary" danger loading={!!deletingId} onClick={confirmDelete} style={{ height: 40, borderRadius: 10, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}>Xóa</Button>
        </Box>
      </Modal>
    </Box>
  );
};
