import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import RequireAuth from './lib/RequireAuth';
import AppLayout from './components/AppLayout';
import { Toaster } from './components/ui/sonner';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MarketplacePage from './pages/MarketplacePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import SellerProductsPage from './pages/SellerProductsPage';
import SellerProductFormPage from './pages/SellerProductFormPage';
import TeamPage from './pages/TeamPage';

function PublicLanding() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

function Protected({ children }) {
  return (
    <RequireAuth>
      <AppLayout>{children}</AppLayout>
    </RequireAuth>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicLanding />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
          <Route path="/marketplace" element={<Protected><MarketplacePage /></Protected>} />
          <Route path="/products/:id" element={<Protected><ProductDetailPage /></Protected>} />
          <Route path="/cart" element={<Protected><CartPage /></Protected>} />
          <Route path="/orders" element={<Protected><OrdersPage /></Protected>} />
          <Route path="/orders/:id" element={<Protected><OrderDetailPage /></Protected>} />
          <Route path="/seller/products" element={<Protected><SellerProductsPage /></Protected>} />
          <Route path="/seller/products/new" element={<Protected><SellerProductFormPage /></Protected>} />
          <Route path="/seller/products/:id/edit" element={<Protected><SellerProductFormPage /></Protected>} />
          <Route path="/team" element={<Protected><TeamPage /></Protected>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}

export default App;
