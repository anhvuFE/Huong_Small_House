import type { FC } from 'react';
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FiActivity,
  FiFeather,
  FiShield,
  FiHeart,
  FiSun,
  FiMoon,
  FiStar,
  FiTrendingDown,
  FiBox,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { cn } from '../../utils/cn';
import { productApi } from '../../services/productApi';
import type { Category } from '../../types';
import { mockCategories } from '../../data/categoryData';

interface CategoriesProps {
  className?: string;
}

const iconComponents = {
  vitamin: FiActivity,
  digestive: FiTrendingDown,
  immunity: FiShield,
  heart: FiHeart,
  beauty: FiStar,
  energy: FiSun,
  sleep: FiMoon,
  collagen: FiFeather,
} as const;

const getIcon = (slug: string) => {
  const normalized = slug.replace(/-.*$/, '');
  return iconComponents[normalized as keyof typeof iconComponents] ?? FiBox;
};

export const Categories: FC<CategoriesProps> = ({ className }) => {
  const [items, setItems] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await productApi.listCategories('customer');
        setItems(data);
      } catch (err) {
        console.error('Failed to fetch categories, using mock data:', err);
        setItems(mockCategories);
        setError('');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const extendedItems = [...items, ...items.slice(0, 5)];

  useEffect(() => {
    if (items.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= items.length - 1) {
            setTimeout(() => {
              setIsTransitioning(false);
              setCurrentIndex(0);
              setTimeout(() => setIsTransitioning(true), 50);
            }, 500);
            return prev + 1;
          }
          return prev + 1;
        });
      }, 3000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [items.length]);

  const handlePrevious = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setCurrentIndex((prev) => {
      if (prev === 0) {
        setIsTransitioning(false);
        const newIndex = items.length - 1;
        setTimeout(() => {
          setCurrentIndex(newIndex);
          setIsTransitioning(true);
        }, 50);
        return newIndex;
      }
      return prev - 1;
    });

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= items.length - 1) {
          setTimeout(() => {
            setIsTransitioning(false);
            setCurrentIndex(0);
            setTimeout(() => setIsTransitioning(true), 50);
          }, 500);
          return prev + 1;
        }
        return prev + 1;
      });
    }, 3000);
  };

  const handleNext = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setCurrentIndex((prev) => {
      if (prev >= items.length - 1) {
        setTimeout(() => {
          setIsTransitioning(false);
          setCurrentIndex(0);
          setTimeout(() => setIsTransitioning(true), 50);
        }, 500);
        return prev + 1;
      }
      return prev + 1;
    });

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= items.length - 1) {
          setTimeout(() => {
            setIsTransitioning(false);
            setCurrentIndex(0);
            setTimeout(() => setIsTransitioning(true), 50);
          }, 500);
          return prev + 1;
        }
        return prev + 1;
      });
    }, 3000);
  };

  const handleDotClick = (index: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCurrentIndex(index);

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= items.length - 1) {
          setTimeout(() => {
            setIsTransitioning(false);
            setCurrentIndex(0);
            setTimeout(() => setIsTransitioning(true), 50);
          }, 500);
          return prev + 1;
        }
        return prev + 1;
      });
    }, 3000);
  };

  return (
    <section className={cn('py-12 bg-gradient-to-b from-white to-gray-50', className)}>
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Danh mục sản phẩm
        </h2>
        {error && <p className="text-center text-red-600 mb-6">{error}</p>}

        <div className="relative">
          {/* Navigation Buttons */}
          {items.length > 5 && !isLoading && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 z-10 bg-white shadow-lg rounded-full p-2 md:p-3 hover:bg-gray-50 transition-all hover:scale-110"
                aria-label="Previous"
              >
                <FiChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 z-10 bg-white shadow-lg rounded-full p-2 md:p-3 hover:bg-gray-50 transition-all hover:scale-110"
                aria-label="Next"
              >
                <FiChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </>
          )}

          {/* Slider Container */}
          <div className="overflow-hidden rounded-xl" ref={sliderRef}>
            <div
              className={`flex ${isTransitioning ? 'transition-transform duration-500 ease-out' : ''}`}
              style={{
                transform: `translateX(-${currentIndex * (100 / 5)}%)`,
              }}
            >
              {isLoading
                ? Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className="w-full md:w-1/3 lg:w-1/5 flex-shrink-0 px-2"
                    >
                      <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
                    </div>
                  ))
                : extendedItems.map((category, index) => {
                    const Icon = getIcon(category.slug);
                    return (
                      <div
                        key={`${category.id}-${index}`}
                        className="w-full md:w-1/3 lg:w-1/5 flex-shrink-0 px-2"
                      >
                        <Link
                          to={`/products?category=${category.slug}`}
                          className="group block"
                        >
                          <div className="bg-white rounded-lg p-6 text-center hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 h-full">
                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300 text-primary">
                              <Icon className="w-10 h-10 mx-auto" />
                            </div>
                            <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                              {category.name}
                            </h3>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
            </div>
          </div>

          {/* Dots Indicator */}
          {items.length > 5 && !isLoading && (
            <div className="flex justify-center gap-2 mt-6">
              {items.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-300',
                    index === (currentIndex % items.length)
                      ? 'bg-primary w-6'
                      : 'bg-gray-300 hover:bg-gray-400'
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
