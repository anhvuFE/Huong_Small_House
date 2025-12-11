import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCreditCard, FiTruck, FiUser, FiMail, FiPhone, FiMapPin, FiEdit3, FiDollarSign, FiPackage } from 'react-icons/fi';
import { useCartStore } from '../store/useCartStore';
import { formatCurrency } from '../utils/format';
import { ProductImageFallback } from '../components/common/ProductImageFallback';
import { useToast } from '../components/common/Toast';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { showToast } = useToast();
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    district: '',
    province: '',
    note: ''
  });

  const totalPrice = getTotalPrice();
  const shippingFee = 30000;
  const finalTotal = totalPrice + shippingFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Here you would typically send the order to your backend
    console.log('Order submitted:', {
      customer: formData,
      items,
      paymentMethod,
      total: finalTotal
    });

    // Show success toast
    showToast({
      title: 'Đặt hàng thành công!',
      message: 'Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng.',
      variant: 'success'
    });

    // Clear cart and redirect after a short delay
    setTimeout(() => {
      clearCart();
      navigate('/');
    }, 2000);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống</h2>
          <p className="text-gray-600 mb-6">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
          <Link to="/products" className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-lg inline-block">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-all hover:translate-x-[-4px]">
          <FiArrowLeft className="w-5 h-5" />
          <span className="font-medium">Quay lại</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Thanh toán</h1>
          <p className="text-gray-600">Hoàn tất đơn hàng của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Customer info and delivery */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Thông tin khách hàng</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        placeholder="Nhập họ và tên"
                        className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại *
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        pattern="[0-9]{10}"
                        placeholder="0123456789"
                        className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 relative">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="email@example.com"
                        className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FiTruck className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Địa chỉ giao hàng</h2>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ *
                    </label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        placeholder="Số nhà, tên đường..."
                        className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                        Quận/Huyện *
                      </label>
                      <input
                        type="text"
                        id="district"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        required
                        placeholder="Nhập quận/huyện"
                        className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-2">
                        Tỉnh/Thành phố *
                      </label>
                      <input
                        type="text"
                        id="province"
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        required
                        placeholder="Nhập tỉnh/thành phố"
                        className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú
                    </label>
                    <div className="relative">
                      <FiEdit3 className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                      <textarea
                        id="note"
                        name="note"
                        value={formData.note}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Ghi chú cho đơn hàng..."
                        className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FiCreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Phương thức thanh toán</h2>
                </div>

                <div className="space-y-4">
                  <label className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 w-4 h-4 text-primary focus:ring-primary"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <FiDollarSign className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">Thanh toán khi nhận hàng (COD)</div>
                        <div className="text-sm text-gray-600 mt-1">Thanh toán bằng tiền mặt khi nhận hàng</div>
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${paymentMethod === 'bank' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={paymentMethod === 'bank'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 w-4 h-4 text-primary focus:ring-primary"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiCreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">Chuyển khoản ngân hàng</div>
                        <div className="text-sm text-gray-600 mt-1">Chuyển khoản trước khi giao hàng</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit button for mobile */}
              <button
                type="submit"
                className="lg:hidden w-full bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white py-4 rounded-lg font-semibold transition-all transform hover:scale-[1.02] shadow-lg"
              >
                Đặt hàng
              </button>
            </form>
          </div>

          {/* Right column - Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FiPackage className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Đơn hàng ({items.length} sản phẩm)</h2>
              </div>

              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    {item.product.thumbnail && !imageLoadErrors[item.product.id] ? (
                      <img
                        src={item.product.thumbnail}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={() => {
                          setImageLoadErrors(prev => ({ ...prev, [item.product.id]: true }));
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg overflow-hidden">
                        <ProductImageFallback name={item.product.name} size="sm" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-800 line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">Số lượng: {item.quantity}</p>
                      <p className="text-sm font-bold text-primary mt-1">
                        {formatCurrency(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tạm tính:</span>
                  <span className="text-sm font-medium">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Phí vận chuyển:</span>
                  <span className="text-sm font-medium">{formatCurrency(shippingFee)}</span>
                </div>
                <div className="pt-3 mt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(finalTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Submit button for desktop */}
              <button
                onClick={handleSubmit}
                className="hidden lg:block w-full bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white py-4 rounded-lg font-semibold transition-all transform hover:scale-[1.02] shadow-lg mt-6"
              >
                <div className="flex items-center justify-center gap-2">
                  <FiPackage className="w-5 h-5" />
                  <span>Đặt hàng</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};