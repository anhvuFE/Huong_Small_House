import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FiSearch,
  FiFilter,
  FiMail,
  FiPhone,
  FiMapPin,
  FiUser,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiLock,
  FiUnlock,
} from 'react-icons/fi';
import { Select } from '../../components/common/Select';
import { userApi } from '../../services/userApi';
import { getErrorMessage } from '../../utils/error';
import type { User } from '../../types';
import { Loader } from '../../components/common/Loader';
import { useToast } from '../../components/common/Toast';

const getDaysSinceLogin = (lastLogin?: Date) => {
  if (!lastLogin) return Infinity;
  return Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
};

export const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [lockedUsers, setLockedUsers] = useState<Record<string, boolean>>({});
  const { showToast } = useToast();

  const verificationOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'verified', label: 'Đã xác minh' },
    { value: 'unverified', label: 'Chưa xác minh' },
    { value: 'partial', label: 'Xác minh một phần' },
  ];

  const activityOptions = [
    { value: '', label: 'Tất cả hoạt động' },
    { value: 'active', label: 'Hoạt động gần đây' },
    { value: 'inactive', label: 'Không hoạt động' },
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await userApi.listUsers();
        setUsers(data);
      } catch (err) {
        setError(getErrorMessage(err, 'Không thể tải danh sách người dùng.'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm);

      let matchesVerification = true;
      if (verificationFilter === 'verified') {
        matchesVerification = user.isEmailVerified && user.isPhoneVerified;
      } else if (verificationFilter === 'unverified') {
        matchesVerification = !user.isEmailVerified && !user.isPhoneVerified;
      } else if (verificationFilter === 'partial') {
        matchesVerification = user.isEmailVerified !== user.isPhoneVerified;
      }

      let matchesActivity = true;
      if (activityFilter === 'active') {
        matchesActivity = getDaysSinceLogin(user.lastLogin) <= 7;
      } else if (activityFilter === 'inactive') {
        matchesActivity = getDaysSinceLogin(user.lastLogin) > 30;
      }

      return matchesSearch && matchesVerification && matchesActivity;
    });
  }, [users, searchTerm, verificationFilter, activityFilter]);

  const getVerificationStatus = (user: User) => {
    if (user.isEmailVerified && user.isPhoneVerified) {
      return { text: 'Đã xác minh', color: 'bg-green-100 text-green-800', icon: FiCheckCircle };
    } else if (!user.isEmailVerified && !user.isPhoneVerified) {
      return { text: 'Chưa xác minh', color: 'bg-red-100 text-red-800', icon: FiXCircle };
    } else {
      return { text: 'Một phần', color: 'bg-yellow-100 text-yellow-800', icon: FiXCircle };
    }
  };

  const getActivityStatus = (lastLogin?: Date) => {
    if (!lastLogin) {
      return { text: 'Chưa đăng nhập', color: 'text-gray-500' };
    }
    const daysSinceLogin = getDaysSinceLogin(lastLogin);

    if (daysSinceLogin <= 1) {
      return { text: 'Hôm nay', color: 'text-green-600' };
    } else if (daysSinceLogin <= 7) {
      return { text: `${daysSinceLogin} ngày trước`, color: 'text-blue-600' };
    } else if (daysSinceLogin <= 30) {
      return { text: `${daysSinceLogin} ngày trước`, color: 'text-yellow-600' };
    } else {
      return { text: `${daysSinceLogin} ngày trước`, color: 'text-red-600' };
    }
  };

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const verifiedUsers = users.filter(u => u.isEmailVerified && u.isPhoneVerified).length;
    const activeUsers = users.filter(u => getDaysSinceLogin(u.lastLogin) <= 7).length;
    const newUsers = users.filter(u => {
      const daysSinceJoin = Math.floor((Date.now() - u.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceJoin <= 30;
    }).length;
    return { totalUsers, verifiedUsers, activeUsers, newUsers };
  }, [users]);

  const handleOpenDetail = (user: User) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  const handleToggleLock = (userId: string) => {
    const next = !lockedUsers[userId];
    setLockedUsers((prev) => ({ ...prev, [userId]: next }));
    showToast({
      title: next ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản',
      variant: next ? 'error' : 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-600">
            Theo dõi và quản lý thông tin khách hàng
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FiFilter className="w-4 h-4 mr-2" />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiUser className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiCheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Đã xác minh</p>
              <p className="text-lg font-bold text-gray-900">{stats.verifiedUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiCalendar className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Hoạt động tuần</p>
              <p className="text-lg font-bold text-gray-900">{stats.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FiUser className="w-5 h-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Mới tháng này</p>
              <p className="text-lg font-bold text-gray-900">{stats.newUsers}</p>
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
                placeholder="Tìm kiếm tên, email, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Verification Filter */}
          <div>
            <Select
              value={verificationFilter}
              onChange={setVerificationFilter}
              options={verificationOptions}
              placeholder="Trạng thái xác minh"
            />
          </div>

          {/* Activity Filter */}
          <div>
            <Select
              value={activityFilter}
              onChange={setActivityFilter}
              options={activityOptions}
              placeholder="Hoạt động"
            />
          </div>
        </div>
      </div>

      {/* Users Cards (mobile) */}
      <div className="space-y-3 md:hidden">
        {isLoading && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <Loader />
          </div>
        )}
        {!isLoading && filteredUsers.map((user) => {
          const verificationStatus = getVerificationStatus(user);
          const activityStatus = getActivityStatus(user.lastLogin);
          const VerificationIcon = verificationStatus.icon;
          return (
            <div key={user.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.fullName} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <FiUser className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
                    <p className="text-xs text-gray-500">ID: {user.id}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium ${verificationStatus.color}`}>
                  <VerificationIcon className="w-3 h-3 mr-1" />
                  {verificationStatus.text}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FiMail className="w-4 h-4" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FiPhone className="w-4 h-4" />
                    <span>{user.phone || '---'}</span>
                  </div>
                  <div className="flex items-start gap-2 text-gray-600">
                    <FiMapPin className="w-4 h-4 mt-0.5" />
                    <span className="text-sm">
                      {user.addresses?.length
                        ? `${user.addresses[0].street}${user.addresses[0].ward ? ', ' + user.addresses[0].ward : ''}`
                        : 'Chưa có địa chỉ'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between text-right">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <FiCalendar className="w-4 h-4" />
                    {user.createdAt?.toLocaleDateString('vi-VN')}
                  </div>
                  <span className={`text-sm font-medium ${activityStatus.color}`}>
                    {activityStatus.text}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => handleOpenDetail(user)}
                  aria-label="Xem chi tiết người dùng"
                >
                  <FiEye className="w-4 h-4" />
                </button>
                <button
                  className={`p-2 rounded-lg transition-colors ${lockedUsers[user.id]
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-green-600 hover:bg-green-50'}`}
                  onClick={() => handleToggleLock(user.id)}
                  aria-label={lockedUsers[user.id] ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                >
                  {lockedUsers[user.id] ? (
                    <FiUnlock className="w-4 h-4" />
                  ) : (
                    <FiLock className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {!isLoading && filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-600 bg-white border border-gray-200 rounded-xl">
            Không tìm thấy người dùng nào.
          </div>
        )}
      </div>

      {/* Users Table (desktop) */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {error && (
          <div className="px-4 py-3 bg-red-50 border-b border-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Địa chỉ
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Xác minh
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hoạt động cuối
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tham gia
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
              {!isLoading && filteredUsers.map((user) => {
                const verificationStatus = getVerificationStatus(user);
                const activityStatus = getActivityStatus(user.lastLogin);
                const VerificationIcon = verificationStatus.icon;

                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.fullName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <FiUser className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <FiMail className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                          {user.isEmailVerified && (
                            <FiCheckCircle className="w-3 h-3 ml-1 text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FiPhone className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{user.phone}</span>
                          {user.isPhoneVerified && (
                            <FiCheckCircle className="w-3 h-3 ml-1 text-green-500" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {user.addresses.length > 0 ? (
                        <div className="flex items-start text-sm text-gray-600">
                          <FiMapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="line-clamp-1">
                              {user.addresses[0].street}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user.addresses[0].ward}, {user.addresses[0].district}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Chưa có địa chỉ</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${verificationStatus.color}`}>
                        <VerificationIcon className="w-3 h-3 mr-1" />
                        {verificationStatus.text}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-sm font-medium ${activityStatus.color}`}>
                        {activityStatus.text}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-500">
                        {user.createdAt.toLocaleDateString('vi-VN')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          onClick={() => handleOpenDetail(user)}
                          aria-label="Xem chi tiết người dùng"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          className={`p-1.5 rounded transition-colors ${lockedUsers[user.id]
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-green-600 hover:bg-green-50'}`}
                          onClick={() => handleToggleLock(user.id)}
                          aria-label={lockedUsers[user.id] ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                        >
                          {lockedUsers[user.id] ? (
                            <FiUnlock className="w-4 h-4" />
                          ) : (
                            <FiLock className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <FiUser className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy người dùng nào
            </h3>
            <p className="text-gray-500">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-700">
            Hiển thị <span className="font-medium">1</span> đến{' '}
            <span className="font-medium">{filteredUsers.length}</span> trong tổng số{' '}
            <span className="font-medium">{filteredUsers.length}</span> người dùng
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50">
              Trước
            </button>
            <button className="px-3 py-1 bg-primary text-white rounded text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50">
              Sau
            </button>
          </div>
        </div>
      )}

      {isDetailOpen && selectedUser && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden">
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-gray-400 font-semibold">Chi tiết người dùng</p>
                <h3 className="text-2xl font-semibold text-gray-900 mt-1">{selectedUser.fullName}</h3>
                <p className="text-xs text-gray-500 mt-1">ID: {selectedUser.id}</p>
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
                <p className="text-gray-500">Email</p>
                <p className="font-semibold text-gray-900">{selectedUser.email}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-gray-500">Số điện thoại</p>
                <p className="font-semibold text-gray-900">{selectedUser.phone || 'Chưa có'}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-gray-500">Ngày tham gia</p>
                <p className="font-semibold text-gray-900">
                  {selectedUser.createdAt ? selectedUser.createdAt.toLocaleDateString('vi-VN') : 'Không rõ'}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-gray-500">Hoạt động cuối</p>
                <p className="font-semibold text-gray-900">
                  {selectedUser.lastLogin ? selectedUser.lastLogin.toLocaleString('vi-VN') : 'Chưa xác định'}
                </p>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <p className="text-gray-500">Địa chỉ</p>
                {selectedUser.addresses?.length ? (
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">{selectedUser.addresses[0].street}</p>
                    <p className="text-xs text-gray-500">
                      {[selectedUser.addresses[0].ward, selectedUser.addresses[0].district, selectedUser.addresses[0].province]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                ) : (
                  <p className="font-semibold text-gray-500">Chưa có địa chỉ</p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end">
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
    </div>
  );
};
