import React, { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';
import { theme } from '../theme';
import { productApi } from '../services/productApi';
import type { Product } from '../types';
import { mockProducts } from '../data/productData';

// Eagerly loaded — above the fold
import HeroSection from '../components/home/HeroSection';
import TrustSection from '../components/home/TrustSection';

// Lazy loaded — below the fold for performance
const StatsSection = lazy(() => import('../components/home/StatsSection'));
const CategorySection = lazy(() => import('../components/home/CategorySection'));
const ProductHighlight = lazy(() => import('../components/home/ProductHighlight'));
const PromoBanner = lazy(() => import('../components/home/PromoBanner'));
const TestimonialSection = lazy(() => import('../components/home/TestimonialSection'));
const CTASection = lazy(() => import('../components/home/CTASection'));

// Minimal fallback — prevents layout shift
const SectionFallback: React.FC = () => (
  <Box sx={{ py: 6, minHeight: 200 }} />
);

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await productApi.listProducts();
        if (!cancelled) setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products, using mock data:', err);
        if (!cancelled) {
          setProducts(mockProducts);
          setError('');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchProducts();
    return () => { cancelled = true; };
  }, []);

  const featuredProducts = useMemo(
    () => products.filter((p) => p.isFeatured).slice(0, 4),
    [products]
  );

  const bestSellers = useMemo(
    () => [...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, 4),
    [products]
  );

  const newProducts = useMemo(
    () => [...products].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 4),
    [products]
  );

  // Fallback: if no featured products flagged, take first 4
  const featured = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4);

  return (
    <ThemeProvider theme={theme}>
      {/* === Above the fold — no lazy loading === */}
      <HeroSection />
      <TrustSection />

      {/* === Below the fold — lazy loaded sections === */}
      <Suspense fallback={<SectionFallback />}>
        <StatsSection />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <CategorySection />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <ProductHighlight
          tag="Nổi bật"
          title="Sản phẩm nổi bật"
          link="/products?featured=true"
          products={featured}
          isLoading={isLoading}
          error={error}
          bgColor="#fff"
        />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <PromoBanner />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <ProductHighlight
          tag="Bán chạy"
          title="Sản phẩm bán chạy nhất"
          link="/products?bestseller=true"
          products={bestSellers}
          isLoading={isLoading}
          error={error}
          bgColor="#FAFBFC"
        />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <ProductHighlight
          tag="Mới nhất"
          title="Sản phẩm mới về"
          link="/products?new=true"
          products={newProducts}
          isLoading={isLoading}
          error={error}
          bgColor="#fff"
        />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <TestimonialSection />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <CTASection />
      </Suspense>
    </ThemeProvider>
  );
};
