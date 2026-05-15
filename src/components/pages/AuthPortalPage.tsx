'use client';

import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Stethoscope,
  ShoppingCart,
  Store,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

interface AuthPortalPageProps {
  mode: 'login' | 'register';
}

function AuthPortalPage({ mode }: AuthPortalPageProps) {
  const { navigate } = useAppStore();

  const isLogin = mode === 'login';
  const title = isLogin ? 'Sign in to your account' : 'Create your account';
  const subtitle = isLogin
    ? 'Choose how you want to access the platform'
    : 'Choose your account type to get started';
  const buyerTarget = isLogin ? 'buyer-login' : 'buyer-register';
  const sellerTarget = isLogin ? 'seller-login' : 'seller-register';
  const switchMode = isLogin ? 'register-portal' : 'login-portal';
  const switchLabel = isLogin
    ? "Don't have an account? Create one"
    : 'Already have an account? Sign in';

  return (
    <div className="min-h-screen flex flex-col bg-background gradient-mesh">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('landing')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
            data-testid="portal-back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-semibold text-foreground">
              MedMkt
            </span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl animate-fade-in-up">
          <div className="text-center mb-10">
            <span className="label-overline text-primary mb-3 inline-block">
              {isLogin ? 'Welcome back' : 'Get started'}
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-2">
              {title}
            </h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 stagger-children">
            {/* Buyer Card */}
            <button
              data-testid="portal-buyer"
              onClick={() => navigate(buyerTarget)}
              className="portal-card-buyer group border-2 border-border rounded-xl p-8 text-left focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background"
            >
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 transition-all duration-300">
                  <ShoppingCart className="w-7 h-7 text-primary group-hover:scale-110 transition-all duration-300" />
                </div>
                <h2 className="font-heading text-xl font-semibold text-foreground mb-1.5 transition-colors duration-300">
                  I&apos;m a Buyer
                </h2>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed transition-colors duration-300">
                  Hospitals &amp; pharmacies looking to procure medical supplies
                  efficiently.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="px-2.5 py-1 bg-primary/8 text-primary rounded-md text-xs font-medium transition-colors duration-300">
                    Hospital
                  </span>
                  <span className="px-2.5 py-1 bg-primary/8 text-primary rounded-md text-xs font-medium transition-colors duration-300">
                    Pharmacy
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-300">
                  {isLogin ? 'Sign in' : 'Get started'}
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </button>

            {/* Seller Card */}
            <button
              data-testid="portal-seller"
              onClick={() => navigate(sellerTarget)}
              className="portal-card-seller group border-2 border-accent/20 rounded-xl p-8 text-left focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2 focus:ring-offset-background"
            >
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-5 transition-all duration-300">
                  <Store className="w-7 h-7 text-accent group-hover:scale-110 transition-all duration-300" />
                </div>
                <h2 className="font-heading text-xl font-semibold text-foreground mb-1.5 transition-colors duration-300">
                  I&apos;m a Seller
                </h2>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed transition-colors duration-300">
                  Vendors &amp; distributors listing products and fulfilling
                  orders.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="px-2.5 py-1 bg-accent/8 text-accent rounded-md text-xs font-medium transition-colors duration-300">
                    Vendor
                  </span>
                  <span className="px-2.5 py-1 bg-accent/8 text-accent rounded-md text-xs font-medium transition-colors duration-300">
                    Distributor
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-accent transition-colors duration-300">
                  {isLogin ? 'Sign in' : 'Get started'}
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </button>
          </div>

          {/* Switch Mode Link */}
          <div className="text-center mt-8">
            <Button
              variant="link"
              className="text-primary hover:text-primary/80"
              data-testid="portal-switch-mode"
              onClick={() => navigate(switchMode)}
            >
              {switchLabel}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export function LoginPortalPage() {
  return <AuthPortalPage mode="login" />;
}

export function RegisterPortalPage() {
  return <AuthPortalPage mode="register" />;
}
