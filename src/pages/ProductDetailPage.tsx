import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiChevronLeft, FiShoppingCart, FiPlus, FiMinus, FiStar, FiCheck } from 'react-icons/fi';
import { ProductList } from '../components/products/ProductList';
import { useCartStore } from '../store/useCartStore';
import { formatCurrency, calculateDiscount } from '../utils/format';
import { cn } from '../utils/cn';
import { productApi } from '../services/productApi';
import { reviewApi, type Review } from '../services/reviewApi';
import { useAuthStore } from '../store/useAuthStore';
import { getErrorMessage } from '../utils/error';
import type { Product } from '../types';
import { extractIdFromSlug } from '../utils/slugify';
import { Loader } from '../components/common/Loader';
import { mockProducts } from '../data/productData';
import { getProductImage } from '../utils/productImage';
import logo from '../assets/logo.png';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<number, boolean>>({});
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { addItem, toggleCart } = useCartStore();

  const { isAuthenticated } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const productId = product?.productId;

  const loadReviews = useCallback(async (id: number) => {
    try {
      setReviews(await reviewApi.list(id));
    } catch {
      setReviews([]);
    }
  }, []);

  useEffect(() => {
    if (typeof productId === 'number') loadReviews(productId);
  }, [productId, loadReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof productId !== 'number') return;
    setReviewSubmitting(true);
    setReviewError('');
    try {
      await reviewApi.create({ productId, rating: reviewRating, comment: reviewComment.trim() || undefined });
      setReviewComment('');
      setReviewRating(5);
      await loadReviews(productId);
    } catch (err) {
      setReviewError(getErrorMessage(err, 'Không gửi được đánh giá.'));
    } finally {
      setReviewSubmitting(false);
    }
  };

  useEffect(() => {
    if (!slug) {
      setError('Sản phẩm không tồn tại.');
      setIsLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Try to get product ID from slug
        const productId = extractIdFromSlug(slug);

        if (productId) {
          // Try API first if we have a numeric ID
          try {
            const categories = await productApi.listCategories('customer');
            const [detail, list] = await Promise.all([
              productApi.getProduct(productId, categories),
              productApi.listProducts(categories),
            ]);
            setProduct(detail);
            const related = list
              .filter((item) => item.brand === detail.brand && item.id !== detail.id)
              .slice(0, 4);
            setRelatedProducts(related);
            return;
          } catch (apiError) {
            console.error('API failed, using mock data:', apiError);
          }
        }

        // Use mock data as fallback or when no numeric ID
        const mockProduct = mockProducts.find(p => p.slug === slug);
        if (mockProduct) {
          setProduct(mockProduct);
          const related = mockProducts
            .filter((item) => item.brand === mockProduct.brand && item.id !== mockProduct.id)
            .slice(0, 4);
          setRelatedProducts(related);
        } else {
          setError('Sản phẩm không tồn tại.');
        }
      } catch (error) {
        console.error('Error loading product:', error);
        setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem(product, quantity);
    toggleCart();
  };

  const handleQuantityChange = (delta: number) => {
    if (!product) return;
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader />
      </div>
    );
  }

  if (!product || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">{error || 'Sản phẩm không tồn tại'}</h1>
          <Link to="/products" className="text-primary hover:underline">
            Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  const discountPercent = product.originalPrice
    ? calculateDiscount(product.price, product.originalPrice)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors"
        >
          <FiChevronLeft className="w-4 h-4" />
          Quay lại
        </Link>

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <div>
              <div className="mb-4">
                {!imageLoadErrors[selectedImage] ? (
                  <img
                    src={
                      /^https?:\/\//.test(product.images[selectedImage] ?? '')
                        ? product.images[selectedImage]
                        : getProductImage(product)
                    }
                    alt={product.name}
                    className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-lg"
                    onError={() => {
                      setImageLoadErrors(prev => ({ ...prev, [selectedImage]: true }));
                    }}
                  />
                ) : (
                  <div className="w-full h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden">
                    <img src={logo} alt={product.name} className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        'flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden',
                        selectedImage === index ? 'border-primary' : 'border-gray-200'
                      )}
                    >
                      {!imageLoadErrors[1000 + index] ? (
                        <img
                          src={/^https?:\/\//.test(image) ? image : getProductImage(product)}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={() => {
                            setImageLoadErrors(prev => ({ ...prev, [1000 + index]: true }));
                          }}
                        />
                      ) : (
                        <img src={logo} alt={product.name} className="w-full h-full object-contain" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
              {product.nameEn && <p className="text-sm md:text-base text-gray-600 mb-4">{product.nameEn}</p>}

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={cn(
                        'w-4 h-4 md:w-5 md:h-5',
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm md:text-base text-gray-600">
                  {product.rating} ({product.reviewCount} đánh giá)
                </span>
                <span className="text-sm md:text-base text-gray-600">Đã bán: {product.soldCount}</span>
              </div>

              <div className="mb-6">
                <div className="flex flex-wrap items-baseline gap-2 md:gap-3">
                  <span className="text-2xl md:text-3xl font-bold text-primary">
                    {formatCurrency(product.price)}
                  </span>
                  {product.originalPrice && (
                    <>
                      <span className="text-lg md:text-xl text-gray-500 line-through">
                        {formatCurrency(product.originalPrice)}
                      </span>
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-xs md:text-sm font-semibold">
                        -{discountPercent}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm md:text-base text-gray-700">{product.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6">
                <div className="flex justify-between sm:block">
                  <span className="text-sm md:text-base text-gray-600">Thương hiệu:</span>
                  <span className="ml-2 text-sm md:text-base font-semibold">{product.brand}</span>
                </div>
                <div className="flex justify-between sm:block">
                  <span className="text-sm md:text-base text-gray-600">Danh mục:</span>
                  <span className="ml-2 text-sm md:text-base font-semibold">{product.category}</span>
                </div>
                <div className="flex justify-between sm:block">
                  <span className="text-sm md:text-base text-gray-600">Tồn kho:</span>
                  <span className="ml-2 text-sm md:text-base font-semibold">{product.stock}</span>
                </div>
                <div className="flex justify-between sm:block">
                  <span className="text-sm md:text-base text-gray-600">Đơn vị:</span>
                  <span className="ml-2 text-sm md:text-base font-semibold">{product.quantity} {product.unit || 'sản phẩm'}</span>
                </div>
                {product.productId && (
                  <div className="flex justify-between sm:block">
                    <span className="text-sm md:text-base text-gray-600">Mã sản phẩm:</span>
                    <span className="ml-2 text-sm md:text-base font-semibold">#{product.productId}</span>
                  </div>
                )}
                <div className="flex justify-between items-center sm:gap-4">
                  <span className="text-sm md:text-base text-gray-600">Số lượng:</span>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="p-2 hover:bg-gray-100 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 min-w-[50px] text-center">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="p-2 hover:bg-gray-100 transition-colors"
                      disabled={quantity >= product.stock}
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-primary hover:bg-secondary text-white py-3 px-4 md:px-6 rounded-lg text-sm md:text-base font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FiShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                  Thêm vào giỏ hàng
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 bg-[#14532D] hover:bg-[#0f3d21] text-white py-3 px-4 md:px-6 rounded-lg text-sm md:text-base font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mua ngay
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Thông tin chi tiết</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <h3 className="text-base md:text-lg font-semibold mb-2">Thành phần</h3>
              <ul className="space-y-2 text-sm md:text-base text-gray-700">
                {(product.ingredients || ['Đang cập nhật']).map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <FiCheck className="w-4 h-4 md:w-5 md:h-5 text-primary mt-0.5 md:mt-1 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold mb-2">Hướng dẫn sử dụng</h3>
              <p className="text-sm md:text-base text-gray-700">
                {product.usage || 'Sử dụng 1-2 viên mỗi ngày sau bữa ăn. Tham khảo ý kiến bác sĩ nếu bạn đang mang thai, cho con bú hoặc điều trị bệnh.'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Đánh giá ({reviews.length})</h2>

          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500 mb-6">Chưa có đánh giá nào cho sản phẩm này.</p>
          ) : (
            <div className="space-y-4 mb-6">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-800">{r.author}</span>
                    <span className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FiStar
                          key={i}
                          className={cn('w-3.5 h-3.5', i < r.rating ? 'text-[#FFB300] fill-current' : 'text-gray-300')}
                        />
                      ))}
                    </span>
                  </div>
                  {r.comment && <p className="text-sm text-gray-700 mt-1">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}

          {isAuthenticated ? (
            <form onSubmit={handleSubmitReview} className="border-t border-gray-100 pt-4">
              <h3 className="text-base font-semibold mb-3">Viết đánh giá của bạn</h3>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button type="button" key={i} onClick={() => setReviewRating(i + 1)} aria-label={`${i + 1} sao`}>
                    <FiStar className={cn('w-6 h-6', i < reviewRating ? 'text-[#FFB300] fill-current' : 'text-gray-300')} />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-primary"
              />
              {reviewError && <p className="text-sm text-red-600 mt-2">{reviewError}</p>}
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="mt-3 bg-primary hover:bg-secondary text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {reviewSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </form>
          ) : (
            <p className="text-sm text-gray-500 border-t border-gray-100 pt-4">
              <Link to="/login" className="text-primary font-semibold hover:underline">Đăng nhập</Link> để viết đánh giá.
            </p>
          )}
        </div>

        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Sản phẩm liên quan</h2>
          {relatedProducts.length > 0 ? (
            <ProductList products={relatedProducts} />
          ) : (
            <p className="text-sm md:text-base text-gray-500">Không có sản phẩm liên quan.</p>
          )}
        </div>
      </div>
    </div>
  );
};
