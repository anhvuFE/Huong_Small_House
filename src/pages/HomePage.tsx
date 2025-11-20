import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { Hero } from '../components/common/Hero';
import { Categories } from '../components/common/Categories';
import { ProductList } from '../components/products/ProductList';
import { productApi } from '../services/productApi';
import type { Product } from '../types';

const SectionWrapper: React.FC<{
  title: string;
  link: string;
  cta?: string;
  isLoading: boolean;
  error: string;
  products: Product[];
}> = ({ title, link, cta = 'Xem tất cả', isLoading, error, products }) => (
  <section className="py-12 bg-gray-50">
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
        <Link
          to={link}
          className="flex items-center gap-2 text-primary hover:text-secondary font-medium transition-colors"
        >
          {cta} <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {error && <p className="text-red-600 text-center py-6">{error}</p>}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-64 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <ProductList products={products} />
      )}
    </div>
  </section>
);

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await productApi.listProducts();
        setProducts(data);
      } catch {
        setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const featuredProducts = useMemo(() => products.slice(0, 4), [products]);
  const bestSellers = useMemo(
    () => [...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, 4),
    [products]
  );
  const newProducts = useMemo(
    () => [...products].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 4),
    [products]
  );

  return (
    <>
      <Hero />
      <Categories />

      <SectionWrapper
        title="Sản phẩm nổi bật"
        link="/products?featured=true"
        isLoading={isLoading}
        error={error}
        products={featuredProducts}
      />

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
          {error && <p className="text-red-600 text-center py-6">{error}</p>}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-64 bg-gray-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <ProductList products={bestSellers} />
          )}
        </div>
      </section>

      <SectionWrapper
        title="Sản phẩm mới"
        link="/products?new=true"
        isLoading={isLoading}
        error={error}
        products={newProducts}
      />

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
