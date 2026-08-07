import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { Button, Input } from 'antd';
import { consultationApi, type Consultation } from '../../services/consultationApi';
import { getErrorMessage } from '../../utils/error';
import { useToast } from '../../components/common/Toast';
import { Loader } from '../../components/common/Loader';
import { palette } from '../../theme';

const { TextArea } = Input;

export const ConsultationManagement: React.FC = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState<Consultation[]>([]);
  const [selected, setSelected] = useState<Consultation | null>(null);
  const [reply, setReply] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const list = await consultationApi.list();
        setItems(list);
        setSelected((cur) => cur ?? list[0] ?? null);
      } catch (err) {
        setError(getErrorMessage(err, 'Không thể tải phiên tư vấn.'));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const sync = (updated: Consultation) => {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    setSelected(updated);
  };

  const handleReply = async () => {
    if (!selected || !reply.trim()) return;
    setWorking(true);
    try {
      sync(await consultationApi.adminReply(selected.id, reply.trim()));
      setReply('');
    } catch (err) {
      showToast({ title: getErrorMessage(err, 'Gửi thất bại'), variant: 'error' });
    } finally {
      setWorking(false);
    }
  };

  const handleClose = async () => {
    if (!selected) return;
    setWorking(true);
    try {
      sync(await consultationApi.close(selected.id));
      showToast({ title: 'Đã đóng phiên', variant: 'success' });
    } catch (err) {
      showToast({ title: getErrorMessage(err, 'Đóng thất bại'), variant: 'error' });
    } finally {
      setWorking(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box>
        <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: palette.textPrimary }}>Tư vấn khách hàng</Typography>
        <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>{items.length} phiên</Typography>
      </Box>

      {error && (
        <Paper elevation={0} sx={{ p: 2, border: '1px solid #FCA5A5', bgcolor: '#FEF2F2', borderRadius: 2 }}>
          <Typography sx={{ color: '#B91C1C', fontSize: '0.88rem' }}>{error}</Typography>
        </Paper>
      )}

      {isLoading ? (
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><Loader /></Box>
      ) : items.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: `1px solid ${palette.border}`, borderRadius: 3 }}>
          <Typography sx={{ color: palette.textMuted }}>Chưa có phiên tư vấn nào.</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '300px 1fr' }, gap: 2 }}>
          {/* Danh sách phiên */}
          <Paper elevation={0} sx={{ border: `1px solid ${palette.border}`, borderRadius: 3, overflow: 'hidden', maxHeight: 560, overflowY: 'auto' }}>
            {items.map((c) => (
              <Box
                key={c.id}
                onClick={() => setSelected(c)}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  borderBottom: `1px solid ${palette.border}`,
                  bgcolor: selected?.id === c.id ? palette.primarySoft : 'transparent',
                  '&:hover': { bgcolor: palette.background },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: palette.textPrimary }}>{c.name}</Typography>
                  <Chip
                    label={c.status === 'open' ? 'Mở' : 'Đóng'}
                    size="small"
                    sx={{ bgcolor: c.status === 'open' ? '#DCFCE7' : '#F1F5F9', color: c.status === 'open' ? '#15803D' : '#64748B', fontWeight: 600, height: 20 }}
                  />
                </Box>
                <Typography sx={{ fontSize: '0.76rem', color: palette.textMuted, mt: 0.3 }} noWrap>
                  {c.topic}
                </Typography>
              </Box>
            ))}
          </Paper>

          {/* Hội thoại */}
          <Paper elevation={0} sx={{ border: `1px solid ${palette.border}`, borderRadius: 3, display: 'flex', flexDirection: 'column', minHeight: 400 }}>
            {selected ? (
              <>
                <Box sx={{ p: 2, borderBottom: `1px solid ${palette.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, color: palette.textPrimary }}>{selected.name}</Typography>
                    <Typography sx={{ fontSize: '0.76rem', color: palette.textMuted }}>{selected.email} · {selected.topic}</Typography>
                  </Box>
                  {selected.status === 'open' && (
                    <Button size="small" onClick={handleClose} loading={working} style={{ borderRadius: 8 }}>Đóng phiên</Button>
                  )}
                </Box>

                <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', gap: 1.2, overflowY: 'auto', maxHeight: 380 }}>
                  {selected.messages.map((m, i) => (
                    <Box key={i} sx={{ alignSelf: m.sender === 'admin' ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                      <Box
                        sx={{
                          px: 1.6,
                          py: 1,
                          borderRadius: 2.5,
                          bgcolor: m.sender === 'admin' ? palette.accent : palette.background,
                          color: m.sender === 'admin' ? '#fff' : palette.textPrimary,
                          border: m.sender === 'admin' ? 'none' : `1px solid ${palette.border}`,
                          fontSize: '0.85rem',
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {m.content}
                      </Box>
                    </Box>
                  ))}
                </Box>

                {selected.status === 'open' ? (
                  <Box sx={{ p: 2, borderTop: `1px solid ${palette.border}`, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <TextArea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      autoSize={{ minRows: 1, maxRows: 3 }}
                      placeholder="Nhập câu trả lời..."
                      style={{ borderRadius: 8, fontFamily: 'Inter, system-ui, sans-serif' }}
                      onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); handleReply(); } }}
                    />
                    <Button type="primary" loading={working} onClick={handleReply} style={{ backgroundColor: palette.accent, borderColor: palette.accent, height: 40, borderRadius: 8, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}>
                      Gửi
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ p: 2, borderTop: `1px solid ${palette.border}` }}>
                    <Typography sx={{ fontSize: '0.82rem', color: palette.textMuted, textAlign: 'center' }}>Phiên đã đóng.</Typography>
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: palette.textMuted }}>Chọn một phiên để xem.</Typography>
              </Box>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default ConsultationManagement;
