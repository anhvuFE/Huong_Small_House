import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiShield, FiTruck, FiAward } from 'react-icons/fi';
import { FaHandHoldingHeart } from 'react-icons/fa';
import { cn } from '../../utils/cn';

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1920&h=600&fit=crop',
    title: 'Thực phẩm chức năng chính hãng',
    subtitle: 'Cam kết 100% hàng chính hãng từ Mỹ, Úc, Canada',
    cta: 'Khám phá ngay',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1920&h=600&fit=crop',
    title: 'Giảm giá lên đến 30%',
    subtitle: 'Ưu đãi đặc biệt cho khách hàng mới',
    cta: 'Mua sắm ngay',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=1920&h=600&fit=crop',
    title: 'Chăm sóc sức khỏe toàn diện',
    subtitle: 'Đa dạng sản phẩm cho mọi nhu cầu',
    cta: 'Xem thêm',
  },
];

export const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div>
      <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              'absolute inset-0 transition-transform duration-500 ease-in-out',
              index === currentSlide ? 'translate-x-0' : index < currentSlide ? '-translate-x-full' : 'translate-x-full'
            )}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${slide.image})`,
              }}
            >
              <div className="container mx-auto px-4 h-full flex items-center">
                <div className="text-white max-w-2xl">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl mb-6">
                    {slide.subtitle}
                  </p>
                  <button className="bg-primary hover:bg-secondary text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                    {slide.cta}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
          aria-label="Previous slide"
        >
          <FiChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
          aria-label="Next slide"
        >
          <FiChevronRight className="w-6 h-6" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'w-3 h-3 rounded-full transition-colors',
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="bg-gray-50 py-6 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
              <div className="bg-primary/10 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <FiShield className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Hàng chính hãng</h3>
                <p className="text-xs sm:text-sm text-gray-600">Cam kết 100% chính hãng</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
              <div className="bg-primary/10 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <FiTruck className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Giao hàng nhanh</h3>
                <p className="text-xs sm:text-sm text-gray-600">Giao hàng trong 24h</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
              <div className="bg-primary/10 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <FaHandHoldingHeart className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Tư vấn miễn phí</h3>
                <p className="text-xs sm:text-sm text-gray-600">Hỗ trợ 24/7</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
              <div className="bg-primary/10 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <FiAward className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Ưu đãi hấp dẫn</h3>
                <p className="text-xs sm:text-sm text-gray-600">Giảm giá lên đến 30%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
