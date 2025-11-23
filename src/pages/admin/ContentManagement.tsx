import React, { useMemo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiEye,
  FiImage,
  FiFileText,
  FiGlobe,
  FiCalendar,
  FiToggleLeft,
  FiToggleRight,
} from 'react-icons/fi';
import { Select } from '../../components/common/Select';
import { contentApi } from '../../services/contentApi';
import { getErrorMessage } from '../../utils/error';
import type { ContentItem } from '../../types';
import { Loader } from '../../components/common/Loader';
import { useToast } from '../../components/common/Toast';

export const ContentManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [isWorking, setIsWorking] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    published: false,
    tagsText: '',
    body: '',
  });
  const [editError, setEditError] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const { showToast } = useToast();

  const typeOptions = [
    { value: '', label: 'Tất cả loại' },
    { value: 'PAGE', label: 'Trang web' },
    { value: 'BLOG', label: 'Bài viết' },
    { value: 'BANNER', label: 'Banner' },
    { value: 'ANNOUNCEMENT', label: 'Thông báo' },
  ];

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'PUBLISHED', label: 'Đã xuất bản' },
    { value: 'DRAFT', label: 'Bản nháp' },
    { value: 'ARCHIVED', label: 'Lưu trữ' },
  ];

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await contentApi.listContent();
        setContent(data);
      } catch (err) {
        setError(getErrorMessage(err, 'Không thể tải danh sách nội dung.'));
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  const filteredContent = useMemo(() => {
    return content.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !typeFilter || item.type === typeFilter;
      const matchesStatus = !statusFilter || item.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [content, searchTerm, typeFilter, statusFilter]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PAGE':
        return <FiGlobe className="w-4 h-4" />;
      case 'BLOG':
        return <FiFileText className="w-4 h-4" />;
      case 'BANNER':
        return <FiImage className="w-4 h-4" />;
      case 'ANNOUNCEMENT':
        return <FiCalendar className="w-4 h-4" />;
      default:
        return <FiFileText className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const types = {
      PAGE: 'Trang web',
      BLOG: 'Bài viết',
      BANNER: 'Banner',
      ANNOUNCEMENT: 'Thông báo',
    };
    return types[type as keyof typeof types] || type;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PUBLISHED: { text: 'Đã xuất bản', color: 'bg-green-100 text-green-800' },
      DRAFT: { text: 'Bản nháp', color: 'bg-yellow-100 text-yellow-800' },
      ARCHIVED: { text: 'Lưu trữ', color: 'bg-gray-100 text-gray-800' },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const stats = useMemo(() => {
    const total = content.length;
    const published = content.filter(c => c.status === 'PUBLISHED').length;
    const draft = content.filter(c => c.status === 'DRAFT').length;
    const totalViews = content.reduce((sum, c) => sum + (c.views || 0), 0);
    return { total, published, draft, totalViews };
  }, [content]);

  const handleToggleActive = (id: string) => {
    const current = content.find((c) => c.id === id);
    if (!current) return;
    const next = !current.published;
    setIsWorking(id);
    setActionMessage('');

    // optimistic update
    setContent((prev) => prev.map((item) => (item.id === id ? { ...item, published: next, isActive: next, status: next ? 'PUBLISHED' : 'DRAFT' } : item)));

    contentApi
      .updateContent(id, { published: next })
      .then((updated) => {
        setContent((prev) => prev.map((item) => (item.id === id ? updated : item)));
        setActionMessage(next ? 'Đã bật nội dung' : 'Đã tắt nội dung');
        showToast({ title: next ? 'Đã bật nội dung' : 'Đã tắt nội dung', variant: 'success' });
      })
      .catch((err) => {
        setContent((prev) => prev.map((item) => (item.id === id ? { ...item, published: !next, isActive: !next, status: !next ? 'PUBLISHED' : 'DRAFT' } : item)));
        setError(getErrorMessage(err, 'Không thể cập nhật trạng thái.'));
        showToast({ title: 'Cập nhật trạng thái thất bại', variant: 'error' });
      })
      .finally(() => setIsWorking(null));
  };

  const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null);

  const handleDelete = async (id: string) => {
    const target = content.find((c) => c.id === id);
    if (!target) return;
    setDeleteTarget(target);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsWorking(deleteTarget.id);
    setActionMessage('');
    try {
      await contentApi.deleteContent(deleteTarget.id);
      setContent((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setActionMessage('Đã xóa nội dung.');
      showToast({ title: 'Đã xóa nội dung', variant: 'error' });
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể xóa nội dung.'));
      showToast({ title: 'Xóa nội dung thất bại', variant: 'error' });
    } finally {
      setIsWorking(null);
      setDeleteTarget(null);
    }
  };

  const handleView = (item: ContentItem) => {
    setSelectedContent(item);
    setIsDetailOpen(true);
  };

  const handleEdit = (item: ContentItem) => {
    setSelectedContent(item);
    setEditForm({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || '',
      published: item.published ?? item.isActive,
      tagsText: item.tags?.join(', ') || '',
      body: item.body || '',
    });
    setEditError('');
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedContent) return;
    if (!editForm.title.trim()) {
      setEditError('Tiêu đề không được để trống.');
      return;
    }
    if (!editForm.body.trim()) {
      setEditError('Nội dung không được để trống.');
      return;
    }
    setIsSavingEdit(true);
    setEditError('');
    const tags = editForm.tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      const updated = await contentApi.updateContent(selectedContent.id, {
        title: editForm.title,
        slug: editForm.slug,
        excerpt: editForm.excerpt,
        published: editForm.published,
        tags,
        body: editForm.body,
      });
      setContent((prev) => prev.map((item) => (item.id === selectedContent.id ? updated : item)));
      setIsEditOpen(false);
      setActionMessage('Đã cập nhật nội dung.');
      showToast({ title: 'Đã lưu nội dung', variant: 'success' });
    } catch (err) {
      setEditError(getErrorMessage(err, 'Không thể lưu nội dung.'));
      showToast({ title: 'Lưu nội dung thất bại', variant: 'error' });
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý nội dung</h1>
          <p className="text-gray-600">
            Quản lý trang web, bài viết, banner và thông báo
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FiImage className="w-4 h-4 mr-2" />
            Thư viện ảnh
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
            <FiPlus className="w-5 h-5 mr-2" />
            Tạo nội dung
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiFileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Tổng nội dung</p>
              <p className="text-lg font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiGlobe className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Đã xuất bản</p>
              <p className="text-lg font-bold text-gray-900">{stats.published}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FiEdit className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Bản nháp</p>
              <p className="text-lg font-bold text-gray-900">{stats.draft}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiEye className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Tổng lượt xem</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              options={typeOptions}
              placeholder="Loại nội dung"
            />
          </div>

          {/* Status Filter */}
          <div>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              placeholder="Trạng thái"
            />
          </div>
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {error && (
          <div className="px-4 py-3 bg-red-50 border-b border-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}
        {actionMessage && (
          <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100 text-emerald-700 text-sm">
            {actionMessage}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nội dung
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tác giả
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lượt xem
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cập nhật
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="py-6 px-4">
                    <Loader />
                  </td>
                </tr>
              )}
              {!isLoading && filteredContent.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500">ID: {item.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">
                      {getTypeLabel(item.type)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">{item.author}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <FiEye className="w-4 h-4 mr-1 text-gray-400" />
                      {item.views.toLocaleString()}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-500">
                      {item.updatedAt.toLocaleDateString('vi-VN')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        onClick={() => handleView(item)}
                        aria-label="Xem"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                        onClick={() => handleEdit(item)}
                        aria-label="Chỉnh sửa"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        className="inline-flex items-center"
                        onClick={() => handleToggleActive(item.id)}
                        aria-label={item.isActive ? 'Tắt' : 'Bật'}
                        disabled={isWorking === item.id}
                      >
                        {item.isActive ? (
                          <FiToggleRight className="w-8 h-8 text-green-500" />
                        ) : (
                          <FiToggleLeft className="w-8 h-8 text-gray-400" />
                        )}
                      </button>
                      <button
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        onClick={() => handleDelete(item.id)}
                        aria-label="Xóa"
                        disabled={isWorking === item.id}
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && filteredContent.length === 0 && (
          <div className="py-10 text-center text-gray-500 text-sm">
            Không có nội dung nào. Thử thay đổi bộ lọc hoặc tạo mới.
          </div>
        )}
      </div>

      {isDetailOpen && selectedContent && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="absolute inset-0" onClick={() => setIsDetailOpen(false)} />
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden">
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-gray-400 font-semibold">Chi tiết nội dung</p>
                <h3 className="text-2xl font-semibold text-gray-900 mt-1">{selectedContent.title}</h3>
                <p className="text-xs text-gray-500 mt-1">ID: {selectedContent.id}</p>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-gray-700">
              <div className="space-y-1.5">
                <p className="text-gray-500">Loại</p>
                <p className="font-semibold text-gray-900">{getTypeLabel(selectedContent.type)}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-gray-500">Trạng thái</p>
                <div className="font-semibold text-gray-900">{getStatusBadge(selectedContent.status)}</div>
              </div>
              <div className="space-y-1.5">
                <p className="text-gray-500">Tác giả</p>
                <p className="font-semibold text-gray-900">{selectedContent.author || 'Không rõ'}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-gray-500">Lượt xem</p>
                <p className="font-semibold text-gray-900">{selectedContent.views?.toLocaleString() || 0}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-gray-500">Cập nhật</p>
                <p className="font-semibold text-gray-900">
                  {selectedContent.updatedAt ? selectedContent.updatedAt.toLocaleDateString('vi-VN') : 'Không rõ'}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-gray-500">Slug</p>
                <p className="font-semibold text-gray-900">{selectedContent.slug}</p>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <p className="text-gray-500">Tóm tắt</p>
                <p className="font-semibold text-gray-800">{selectedContent.excerpt || 'Chưa có tóm tắt'}</p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${selectedContent.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'}`}>
                  {selectedContent.isActive ? 'Đang bật' : 'Đang tắt'}
                </span>
                {selectedContent.tags?.length ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedContent.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">#{tag}</span>
                    ))}
                  </div>
                ) : null}
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-white transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      {deleteTarget && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="absolute inset-0" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900">Xóa nội dung</h3>
              <p className="text-sm text-gray-600 mt-2">
                Bạn có chắc muốn xóa “{deleteTarget.title}”? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-white transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                disabled={isWorking === deleteTarget.id}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-60"
              >
                {isWorking === deleteTarget.id ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      {isEditOpen && selectedContent && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="absolute inset-0" onClick={() => setIsEditOpen(false)} />
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden">
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-gray-400 font-semibold">Chỉnh sửa nội dung</p>
                <h3 className="text-2xl font-semibold text-gray-900 mt-1">{selectedContent.title}</h3>
                <p className="text-xs text-gray-500 mt-1">ID: {selectedContent.id}</p>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tiêu đề</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Slug</label>
                  <input
                    type="text"
                    value={editForm.slug}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, slug: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Tóm tắt</label>
                <textarea
                  rows={3}
                  value={editForm.excerpt}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Tags (ngăn cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  value={editForm.tagsText}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, tagsText: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Nội dung (text)</label>
                <textarea
                  rows={6}
                  value={editForm.body}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, body: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Nhập nội dung bài viết (nếu cần chỉnh)"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span>Xuất bản</span>
                  <button
                    type="button"
                    onClick={() => setEditForm((prev) => ({ ...prev, published: !prev.published }))}
                    className="inline-flex items-center"
                  >
                    {editForm.published ? (
                      <FiToggleRight className="w-8 h-8 text-green-500" />
                    ) : (
                      <FiToggleLeft className="w-8 h-8 text-gray-400" />
                    )}
                  </button>
                  <span className="text-xs text-gray-500">
                    {editForm.published ? 'Đang xuất bản' : 'Bản nháp'}
                  </span>
                </div>
                {editError && <p className="text-sm text-red-600">{editError}</p>}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-white transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark disabled:opacity-60"
              >
                {isSavingEdit ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
};
