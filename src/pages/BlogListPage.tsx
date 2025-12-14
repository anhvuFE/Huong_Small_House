import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiEye, FiFilter, FiSearch, FiTag, FiUser } from 'react-icons/fi';
import { contentApi } from '../services/contentApi';
import type { ContentItem } from '../types';
import { getErrorMessage } from '../utils/error';
import { Loader } from '../components/common/Loader';
import { Pagination } from '../components/common/Pagination';
import { usePagination } from '../hooks/usePagination';
import logo from '../assets/logo.png';

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

  // Pagination hook - 9 items per page
  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    getPaginatedData,
    resetPagination,
  } = usePagination(1, 9);

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

  // Reset to page 1 when filter changes
  useEffect(() => {
    resetPagination();
  }, [search, tagFilter, resetPagination]);

  // Get paginated data
  const paginatedData = useMemo(() => {
    return getPaginatedData(filteredBlogs);
  }, [filteredBlogs, getPaginatedData]);

  const featured = currentPage === 1 && paginatedData.items.length > 0 ? paginatedData.items[0] : null;
  const others = currentPage === 1 && featured ? paginatedData.items.slice(1) : paginatedData.items;

  return (
    <div className="bg-gradient-to-b from-primary/5 via-white to-white pb-8 sm:pb-12 md:pb-16">
      <section className="container mx-auto px-4 pt-8 sm:pt-12 md:pt-16 lg:pt-20">
        <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary via-secondary to-primary text-white p-6 sm:p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3 max-w-2xl">
              <p className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white/80 font-semibold">Blog</p>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">Kiến thức sức khỏe & sản phẩm cập nhật</h1>
              <p className="text-white/80 text-sm sm:text-base md:text-lg">
                Bài viết, hướng dẫn và tin tức mới nhất từ Hương Small House.
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <span className="px-2.5 sm:px-3 py-1 rounded-full bg-white/20 text-white text-xs sm:text-sm">Chăm sóc sức khỏe</span>
                <span className="px-2.5 sm:px-3 py-1 rounded-full bg-white/20 text-white text-xs sm:text-sm">Thực phẩm chức năng</span>
                <span className="px-2.5 sm:px-3 py-1 rounded-full bg-white/20 text-white text-xs sm:text-sm hidden sm:inline-block">Mẹo sống khỏe</span>
              </div>
            </div>
            <div className="w-full lg:w-96 bg-white text-gray-900 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3 border-b border-gray-100 pb-3 sm:pb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center p-2">
                  <img src={logo} alt="Hương Small House" className="w-full h-full object-contain" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">Số bài viết</p>
                  <p className="text-xl sm:text-2xl font-bold">{blogs.length}</p>
                </div>
              </div>
              <div className="pt-3 sm:pt-4 space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                  <FiClock className="text-primary w-4 h-4 sm:w-auto sm:h-auto" />
                  <span className="truncate">Cập nhật liên tục mỗi tuần</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                  <FiUser className="text-primary w-4 h-4 sm:w-auto sm:h-auto" />
                  <span className="truncate">Đội ngũ chuyên gia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 mt-6 sm:mt-8 md:mt-10 space-y-4 sm:space-y-6">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-md border border-gray-100 p-3 sm:p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm bài viết..."
                  className="w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm font-medium">
                <FiFilter className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Lọc theo tag:</span>
                <span className="sm:hidden">Tag:</span>
              </div>
              <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                <button
                  onClick={() => setTagFilter('')}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm border ${
                    tagFilter === '' ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                  }`}
                >
                  Tất cả
                </button>
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setTagFilter(tag)}
                    className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm border ${
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
          <div className="py-10">
            <Loader />
          </div>
        )}

        {!isLoading && featured && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="relative h-48 sm:h-56 md:h-64 lg:h-full">
                <img
                  src={(featured.thumbnail && featured.thumbnail.startsWith('http') && !featured.thumbnail.includes('placeholder') && !featured.thumbnail.includes('placehold')) ? featured.thumbnail : logo}
                  alt={featured.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 flex gap-1.5 sm:gap-2 flex-wrap">
                  {featured.tags?.slice(0, 2).map((tag) => (
                    <span key={tag} className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/90 text-primary text-[10px] sm:text-xs font-semibold">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-3 sm:gap-4 justify-center">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-primary/10 text-primary font-semibold text-[10px] sm:text-xs">
                    Nổi bật
                  </span>
                  <span className="flex items-center gap-1 sm:gap-2">
                    <FiClock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="truncate">{formatDate(featured.publishedAt ?? featured.createdAt)}</span>
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight line-clamp-2">{featured.title}</h2>
                <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed line-clamp-2 sm:line-clamp-3">{featured.excerpt || 'Khám phá thêm nội dung chi tiết trong bài viết.'}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <Link
                    to={`/blog/${featured.slug}`}
                    className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-primary text-white rounded-lg sm:rounded-xl hover:bg-primary-dark transition text-sm sm:text-base"
                  >
                    Đọc ngay
                    <FiEye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Link>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500">
                    <FiEye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {featured.views.toLocaleString()} lượt xem
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isLoading && others.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {others.map((blog) => (
              <article key={blog.id} className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:-translate-y-1 hover:shadow-xl transition">
                <div className="h-36 sm:h-40 md:h-44 relative">
                  <img
                    src={(blog.thumbnail && blog.thumbnail.startsWith('http') && !blog.thumbnail.includes('placeholder') && !blog.thumbnail.includes('placehold')) ? blog.thumbnail : logo}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex gap-1.5 sm:gap-2 flex-wrap">
                    {blog.tags?.slice(0, 1).map((tag) => (
                      <span key={tag} className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-white/90 text-primary text-[10px] sm:text-xs font-semibold flex items-center gap-1">
                        <FiTag className="w-3 h-3 hidden sm:inline-block" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="flex items-center text-[10px] sm:text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      <span>{formatDate(blog.publishedAt ?? blog.createdAt)}</span>
                    </span>
                  </div>
                  <Link to={`/blog/${blog.slug}`} className="block text-sm sm:text-base md:text-lg font-semibold text-gray-900 leading-snug hover:text-primary line-clamp-2">
                    {blog.title}
                  </Link>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-3">{blog.excerpt || 'Khám phá thêm nội dung trong bài viết.'}</p>
                  <div className="flex items-center justify-between pt-1 sm:pt-2">
                    <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
                      <FiEye className="w-3 h-3 sm:w-4 sm:h-4" />
                      {blog.views.toLocaleString()} lượt xem
                    </div>
                    <Link
                      to={`/blog/${blog.slug}`}
                      className="text-xs sm:text-sm font-semibold text-primary hover:text-primary-dark"
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
          <div className="text-center py-8 sm:py-12 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
            <p className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">Chưa có bài viết phù hợp</p>
            <p className="text-sm sm:text-base text-gray-500">Thử tìm kiếm khác hoặc xem lại sau.</p>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && filteredBlogs.length > 0 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={paginatedData.totalPages}
              totalItems={paginatedData.totalItems}
              itemsPerPage={pageSize}
              onPageChange={handlePageChange}
              showPageSizeSelect={true}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[6, 9, 12, 18]}
            />
          </div>
        )}
      </section>
    </div>
  );
};
