'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stethoscope, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface PortalLoginPageProps {
  accountType: 'buyer' | 'seller';
}

const BUYER_CREDENTIALS = [
  { email: 'alice@hospital.com', password: 'Password123!' },
  { email: 'bob@hospital.com', password: 'Password123!' },
  { email: 'carol@pharmacy.com', password: 'Password123!' },
  { email: 'dan@pharmacy.com', password: 'Password123!' },
];

const SELLER_CREDENTIALS = [
  { email: 'eve@vendor.com', password: 'Password123!' },
  { email: 'frank@distributor.com', password: 'Password123!' },
];

export default function PortalLoginPage({ accountType }: PortalLoginPageProps) {
  const { navigate, loginWithPortal } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isBuyer = accountType === 'buyer';
  const panelBg = isBuyer ? 'bg-[#4A675B]' : 'bg-[#C47055]';
  const panelHoverBg = isBuyer ? 'hover:bg-[#3D564C]' : 'hover:bg-[#B05F47]';
  const accentColor = isBuyer ? '#4A675B' : '#C47055';
  const credentials = isBuyer ? BUYER_CREDENTIALS : SELLER_CREDENTIALS;
  const registerTarget = isBuyer ? 'buyer-register' : 'seller-register';
  const otherPortal = isBuyer ? 'seller-login' : 'buyer-login';
  const otherLabel = isBuyer ? 'Seller' : 'Buyer';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setSubmitting(true);
    try {
      await loginWithPortal(accountType, email, password);
      toast.success('Welcome back!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const fillCredentials = (cred: { email: string; password: string }) => {
    setEmail(cred.email);
    setPassword(cred.password);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel */}
      <div
        className={`${panelBg} flex flex-col justify-between p-8 lg:p-12 lg:w-5/12 min-h-[280px] lg:min-h-screen`}
      >
        <div>
          <button
            onClick={() => navigate('login-portal')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-10"
            data-testid="login-back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to portal</span>
          </button>

          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-md bg-white/20 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-semibold text-xl text-white">
              MedMarket
            </span>
          </div>

          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-3">
            {isBuyer
              ? 'Streamline your procurement workflow'
              : 'Reach healthcare buyers nationwide'}
          </h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-sm">
            {isBuyer
              ? 'Access tier-based pricing, manage purchase orders, and track deliveries — all from one dashboard.'
              : 'List your products, manage pricing tiers, and fulfill orders from hospitals and pharmacies across the country.'}
          </p>
        </div>

        <div className="hidden lg:block">
          <div className="flex items-center gap-4 mt-8">
            <div className="flex flex-col">
              <span className="text-white/50 text-xs uppercase tracking-wide">
                Account type
              </span>
              <span className="text-white font-heading font-semibold">
                {isBuyer ? 'Buyer' : 'Seller'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-16 bg-[#FDFBF7]">
        <div className="w-full max-w-md mx-auto">
          <h1 className="font-heading text-2xl font-bold text-[#1F2321] mb-1">
            Sign in
          </h1>
          <p className="text-[#5C635F] text-sm mb-8">
            Enter your credentials to access your {isBuyer ? 'buyer' : 'seller'}{' '}
            dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#1F2321]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-[#D5CEBD] bg-white focus-visible:border-[#4A675B]"
                data-testid="login-email"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#1F2321]">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-[#D5CEBD] bg-white pr-10 focus-visible:border-[#4A675B]"
                  data-testid="login-password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C635F] hover:text-[#1F2321]"
                  data-testid="login-toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md text-white font-medium h-10"
              style={{ backgroundColor: accentColor }}
              data-testid="login-submit"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 flex flex-col gap-3 text-center text-sm">
            <p className="text-[#5C635F]">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => navigate(registerTarget)}
                className="font-medium hover:underline"
                style={{ color: accentColor }}
                data-testid="login-goto-register"
              >
                Create one
              </button>
            </p>
            <p className="text-[#5C635F]">
              Are you a {otherLabel.toLowerCase()}?{' '}
              <button
                onClick={() => navigate(otherPortal)}
                className="font-medium hover:underline"
                style={{ color: accentColor }}
                data-testid="login-switch-portal"
              >
                Sign in as {otherLabel}
              </button>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-[#F4F1EA] border border-[#D5CEBD] rounded-md">
            <p className="text-xs font-medium text-[#1F2321] mb-2">
              Demo credentials
            </p>
            <div className="space-y-1.5">
              {credentials.map((cred) => (
                <button
                  key={cred.email}
                  type="button"
                  onClick={() => fillCredentials(cred)}
                  className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded hover:bg-[#EAE5D9] transition-colors group"
                  data-testid={`login-demo-${cred.email.split('@')[0]}`}
                >
                  <span className="text-xs text-[#5C635F] group-hover:text-[#1F2321] font-mono">
                    {cred.email}
                  </span>
                  <span className="text-[10px] text-[#D5CEBD]">/</span>
                  <span className="text-xs text-[#5C635F] group-hover:text-[#1F2321] font-mono">
                    {cred.password}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
