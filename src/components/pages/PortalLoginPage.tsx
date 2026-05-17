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
  const panelBg = isBuyer ? 'bg-primary' : 'bg-accent';
  const panelIconBg = isBuyer ? 'bg-white/20' : 'bg-white/20';
  const credentials = isBuyer ? BUYER_CREDENTIALS : SELLER_CREDENTIALS;
  const registerTarget = isBuyer ? 'buyer-register' : 'seller-register';
  const otherPortal = isBuyer ? 'seller-login' : 'buyer-login';
  const otherLabel = isBuyer ? 'Seller' : 'Buyer';
  const btnBg = isBuyer ? 'bg-primary hover:bg-primary/90' : 'bg-accent hover:bg-accent/90';
  const accentText = isBuyer ? 'text-primary' : 'text-accent';
  const accentHoverText = isBuyer ? 'hover:text-primary/80' : 'hover:text-accent/80';

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
        className={`${panelBg} flex flex-col justify-between p-8 lg:p-12 lg:w-5/12 min-h-[280px] lg:min-h-screen relative overflow-hidden`}
      >
        {/* Decorative dot pattern overlay */}
        <div className="absolute inset-0 dot-pattern opacity-[0.04]" />

        <div className="relative z-10">
          <button
            onClick={() => navigate('login-portal')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-10"
            data-testid="login-back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to portal</span>
          </button>

          <div className="flex items-center gap-2.5 mb-8">
            <div className={`w-10 h-10 rounded-md ${panelIconBg} flex items-center justify-center`}>
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-semibold text-xl text-white">
              MedMkt
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

        <div className="relative z-10 hidden lg:block">
          <div className="flex items-center gap-4 mt-8">
            <div className="flex flex-col">
              <span className="label-overline text-white/50">Account type</span>
              <span className="text-white font-heading font-semibold mt-0.5">
                {isBuyer ? 'Buyer' : 'Seller'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-16 bg-background">
        <div className="w-full max-w-md mx-auto animate-fade-in-up">
          <h1 className="font-heading text-2xl font-bold text-foreground mb-1">
            Sign in
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Enter your credentials to access your {isBuyer ? 'buyer' : 'seller'}{' '}
            dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-border bg-card focus-visible:ring-primary/20 focus-visible:border-primary"
                data-testid="login-email"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-border bg-card pr-10 focus-visible:ring-primary/20 focus-visible:border-primary"
                  data-testid="login-password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
              className={`w-full rounded-md text-white font-medium h-10 btn-press ${btnBg}`}
              data-testid="login-submit"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 flex flex-col gap-3 text-center text-sm">
            <p className="text-muted-foreground">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => navigate(registerTarget)}
                className={`font-medium ${accentText} ${accentHoverText} hover:underline`}
                data-testid="login-goto-register"
              >
                Create one
              </button>
            </p>
            <p className="text-muted-foreground">
              Are you a {otherLabel.toLowerCase()}?{' '}
              <button
                onClick={() => navigate(otherPortal)}
                className={`font-medium ${accentText} ${accentHoverText} hover:underline`}
                data-testid="login-switch-portal"
              >
                Sign in as {otherLabel}
              </button>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-secondary rounded-lg border border-border">
            <p className="label-overline text-muted-foreground mb-3">
              Demo credentials
            </p>
            <div className="space-y-1">
              {credentials.map((cred) => (
                <button
                  key={cred.email}
                  type="button"
                  onClick={() => fillCredentials(cred)}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md hover:bg-secondary/80 transition-colors group"
                  data-testid={`login-demo-${cred.email.split('@')[0]}`}
                >
                  <span className="text-xs text-muted-foreground group-hover:text-foreground font-mono transition-colors">
                    {cred.email}
                  </span>
                  <span className="text-[10px] text-border">/</span>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground font-mono transition-colors">
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
