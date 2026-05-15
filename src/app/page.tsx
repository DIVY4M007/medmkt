'use client';

import { useAppStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import {
  Stethoscope,
  LogOut,
  Store,
  ShoppingCart,
  Package,
  Users,
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
  CircleDot,
} from 'lucide-react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isBuyer = user?.accountType === 'buyer';
  const isSeller = user?.accountType === 'seller';

  const navItems = [
    {
      label: 'Dashboard',
      page: 'dashboard',
      icon: LayoutDashboard,
      testid: 'nav-dashboard',
    },
    {
      label: 'Marketplace',
      page: 'marketplace',
      icon: Store,
      testid: 'nav-marketplace',
    },
  ];

  if (isBuyer) {
    navItems.push(
      {
        label: 'Cart',
        page: 'cart',
        icon: ShoppingCart,
        testid: 'nav-cart',
      },
      {
        label: 'Orders',
        page: 'orders',
        icon: Package,
        testid: 'nav-orders',
      }
    );
  }

  if (isSeller) {
    navItems.push(
      {
        label: 'Orders',
        page: 'orders',
        icon: Package,
        testid: 'nav-orders',
      },
      {
        label: 'Products',
        page: 'seller-products',
        icon: Package,
        testid: 'nav-products',
      }
    );
  }

  navItems.push({
    label: 'Team',
    page: 'team',
    icon: Users,
    testid: 'nav-team',
  });

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '??';

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-sidebar border-r border-sidebar-border shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-sidebar-border shrink-0">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-semibold text-sidebar-foreground leading-tight">
              MedMkt
            </span>
            <span className="text-[10px] text-sidebar-foreground/50 leading-none tracking-wider uppercase">
              Healthcare B2B
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const isActive = page === item.page;
            const Icon = item.icon;
            return (
              <button
                key={item.page}
                data-testid={item.testid}
                onClick={() => navigate(item.page)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                }`}
              >
                <Icon className="size-[18px] shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && (
                  <CircleDot className="size-3 text-sidebar-primary" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-sidebar-foreground/50 truncate">
                {user?.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              data-testid="nav-logout"
              className="text-sidebar-foreground/50 hover:text-red-400 hover:bg-red-500/10 size-8 shrink-0"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-sidebar transform transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-sidebar-primary-foreground" />
            </div>
            <span className="font-heading font-semibold text-sidebar-foreground">
              MedMkt
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = page === item.page;
            const Icon = item.icon;
            return (
              <button
                key={item.page}
                data-testid={`mobile-${item.testid}`}
                onClick={() => {
                  navigate(item.page);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                }`}
              >
                <Icon className="size-[18px]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary text-xs font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-sidebar-foreground/50 truncate">
                {user?.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-sidebar-foreground/50 hover:text-red-400 size-8"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile hamburger + breadcrumb) */}
        <header className="sticky top-0 z-40 h-14 bg-background/80 backdrop-blur-md border-b border-border flex items-center gap-3 px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
            data-testid="mobile-menu-btn"
          >
            <Menu className="size-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-muted-foreground">
              {navItems.find((i) => i.page === page)?.label || 'Dashboard'}
            </span>
          </div>

          <div className="flex-1" />

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-secondary rounded-full px-3 py-1.5">
              <span className="capitalize">{user?.accountType}</span>
              <span className="text-border">·</span>
              <span className="capitalize">{user?.role}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground font-heading">
            Loading MedMkt...
          </span>
        </div>
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
