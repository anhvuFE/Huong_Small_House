import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { FiClock, FiEdit2, FiLogOut, FiMail, FiMapPin, FiPhone, FiShield, FiX } from 'react-icons/fi';
import { profileApi } from '../services/profileApi';
import { useAuthStore } from '../store/useAuthStore';
import { getErrorMessage } from '../utils/error';

export const AccountPage: React.FC = () => {
  const { user, updateUser, logout, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({ fullName: '', phone: '', address: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) return;
      setIsLoading(true);
      setError('');

      try {
        const profile = await profileApi.getProfile();
        updateUser(profile);
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể tải thông tin tài khoản');
        setError(message);
        if (message.toLowerCase().includes('unauthorized') || message.toLowerCase().includes('hết hạn')) {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, logout, updateUser]);

  const formattedCreatedAt = useMemo(() => {
    if (!user?.createdAt) return 'Không xác định';
    return new Date(user.createdAt).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, [user?.createdAt]);

  const formattedLastLogin = useMemo(() => {
    if (!user?.lastLogin) return 'Chưa xác định';
    return new Date(user.lastLogin).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, [user?.lastLogin]);

  const initials = useMemo(() => {
    if (!user?.fullName) return '?';
    return user.fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join('');
  }, [user?.fullName]);

  const primaryAddress = useMemo(() => {
    const addr = user?.addresses?.[0]?.street || user?.address;
    return addr && addr.trim().length > 0 ? addr : 'Chưa có địa chỉ mặc định';
  }, [user?.addresses, user?.address]);


  const openEditModal = (): void => {
    if (!user) return;
    setEditData({
      fullName: user.fullName || '',
      phone: user.phone || '',
      address: (user.addresses?.[0]?.street || user.address || ''),
    });
    setFormError('');
    setFormSuccess('');
    setIsEditOpen(true);
  };

  const closeEditModal = (): void => {
    setIsEditOpen(false);
    setFormError('');
  };

  const handleEditChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = event.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
    if (formSuccess) setFormSuccess('');
  };

  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setIsSaving(true);
    setFormError('');

    try {
      const updated = await profileApi.updateProfile(editData);
      updateUser(updated);
      setFormSuccess('Cập nhật thông tin thành công!');
      setTimeout(() => {
        setIsEditOpen(false);
        setFormSuccess('');
      }, 800);
    } catch (err) {
      setFormError(getErrorMessage(err, 'Không thể cập nhật thông tin. Vui lòng thử lại.'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-white to-white py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-secondary px-8 py-10 text-white flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-semibold">
                {initials}
              </div>
              <div>
                <p className="text-sm uppercase tracking-widest text-white/70">Xin chào,</p>
                <h1 className="text-3xl font-semibold">{user?.fullName}</h1>
                <div className="flex flex-wrap gap-3 mt-3 text-sm">
                  <span className="px-3 py-1 rounded-full bg-white/20">
                    {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
                  </span>
                  {user?.lastLogin && (
                    <span className="px-3 py-1 rounded-full bg-white/10 flex items-center gap-2">
                      <FiClock className="text-white/80" />
                      Lần đăng nhập cuối: {formattedLastLogin}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={openEditModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/40 text-white hover:bg-white/20 transition"
              >
                <FiEdit2 /> Chỉnh sửa
              </button>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-primary font-medium hover:bg-gray-100 transition"
              >
                <FiLogOut /> Đăng xuất
              </button>
            </div>
          </div>

          <div className="p-8">
            {isLoading && (
              <div className="mb-4 text-sm text-gray-500 flex items-center gap-2">
                <FiClock /> Đang tải dữ liệu tài khoản...
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div className="border rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin liên hệ</h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-primary/10 text-primary">
                      <FiMail />
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Email</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-primary/10 text-primary">
                      <FiPhone />
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Số điện thoại</p>
                      <p className="font-medium">{user?.phone || 'Chưa cập nhật'}</p>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-primary/10 text-primary">
                      <FiMapPin />
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Địa chỉ</p>
                      <p className="font-medium">{primaryAddress}</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="border rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Bảo mật & trạng thái</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500">Tạo tài khoản</p>
                      <p className="text-lg font-medium text-gray-900">{formattedCreatedAt}</p>
                    </div>
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                      Hoạt động
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <span className="p-2 rounded-full bg-white shadow text-primary">
                      <FiShield />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Mật khẩu của bạn đang được mã hóa và bảo vệ an toàn.</p>
                      <p className="text-xs text-gray-400">Chúng tôi khuyến nghị đổi mật khẩu định kỳ.</p>
                    </div>
                    <button
                      type="button"
                      className="text-sm font-medium text-primary hover:text-primary-dark"
                    >
                      Đổi mật khẩu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-400">Cập nhật thông tin</p>
                <h3 className="text-xl font-semibold text-gray-900">Chỉnh sửa hồ sơ</h3>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                aria-label="Đóng"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form className="space-y-5" onSubmit={handleSaveProfile}>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={editData.fullName}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Nhập họ tên đầy đủ"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={editData.phone}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={editData.address}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Nhập địa chỉ mặc định"
                />
              </div>

              {formError && <p className="text-sm text-red-600">{formError}</p>}
              {formSuccess && <p className="text-sm text-emerald-600">{formSuccess}</p>}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
