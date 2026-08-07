import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';
import { Button, Input } from 'antd';
import { FiSend } from 'react-icons/fi';
import { consultationApi, type Consultation } from '../../services/consultationApi';
import { useAuthStore } from '../../store/useAuthStore';
import { getErrorMessage } from '../../utils/error';
import { palette } from '../../theme';

const { TextArea } = Input;

/** Chat trực tiếp với tư vấn viên (backend consultations), dùng cạnh bot. */
export const ConsultationChat: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [name, setName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  // Cuộn xuống cuối khi có tin mới.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [consultation?.messages.length]);

  // Poll tin trả lời của tư vấn viên (mỗi 5s) khi phiên đang mở.
  useEffect(() => {
    if (!consultation || consultation.status !== 'open') return;
    const id = consultation.id;
    const timer = setInterval(async () => {
      try {
        setConsultation(await consultationApi.get(id));
      } catch {
        /* bỏ qua lỗi poll */
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [consultation]);

  const handleStart = async () => {
    if (!name.trim() || !email.trim() || !draft.trim()) {
      setError('Vui lòng nhập tên, email và nội dung.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const c = await consultationApi.create({
        name: name.trim(),
        email: email.trim(),
        topic: 'Tư vấn qua chat',
        message: draft.trim(),
      });
      setConsultation(c);
      setDraft('');
    } catch (err) {
      setError(getErrorMessage(err, 'Không mở được phiên tư vấn.'));
    } finally {
      setBusy(false);
    }
  };

  const handleSend = async () => {
    if (!consultation || !draft.trim()) return;
    setBusy(true);
    try {
      const updated = await consultationApi.sendMessage(consultation.id, draft.trim());
      setConsultation(updated);
      setDraft('');
    } catch (err) {
      setError(getErrorMessage(err, 'Gửi tin nhắn thất bại.'));
    } finally {
      setBusy(false);
    }
  };

  // ----- Chưa đăng nhập: yêu cầu đăng nhập (API tư vấn cần auth) -----
  if (!isAuthenticated) {
    return (
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 3, bgcolor: palette.background, textAlign: 'center' }}>
        <Typography sx={{ fontWeight: 700, color: palette.textPrimary, mb: 0.5 }}>Chat với tư vấn viên</Typography>
        <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted, mb: 2 }}>
          Vui lòng đăng nhập để bắt đầu phiên tư vấn với dược sĩ.
        </Typography>
        <Link to="/login" style={{ color: palette.accent, fontWeight: 600, textDecoration: 'none' }}>
          Đăng nhập →
        </Link>
      </Box>
    );
  }

  // ----- Chưa mở phiên: form bắt đầu -----
  if (!consultation) {
    return (
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2, bgcolor: palette.background }}>
        <Typography sx={{ fontWeight: 700, color: palette.textPrimary, mb: 0.5 }}>
          Chat với tư vấn viên
        </Typography>
        <Typography sx={{ fontSize: '0.82rem', color: palette.textMuted, mb: 2 }}>
          Để lại thông tin, đội ngũ dược sĩ sẽ phản hồi trực tiếp tại đây.
        </Typography>
        <Stack spacing={1.2}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Họ tên" size="large" />
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" size="large" />
          <TextArea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Bạn cần tư vấn điều gì?"
            autoSize={{ minRows: 2, maxRows: 4 }}
          />
          {error && <Typography sx={{ color: palette.error, fontSize: '0.8rem' }}>{error}</Typography>}
          <Button
            type="primary"
            size="large"
            loading={busy}
            onClick={handleStart}
            style={{ backgroundColor: palette.accent, borderColor: palette.accent, borderRadius: 10, fontWeight: 600 }}
          >
            Bắt đầu tư vấn
          </Button>
        </Stack>
      </Box>
    );
  }

  // ----- Đã mở phiên: khung hội thoại -----
  return (
    <>
      <Box ref={listRef} sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2, bgcolor: palette.background }}>
        <Stack spacing={1.25}>
          {consultation.messages.map((m, i) => (
            <Stack key={i} direction="row" justifyContent={m.sender === 'user' ? 'flex-end' : 'flex-start'}>
              <Box
                sx={{
                  maxWidth: '78%',
                  px: 1.6,
                  py: 1,
                  borderRadius: 2.5,
                  fontSize: '0.85rem',
                  whiteSpace: 'pre-line',
                  bgcolor: m.sender === 'user' ? palette.accent : palette.surface,
                  color: m.sender === 'user' ? '#fff' : palette.textPrimary,
                  border: m.sender === 'user' ? 'none' : `1px solid ${palette.border}`,
                }}
              >
                {m.content}
              </Box>
            </Stack>
          ))}
          {consultation.status === 'closed' && (
            <Typography sx={{ textAlign: 'center', fontSize: '0.76rem', color: palette.textMuted, mt: 1 }}>
              Phiên tư vấn đã kết thúc.
            </Typography>
          )}
        </Stack>
      </Box>

      {consultation.status === 'open' && (
        <Stack direction="row" spacing={1} sx={{ px: 1.5, py: 1.5, borderTop: `1px solid ${palette.border}`, bgcolor: palette.surface }}>
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onPressEnter={handleSend}
            placeholder="Nhập tin nhắn..."
            size="large"
            allowClear
          />
          <Button type="primary" size="large" onClick={handleSend} disabled={!draft.trim() || busy} icon={<FiSend />} />
        </Stack>
      )}
    </>
  );
};

export default ConsultationChat;
