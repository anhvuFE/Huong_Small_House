import React, { useState } from 'react';
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

interface ContentItem {
  id: string;
  title: string;
  type: 'PAGE' | 'BLOG' | 'BANNER' | 'ANNOUNCEMENT';
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  author: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  isActive: boolean;
}

const mockContent: ContentItem[] = [
  {
    id: '1',
    title: 'Trang Giới thiệu',
    type: 'PAGE',
    status: 'PUBLISHED',
    author: 'Admin',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-20'),
    views: 1250,
    isActive: true,
  },
  {
    id: '2',
    title: 'Chính sách đổi trả',
    type: 'PAGE',
    status: 'PUBLISHED',
    author: 'Admin',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-15'),
    views: 890,
    isActive: true,
  },
  {
    id: '3',
    title: 'Banner khuyến mãi mùa hè',
    type: 'BANNER',
    status: 'PUBLISHED',
    author: 'Marketing Team',
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-01'),
    views: 5600,
    isActive: true,
  },
  {
    id: '4',
    title: 'Lợi ích của Vitamin C với sức khỏe',
    type: 'BLOG',
    status: 'PUBLISHED',
    author: 'Content Writer',
    createdAt: new Date('2024-05-15'),
    updatedAt: new Date('2024-05-20'),
    views: 2340,
    isActive: true,
  },
  {
    id: '5',
    title: 'Thông báo bảo trì hệ thống',
    type: 'ANNOUNCEMENT',
    status: 'DRAFT',
    author: 'Admin',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
    views: 0,
    isActive: false,
  },
];

export const ContentManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  const filteredContent = mockContent.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || item.type === typeFilter;
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

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

  const getContentStats = () => {
    const total = mockContent.length;
    const published = mockContent.filter(c => c.status === 'PUBLISHED').length;
    const draft = mockContent.filter(c => c.status === 'DRAFT').length;
    const totalViews = mockContent.reduce((sum, c) => sum + c.views, 0);

    return { total, published, draft, totalViews };
  };

  const stats = getContentStats();

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
              {filteredContent.map((item) => (
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
                      <button className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button className="inline-flex items-center">
                        {item.isActive ? (
                          <FiToggleRight className="w-8 h-8 text-green-500" />
                        ) : (
                          <FiToggleLeft className="w-8 h-8 text-gray-400" />
                        )}
                      </button>
                      <button className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};