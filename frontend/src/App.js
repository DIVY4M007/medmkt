import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import RequireAuth from './lib/RequireAuth';
import AppLayout from './components/AppLayout';
import { Toaster } from './components/ui/sonner';

import LandingPage from './pages/LandingPage';
import { LoginPortal, RegisterPortal } from './pages/AuthPortalPage';
import PortalLoginPage from './pages/PortalLoginPage';
import PortalRegisterPage from './pages/PortalRegisterPage';
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

// Restrict a protected page to one accountType — used for cart (buyers only) and seller catalogue.
function RequireAccountType({ accountType, children }) {
  const { user } = useAuth();
  if (user && user.accountType !== accountType) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicLanding />} />

          {/* Portal selectors */}
          <Route path="/login" element={<LoginPortal />} />
          <Route path="/register" element={<RegisterPortal />} />

          {/* Buyer auth */}
          <Route path="/buyer/login" element={<PortalLoginPage accountType="buyer" />} />
          <Route path="/buyer/register" element={<PortalRegisterPage accountType="buyer" />} />

          {/* Seller auth */}
          <Route path="/seller/login" element={<PortalLoginPage accountType="seller" />} />
          <Route path="/seller/register" element={<PortalRegisterPage accountType="seller" />} />

          {/* Shared protected routes — dashboard adapts itself based on accountType */}
          <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
          <Route path="/marketplace" element={<Protected><MarketplacePage /></Protected>} />
          <Route path="/products/:id" element={<Protected><ProductDetailPage /></Protected>} />
          <Route path="/orders" element={<Protected><OrdersPage /></Protected>} />
          <Route path="/orders/:id" element={<Protected><OrderDetailPage /></Protected>} />
          <Route path="/team" element={<Protected><TeamPage /></Protected>} />

          {/* Buyer-only */}
          <Route path="/cart" element={<Protected><RequireAccountType accountType="buyer"><CartPage /></RequireAccountType></Protected>} />

          {/* Seller-only */}
          <Route path="/seller/products" element={<Protected><RequireAccountType accountType="seller"><SellerProductsPage /></RequireAccountType></Protected>} />
          <Route path="/seller/products/new" element={<Protected><RequireAccountType accountType="seller"><SellerProductFormPage /></RequireAccountType></Protected>} />
          <Route path="/seller/products/:id/edit" element={<Protected><RequireAccountType accountType="seller"><SellerProductFormPage /></RequireAccountType></Protected>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}

export default App;
