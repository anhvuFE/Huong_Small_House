import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense, type ComponentType } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ShoppingCart } from './components/cart/ShoppingCart';
import { ScrollToTop } from './components/common/ScrollToTop';
import { useAuthStore } from './store/useAuthStore';
import { Loader } from './components/common/Loader';
import { ToastProvider } from './components/common/Toast';

const lazyComponent = <T extends Record<string, ComponentType>>(
  factory: () => Promise<T>,
  exportName: keyof T,
) =>
  lazy(() =>
    factory().then((module) => ({
      default: module[exportName] as ComponentType,
    })),
  );

const AdminLayout = lazyComponent(() => import('./components/admin/AdminLayout'), 'AdminLayout');
const HomePage = lazyComponent(() => import('./pages/HomePage'), 'HomePage');
const ProductsPage = lazyComponent(() => import('./pages/ProductsPage'), 'ProductsPage');
const ProductDetailPage = lazyComponent(() => import('./pages/ProductDetailPage'), 'ProductDetailPage');
const LoginPage = lazyComponent(() => import('./pages/LoginPage'), 'LoginPage');
const RegisterPage = lazyComponent(() => import('./pages/RegisterPage'), 'RegisterPage');
const ForgotPasswordPage = lazyComponent(() => import('./pages/ForgotPasswordPage'), 'ForgotPasswordPage');
const CategoriesPage = lazyComponent(() => import('./pages/CategoriesPage'), 'CategoriesPage');
const AboutPage = lazyComponent(() => import('./pages/AboutPage'), 'AboutPage');
const ContactPage = lazyComponent(() => import('./pages/ContactPage'), 'ContactPage');
const BlogListPage = lazyComponent(() => import('./pages/BlogListPage'), 'BlogListPage');
const BlogDetailPage = lazyComponent(() => import('./pages/BlogDetailPage'), 'BlogDetailPage');
const AccountPage = lazyComponent(() => import('./pages/AccountPage'), 'AccountPage');
const AdminDashboard = lazyComponent(() => import('./pages/admin/AdminDashboard'), 'AdminDashboard');
const ProductManagement = lazyComponent(() => import('./pages/admin/ProductManagement'), 'ProductManagement');
const OrderManagement = lazyComponent(() => import('./pages/admin/OrderManagement'), 'OrderManagement');
const UserManagement = lazyComponent(() => import('./pages/admin/UserManagement'), 'UserManagement');
const PromotionManagement = lazyComponent(() => import('./pages/admin/PromotionManagement'), 'PromotionManagement');
const ContentManagement = lazyComponent(() => import('./pages/admin/ContentManagement'), 'ContentManagement');
const Reports = lazyComponent(() => import('./pages/admin/Reports'), 'Reports');
const Settings = lazyComponent(() => import('./pages/admin/Settings'), 'Settings');
const CategoryManagement = lazyComponent(() => import('./pages/admin/CategoryManagement'), 'CategoryManagement');

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
      <ToastProvider>
        <ScrollToTop />
        <Suspense fallback={<div className="py-10 flex justify-center"><Loader /></div>}>
          <Routes>
          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
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
          <Route
            path="/*"
            element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1" style={{ paddingTop: `${headerHeight}px` }}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:slug" element={<ProductDetailPage />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                    <Route path="/blog" element={<BlogListPage />} />
                    <Route path="/blog/:slug" element={<BlogDetailPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/account" element={<AccountPage />} />
                  </Routes>
                </main>
                <Footer />
                <ShoppingCart />
              </div>
            }
          />
          </Routes>
        </Suspense>
      </ToastProvider>
    </Router>
  );
}

export default App;
