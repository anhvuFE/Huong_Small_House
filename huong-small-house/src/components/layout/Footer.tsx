import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiFacebook,
  FiInstagram,
  FiYoutube,
} from 'react-icons/fi';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">Hương Small House</h3>
            <p className="text-gray-300 mb-4">
              Chuyên cung cấp thực phẩm chức năng chính hãng, chất lượng cao với giá tốt nhất thị trường.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <FiFacebook className="w-6 h-6" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <FiInstagram className="w-6 h-6" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="Youtube"
              >
                <FiYoutube className="w-6 h-6" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-primary transition-colors">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-primary transition-colors">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-300 hover:text-primary transition-colors">
                  Danh mục
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-primary transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Chính sách</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-primary transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-primary transition-colors">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-300 hover:text-primary transition-colors">
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link to="/return" className="text-gray-300 hover:text-primary transition-colors">
                  Chính sách đổi trả
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Thông tin liên hệ</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <FiMapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <span className="text-gray-300">
                  120 Hoàng Quốc Việt, Cầu Giấy, Hà Nội
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="tel:0336064040" className="text-gray-300 hover:text-primary transition-colors">
                  0336 064 040
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="w-5 h-5 text-primary flex-shrink-0" />
                <a
                  href="mailto:vuquynhhuong171298@gmail.com"
                  className="text-gray-300 hover:text-primary transition-colors break-all"
                >
                  vuquynhhuong171298@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FiClock className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-gray-300">
                  8:00 - 22:00 (Tất cả các ngày)
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2024 Hương Small House. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex gap-4">
              <img
                src="/placeholder.jpg"
                alt="Payment method 1"
                className="h-8 object-contain"
              />
              <img
                src="/placeholder.jpg"
                alt="Payment method 2"
                className="h-8 object-contain"
              />
              <img
                src="/placeholder.jpg"
                alt="Payment method 3"
                className="h-8 object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
