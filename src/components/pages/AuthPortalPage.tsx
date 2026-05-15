'use client';

import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Stethoscope, ShoppingCart, Store, ArrowLeft } from 'lucide-react';

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
      <header className="border-b border-[#D5CEBD]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('landing')}
            className="flex items-center gap-2 text-[#5C635F] hover:text-[#1F2321] transition-colors"
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
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#1F2321] mb-2">
              {title}
            </h1>
            <p className="text-[#5C635F]">{subtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Buyer Card */}
            <button
              data-testid="portal-buyer"
              onClick={() => navigate(buyerTarget)}
              className="group bg-[#FDFBF7] border border-[#D5CEBD] rounded-md p-6 text-left hover:-translate-y-1 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#4A675B] focus:ring-offset-2"
            >
              <div className="w-14 h-14 rounded-md bg-[#4A675B]/10 flex items-center justify-center mb-5 group-hover:bg-[#4A675B]/20 transition-colors">
                <ShoppingCart className="w-7 h-7 text-[#4A675B]" />
              </div>
              <h2 className="font-heading text-xl font-semibold text-[#1F2321] mb-1">
                I&apos;m a Buyer
              </h2>
              <p className="text-sm text-[#5C635F] mb-4">
                Hospitals &amp; pharmacies looking to procure medical supplies
                efficiently.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 bg-[#4A675B]/10 text-[#4A675B] rounded text-xs font-medium">
                  Hospital
                </span>
                <span className="px-2 py-0.5 bg-[#4A675B]/10 text-[#4A675B] rounded text-xs font-medium">
                  Pharmacy
                </span>
              </div>
            </button>

            {/* Seller Card */}
            <button
              data-testid="portal-seller"
              onClick={() => navigate(sellerTarget)}
              className="group bg-[#FDFBF7] border border-[#C47055]/30 rounded-md p-6 text-left hover:-translate-y-1 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#C47055] focus:ring-offset-2"
            >
              <div className="w-14 h-14 rounded-md bg-[#C47055]/10 flex items-center justify-center mb-5 group-hover:bg-[#C47055]/20 transition-colors">
                <Store className="w-7 h-7 text-[#C47055]" />
              </div>
              <h2 className="font-heading text-xl font-semibold text-[#1F2321] mb-1">
                I&apos;m a Seller
              </h2>
              <p className="text-sm text-[#5C635F] mb-4">
                Vendors &amp; distributors listing products and fulfilling
                orders.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 bg-[#C47055]/10 text-[#C47055] rounded text-xs font-medium">
                  Vendor
                </span>
                <span className="px-2 py-0.5 bg-[#C47055]/10 text-[#C47055] rounded text-xs font-medium">
                  Distributor
                </span>
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
