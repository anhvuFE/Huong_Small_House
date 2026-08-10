import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Box,
  Fab,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Button, ConfigProvider, Input, Tag } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { FiMessageCircle, FiSend, FiX, FiHeadphones } from 'react-icons/fi';
import { palette } from '../../theme';
import { ConsultationChat } from './ConsultationChat';
import logo from '../../assets/logo.png';
import { getProductImage } from '../../utils/productImage';
import { productApi } from '../../services/productApi';
import { formatCurrency } from '../../utils/format';
import type { Category, Product } from '../../types';
import { buildBotReply } from './chatBot';

interface ChatMessage {
  id: string;
  author: 'bot' | 'user';
  text: string;
  timestamp: Date;
  products?: Product[];
}

const QUICK_REPLIES = [
  'Tăng đề kháng',
  'Bổ sung collagen',
  'Hỗ trợ tiêu hóa',
  'Liên hệ hotline',
];

const BOT_GREETING: ChatMessage = {
  id: 'greeting',
  author: 'bot',
  text:
    'Chào anh/chị! Em là trợ lý Huong Small House. Anh/chị muốn tìm sản phẩm cho vấn đề sức khỏe nào ạ?',
  timestamp: new Date(),
};

const formatTime = (date: Date) =>
  date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

export const ChatWidget: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'bot' | 'consult'>('bot');
  const [hasUnread, setHasUnread] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([BOT_GREETING]);
  const [draft, setDraft] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isBotTyping, isOpen]);

  // Cancel any pending bot reply on unmount to avoid a state update on an
  // unmounted component when the widget is closed within the reply delay.
  useEffect(() => {
    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isOpen || catalogLoaded) return;
    let cancelled = false;
    (async () => {
      try {
        const cats = await productApi.listCategories();
        const prods = await productApi.listProducts(cats);
        if (cancelled) return;
        setCategories(cats);
        setProducts(prods);
      } catch {
        // Catalog unavailable — bot will still answer non-product intents.
      } finally {
        if (!cancelled) setCatalogLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, catalogLoaded]);

  const handleToggle = () => {
    setIsOpen((prev) => {
      if (!prev) setHasUnread(false);
      return !prev;
    });
  };

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      author: 'user',
      text: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setDraft('');
    setIsBotTyping(true);

    botTimerRef.current = window.setTimeout(() => {
      const reply = buildBotReply(trimmed, products, categories);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-bot`,
          author: 'bot',
          text: reply.text,
          products: reply.products,
          timestamp: new Date(),
        },
      ]);
      setIsBotTyping(false);
      botTimerRef.current = null;
    }, 700);
  };

  const renderProductCard = (product: Product) => (
    <Link
      key={product.id}
      to={`/products/${product.slug}`}
      onClick={() => setIsOpen(false)}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <Stack
        direction="row"
        spacing={1.25}
        sx={{
          p: 1,
          mt: 0.75,
          bgcolor: palette.surface,
          border: `1px solid ${palette.border}`,
          borderRadius: 1.5,
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: palette.accent,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          },
        }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 1,
            overflow: 'hidden',
            flexShrink: 0,
            bgcolor: palette.background,
          }}
        >
          <img
            src={getProductImage(product)}
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = logo;
            }}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: 13,
              color: palette.textPrimary,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.3,
            }}
          >
            {product.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {product.brand}
          </Typography>
          <Typography
            sx={{ mt: 0.25, fontWeight: 700, color: palette.primary, fontSize: 13 }}
          >
            {formatCurrency(product.price)}
          </Typography>
        </Box>
      </Stack>
    </Link>
  );

  return (
    <ConfigProvider theme={{ token: { colorPrimary: palette.accent } }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'fixed', right: 24, bottom: 96, zIndex: 1300 }}
          >
            <Paper
              elevation={12}
              sx={{
                width: { xs: 'calc(100vw - 32px)', sm: 360 },
                maxWidth: 380,
                height: { xs: 'calc(100vh - 160px)', sm: 540 },
                maxHeight: 580,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: 3,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ px: 2, py: 1.5, bgcolor: palette.accent, color: '#fff' }}
              >
                <Stack direction="row" alignItems="center" spacing={1.25}>
                  <Avatar
                    src={logo}
                    alt="Huong Small House"
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: '#fff',
                      '& img': { objectFit: 'contain', p: 0.5 },
                    }}
                  />
                  <Box>
                    <Typography sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      Huong Small House
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: '#7CFC00',
                          boxShadow: '0 0 0 2px rgba(255,255,255,0.4)',
                        }}
                      />
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Đang trực tuyến
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <IconButton
                    onClick={() => setMode((m) => (m === 'bot' ? 'consult' : 'bot'))}
                    size="small"
                    sx={{ color: '#fff' }}
                    aria-label={mode === 'bot' ? 'Gặp tư vấn viên' : 'Về trợ lý ảo'}
                    title={mode === 'bot' ? 'Gặp tư vấn viên' : 'Về trợ lý ảo'}
                  >
                    {mode === 'bot' ? <FiHeadphones /> : <FiMessageCircle />}
                  </IconButton>
                  <IconButton
                    onClick={handleToggle}
                    size="small"
                    sx={{ color: '#fff' }}
                    aria-label="Đóng hộp thoại"
                  >
                    <FiX />
                  </IconButton>
                </Stack>
              </Stack>

              {mode === 'consult' ? (
                <ConsultationChat />
              ) : (
                <>

              <Box
                ref={listRef}
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  px: 2,
                  py: 2,
                  bgcolor: palette.background,
                }}
              >
                <Stack spacing={1.25}>
                  {messages.map((message) => (
                    <Stack
                      key={message.id}
                      direction="row"
                      justifyContent={message.author === 'user' ? 'flex-end' : 'flex-start'}
                    >
                      <Box
                        sx={{
                          maxWidth: '85%',
                          px: 1.5,
                          py: 1,
                          borderRadius: 2,
                          bgcolor: message.author === 'user' ? palette.accent : palette.surface,
                          color: message.author === 'user' ? '#fff' : palette.textPrimary,
                          border:
                            message.author === 'user'
                              ? 'none'
                              : `1px solid ${palette.border}`,
                          boxShadow:
                            message.author === 'user'
                              ? 'none'
                              : '0 1px 2px rgba(0,0,0,0.04)',
                        }}
                      >
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {message.text}
                        </Typography>
                        {message.products?.map(renderProductCard)}
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            opacity: 0.7,
                            color: message.author === 'user' ? '#fff' : palette.textMuted,
                            fontSize: 10,
                            textAlign: message.author === 'user' ? 'right' : 'left',
                          }}
                        >
                          {formatTime(message.timestamp)}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                  {isBotTyping && (
                    <Stack direction="row" justifyContent="flex-start">
                      <Box
                        sx={{
                          px: 1.75,
                          py: 1,
                          borderRadius: 2,
                          bgcolor: palette.surface,
                          border: `1px solid ${palette.border}`,
                        }}
                      >
                        <Stack direction="row" spacing={0.5}>
                          {[0, 1, 2].map((i) => (
                            <motion.span
                              key={i}
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                delay: i * 0.2,
                              }}
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: palette.textMuted,
                                display: 'inline-block',
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    </Stack>
                  )}
                </Stack>
              </Box>

              {messages.length <= 1 && (
                <Box
                  sx={{
                    px: 2,
                    pb: 1,
                    pt: 0.5,
                    bgcolor: palette.background,
                    borderTop: `1px dashed ${palette.border}`,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Gợi ý cho anh/chị:
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 0.75 }}>
                    {QUICK_REPLIES.map((reply) => (
                      <Tag
                        key={reply}
                        color="green"
                        style={{ cursor: 'pointer', margin: 0 }}
                        onClick={() => sendMessage(reply)}
                      >
                        {reply}
                      </Tag>
                    ))}
                  </Stack>
                </Box>
              )}

              <Stack
                direction="row"
                spacing={1}
                sx={{
                  px: 1.5,
                  py: 1.5,
                  borderTop: `1px solid ${palette.border}`,
                  bgcolor: palette.surface,
                }}
              >
                <Input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onPressEnter={() => sendMessage(draft)}
                  placeholder="Nhập tin nhắn..."
                  size="large"
                  allowClear
                />
                <Button
                  type="primary"
                  size="large"
                  onClick={() => sendMessage(draft)}
                  disabled={!draft.trim()}
                  icon={<FiSend />}
                />
              </Stack>
              </>
              )}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      <Badge
        color="error"
        variant="dot"
        invisible={isOpen || !hasUnread}
        overlap="circular"
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1300 }}
      >
        <Fab
          onClick={handleToggle}
          aria-label={isOpen ? 'Đóng hộp thoại tư vấn' : 'Mở hộp thoại tư vấn'}
          sx={{
            bgcolor: palette.accent,
            color: '#fff',
            '&:hover': { bgcolor: '#6a9c14' },
          }}
        >
          <motion.span
            key={isOpen ? 'close' : 'open'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex' }}
          >
            {isOpen ? <FiX size={22} /> : <FiMessageCircle size={22} />}
          </motion.span>
        </Fab>
      </Badge>
    </ConfigProvider>
  );
};
