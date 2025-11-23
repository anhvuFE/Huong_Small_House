import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiPackage,
  FiShoppingCart,
  FiUsers,
  FiTag,
  FiBarChart,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiGrid,
} from 'react-icons/fi';
import { useAuthStore } from '../../store/useAuthStore';

interface AdminSidebarProps {
  isCollapsed: boolean;
  isMobileMenuOpen: boolean;
  isMobile: boolean;
  onToggle: () => void;
  onCloseMobile: () => void;
}

const menuItems = [
  {
    path: '/admin',
    icon: FiHome,
    label: 'Dashboard',
    end: true,
  },
  {
    path: '/admin/products',
    icon: FiPackage,
    label: 'Quản lý sản phẩm',
  },
  {
    path: '/admin/categories',
    icon: FiGrid,
    label: 'Quản lý danh mục',
  },
  {
    path: '/admin/orders',
    icon: FiShoppingCart,
    label: 'Quản lý đơn hàng',
  },
  {
    path: '/admin/users',
    icon: FiUsers,
    label: 'Quản lý người dùng',
  },
  {
    path: '/admin/promotions',
    icon: FiTag,
    label: 'Mã khuyến mãi',
  },
  {
    path: '/admin/content',
    icon: FiFileText,
    label: 'Quản lý nội dung',
  },
  {
    path: '/admin/reports',
    icon: FiBarChart,
    label: 'Báo cáo',
  },
  {
    path: '/admin/settings',
    icon: FiSettings,
    label: 'Cài đặt',
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed,
  isMobileMenuOpen,
  isMobile,
  onToggle,
  onCloseMobile,
}) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white shadow-lg z-50 transition-transform duration-300 ${
        isMobile ? 'w-72 max-w-[80vw]' : isCollapsed ? 'w-16' : 'w-48 lg:w-52 xl:w-64'
      } ${isMobile ? (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full') : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 lg:p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        {!isCollapsed || isMobile ? (
          <div className="flex items-center space-x-2 lg:space-x-3">
            <img
              src="/assets/logo.png"
              alt="Hương Small House"
              className="w-7 h-7 lg:w-8 lg:h-8 flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-sm lg:text-lg font-bold text-primary truncate">Admin Panel</h1>
              <p className="text-xs text-gray-600 truncate hidden lg:block">Hương Small House</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <img
              src="/assets/logo.png"
              alt="Hương Small House"
              className="w-7 h-7 lg:w-8 lg:h-8"
            />
          </div>
        )}

        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <FiChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <FiChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.end}
                  onClick={isMobile ? onCloseMobile : undefined}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-primary text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <Icon
                    className={`flex-shrink-0 w-5 h-5 ${
                      isCollapsed && !isMobile ? 'mx-auto' : 'mr-3'
                    }`}
                  />
                  {(!isCollapsed || isMobile) && (
                    <span className="text-xs lg:text-sm font-medium truncate">{item.label}</span>
                  )}

                  {/* Tooltip for collapsed state */}
                  {!isMobile && isCollapsed && (
                    <div className="absolute left-16 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full px-3 py-2.5 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group ${
            isCollapsed && !isMobile ? 'justify-center' : ''
          }`}
        >
          <FiLogOut
            className={`flex-shrink-0 w-5 h-5 ${
              isCollapsed && !isMobile ? '' : 'mr-3'
            }`}
          />
          {(!isCollapsed || isMobile) && (
            <span className="text-xs lg:text-sm font-medium">Đăng xuất</span>
          )}

          {/* Tooltip for collapsed state */}
          {!isMobile && isCollapsed && (
            <div className="absolute left-16 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
              Đăng xuất
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
