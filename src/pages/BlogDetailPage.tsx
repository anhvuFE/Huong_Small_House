import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiEye, FiTag, FiUser } from 'react-icons/fi';
import { contentApi } from '../services/contentApi';
import type { ContentItem } from '../types';
import { getErrorMessage } from '../utils/error';

const formatDateTime = (value?: Date) => {
  if (!value) return 'Không rõ';
  return value.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const renderBody = (body?: string) => {
  if (!body) return null;
  return body.split('\n').map((paragraph, idx) => (
    <p key={idx} className="text-lg leading-relaxed text-gray-700 mb-4">
      {paragraph.trim()}
    </p>
  ));
};

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<ContentItem | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await contentApi.getBlog(slug);
        setPost(data);
      } catch (err) {
        setError(getErrorMessage(err, 'Không thể tải bài viết.'));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [slug]);

  const meta = useMemo(() => {
    if (!post) return null;
    return [
      { icon: FiUser, label: post.author || 'Hương Small House' },
      { icon: FiClock, label: formatDateTime(post.publishedAt ?? post.createdAt) },
      { icon: FiEye, label: `${post.views.toLocaleString()} lượt xem` },
    ];
  }, [post]);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-16 text-center text-gray-600">Đang tải bài viết...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-600 mb-3">{error}</p>
        <Link to="/blog" className="inline-flex items-center gap-2 text-primary hover:text-primary-dark">
          <FiArrowLeft className="w-4 h-4" />
          Quay lại Blog
        </Link>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="bg-white pb-16">
      <div className="relative h-72 md:h-96 bg-gray-900">
        <img
          src={post.thumbnail || 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?auto=format&fit=crop&w=1600&q=80'}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
        <div className="absolute inset-0 container mx-auto px-4 flex items-end pb-10">
          <div className="max-w-3xl space-y-3 text-white">
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white">
              <FiArrowLeft />
              Quay lại Blog
            </Link>
            <div className="flex gap-2 flex-wrap">
              {post.tags?.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold inline-flex items-center gap-1">
                  <FiTag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">{post.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-white/80">
              {meta?.map((item) => {
                const Icon = item.icon;
                return (
                  <span key={item.label} className="inline-flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto -mt-12 bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-10 relative z-10">
          {post.excerpt && (
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 md:p-6 mb-6">
              <p className="text-gray-700 text-lg leading-relaxed">{post.excerpt}</p>
            </div>
          )}

          <article className="max-w-none text-base md:text-lg leading-relaxed text-gray-800">
            {renderBody(post.body)}
            {!post.body && (
              <p className="text-gray-700 text-lg leading-relaxed">
                Nội dung bài viết đang được cập nhật. Vui lòng quay lại sau.
              </p>
            )}
          </article>
        </div>
      </div>
    </div>
  );
};
