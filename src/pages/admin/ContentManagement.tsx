import React, { useMemo, useEffect, useState } from 'react';
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
  Visibility,
  Edit,
  Delete,
  Article,
  Public,
  Image,
  Campaign,
  CheckCircle,
  EditNote,
  RemoveRedEye,
} from '@mui/icons-material';
import { Button, Select as AntSelect, Input, Modal } from 'antd';
import { contentApi } from '../../services/contentApi';
import { getErrorMessage } from '../../utils/error';
import type { ContentItem } from '../../types';
import { Loader } from '../../components/common/Loader';
import { useToast } from '../../components/common/Toast';
import { Pagination } from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { palette } from '../../theme';

const { TextArea } = Input;


const typeConfig: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  PAGE: { label: 'Trang web', icon: <Public sx={{ fontSize: 18 }} />, color: '#1565C0', bg: '#E3F2FD' },
  BLOG: { label: 'Bài viết', icon: <Article sx={{ fontSize: 18 }} />, color: '#2E7D32', bg: '#E8F5E9' },
  BANNER: { label: 'Banner', icon: <Image sx={{ fontSize: 18 }} />, color: '#E65100', bg: '#FFF3E0' },
  ANNOUNCEMENT: { label: 'Thông báo', icon: <Campaign sx={{ fontSize: 18 }} />, color: '#7B1FA2', bg: '#F3E5F5' },
};

const statusChip: Record<string, { label: string; color: string; bg: string }> = {
  PUBLISHED: { label: 'Đã xuất bản', color: '#10B981', bg: '#ECFDF5' },
  DRAFT: { label: 'Bản nháp', color: '#F59E0B', bg: '#FFFBEB' },
  ARCHIVED: { label: 'Lưu trữ', color: '#6B7280', bg: '#F9FAFB' },
};

const typeOpts = [
  { value: 'PAGE', label: 'Trang web' },
  { value: 'BLOG', label: 'Bài viết' },
  { value: 'BANNER', label: 'Banner' },
  { value: 'ANNOUNCEMENT', label: 'Thông báo' },
];

const statusOpts = [
  { value: 'PUBLISHED', label: 'Đã xuất bản' },
  { value: 'DRAFT', label: 'Bản nháp' },
  { value: 'ARCHIVED', label: 'Lưu trữ' },
];

const quickStats = [
  { key: 'total', label: 'Tổng nội dung', icon: <Article sx={{ fontSize: 22 }} />, color: '#1565C0', bg: '#E3F2FD' },
  { key: 'published', label: 'Đã xuất bản', icon: <CheckCircle sx={{ fontSize: 22 }} />, color: '#2E7D32', bg: '#E8F5E9' },
  { key: 'draft', label: 'Bản nháp', icon: <EditNote sx={{ fontSize: 22 }} />, color: '#F59E0B', bg: '#FFFBEB' },
  { key: 'totalViews', label: 'Tổng lượt xem', icon: <RemoveRedEye sx={{ fontSize: 22 }} />, color: '#7B1FA2', bg: '#F3E5F5' },
];

const inputStyle = { borderRadius: 10, height: 40, fontFamily: 'Inter, system-ui, sans-serif' };

export const ContentManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isWorking, setIsWorking] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', slug: '', excerpt: '', published: false, tagsText: '', body: '' });
  const [editError, setEditError] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null);
  const { showToast } = useToast();
  const { currentPage, pageSize, handlePageChange, handlePageSizeChange, getPaginatedData } = usePagination(1, 10);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true); setError('');
      try { setContent(await contentApi.listContent()); } catch (err) { setError(getErrorMessage(err, 'Không thể tải nội dung.')); } finally { setIsLoading(false); }
    };
    load();
  }, []);

  const filteredContent = useMemo(() => {
    return content.filter((c) => {
      const q = searchTerm.toLowerCase();
      return (c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)) && (!typeFilter || c.type === typeFilter) && (!statusFilter || c.status === statusFilter);
    });
  }, [content, searchTerm, typeFilter, statusFilter]);

  const paginatedData = useMemo(() => getPaginatedData(filteredContent), [filteredContent, getPaginatedData]);

  const stats = useMemo(() => {
    const total = content.length;
    const published = content.filter((c) => c.status === 'PUBLISHED').length;
    const draft = content.filter((c) => c.status === 'DRAFT').length;
    const totalViews = content.reduce((s, c) => s + (c.views || 0), 0);
    return { total, published, draft, totalViews } as Record<string, number>;
  }, [content]);

  const handleToggleActive = (id: string) => {
    const cur = content.find((c) => c.id === id);
    if (!cur) return;
    const next = !cur.published;
    setIsWorking(id);
    setContent((prev) => prev.map((i) => i.id === id ? { ...i, published: next, isActive: next, status: next ? 'PUBLISHED' : 'DRAFT' } : i));
    contentApi.updateContent(id, { published: next })
      .then((u) => { setContent((prev) => prev.map((i) => i.id === id ? u : i)); showToast({ title: next ? 'Đã bật' : 'Đã tắt', variant: 'success' }); })
      .catch(() => { setContent((prev) => prev.map((i) => i.id === id ? { ...i, published: !next, isActive: !next, status: !next ? 'PUBLISHED' : 'DRAFT' } : i)); showToast({ title: 'Cập nhật thất bại', variant: 'error' }); })
      .finally(() => setIsWorking(null));
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsWorking(deleteTarget.id);
    try { await contentApi.deleteContent(deleteTarget.id); setContent((prev) => prev.filter((i) => i.id !== deleteTarget.id)); showToast({ title: 'Đã xóa', variant: 'success' }); }
    catch { showToast({ title: 'Xóa thất bại', variant: 'error' }); }
    finally { setIsWorking(null); setDeleteTarget(null); }
  };

  const handleEdit = (item: ContentItem) => {
    setSelectedContent(item);
    setEditForm({ title: item.title, slug: item.slug, excerpt: item.excerpt || '', published: item.published ?? item.isActive, tagsText: item.tags?.join(', ') || '', body: item.body || '' });
    setEditError(''); setIsEditOpen(true);
  };

  const handleOpenCreate = () => {
    setSelectedContent(null);
    setEditForm({ title: '', slug: '', excerpt: '', published: false, tagsText: '', body: '' });
    setEditError('');
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.title.trim()) { setEditError('Tiêu đề không được để trống.'); return; }
    if (!editForm.body.trim()) { setEditError('Nội dung không được để trống.'); return; }
    setIsSavingEdit(true); setEditError('');
    const payload = {
      title: editForm.title, slug: editForm.slug, excerpt: editForm.excerpt, published: editForm.published,
      tags: editForm.tagsText.split(',').map((t) => t.trim()).filter(Boolean), body: editForm.body,
    };
    try {
      if (selectedContent) {
        const updated = await contentApi.updateContent(selectedContent.id, payload);
        setContent((prev) => prev.map((i) => i.id === selectedContent.id ? updated : i));
        showToast({ title: 'Đã lưu', variant: 'success' });
      } else {
        const created = await contentApi.createContent(payload);
        setContent((prev) => [created, ...prev]);
        showToast({ title: 'Đã tạo nội dung', variant: 'success' });
      }
      setIsEditOpen(false);
    } catch (err) { setEditError(getErrorMessage(err, 'Không thể lưu.')); }
    finally { setIsSavingEdit(false); }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: palette.textPrimary }}>Quản lý nội dung</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>{content.length} nội dung</Typography>
        </Box>
        <Button type="primary" onClick={handleOpenCreate} icon={<Add style={{ fontSize: 18 }} />} style={{ backgroundColor: palette.accent, borderColor: palette.accent, height: 40, borderRadius: 10, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}>
          Tạo nội dung
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
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: palette.textPrimary }}>{typeof stats[s.key] === 'number' && stats[s.key] > 999 ? stats[s.key].toLocaleString() : stats[s.key]}</Typography>
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
              <InputBase value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm theo tiêu đề hoặc slug..." sx={{ flex: 1, fontSize: '0.88rem', py: 0.8 }} />
            </Box>
            <AntSelect value={typeFilter || undefined} onChange={(v) => setTypeFilter(v || '')} allowClear placeholder="Loại" options={typeOpts} style={{ width: 160, height: 40, fontFamily: 'Inter, system-ui, sans-serif' }} />
            <AntSelect value={statusFilter || undefined} onChange={(v) => setStatusFilter(v || '')} allowClear placeholder="Trạng thái" options={statusOpts} style={{ width: 160, height: 40, fontFamily: 'Inter, system-ui, sans-serif' }} />
          </Box>
        </Paper>
      )}

      {/* Table */}
      {!isLoading && (
        <Paper elevation={0} sx={{ border: `1px solid ${palette.border}`, borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <Box component="thead">
                <Box component="tr" sx={{ bgcolor: palette.background }}>
                  {['Nội dung', 'Loại', 'Trạng thái', 'Lượt xem', 'Bật/Tắt', ''].map((h) => (
                    <Box key={h} component="th" sx={{ py: 1.5, px: 2, textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {paginatedData.items.map((item) => {
                  const tc = typeConfig[item.type] ?? typeConfig.BLOG;
                  const sc = statusChip[item.status] ?? statusChip.DRAFT;
                  return (
                    <Box key={item.id} component="tr" sx={{ borderBottom: `1px solid ${palette.border}`, '&:hover': { bgcolor: palette.background }, transition: 'background 0.15s' }}>
                      <Box component="td" sx={{ py: 1.5, px: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: tc.bg, color: tc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{tc.icon}</Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: '0.88rem', fontWeight: 500, color: palette.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>{item.title}</Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: palette.textMuted }}>{item.author} · {item.updatedAt.toLocaleDateString('vi-VN')}</Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box component="td" sx={{ py: 1.5, px: 2 }}>
                        <Chip label={tc.label} size="small" sx={{ bgcolor: tc.bg, color: tc.color, fontWeight: 600, fontSize: '0.7rem', height: 24 }} />
                      </Box>
                      <Box component="td" sx={{ py: 1.5, px: 2 }}>
                        <Chip label={sc.label} size="small" sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 600, fontSize: '0.7rem', height: 24 }} />
                      </Box>
                      <Box component="td" sx={{ py: 1.5, px: 2 }}>
                        <Typography sx={{ fontSize: '0.88rem', color: palette.textPrimary }}>{item.views.toLocaleString()}</Typography>
                      </Box>
                      <Box component="td" sx={{ py: 1.5, px: 2 }}>
                        <Switch checked={item.isActive} onChange={() => handleToggleActive(item.id)} disabled={isWorking === item.id} size="small" sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: palette.accent }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: palette.accent } }} />
                      </Box>
                      <Box component="td" sx={{ py: 1.5, px: 2 }}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton size="small" onClick={() => { setSelectedContent(item); setIsDetailOpen(true); }} sx={{ color: palette.textMuted, '&:hover': { bgcolor: '#E3F2FD', color: '#1565C0' } }}><Visibility sx={{ fontSize: 18 }} /></IconButton>
                          <IconButton size="small" onClick={() => handleEdit(item)} sx={{ color: palette.textMuted, '&:hover': { bgcolor: '#E8F5E9', color: '#2E7D32' } }}><Edit sx={{ fontSize: 18 }} /></IconButton>
                          <IconButton size="small" onClick={() => setDeleteTarget(item)} sx={{ color: palette.textMuted, '&:hover': { bgcolor: '#FEF2F2', color: '#EF4444' } }}><Delete sx={{ fontSize: 18 }} /></IconButton>
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
              <Article sx={{ fontSize: 48, color: palette.border, mb: 1.5 }} />
              <Typography sx={{ fontWeight: 600, color: palette.textPrimary }}>Không có nội dung nào</Typography>
            </Box>
          )}
        </Paper>
      )}

      {!isLoading && filteredContent.length > 0 && (
        <Pagination currentPage={currentPage} totalPages={paginatedData.totalPages} totalItems={paginatedData.totalItems} itemsPerPage={pageSize} onPageChange={handlePageChange} showPageSizeSelect onPageSizeChange={handlePageSizeChange} />
      )}

      {/* View Detail */}
      <Modal open={isDetailOpen} onCancel={() => setIsDetailOpen(false)} title={`Chi tiết: ${selectedContent?.title}`} footer={<Button onClick={() => setIsDetailOpen(false)} style={{ borderRadius: 10 }}>Đóng</Button>} width={640} centered>
        {selectedContent && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              {[
                ['Loại', typeConfig[selectedContent.type]?.label],
                ['Tác giả', selectedContent.author || '---'],
                ['Lượt xem', selectedContent.views?.toLocaleString()],
                ['Cập nhật', selectedContent.updatedAt?.toLocaleDateString('vi-VN')],
                ['Slug', selectedContent.slug],
              ].map(([label, value], i) => (
                <Box key={i}>
                  <Typography sx={{ fontSize: '0.75rem', color: palette.textMuted, mb: 0.3 }}>{label}</Typography>
                  <Typography sx={{ fontSize: '0.88rem', fontWeight: 500, color: palette.textPrimary }}>{value}</Typography>
                </Box>
              ))}
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.75rem', color: palette.textMuted, mb: 0.3 }}>Tóm tắt</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: palette.textPrimary }}>{selectedContent.excerpt || 'Chưa có'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={statusChip[selectedContent.status]?.label} size="small" sx={{ bgcolor: statusChip[selectedContent.status]?.bg, color: statusChip[selectedContent.status]?.color, fontWeight: 600 }} />
              <Chip label={selectedContent.isActive ? 'Đang bật' : 'Đang tắt'} size="small" sx={{ bgcolor: selectedContent.isActive ? '#ECFDF5' : '#F9FAFB', color: selectedContent.isActive ? '#10B981' : '#6B7280', fontWeight: 600 }} />
              {selectedContent.tags?.map((tag) => <Chip key={tag} label={`#${tag}`} size="small" sx={{ bgcolor: palette.background, color: palette.textSecondary, fontSize: '0.72rem' }} />)}
            </Box>
          </Box>
        )}
      </Modal>

      {/* Edit */}
      <Modal open={isEditOpen} onCancel={() => setIsEditOpen(false)} title={selectedContent ? `Chỉnh sửa: ${selectedContent.title}` : 'Tạo nội dung mới'} footer={null} width={640} centered>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.5 }}>Tiêu đề *</Typography>
              <Input value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} style={inputStyle} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.5 }}>Slug</Typography>
              <Input value={editForm.slug} onChange={(e) => setEditForm((p) => ({ ...p, slug: e.target.value }))} style={inputStyle} />
            </Box>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.5 }}>Tóm tắt</Typography>
            <TextArea rows={2} value={editForm.excerpt} onChange={(e) => setEditForm((p) => ({ ...p, excerpt: e.target.value }))} style={{ borderRadius: 10, fontFamily: 'Inter, system-ui, sans-serif' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.5 }}>Tags (phẩy ngăn cách)</Typography>
            <Input value={editForm.tagsText} onChange={(e) => setEditForm((p) => ({ ...p, tagsText: e.target.value }))} style={inputStyle} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.5 }}>Nội dung *</Typography>
            <TextArea rows={6} value={editForm.body} onChange={(e) => setEditForm((p) => ({ ...p, body: e.target.value }))} style={{ borderRadius: 10, fontFamily: 'Inter, system-ui, sans-serif' }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '0.85rem', color: palette.textPrimary }}>Xuất bản</Typography>
              <Switch checked={editForm.published} onChange={() => setEditForm((p) => ({ ...p, published: !p.published }))} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: palette.accent }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: palette.accent } }} />
              <Typography sx={{ fontSize: '0.78rem', color: palette.textMuted }}>{editForm.published ? 'Đang xuất bản' : 'Bản nháp'}</Typography>
            </Box>
            {editError && <Typography sx={{ fontSize: '0.82rem', color: '#C62828' }}>{editError}</Typography>}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
            <Button onClick={() => setIsEditOpen(false)} style={{ height: 40, borderRadius: 10, fontFamily: 'Inter, system-ui, sans-serif' }}>Hủy</Button>
            <Button type="primary" loading={isSavingEdit} onClick={handleSaveEdit} style={{ backgroundColor: palette.accent, borderColor: palette.accent, height: 40, borderRadius: 10, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}>
              {isSavingEdit ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Delete */}
      <Modal open={!!deleteTarget} onCancel={() => setDeleteTarget(null)} title="Xóa nội dung" footer={null} width={440} centered>
        <Typography sx={{ fontSize: '0.9rem', color: palette.textSecondary, py: 2 }}>
          Xóa &quot;{deleteTarget?.title}&quot;? Hành động không thể hoàn tác.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button onClick={() => setDeleteTarget(null)} style={{ height: 40, borderRadius: 10, fontFamily: 'Inter, system-ui, sans-serif' }}>Hủy</Button>
          <Button type="primary" danger loading={isWorking === deleteTarget?.id} onClick={confirmDelete} style={{ height: 40, borderRadius: 10, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}>Xóa</Button>
        </Box>
      </Modal>
    </Box>
  );
};
