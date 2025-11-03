import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ShoppingCart } from './components/cart/ShoppingCart';
import { ScrollToTop } from './components/common/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';

function App() {
  const [headerHeight, setHeaderHeight] = useState(96);

  useEffect(() => {
    const calculateHeaderHeight = () => {
      const mainHeader = document.getElementById('main-header');
      const topBar = document.getElementById('top-bar');

      if (!mainHeader || !topBar) {
        setHeaderHeight(96);
        return;
      }

      const totalHeight = mainHeader.offsetHeight + topBar.offsetHeight;
      setHeaderHeight(totalHeight);
    };

    calculateHeaderHeight();
    setTimeout(calculateHeaderHeight, 100);
    window.addEventListener('resize', calculateHeaderHeight);

    return () => {
      window.removeEventListener('resize', calculateHeaderHeight);
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1" style={{ paddingTop: `${headerHeight}px` }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        <Footer />
        <ShoppingCart />
      </div>
    </Router>
  );
}

export default App;
