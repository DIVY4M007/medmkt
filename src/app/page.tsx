'use client';

import { useAppStore } from '@/lib/store';
import { useEffect } from 'react';
import { Stethoscope, LogOut, Store, ShoppingCart, Package, Users, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingPage from '@/components/pages/LandingPage';
import DashboardPage from '@/components/pages/DashboardPage';
import MarketplacePage from '@/components/pages/MarketplacePage';
import ProductDetailPage from '@/components/pages/ProductDetailPage';
import CartPage from '@/components/pages/CartPage';
import CartUploadPage from '@/components/pages/CartUploadPage';
import OrdersPage from '@/components/pages/OrdersPage';
import OrderDetailPage from '@/components/pages/OrderDetailPage';
import SellerProductsPage from '@/components/pages/SellerProductsPage';
import SellerProductFormPage from '@/components/pages/SellerProductFormPage';
import TeamPage from '@/components/pages/TeamPage';
import { LoginPortalPage, RegisterPortalPage } from '@/components/pages/AuthPortalPage';
import PortalLoginPage from '@/components/pages/PortalLoginPage';
import PortalRegisterPage from '@/components/pages/PortalRegisterPage';

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, navigate, logout, page } = useAppStore();

  const isBuyer = user?.accountType === 'buyer';
  const isSeller = user?.accountType === 'seller';

  const navItems = [
    {
      label: 'Dashboard',
      page: 'dashboard',
      icon: <LayoutDashboard className="size-4" />,
      testid: 'nav-dashboard',
    },
    {
      label: 'Marketplace',
      page: 'marketplace',
      icon: <Store className="size-4" />,
      testid: 'nav-marketplace',
    },
  ];

  if (isBuyer) {
    navItems.push(
      {
        label: 'Cart',
        page: 'cart',
        icon: <ShoppingCart className="size-4" />,
        testid: 'nav-cart',
      },
      {
        label: 'Orders',
        page: 'orders',
        icon: <Package className="size-4" />,
        testid: 'nav-orders',
      }
    );
  }

  if (isSeller) {
    navItems.push(
      {
        label: 'Orders',
        page: 'orders',
        icon: <Package className="size-4" />,
        testid: 'nav-orders',
      },
      {
        label: 'Products',
        page: 'seller-products',
        icon: <Package className="size-4" />,
        testid: 'nav-products',
      }
    );
  }

  navItems.push({
    label: 'Team',
    page: 'team',
    icon: <Users className="size-4" />,
    testid: 'nav-team',
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-[#D5CEBD]/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('dashboard')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            data-testid="nav-home"
          >
            <div className="w-8 h-8 rounded-lg bg-[#4A675B] flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-semibold text-[#1F2321] hidden sm:inline">
              MedMarket
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.page}
                data-testid={item.testid}
                onClick={() => navigate(item.page)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-press text-sm font-medium transition-colors ${
                  page === item.page
                    ? 'bg-[#4A675B] text-white'
                    : 'text-[#5C635F] hover:bg-[#F4F1EA]'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#5C635F] hidden sm:inline">
              {user?.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              data-testid="nav-logout"
              className="text-[#5C635F] hover:text-[#C47055] rounded-lg"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FDFBF7]/95 backdrop-blur-md border-t border-[#D5CEBD] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <nav className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.page}
              data-testid={`mobile-${item.testid}`}
              onClick={() => navigate(item.page)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs font-medium transition-colors ${
                page === item.page
                  ? 'text-[#4A675B]'
                  : 'text-[#5C635F]'
              }`}
            >
              {item.icon}
              <span className="truncate max-w-[60px]">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
}

export default function Home() {
  const { page, checkAuth, loading, user } = useAppStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDFBF7]">
        <div className="size-8 border-2 border-[#4A675B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Public pages (no auth required)
  switch (page) {
    case 'landing':
      return <LandingPage />;
    case 'login-portal':
      return <LoginPortalPage />;
    case 'register-portal':
      return <RegisterPortalPage />;
    case 'buyer-login':
      return <PortalLoginPage accountType="buyer" />;
    case 'seller-login':
      return <PortalLoginPage accountType="seller" />;
    case 'buyer-register':
      return <PortalRegisterPage accountType="buyer" />;
    case 'seller-register':
      return <PortalRegisterPage accountType="seller" />;
  }

  // Authenticated pages
  if (!user) {
    return <LandingPage />;
  }

  switch (page) {
    case 'dashboard':
      return <DashboardLayout><DashboardPage /></DashboardLayout>;
    case 'marketplace':
      return <DashboardLayout><MarketplacePage /></DashboardLayout>;
    case 'product-detail':
      return <DashboardLayout><ProductDetailPage /></DashboardLayout>;
    case 'cart':
      return <DashboardLayout><CartPage /></DashboardLayout>;
    case 'cart-upload':
      return <DashboardLayout><CartUploadPage /></DashboardLayout>;
    case 'orders':
      return <DashboardLayout><OrdersPage /></DashboardLayout>;
    case 'order-detail':
      return <DashboardLayout><OrderDetailPage /></DashboardLayout>;
    case 'seller-products':
      return <DashboardLayout><SellerProductsPage /></DashboardLayout>;
    case 'seller-product-form':
      return <DashboardLayout><SellerProductFormPage /></DashboardLayout>;
    case 'team':
      return <DashboardLayout><TeamPage /></DashboardLayout>;
    default:
      return <DashboardLayout><DashboardPage /></DashboardLayout>;
  }
}
