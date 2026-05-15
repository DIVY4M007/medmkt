'use client';

import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Stethoscope, ShoppingCart, Store, ArrowLeft, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      {/* Header */}
      <header className="border-b border-[#D5CEBD] bg-[#FDFBF7]/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('landing')}
            className="flex items-center gap-2 text-[#5C635F] hover:text-[#1F2321] transition-colors duration-200"
            data-testid="portal-back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#4A675B] flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-semibold text-[#1F2321]">
              MedMarket
            </span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl animate-fade-in-up">
          <div className="text-center mb-10">
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#1F2321] mb-2">
              {title}
            </h1>
            <p className="text-[#5C635F]">{subtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 stagger-children">
            {/* Buyer Card */}
            <button
              data-testid="portal-buyer"
              onClick={() => navigate(buyerTarget)}
              className="portal-card-buyer group bg-[#FDFBF7] border-2 border-[#D5CEBD] rounded-xl p-8 text-left focus:outline-none focus:ring-2 focus:ring-[#4A675B]/40 focus:ring-offset-2"
            >
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-[#4A675B]/10 flex items-center justify-center mb-5 group-hover:bg-[#4A675B] transition-all duration-300">
                  <ShoppingCart className="w-7 h-7 text-[#4A675B] group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                </div>
                <h2 className="font-heading text-xl font-semibold text-[#1F2321] mb-1.5 group-hover:text-white transition-colors duration-300">
                  I&apos;m a Buyer
                </h2>
                <p className="text-sm text-[#5C635F] mb-5 leading-relaxed group-hover:text-white/80 transition-colors duration-300">
                  Hospitals &amp; pharmacies looking to procure medical supplies efficiently.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="px-2.5 py-1 bg-[#4A675B]/8 text-[#4A675B] rounded-md text-xs font-medium group-hover:bg-white/20 group-hover:text-white transition-colors duration-300">
                    Hospital
                  </span>
                  <span className="px-2.5 py-1 bg-[#4A675B]/8 text-[#4A675B] rounded-md text-xs font-medium group-hover:bg-white/20 group-hover:text-white transition-colors duration-300">
                    Pharmacy
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-[#4A675B] group-hover:text-white transition-colors duration-300">
                  {isLogin ? 'Sign in' : 'Get started'}
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </button>

            {/* Seller Card */}
            <button
              data-testid="portal-seller"
              onClick={() => navigate(sellerTarget)}
              className="portal-card-seller group bg-[#FDFBF7] border-2 border-[#C47055]/25 rounded-xl p-8 text-left focus:outline-none focus:ring-2 focus:ring-[#C47055]/40 focus:ring-offset-2"
            >
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-[#C47055]/10 flex items-center justify-center mb-5 group-hover:bg-[#C47055] transition-all duration-300">
                  <Store className="w-7 h-7 text-[#C47055] group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                </div>
                <h2 className="font-heading text-xl font-semibold text-[#1F2321] mb-1.5 group-hover:text-white transition-colors duration-300">
                  I&apos;m a Seller
                </h2>
                <p className="text-sm text-[#5C635F] mb-5 leading-relaxed group-hover:text-white/80 transition-colors duration-300">
                  Vendors &amp; distributors listing products and fulfilling orders.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="px-2.5 py-1 bg-[#C47055]/8 text-[#C47055] rounded-md text-xs font-medium group-hover:bg-white/20 group-hover:text-white transition-colors duration-300">
                    Vendor
                  </span>
                  <span className="px-2.5 py-1 bg-[#C47055]/8 text-[#C47055] rounded-md text-xs font-medium group-hover:bg-white/20 group-hover:text-white transition-colors duration-300">
                    Distributor
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-[#C47055] group-hover:text-white transition-colors duration-300">
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
              className="text-[#4A675B] hover:text-[#3D564C]"
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
