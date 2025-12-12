import React, { useState } from 'react';
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiFacebook,
  FiInstagram,
  FiYoutube,
  FiSend,
  FiUser,
  FiMessageCircle,
  FiMessageSquare
} from 'react-icons/fi';
import { Select } from '../components/common/Select';

interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên là bắt buộc';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Chủ đề là bắt buộc';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Nội dung tin nhắn là bắt buộc';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Nội dung tin nhắn phải có ít nhất 10 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof ContactFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (name: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setSubmitSuccess(true);
      setIsSubmitting(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative bg-gradient-to-br from-primary to-secondary py-12 sm:py-16 md:py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/auth-background.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center text-white max-w-3xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              Liên hệ với chúng tôi
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl px-4 sm:px-0">
              Đội ngũ tư vấn chuyên nghiệp của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="grid lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Thông tin liên hệ</h2>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiMapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">Địa chỉ</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Chung cư nhà A 9 tầng, Ngõ 120 Hoàng Quốc Việt, Bắc Từ Liêm, Hà Nội</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiPhone className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">Điện thoại</h3>
                    <a href="tel:0336064040" className="text-gray-600 hover:text-primary transition-colors text-sm sm:text-base">
                      0336 064 040
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiMail className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">Email</h3>
                    <a href="mailto:vuquynhhuong171298@gmail.com" className="text-gray-600 hover:text-primary transition-colors break-all text-xs sm:text-sm md:text-base">
                      vuquynhhuong171298@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiClock className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">Giờ làm việc</h3>
                    <p className="text-gray-600 text-sm sm:text-base">8:00 - 22:00 (Tất cả các ngày)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-bold mb-4 text-center">Kết nối với chúng tôi</h3>
              <div className="flex gap-3 sm:gap-4 flex-wrap justify-center">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 hover:bg-blue-600 text-blue-600 hover:text-white rounded-full flex items-center justify-center transition-all"
                >
                  <FiFacebook className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 hover:bg-pink-600 text-pink-600 hover:text-white rounded-full flex items-center justify-center transition-all"
                >
                  <FiInstagram className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 hover:bg-red-600 text-red-600 hover:text-white rounded-full flex items-center justify-center transition-all"
                >
                  <FiYoutube className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
                <a
                  href="https://zalo.me/0336064040"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 hover:bg-blue-500 text-blue-500 hover:text-white rounded-full flex items-center justify-center transition-all"
                >
                  <FiMessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Gửi tin nhắn cho chúng tôi</h2>

              {submitSuccess && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  Tin nhắn của bạn đã được gửi thành công! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="col-span-1 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`block w-full pl-10 pr-3 py-2 border ${
                          errors.fullName ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                        placeholder="Nhập họ tên của bạn"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="col-span-1 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`block w-full pl-10 pr-3 py-2 border ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                        placeholder="email@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div className="col-span-1 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`block w-full pl-10 pr-3 py-2 border ${
                          errors.phone ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                        placeholder="0336 064 040"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  <div className="col-span-1 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chủ đề <span className="text-red-500">*</span>
                    </label>
                    <div className={errors.subject ? 'ring-1 ring-red-300 rounded-lg' : ''}>
                      <Select
                        value={formData.subject}
                        onChange={(value) => handleSelectChange('subject', value)}
                        options={[
                          { value: '', label: '-- Chọn chủ đề --' },
                          { value: 'tu-van-san-pham', label: 'Tư vấn sản phẩm' },
                          { value: 'dat-hang', label: 'Đặt hàng' },
                          { value: 'khieu-nai', label: 'Khiếu nại' },
                          { value: 'hop-tac', label: 'Hợp tác' },
                          { value: 'khac', label: 'Khác' }
                        ]}
                        placeholder="Chọn chủ đề"
                      />
                    </div>
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung tin nhắn <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <FiMessageCircle className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={5}
                      className={`block w-full pl-10 pr-3 py-2 border ${
                        errors.message ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none`}
                      placeholder="Nhập nội dung tin nhắn của bạn..."
                    />
                  </div>
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-primary to-secondary text-white text-sm sm:text-base font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    <>
                      <FiSend className="w-5 h-5" />
                      <span>Gửi tin nhắn</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-8 sm:mt-12">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-1 sm:p-2 overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d931.0173569775983!2d105.79179686950405!3d21.04532629870902!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab3ae8c77e2b%3A0x8e14d9f462a3b70f!2zTmfDtSAxMjAgSG_DoG5nIFF14buRYyBWaeG7h3Q!5e0!3m2!1svi!2s!4v1702872345678!5m2!1svi!2s"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg sm:rounded-xl md:h-[450px]"
            ></iframe>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 sm:mt-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Câu hỏi thường gặp</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-5 sm:p-6">
              <h3 className="font-semibold text-base sm:text-lg mb-2">Thời gian giao hàng là bao lâu?</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Thời gian giao hàng từ 1-3 ngày cho khu vực nội thành Hà Nội và 3-5 ngày cho các tỉnh thành khác.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5 sm:p-6">
              <h3 className="font-semibold text-base sm:text-lg mb-2">Tôi có thể đổi trả sản phẩm không?</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Bạn có thể đổi trả sản phẩm trong vòng 7 ngày nếu còn nguyên tem, mác và chưa qua sử dụng.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5 sm:p-6">
              <h3 className="font-semibold text-base sm:text-lg mb-2">Làm sao để được tư vấn miễn phí?</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Gọi hotline 0336 064 040 hoặc nhắn tin qua Zalo, Facebook để được tư vấn miễn phí 24/7.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5 sm:p-6">
              <h3 className="font-semibold text-base sm:text-lg mb-2">Có chính sách giảm giá cho khách hàng thân thiết?</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Có, khách hàng thân thiết sẽ được giảm 5-15% tùy theo cấp độ thành viên.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};