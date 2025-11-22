import React, { useEffect, useMemo, useState } from 'react';
import {
  FiSave,
  FiUser,
  FiMail,
  FiBell,
  FiShield,
  FiDatabase,
  FiSettings as FiSettingsIcon,
  FiToggleLeft,
  FiToggleRight,
  FiCamera,
} from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import { Select } from '../../components/common/Select';
import { profileApi } from '../../services/profileApi';
import { getErrorMessage } from '../../utils/error';

export const Settings: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('general');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    next: '',
    confirm: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'Hương Small House',
    siteDescription: 'Cửa hàng thực phẩm chức năng uy tín',
    siteUrl: 'https://huongsmallhouse.com',
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'vi',
    currency: 'VND',

    // Profile Settings
    adminName: 'Admin Hương Small House',
    adminEmail: 'admin@huongsmallhouse.com',
    adminPhone: '0336064040',

    // Email Settings
    emailProvider: 'smtp',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    emailFrom: 'noreply@huongsmallhouse.com',

    // Notification Settings
    emailNotifications: true,
    orderNotifications: true,
    stockNotifications: true,
    reviewNotifications: false,
    marketingEmails: true,

    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: '60',
    passwordPolicy: 'medium',
    loginAttempts: '5',

    // System Settings
    enableCache: true,
    enableLogs: true,
    logLevel: 'info',
    backupFrequency: 'daily',
    maintenanceMode: false,
  });

  const timezoneOptions = useMemo(
    () => [
      { value: 'Asia/Ho_Chi_Minh', label: 'Việt Nam (GMT+7)' },
      { value: 'Asia/Bangkok', label: 'Bangkok (GMT+7)' },
      { value: 'Asia/Singapore', label: 'Singapore (GMT+8)' },
    ],
    [],
  );

  const languageOptions = useMemo(
    () => [
      { value: 'vi', label: 'Tiếng Việt' },
      { value: 'en', label: 'English' },
    ],
    [],
  );

  const currencyOptions = useMemo(
    () => [
      { value: 'VND', label: 'VND (Việt Nam Đồng)' },
      { value: 'USD', label: 'USD (US Dollar)' },
    ],
    [],
  );

  const passwordPolicyOptions = useMemo(
    () => [
      { value: 'weak', label: 'Yếu (6+ ký tự)' },
      { value: 'medium', label: 'Trung bình (8+ ký tự, số và chữ)' },
      { value: 'strong', label: 'Mạnh (12+ ký tự, số, chữ và ký tự đặc biệt)' },
    ],
    [],
  );

  const logLevelOptions = useMemo(
    () => [
      { value: 'error', label: 'Chỉ lỗi' },
      { value: 'warning', label: 'Cảnh báo và lỗi' },
      { value: 'info', label: 'Thông tin, cảnh báo và lỗi' },
      { value: 'debug', label: 'Tất cả (Debug)' },
    ],
    [],
  );

  const backupOptions = useMemo(
    () => [
      { value: 'hourly', label: 'Mỗi giờ' },
      { value: 'daily', label: 'Hàng ngày' },
      { value: 'weekly', label: 'Hàng tuần' },
      { value: 'monthly', label: 'Hàng tháng' },
    ],
    [],
  );

  const tabs = [
    { id: 'general', label: 'Tổng quan', icon: FiSettingsIcon },
    { id: 'profile', label: 'Hồ sơ', icon: FiUser },
    { id: 'email', label: 'Email', icon: FiMail },
    { id: 'notifications', label: 'Thông báo', icon: FiBell },
    { id: 'security', label: 'Bảo mật', icon: FiShield },
    { id: 'system', label: 'Hệ thống', icon: FiDatabase },
  ];

  useEffect(() => {
    const tab = searchParams.get('tab');
    const validTabs = tabs.map((t) => t.id);
    if (tab && validTabs.includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    setSearchParams({ tab: id });
  };

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleInputChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePasswordInputChange = (key: keyof typeof passwordForm, value: string) => {
    setPasswordForm((prev) => ({
      ...prev,
      [key]: value,
    }));
    if (passwordError) setPasswordError('');
    if (passwordSuccess) setPasswordSuccess('');
  };

  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.current || !passwordForm.next || !passwordForm.confirm) {
      setPasswordError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError('Mật khẩu mới và xác nhận không khớp.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const message = await profileApi.changePassword({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.next,
      });
      setPasswordSuccess(message || 'Đổi mật khẩu thành công.');
      setPasswordForm({ current: '', next: '', confirm: '' });
    } catch (error) {
      setPasswordError(getErrorMessage(error, 'Không thể đổi mật khẩu. Vui lòng thử lại.'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSave = () => {
    // In real app, would call API to save settings
    setFeedback('Cài đặt đã được lưu thành công!');
    setTimeout(() => setFeedback(null), 2500);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin website</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên website
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleInputChange('siteName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL website
            </label>
            <input
              type="url"
              value={settings.siteUrl}
              onChange={(e) => handleInputChange('siteUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả website
            </label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => handleInputChange('siteDescription', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cài đặt khu vực</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Múi giờ
            </label>
            <Select
              value={settings.timezone}
              onChange={(val) => handleInputChange('timezone', val)}
              options={timezoneOptions}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngôn ngữ
            </label>
            <Select
              value={settings.language}
              onChange={(val) => handleInputChange('language', val)}
              options={languageOptions}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiền tệ
            </label>
            <Select
              value={settings.currency}
              onChange={(val) => handleInputChange('currency', val)}
              options={currencyOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
            <FiUser className="w-8 h-8 text-gray-400" />
          </div>
          <button className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors">
            <FiCamera className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">Ảnh đại diện</h3>
          <p className="text-sm text-gray-500">JPG, PNG tối đa 2MB</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Họ và tên
          </label>
          <input
            type="text"
            value={settings.adminName}
            onChange={(e) => handleInputChange('adminName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={settings.adminEmail}
            onChange={(e) => handleInputChange('adminEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số điện thoại
          </label>
          <input
            type="tel"
            value={settings.adminPhone}
            onChange={(e) => handleInputChange('adminPhone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Đổi mật khẩu</h3>
        <form className="space-y-4" onSubmit={handleChangePassword}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                value={passwordForm.current}
                onChange={(e) => handlePasswordInputChange('current', e.target.value)}
                autoComplete="current-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={passwordForm.next}
                onChange={(e) => handlePasswordInputChange('next', e.target.value)}
                autoComplete="new-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => handlePasswordInputChange('confirm', e.target.value)}
                autoComplete="new-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
          {passwordSuccess && <p className="text-sm text-emerald-600">{passwordSuccess}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isChangingPassword ? 'Đang đổi mật khẩu...' : 'Cập nhật mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông báo email</h3>
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Nhận thông báo qua email', description: 'Nhận tất cả thông báo quan trọng qua email' },
            { key: 'orderNotifications', label: 'Thông báo đơn hàng', description: 'Nhận thông báo khi có đơn hàng mới' },
            { key: 'stockNotifications', label: 'Thông báo tồn kho', description: 'Nhận thông báo khi sản phẩm sắp hết hàng' },
            { key: 'reviewNotifications', label: 'Thông báo đánh giá', description: 'Nhận thông báo khi có đánh giá mới' },
            { key: 'marketingEmails', label: 'Email marketing', description: 'Nhận email về các chiến dịch marketing' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900">{item.label}</h4>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <button onClick={() => handleToggle(item.key)}>
                {settings[item.key as keyof typeof settings] ? (
                  <FiToggleRight className="w-8 h-8 text-green-500" />
                ) : (
                  <FiToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Bảo mật tài khoản</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Xác thực 2 yếu tố</h4>
              <p className="text-sm text-gray-500">Thêm lớp bảo mật cho tài khoản của bạn</p>
            </div>
            <button onClick={() => handleToggle('twoFactorAuth')}>
              {settings.twoFactorAuth ? (
                <FiToggleRight className="w-8 h-8 text-green-500" />
              ) : (
                <FiToggleLeft className="w-8 h-8 text-gray-400" />
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian hết hạn phiên (phút)
              </label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lần đăng nhập sai tối đa
              </label>
              <input
                type="number"
                value={settings.loginAttempts}
                onChange={(e) => handleInputChange('loginAttempts', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chính sách mật khẩu
            </label>
            <Select
              value={settings.passwordPolicy}
              onChange={(val) => handleInputChange('passwordPolicy', val)}
              options={passwordPolicyOptions}
              className="md:w-1/2"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Hiệu suất hệ thống</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Bật cache</h4>
              <p className="text-sm text-gray-500">Cải thiện tốc độ tải trang</p>
            </div>
            <button onClick={() => handleToggle('enableCache')}>
              {settings.enableCache ? (
                <FiToggleRight className="w-8 h-8 text-green-500" />
              ) : (
                <FiToggleLeft className="w-8 h-8 text-gray-400" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Chế độ bảo trì</h4>
              <p className="text-sm text-gray-500">Tạm thời tắt website để bảo trì</p>
            </div>
            <button onClick={() => handleToggle('maintenanceMode')}>
              {settings.maintenanceMode ? (
                <FiToggleRight className="w-8 h-8 text-red-500" />
              ) : (
                <FiToggleLeft className="w-8 h-8 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Logs và Backup</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mức độ log
            </label>
            <Select
              value={settings.logLevel}
              onChange={(val) => handleInputChange('logLevel', val)}
              options={logLevelOptions}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tần suất backup
            </label>
            <Select
              value={settings.backupFrequency}
              onChange={(val) => handleInputChange('backupFrequency', val)}
              options={backupOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'profile':
        return renderProfileSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'system':
        return renderSystemSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
          <p className="text-gray-600">
            Quản lý cấu hình và tùy chọn của hệ thống
          </p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <FiSave className="w-4 h-4 mr-2" />
          Lưu cài đặt
        </button>
    </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleSelectTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3">
            <FiSave className="w-5 h-5" />
            <span className="text-sm font-medium">{feedback}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-white/80 hover:text-white text-sm underline"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
