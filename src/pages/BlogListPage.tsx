import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Paper,
  Breadcrumbs,
  InputBase,
  Chip,
} from '@mui/material';
import { Button } from 'antd';
import {
  Home,
  NavigateNext,
  Search,
  AccessTime,
  Visibility,
  ArrowForward,
  LocalOffer,
  ArticleOutlined,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { contentApi } from '../services/contentApi';
import type { ContentItem } from '../types';
import { Loader } from '../components/common/Loader';
import { Pagination } from '../components/common/Pagination';
import { usePagination } from '../hooks/usePagination';
import { fadeInUp, staggerContainer } from '../hooks/useScrollAnimation';
import { mockBlogs } from '../data/blogData';
import { resolveImageUrl } from '../utils/image';
import logo from '../assets/logo.png';
import { palette } from '../theme';


const formatDate = (value?: Date) => {
  if (!value) return 'Không rõ';
  return value.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};


export const BlogListPage: React.FC = () => {
  const [blogs, setBlogs] = useState<ContentItem[]>([]);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { currentPage, pageSize, handlePageChange, handlePageSizeChange, getPaginatedData, resetPagination } =
    usePagination(1, 9);

  useEffect(() => {
    let cancelled = false;
    const fetchBlogs = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await contentApi.listBlogs();
        const published = data.filter((item) => item.status === 'PUBLISHED' && item.isActive);
        // Nếu API trả rỗng thì dùng bài viết mẫu để trang không trống trơn.
        if (!cancelled) setBlogs(published.length > 0 ? published : mockBlogs);
      } catch {
        // API chưa sẵn sàng -> fallback bài viết mẫu (giống mockProducts).
        if (!cancelled) setBlogs(mockBlogs);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchBlogs();
    return () => { cancelled = true; };
  }, []);

  const tags = useMemo(() => {
    const s = new Set<string>();
    blogs.forEach((b) => b.tags?.forEach((t) => s.add(t)));
    return Array.from(s);
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const q = search.toLowerCase();
      const matchSearch = b.title.toLowerCase().includes(q) || b.excerpt?.toLowerCase().includes(q);
      const matchTag = !tagFilter || b.tags?.includes(tagFilter);
      return matchSearch && matchTag;
    });
  }, [blogs, search, tagFilter]);

  useEffect(() => { resetPagination(); }, [search, tagFilter, resetPagination]);

  const paginatedData = useMemo(() => getPaginatedData(filteredBlogs), [filteredBlogs, getPaginatedData]);

  const featured = currentPage === 1 && paginatedData.items.length > 0 ? paginatedData.items[0] : null;
  const others = currentPage === 1 && featured ? paginatedData.items.slice(1) : paginatedData.items;

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
            <Typography sx={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>Blog</Typography>
          </Breadcrumbs>

          <Typography variant="h3" sx={{ color: '#fff', fontSize: { xs: '1.6rem', md: '2.2rem' }, mb: 1 }}>
            Kiến thức sức khỏe
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', mb: 3.5, maxWidth: 480 }}>
            Bài viết, hướng dẫn và tin tức mới nhất về thực phẩm chức năng và chăm sóc sức khỏe
          </Typography>

          {/* Search */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              maxWidth: 460,
              bgcolor: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
              borderRadius: 3,
              px: 2,
              py: 0.8,
              border: '1px solid rgba(255,255,255,0.15)',
              transition: 'all 0.2s',
              '&:focus-within': { bgcolor: 'rgba(255,255,255,0.18)', borderColor: 'rgba(255,255,255,0.3)' },
            }}
          >
            <Search sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 20, mr: 1 }} />
            <InputBase
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              sx={{ flex: 1, color: '#fff', fontSize: '0.9rem', '& input::placeholder': { color: 'rgba(255,255,255,0.5)', opacity: 1 } }}
            />
          </Box>
        </Container>
      </Box>

      {/* Tags filter bar */}
      <Box sx={{ bgcolor: '#fff', borderBottom: `1px solid ${palette.border}`, py: 1.5 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <LocalOffer sx={{ fontSize: 16, color: palette.textMuted, mr: 0.5 }} />
            <Chip
              label="Tất cả"
              size="small"
              onClick={() => setTagFilter('')}
              sx={{
                bgcolor: !tagFilter ? palette.accent : 'transparent',
                color: !tagFilter ? '#fff' : palette.textSecondary,
                border: `1px solid ${!tagFilter ? palette.accent : palette.border}`,
                fontWeight: 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
                '&:hover': { borderColor: palette.accent },
              }}
            />
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={`#${tag}`}
                size="small"
                onClick={() => setTagFilter(tag)}
                sx={{
                  bgcolor: tagFilter === tag ? palette.accent : 'transparent',
                  color: tagFilter === tag ? '#fff' : palette.textSecondary,
                  border: `1px solid ${tagFilter === tag ? palette.accent : palette.border}`,
                  fontWeight: 500,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  '&:hover': { borderColor: palette.accent },
                }}
              />
            ))}
            {blogs.length > 0 && (
              <Typography sx={{ fontSize: '0.78rem', color: palette.textMuted, ml: 'auto' }}>
                {filteredBlogs.length} bài viết
              </Typography>
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
        {error && <Typography sx={{ textAlign: 'center', color: '#C62828', py: 2, mb: 2 }}>{error}</Typography>}

        {isLoading && (
          <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}><Loader /></Box>
        )}

        {/* Featured post */}
        {!isLoading && featured && (
          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${palette.border}`,
              borderRadius: 3,
              overflow: 'hidden',
              mb: 4,
              transition: 'all 0.3s ease',
              '&:hover': { boxShadow: '0 8px 25px rgba(0,0,0,0.06)' },
            }}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' } }}>
              {/* Image */}
              <Box sx={{ position: 'relative', minHeight: { xs: 200, lg: 300 }, bgcolor: palette.background }}>
                {resolveImageUrl(featured.thumbnail) ? (
                  <Box
                    component="img"
                    src={resolveImageUrl(featured.thumbnail)!}
                    alt={featured.title}
                    sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box component="img" src={logo} alt="Logo" sx={{ width: 80, height: 80, objectFit: 'contain', opacity: 0.5 }} />
                  </Box>
                )}
                <Chip
                  label="Nổi bật"
                  size="small"
                  sx={{ position: 'absolute', top: 12, left: 12, bgcolor: palette.accent, color: '#fff', fontWeight: 600, fontSize: '0.72rem' }}
                />
              </Box>

              {/* Content */}
              <Box sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: palette.textMuted }}>
                    <AccessTime sx={{ fontSize: 15 }} />
                    <Typography sx={{ fontSize: '0.78rem' }}>{formatDate(featured.publishedAt ?? featured.createdAt)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: palette.textMuted }}>
                    <Visibility sx={{ fontSize: 15 }} />
                    <Typography sx={{ fontSize: '0.78rem' }}>{featured.views.toLocaleString()} lượt xem</Typography>
                  </Box>
                </Box>

                <Typography sx={{ fontWeight: 700, fontSize: { xs: '1.15rem', md: '1.4rem' }, color: palette.textPrimary, lineHeight: 1.35 }}>
                  {featured.title}
                </Typography>

                <Typography sx={{ fontSize: '0.9rem', color: palette.textSecondary, lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {featured.excerpt || 'Khám phá thêm nội dung chi tiết trong bài viết.'}
                </Typography>

                {featured.tags && featured.tags.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                    {featured.tags.slice(0, 3).map((tag) => (
                      <Chip key={tag} label={`#${tag}`} size="small" sx={{ bgcolor: palette.accentLight, color: palette.accent, fontWeight: 500, fontSize: '0.72rem', height: 22 }} />
                    ))}
                  </Box>
                )}

                <Link to={`/blog/${featured.slug}`} style={{ textDecoration: 'none', alignSelf: 'flex-start' }}>
                  <Button
                    type="primary"
                    icon={<ArrowForward style={{ fontSize: 15 }} />}
                    iconPosition="end"
                    style={{
                      backgroundColor: palette.accent,
                      borderColor: palette.accent,
                      height: 40,
                      paddingInline: 20,
                      fontWeight: 600,
                      borderRadius: 10,
                      fontSize: '0.85rem',
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                  >
                    Đọc ngay
                  </Button>
                </Link>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Blog grid */}
        {!isLoading && others.length > 0 && (
          <motion.div variants={staggerContainer(0.05)} initial="hidden" animate="visible">
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2.5 }}>
              {others.map((blog) => (
                <motion.div key={blog.id} variants={fadeInUp} transition={{ duration: 0.35 }}>
                  <Link to={`/blog/${blog.slug}`} style={{ textDecoration: 'none' }}>
                    <Paper
                      elevation={0}
                      sx={{
                        border: `1px solid ${palette.border}`,
                        borderRadius: 3,
                        overflow: 'hidden',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 8px 25px rgba(0,0,0,0.06)',
                          borderColor: 'rgba(125,175,24,0.3)',
                        },
                        '&:hover .blog-img': { transform: 'scale(1.05)' },
                      }}
                    >
                      {/* Image */}
                      <Box sx={{ height: 180, overflow: 'hidden', bgcolor: palette.background, position: 'relative' }}>
                        {resolveImageUrl(blog.thumbnail) ? (
                          <Box
                            component="img"
                            className="blog-img"
                            src={resolveImageUrl(blog.thumbnail)!}
                            alt={blog.title}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s ease' }}
                          />
                        ) : (
                          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArticleOutlined sx={{ fontSize: 48, color: palette.border }} />
                          </Box>
                        )}
                        {blog.tags?.[0] && (
                          <Chip
                            label={`#${blog.tags[0]}`}
                            size="small"
                            sx={{ position: 'absolute', top: 10, left: 10, bgcolor: 'rgba(255,255,255,0.92)', color: palette.accent, fontWeight: 600, fontSize: '0.7rem', height: 22 }}
                          />
                        )}
                      </Box>

                      {/* Content */}
                      <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: palette.textMuted }}>
                            <AccessTime sx={{ fontSize: 13 }} />
                            <Typography sx={{ fontSize: '0.72rem' }}>{formatDate(blog.publishedAt ?? blog.createdAt)}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: palette.textMuted }}>
                            <Visibility sx={{ fontSize: 13 }} />
                            <Typography sx={{ fontSize: '0.72rem' }}>{blog.views.toLocaleString()}</Typography>
                          </Box>
                        </Box>

                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            color: palette.textPrimary,
                            lineHeight: 1.4,
                            mb: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            transition: 'color 0.2s',
                            '&:hover': { color: palette.accent },
                          }}
                        >
                          {blog.title}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: '0.82rem',
                            color: palette.textMuted,
                            lineHeight: 1.6,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            flex: 1,
                            mb: 1.5,
                          }}
                        >
                          {blog.excerpt || 'Khám phá thêm nội dung trong bài viết.'}
                        </Typography>

                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: palette.accent, mt: 'auto' }}>
                          Đọc tiếp →
                        </Typography>
                      </Box>
                    </Paper>
                  </Link>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        )}

        {!isLoading && filteredBlogs.length === 0 && (
          <Paper elevation={0} sx={{ textAlign: 'center', py: 6, border: `1px solid ${palette.border}`, borderRadius: 3 }}>
            <ArticleOutlined sx={{ fontSize: 48, color: palette.border, mb: 2 }} />
            <Typography sx={{ fontWeight: 600, color: palette.textPrimary, mb: 0.5 }}>Chưa có bài viết phù hợp</Typography>
            <Typography sx={{ fontSize: '0.88rem', color: palette.textMuted }}>Thử tìm kiếm khác hoặc xem lại sau.</Typography>
          </Paper>
        )}

        {!isLoading && filteredBlogs.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Pagination
              currentPage={currentPage}
              totalPages={paginatedData.totalPages}
              totalItems={paginatedData.totalItems}
              itemsPerPage={pageSize}
              onPageChange={handlePageChange}
              showPageSizeSelect
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[6, 9, 12, 18]}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};
