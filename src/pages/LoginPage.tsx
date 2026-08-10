import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../services/authApi';
import { getErrorMessage } from '../utils/error';

const STATE_MACHINE_NAME = 'Login Machine';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cancel the post-login redirect timer if the page unmounts first.
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  const { rive, RiveComponent } = useRive({
    src: '/login_character.riv',
    stateMachines: STATE_MACHINE_NAME,
    autoplay: true,
  });

  const isChecking = useStateMachineInput(rive, STATE_MACHINE_NAME, 'isChecking');
  const isHandsUp = useStateMachineInput(rive, STATE_MACHINE_NAME, 'isHandsUp');
  const trigSuccess = useStateMachineInput(rive, STATE_MACHINE_NAME, 'trigSuccess');
  const trigFail = useStateMachineInput(rive, STATE_MACHINE_NAME, 'trigFail');
  const numLook = useStateMachineInput(rive, STATE_MACHINE_NAME, 'numLook');

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setFormError('');

    if (isChecking) isChecking.value = false;
    if (isHandsUp) isHandsUp.value = false;

    try {
      const result = await authApi.login({
        email: formData.email,
        password: formData.password,
      });

      trigSuccess?.fire();
      login(result.user, result.accessToken, result.refreshToken);
      const destination = result.user.role === 'ADMIN' ? '/admin' : '/';
      redirectTimerRef.current = setTimeout(() => navigate(destination), 800);
    } catch (error) {
      trigFail?.fire();
      const message = getErrorMessage(error, 'Đăng nhập thất bại, vui lòng thử lại.');
      setFormError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (formError) {
      setFormError('');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/auth-background.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
      <div className="max-w-md w-full space-y-8 relative z-10 bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl">
        <div className="flex justify-center -mt-4 -mb-2">
          <RiveComponent style={{ width: 250, height: 250 }} />
        </div>

        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập tài khoản
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-medium text-primary hover:text-primary-dark">
              Đăng ký ngay
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => {
                    handleChange(e);
                    if (numLook) numLook.value = Math.min(e.target.value.length * 2, 100);
                  }}
                  onFocus={() => {
                    if (isChecking) isChecking.value = true;
                    if (isHandsUp) isHandsUp.value = false;
                  }}
                  onBlur={() => {
                    if (isChecking) isChecking.value = false;
                  }}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                  placeholder="Nhập email của bạn"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => {
                    if (isChecking) isChecking.value = false;
                    if (isHandsUp) isHandsUp.value = true;
                  }}
                  onBlur={() => {
                    if (isHandsUp) isHandsUp.value = false;
                  }}
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => {
                    setShowPassword(!showPassword);
                    if (isHandsUp) isHandsUp.value = showPassword;
                  }}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={formData.remember}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-primary hover:text-primary-dark">
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </div>
          {formError && (
            <p className="text-sm text-red-600 text-center">{formError}</p>
          )}

          <div className="text-center text-sm text-gray-600">
            <p>
              Bằng việc đăng nhập, bạn đồng ý với{' '}
              <Link to="/terms" className="text-primary hover:text-primary-dark">
                Điều khoản sử dụng
              </Link>{' '}
              và{' '}
              <Link to="/privacy" className="text-primary hover:text-primary-dark">
                Chính sách bảo mật
              </Link>{' '}
              của chúng tôi
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
