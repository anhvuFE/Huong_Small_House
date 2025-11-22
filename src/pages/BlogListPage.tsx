import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiEye, FiFilter, FiSearch, FiTag, FiUser } from 'react-icons/fi';
import { contentApi } from '../services/contentApi';
import type { ContentItem } from '../types';
import { getErrorMessage } from '../utils/error';

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

  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await contentApi.listBlogs();
        const published = data.filter((item) => item.status === 'PUBLISHED' && item.isActive);
        setBlogs(published);
      } catch (err) {
        setError(getErrorMessage(err, 'Không thể tải bài viết.'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const tags = useMemo(() => {
    const tagSet = new Set<string>();
    blogs.forEach((b) => b.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesSearch =
        blog.title.toLowerCase().includes(search.toLowerCase()) ||
        blog.excerpt?.toLowerCase().includes(search.toLowerCase() || '');
      const matchesTag = !tagFilter || blog.tags?.includes(tagFilter);
      return matchesSearch && matchesTag;
    });
  }, [blogs, search, tagFilter]);

  const featured = filteredBlogs[0];
  const others = filteredBlogs.slice(1);

  return (
    <div className="bg-gradient-to-b from-primary/5 via-white to-white pb-16">
      <section className="container mx-auto px-4 pt-16 md:pt-20">
        <div className="rounded-3xl bg-gradient-to-r from-primary via-secondary to-primary text-white p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <p className="text-sm uppercase tracking-[0.25em] text-white/80 font-semibold">Blog</p>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">Kiến thức sức khỏe & sản phẩm cập nhật</h1>
              <p className="text-white/80 text-lg">
                Bài viết, hướng dẫn và tin tức mới nhất từ Hương Small House.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-sm">Chăm sóc sức khỏe</span>
                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-sm">Thực phẩm chức năng</span>
                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-sm">Mẹo sống khỏe</span>
              </div>
            </div>
            <div className="w-full lg:w-96 bg-white text-gray-900 rounded-2xl shadow-lg p-4">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  HS
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">Số bài viết</p>
                  <p className="text-2xl font-bold">{blogs.length}</p>
                </div>
              </div>
              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <FiClock className="text-primary" />
                  Cập nhật liên tục mỗi tuần
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <FiUser className="text-primary" />
                  Đội ngũ chuyên gia Hương Small House
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 mt-10 space-y-6">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm bài viết..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                <FiFilter />
                Lọc theo tag:
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setTagFilter('')}
                  className={`px-3 py-1.5 rounded-full text-sm border ${
                    tagFilter === '' ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                  }`}
                >
                  Tất cả
                </button>
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setTagFilter(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm border ${
                      tagFilter === tag ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        </div>

        {isLoading && (
          <div className="text-center text-gray-500 py-10">Đang tải bài viết...</div>
        )}

        {!isLoading && featured && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="relative h-64 lg:h-full">
                <img
                  src={featured.thumbnail || 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80'}
                  alt={featured.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 flex gap-2 flex-wrap">
                  {featured.tags?.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-white/90 text-primary text-xs font-semibold">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-6 md:p-8 flex flex-col gap-4 justify-center">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                    Nổi bật
                  </span>
                  <span className="flex items-center gap-2">
                    <FiClock />
                    {formatDate(featured.publishedAt ?? featured.createdAt)}
                  </span>
                  <span className="flex items-center gap-2">
                    <FiUser />
                    {featured.author}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{featured.title}</h2>
                <p className="text-gray-600 text-lg leading-relaxed line-clamp-3">{featured.excerpt || 'Khám phá thêm nội dung chi tiết trong bài viết.'}</p>
                <div className="flex items-center gap-3">
                  <Link
                    to={`/blog/${featured.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition"
                  >
                    Đọc ngay
                    <FiEye className="w-4 h-4" />
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FiEye className="w-4 h-4" />
                    {featured.views.toLocaleString()} lượt xem
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isLoading && others.length > 0 && (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {others.map((blog) => (
              <article key={blog.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:-translate-y-1 hover:shadow-xl transition">
                <div className="h-44 relative">
                  <img
                    src={blog.thumbnail || 'https://images.unsplash.com/photo-1444731961956-751ed90465a5?auto=format&fit=crop&w=900&q=80'}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                    {blog.tags?.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full bg-white/90 text-primary text-xs font-semibold flex items-center gap-1">
                        <FiTag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiClock />
                      {formatDate(blog.publishedAt ?? blog.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiUser />
                      {blog.author}
                    </span>
                  </div>
                  <Link to={`/blog/${blog.slug}`} className="block text-lg font-semibold text-gray-900 leading-snug hover:text-primary">
                    {blog.title}
                  </Link>
                  <p className="text-sm text-gray-600 line-clamp-3">{blog.excerpt || 'Khám phá thêm nội dung trong bài viết.'}</p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FiEye className="w-4 h-4" />
                      {blog.views.toLocaleString()} lượt xem
                    </div>
                    <Link
                      to={`/blog/${blog.slug}`}
                      className="text-sm font-semibold text-primary hover:text-primary-dark"
                    >
                      Đọc tiếp →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!isLoading && filteredBlogs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-lg font-semibold text-gray-800 mb-2">Chưa có bài viết phù hợp</p>
            <p className="text-gray-500">Thử tìm kiếm khác hoặc xem lại sau.</p>
          </div>
        )}
      </section>
    </div>
  );
};
