import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiSearch, FiUser, FiChevronDown, FiMenu } from 'react-icons/fi';
import { useAuthStore } from '../../store/useAuthStore';
import { profileApi } from '../../services/profileApi';
import logo from '../../assets/logo.png';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  isMobile: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleSidebar,
  isMobile,
}) => {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const hasFetchedProfile = useRef(false);

  useEffect(() => {
    if (hasFetchedProfile.current) return;
    hasFetchedProfile.current = true;

    const loadProfile = async () => {
      try {
        const profile = await profileApi.getProfile();
        updateUser(profile);
      } catch (error) {
        console.error('Không thể tải thông tin hồ sơ:', error);
      }
    };

    loadProfile();
  }, [updateUser]);

  const handleOpenProfile = async () => {
    try {
      const profile = await profileApi.getProfile();
      updateUser(profile);
      navigate('/admin/settings?tab=profile');
    } catch (error) {
      console.error('Không thể tải thông tin hồ sơ:', error);
    } finally {
      setShowProfileMenu(false);
    }
  };

  const handleLogout = () => {
    useAuthStore.getState().logout();
    setShowProfileMenu(false);
    navigate('/login');
  };

  const handleOpenSettings = () => {
    setShowProfileMenu(false);
    navigate('/admin/settings');
  };

  const notifications = [
    {
      id: '1',
      type: 'order',
      title: 'Đơn hàng mới',
      message: 'Có 3 đơn hàng mới cần xác nhận',
      time: '5 phút trước',
      isRead: false,
    },
    {
      id: '2',
      type: 'product',
      title: 'Sản phẩm sắp hết hàng',
      message: 'Vitamin C 1000mg chỉ còn 5 sản phẩm',
      time: '1 giờ trước',
      isRead: false,
    },
    {
      id: '3',
      type: 'user',
      title: 'Người dùng mới',
      message: '10 người dùng mới đăng ký hôm nay',
      time: '2 giờ trước',
      isRead: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        {/* Mobile menu button */}
        {isMobile && (
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          >
            <FiMenu className="w-6 h-6" />
          </button>
        )}

        {/* Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={isMobile ? "Tìm kiếm..." : "Tìm kiếm sản phẩm, đơn hàng..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <FiBell className="w-5 h-5 lg:w-6 lg:h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-7 h-7 lg:w-8 lg:h-8 bg-primary/15 rounded-full flex items-center justify-center p-1">
                <img src={logo} alt="Admin Avatar" className="w-full h-full object-contain" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.fullName || 'Admin'}
                </p>
                <p className="text-xs text-gray-600">Quản trị viên</p>
              </div>
              <FiChevronDown className="w-4 h-4 text-gray-600 hidden sm:block" />
            </button>

            {/* Profile dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={handleOpenProfile}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Thông tin cá nhân
                </button>
                <button
                  onClick={handleOpenSettings}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Cài đặt
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
