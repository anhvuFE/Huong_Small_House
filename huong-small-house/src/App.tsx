import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ShoppingCart } from './components/cart/ShoppingCart';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { CategoriesPage } from './pages/CategoriesPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/about" element={<div className="container mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Giới thiệu</h1></div>} />
            <Route path="/contact" element={<div className="container mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Liên hệ</h1></div>} />
          </Routes>
        </main>
        <Footer />
        <ShoppingCart />
      </div>
    </Router>
  );
}

export default App;
