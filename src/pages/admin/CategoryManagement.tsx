import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  InputBase,
  Switch,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  Category,
  Inventory2,
  CheckCircle,
  BarChart,
} from '@mui/icons-material';
import { Button, Input, Modal } from 'antd';
import { productApi } from '../../services/productApi';
import type { Category as CategoryType } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';
import { Loader } from '../../components/common/Loader';
import { useToast } from '../../components/common/Toast';
import { palette } from '../../theme';

const { TextArea } = Input;


const defaultFormState = { name: '', nameEn: '', description: '', icon: '', isActive: true };

const statCards = [
  { key: 'total', label: 'Tổng danh mục', icon: <Category sx={{ fontSize: 22 }} />, color: '#1565C0', bg: '#E3F2FD' },
  { key: 'active', label: 'Đang hoạt động', icon: <CheckCircle sx={{ fontSize: 22 }} />, color: '#2E7D32', bg: '#E8F5E9' },
  { key: 'totalProducts', label: 'Tổng sản phẩm', icon: <Inventory2 sx={{ fontSize: 22 }} />, color: '#7B1FA2', bg: '#F3E5F5' },
  { key: 'avgProducts', label: 'TB SP/danh mục', icon: <BarChart sx={{ fontSize: 22 }} />, color: '#E65100', bg: '#FFF3E0' },
];

export const CategoryManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(null);
  const [formData, setFormData] = useState({ ...defaultFormState });
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [productCounts, setProductCounts] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [viewCategory, setViewCategory] = useState<CategoryType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryType | null>(null);
  const userRole = useAuthStore((state) => state.user?.role);
  const { showToast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        setStatusMessage('');
        const [catList, prodList] = await Promise.all([productApi.listCategories('admin'), productApi.listProducts()]);
        const counts: Record<number, number> = {};
        prodList.forEach((p) => { if (p.categoryId != null) counts[p.categoryId] = (counts[p.categoryId] ?? 0) + 1; });
        setProductCounts(counts);
        setCategories(catList.map((c) => ({ ...c, productCount: c.productCount ?? counts[c.categoryId] ?? 0 })));
      } catch { setStatusMessage('Không thể tải danh mục.'); } finally { setIsLoading(false); }
    };
    if (userRole !== 'ADMIN') { setStatusMessage('Chỉ admin mới có thể quản lý danh mục.'); setIsLoading(false); return; }
    fetch();
  }, [userRole]);

  const filteredCategories = useMemo(() => {
    return categories
      .filter((c) => (c.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) || (c.description ?? '').toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.name ?? '').localeCompare(b.name ?? ''));
  }, [categories, searchTerm]);

  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((c) => c.isActive !== false).length;
    const totalProducts = categories.reduce((s, c) => s + (c.productCount ?? 0), 0);
    const avgProducts = total ? Math.round(totalProducts / total) : 0;
    return { total, active, totalProducts, avgProducts } as Record<string, number>;
  }, [categories]);

  const handleAddCategory = () => { setFormData({ ...defaultFormState }); setEditingCategory(null); setShowAddModal(true); };
  const handleEditCategory = (cat: CategoryType) => {
    setFormData({ name: cat.name, nameEn: cat.nameEn ?? '', description: cat.description ?? '', icon: cat.icon ?? '', isActive: cat.isActive ?? true });
    setEditingCategory(cat);
    setShowAddModal(true);
  };

  const handleSaveCategory = async () => {
    if (!formData.name.trim() || userRole !== 'ADMIN') return;
    try {
      setIsSubmitting(true);
      if (editingCategory) {
        const updated = await productApi.updateCategory(editingCategory.categoryId ?? Number(editingCategory.id), {
          name: formData.name, nameEn: formData.nameEn, description: formData.description, icon: formData.icon, isActive: formData.isActive,
        });
        setCategories((prev) => prev.map((c) => c.id === editingCategory.id ? { ...updated, productCount: updated.productCount ?? productCounts[updated.categoryId] ?? c.productCount } : c));
        showToast({ title: 'Đã cập nhật danh mục', variant: 'success' });
      } else {
        const cat = await productApi.createCategory({ name: formData.name, slug: formData.nameEn });
        setCategories((prev) => [...prev, { ...cat, productCount: cat.productCount ?? 0 }]);
        if (cat.categoryId !== undefined) setProductCounts((prev) => ({ ...prev, [cat.categoryId]: 0 }));
        showToast({ title: 'Đã tạo danh mục', variant: 'success' });
      }
      setShowAddModal(false); setEditingCategory(null); setFormData({ ...defaultFormState }); setStatusMessage('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể lưu danh mục.';
      showToast({ title: 'Lưu thất bại', message: msg, variant: 'error' });
    } finally { setIsSubmitting(false); }
  };

  const toggleStatus = (id: string) => {
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const handleViewCategory = async (cat: CategoryType) => {
    try {
      const detail = await productApi.getCategory(cat.categoryId ?? Number(cat.id));
      setViewCategory({ ...detail, productCount: detail.productCount ?? productCounts[detail.categoryId] ?? cat.productCount });
    } catch { showToast({ title: 'Không thể tải chi tiết', variant: 'error' }); }
  };

  const inputStyle = { borderRadius: 10, height: 40, fontFamily: 'Inter, system-ui, sans-serif' };

  if (isLoading) return <Paper elevation={0} sx={{ p: 4, border: `1px solid ${palette.border}`, borderRadius: 3, display: 'flex', justifyContent: 'center' }}><Loader /></Paper>;
  if (userRole !== 'ADMIN') return <Paper elevation={0} sx={{ p: 4, border: `1px solid ${palette.border}`, borderRadius: 3, textAlign: 'center', color: '#C62828' }}>Bạn không có quyền truy cập.</Paper>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: palette.textPrimary }}>Quản lý danh mục</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>{categories.length} danh mục</Typography>
        </Box>
        <Button type="primary" icon={<Add style={{ fontSize: 18 }} />} onClick={handleAddCategory} style={{ backgroundColor: palette.accent, borderColor: palette.accent, height: 40, borderRadius: 10, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}>
          Thêm danh mục
        </Button>
      </Box>

      {statusMessage && (
        <Paper elevation={0} sx={{ p: 2, border: '1px solid #90CAF9', bgcolor: '#E3F2FD', borderRadius: 2 }}>
          <Typography sx={{ color: '#1565C0', fontSize: '0.88rem' }}>{statusMessage}</Typography>
        </Paper>
      )}

      {/* Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
        {statCards.map((s) => (
          <Paper key={s.key} elevation={0} sx={{ p: 2, border: `1px solid ${palette.border}`, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 42, height: 42, borderRadius: 2.5, bgcolor: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</Box>
            <Box>
              <Typography sx={{ fontSize: '0.75rem', color: palette.textMuted }}>{s.label}</Typography>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: palette.textPrimary }}>{stats[s.key]}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Search */}
      <Paper elevation={0} sx={{ p: 2, border: `1px solid ${palette.border}`, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: palette.background, borderRadius: 2.5, border: `1px solid ${palette.border}`, px: 1.5, maxWidth: 400, '&:focus-within': { borderColor: palette.accent } }}>
          <Search sx={{ fontSize: 20, color: palette.textMuted, mr: 1 }} />
          <InputBase value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm kiếm danh mục..." sx={{ flex: 1, fontSize: '0.88rem', py: 0.8 }} />
        </Box>
      </Paper>

      {/* Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
        {filteredCategories.map((cat) => (
          <Paper
            key={cat.id}
            elevation={0}
            sx={{
              p: 2.5,
              border: `1px solid ${palette.border}`,
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.06)', borderColor: palette.accent },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: palette.accentLight, color: palette.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Category sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: palette.textPrimary }}>{cat.name}</Typography>
                  {cat.nameEn && <Typography sx={{ fontSize: '0.75rem', color: palette.textMuted }}>{cat.nameEn}</Typography>}
                </Box>
              </Box>
              <Switch checked={cat.isActive !== false} onChange={() => toggleStatus(cat.id)} size="small" sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: palette.accent }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: palette.accent } }} />
            </Box>

            <Typography sx={{ fontSize: '0.82rem', color: palette.textMuted, lineHeight: 1.5, mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {cat.description || 'Chưa có mô tả'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Chip label={`${cat.productCount ?? 0} sản phẩm`} size="small" sx={{ bgcolor: palette.accentLight, color: palette.accent, fontWeight: 600, fontSize: '0.72rem', height: 24 }} />
              <Typography sx={{ fontSize: '0.7rem', color: palette.textMuted }}>
                {cat.updatedAt ? cat.updatedAt.toLocaleDateString('vi-VN') : '--/--/----'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, mt: 1.5, pt: 1.5, borderTop: `1px solid ${palette.border}` }}>
              <IconButton size="small" onClick={() => handleViewCategory(cat)} sx={{ color: palette.textMuted, '&:hover': { bgcolor: '#E3F2FD', color: '#1565C0' } }}>
                <Visibility sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton size="small" onClick={() => handleEditCategory(cat)} sx={{ color: palette.textMuted, '&:hover': { bgcolor: '#E8F5E9', color: '#2E7D32' } }}>
                <Edit sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton size="small" onClick={() => setDeleteTarget(cat)} sx={{ color: palette.textMuted, '&:hover': { bgcolor: '#FEF2F2', color: '#EF4444' } }}>
                <Delete sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Paper>
        ))}

        {!filteredCategories.length && (
          <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 6 }}>
            <Category sx={{ fontSize: 48, color: palette.border, mb: 1.5 }} />
            <Typography sx={{ fontWeight: 600, color: palette.textPrimary }}>Không tìm thấy danh mục</Typography>
          </Box>
        )}
      </Box>

      {/* Add/Edit Modal */}
      <Modal open={showAddModal} onCancel={() => { setShowAddModal(false); setEditingCategory(null); }} title={editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'} footer={null} width={480} centered>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <Box>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.5 }}>Tên danh mục (Tiếng Việt) *</Typography>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ví dụ: Vitamin" style={inputStyle} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.5 }}>Tên (Tiếng Anh)</Typography>
            <Input value={formData.nameEn} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} placeholder="Ví dụ: Vitamins" style={inputStyle} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.5 }}>Mô tả</Typography>
            <TextArea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Mô tả ngắn..." style={{ borderRadius: 10, fontFamily: 'Inter, system-ui, sans-serif' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.5 }}>Icon</Typography>
            <Input value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} placeholder="Tên icon hoặc URL" style={inputStyle} />
          </Box>
          <Paper elevation={0} sx={{ p: 2, bgcolor: palette.background, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: palette.textPrimary }}>Kích hoạt danh mục</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: palette.textMuted }}>Hiển thị trên website</Typography>
            </Box>
            <Switch checked={formData.isActive} onChange={() => setFormData({ ...formData, isActive: !formData.isActive })} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: palette.accent }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: palette.accent } }} />
          </Paper>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
            <Button onClick={() => { setShowAddModal(false); setEditingCategory(null); }} style={{ height: 40, borderRadius: 10, fontFamily: 'Inter, system-ui, sans-serif' }}>Hủy</Button>
            <Button type="primary" loading={isSubmitting} onClick={handleSaveCategory} style={{ backgroundColor: palette.accent, borderColor: palette.accent, height: 40, borderRadius: 10, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}>
              {isSubmitting ? 'Đang lưu...' : editingCategory ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* View Modal */}
      <Modal open={!!viewCategory} onCancel={() => setViewCategory(null)} title="Chi tiết danh mục" footer={<Button onClick={() => setViewCategory(null)} style={{ borderRadius: 10 }}>Đóng</Button>} width={480} centered>
        {viewCategory && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: palette.accentLight, color: palette.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Category sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: '1.05rem', color: palette.textPrimary }}>{viewCategory.name}</Typography>
                {viewCategory.nameEn && <Typography sx={{ fontSize: '0.8rem', color: palette.textMuted }}>{viewCategory.nameEn}</Typography>}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Chip label={viewCategory.isActive ? 'Đang bật' : 'Đang tắt'} size="small" sx={{ bgcolor: viewCategory.isActive ? '#E8F5E9' : '#F5F5F5', color: viewCategory.isActive ? '#2E7D32' : '#757575', fontWeight: 600 }} />
              <Chip label={`${viewCategory.productCount ?? 0} sản phẩm`} size="small" sx={{ bgcolor: palette.accentLight, color: palette.accent, fontWeight: 600 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.78rem', color: palette.textMuted, mb: 0.3 }}>Mô tả</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: palette.textPrimary }}>{viewCategory.description || 'Chưa có mô tả'}</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.75rem', color: palette.textMuted }}>
              Cập nhật: {viewCategory.updatedAt ? viewCategory.updatedAt.toLocaleDateString('vi-VN') : '--/--/----'}
            </Typography>
          </Box>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteTarget} onCancel={() => setDeleteTarget(null)} title="Xóa danh mục" footer={null} width={440} centered>
        <Typography sx={{ fontSize: '0.9rem', color: palette.textSecondary, py: 2 }}>
          Bạn chắc chắn xóa danh mục &quot;{deleteTarget?.name}&quot;? Hành động này không thể hoàn tác.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button onClick={() => setDeleteTarget(null)} style={{ height: 40, borderRadius: 10, fontFamily: 'Inter, system-ui, sans-serif' }}>Hủy</Button>
          <Button type="primary" danger onClick={async () => {
            if (!deleteTarget?.categoryId) return;
            try {
              await productApi.deleteCategory(deleteTarget.categoryId);
              setCategories((prev) => prev.filter((c) => c.categoryId !== deleteTarget.categoryId));
              setProductCounts((prev) => { const n = { ...prev }; delete n[deleteTarget.categoryId]; return n; });
              showToast({ title: 'Đã xóa danh mục', variant: 'error' });
            } catch (err) {
              showToast({ title: 'Xóa thất bại', message: err instanceof Error ? err.message : '', variant: 'error' });
            } finally { setDeleteTarget(null); }
          }} style={{ height: 40, borderRadius: 10, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}>Xóa</Button>
        </Box>
      </Modal>
    </Box>
  );
};
