import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Paper, Chip, TextField, MenuItem } from '@mui/material';
import { Button } from 'antd';
import { feedbackApi, type Feedback, type FeedbackStatus } from '../../services/feedbackApi';
import { getErrorMessage } from '../../utils/error';
import { useToast } from '../../components/common/Toast';
import { Loader } from '../../components/common/Loader';
import { palette } from '../../theme';

const STATUS_META: Record<FeedbackStatus, { label: string; color: string; bg: string }> = {
  open: { label: 'Mới', color: '#B45309', bg: '#FEF3C7' },
  in_progress: { label: 'Đang xử lý', color: '#1D4ED8', bg: '#DBEAFE' },
  resolved: { label: 'Đã xử lý', color: '#15803D', bg: '#DCFCE7' },
};
const STATUS_OPTIONS: FeedbackStatus[] = ['open', 'in_progress', 'resolved'];

export const FeedbackManagement: React.FC = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [working, setWorking] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'all'>('all');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        setItems(await feedbackApi.list());
      } catch (err) {
        setError(getErrorMessage(err, 'Không thể tải phản hồi.'));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(
    () => (statusFilter === 'all' ? items : items.filter((i) => i.status === statusFilter)),
    [items, statusFilter],
  );

  const patch = (updated: Feedback) =>
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));

  const handleStatus = async (id: string, status: FeedbackStatus) => {
    setWorking(id);
    try {
      patch(await feedbackApi.updateStatus(id, status));
      showToast({ title: 'Đã cập nhật trạng thái', variant: 'success' });
    } catch (err) {
      showToast({ title: getErrorMessage(err, 'Cập nhật thất bại'), variant: 'error' });
    } finally {
      setWorking(null);
    }
  };

  const handleRespond = async (id: string) => {
    const text = (replyDraft[id] ?? '').trim();
    if (!text) return;
    setWorking(id);
    try {
      patch(await feedbackApi.respond(id, text));
      setReplyDraft((prev) => ({ ...prev, [id]: '' }));
      showToast({ title: 'Đã gửi phản hồi', variant: 'success' });
    } catch (err) {
      showToast({ title: getErrorMessage(err, 'Gửi phản hồi thất bại'), variant: 'error' });
    } finally {
      setWorking(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: palette.textPrimary }}>
            Phản hồi khách hàng
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>{items.length} phản hồi</Typography>
        </Box>
        <TextField
          select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as FeedbackStatus | 'all')}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="all">Tất cả trạng thái</MenuItem>
          {STATUS_OPTIONS.map((s) => (
            <MenuItem key={s} value={s}>
              {STATUS_META[s].label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {error && (
        <Paper elevation={0} sx={{ p: 2, border: '1px solid #FCA5A5', bgcolor: '#FEF2F2', borderRadius: 2 }}>
          <Typography sx={{ color: '#B91C1C', fontSize: '0.88rem' }}>{error}</Typography>
        </Paper>
      )}

      {isLoading ? (
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
          <Loader />
        </Box>
      ) : filtered.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: `1px solid ${palette.border}`, borderRadius: 3 }}>
          <Typography sx={{ color: palette.textMuted }}>Chưa có phản hồi nào.</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map((f) => {
            const meta = STATUS_META[f.status];
            return (
              <Paper key={f.id} elevation={0} sx={{ p: 2.5, border: `1px solid ${palette.border}`, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 1 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: palette.textPrimary }}>{f.name}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: palette.textMuted }}>{f.email}</Typography>
                  </Box>
                  <Chip label={meta.label} size="small" sx={{ bgcolor: meta.bg, color: meta.color, fontWeight: 600 }} />
                </Box>

                <Typography sx={{ fontSize: '0.9rem', color: palette.textSecondary, whiteSpace: 'pre-line', mb: 1.5 }}>
                  {f.message}
                </Typography>

                {f.response && (
                  <Box sx={{ p: 1.5, bgcolor: palette.primarySoft, borderRadius: 2, mb: 1.5 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: palette.primary, mb: 0.3 }}>
                      Phản hồi của shop
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: palette.textSecondary }}>{f.response}</Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <TextField
                    select
                    size="small"
                    value={f.status}
                    onChange={(e) => handleStatus(f.id, e.target.value as FeedbackStatus)}
                    disabled={working === f.id}
                    sx={{ minWidth: 150 }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <MenuItem key={s} value={s}>
                        {STATUS_META[s].label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 1.5, alignItems: 'flex-start' }}>
                  <TextField
                    size="small"
                    fullWidth
                    multiline
                    minRows={1}
                    placeholder="Viết phản hồi..."
                    value={replyDraft[f.id] ?? ''}
                    onChange={(e) => setReplyDraft((prev) => ({ ...prev, [f.id]: e.target.value }))}
                  />
                  <Button
                    type="primary"
                    loading={working === f.id}
                    onClick={() => handleRespond(f.id)}
                    style={{
                      backgroundColor: palette.accent,
                      borderColor: palette.accent,
                      height: 40,
                      borderRadius: 10,
                      fontWeight: 600,
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                  >
                    Gửi
                  </Button>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default FeedbackManagement;
