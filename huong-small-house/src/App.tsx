import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ShoppingCart } from './components/cart/ShoppingCart';
import { ScrollToTop } from './components/common/ScrollToTop';
import { AdminLayout } from './components/admin/AdminLayout';
import { useAuthStore } from './store/useAuthStore';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ProductManagement } from './pages/admin/ProductManagement';
import { OrderManagement } from './pages/admin/OrderManagement';
import { UserManagement } from './pages/admin/UserManagement';
import { PromotionManagement } from './pages/admin/PromotionManagement';
import { ContentManagement } from './pages/admin/ContentManagement';
import { Reports } from './pages/admin/Reports';
import { Settings } from './pages/admin/Settings';
import { CategoryManagement } from './pages/admin/CategoryManagement';

// Protected Route Component for Admin
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  // For demo purposes, we'll allow admin access with the mock login
  // In production, you'd check for actual admin role
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

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
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="promotions" element={<PromotionManagement />} />
          <Route path="content" element={<ContentManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Public Routes */}
        <Route path="/*" element={
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
        } />
      </Routes>
    </Router>
  );
}

export default App;
