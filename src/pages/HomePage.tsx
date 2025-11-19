import React from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '../components/common/Hero';
import { Categories } from '../components/common/Categories';
import { ProductList } from '../components/products/ProductList';
import { mockProducts } from '../data/products';
import { FiArrowRight } from 'react-icons/fi';

export const HomePage: React.FC = () => {
  const featuredProducts = mockProducts.filter(p => p.isFeatured).slice(0, 4);
  const bestSellers = mockProducts.filter(p => p.isBestSeller).slice(0, 4);
  const newProducts = mockProducts.filter(p => p.isNew).slice(0, 4);

  return (
    <>
      <Hero />
      <Categories />

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Sản phẩm nổi bật</h2>
            <Link
              to="/products?featured=true"
              className="flex items-center gap-2 text-primary hover:text-secondary font-medium transition-colors"
            >
              Xem tất cả <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <ProductList products={featuredProducts} />
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Sản phẩm bán chạy</h2>
            <Link
              to="/products?bestseller=true"
              className="flex items-center gap-2 text-primary hover:text-secondary font-medium transition-colors"
            >
              Xem tất cả <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <ProductList products={bestSellers} />
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Sản phẩm mới</h2>
            <Link
              to="/products?new=true"
              className="flex items-center gap-2 text-primary hover:text-secondary font-medium transition-colors"
            >
              Xem tất cả <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <ProductList products={newProducts} />
        </div>
      </section>

      <section className="py-12 bg-primary">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Đăng ký nhận thông tin khuyến mãi
            </h2>
            <p className="text-lg mb-8 text-gray-100">
              Nhận ngay voucher giảm giá 10% cho đơn hàng đầu tiên
            </p>
            <form className="max-w-lg mx-auto flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 outline-none"
              />
              <button
                type="submit"
                className="bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Đăng ký ngay
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};
