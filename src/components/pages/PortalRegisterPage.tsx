'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Stethoscope, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface PortalRegisterPageProps {
  accountType: 'buyer' | 'seller';
}

const BUYER_ORG_TYPES = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'pharmacy', label: 'Pharmacy' },
];

const SELLER_ORG_TYPES = [
  { value: 'vendor', label: 'Vendor' },
  { value: 'distributor', label: 'Distributor' },
];

export default function PortalRegisterPage({
  accountType,
}: PortalRegisterPageProps) {
  const { navigate, registerWithPortal } = useAppStore();
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isBuyer = accountType === 'buyer';
  const panelBg = isBuyer ? 'bg-primary' : 'bg-accent';
  const panelIconBg = isBuyer ? 'bg-white/20' : 'bg-white/20';
  const orgTypes = isBuyer ? BUYER_ORG_TYPES : SELLER_ORG_TYPES;
  const loginTarget = isBuyer ? 'buyer-login' : 'seller-login';
  const otherPortal = isBuyer ? 'seller-register' : 'buyer-register';
  const otherLabel = isBuyer ? 'Seller' : 'Buyer';
  const btnBg = isBuyer ? 'bg-primary hover:bg-primary/90' : 'bg-accent hover:bg-accent/90';
  const accentText = isBuyer ? 'text-primary' : 'text-accent';
  const accentHoverText = isBuyer ? 'hover:text-primary/80' : 'hover:text-accent/80';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !orgType || !name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSubmitting(true);
    try {
      await registerWithPortal(accountType, {
        orgName,
        orgType,
        name,
        email,
        password,
      });
      toast.success('Account created successfully!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
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
            onClick={() => navigate('register-portal')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-10"
            data-testid="register-back"
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
              ? 'Join the healthcare procurement network'
              : 'Expand your reach in healthcare'}
          </h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-sm">
            {isBuyer
              ? 'Register your organization to access verified suppliers, tier-based pricing, and streamlined order management.'
              : 'Register your business to list products, set pricing tiers, and connect with hospitals and pharmacies nationwide.'}
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
            Create account
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Set up your {isBuyer ? 'buyer' : 'seller'} organization on MedMkt
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="orgName" className="text-foreground">
                Organization name
              </Label>
              <Input
                id="orgName"
                type="text"
                placeholder={isBuyer ? 'City General Hospital' : 'MedSupply Co.'}
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="border-border bg-card focus-visible:ring-primary/20 focus-visible:border-primary"
                data-testid="register-orgName"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orgType" className="text-foreground">
                Organization type
              </Label>
              <Select value={orgType} onValueChange={setOrgType}>
                <SelectTrigger
                  className="w-full border-border bg-card"
                  data-testid="register-orgType"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {orgTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Your name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-border bg-card focus-visible:ring-primary/20 focus-visible:border-primary"
                data-testid="register-name"
              />
            </div>

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
                data-testid="register-email"
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
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-border bg-card pr-10 focus-visible:ring-primary/20 focus-visible:border-primary"
                  data-testid="register-password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="register-toggle-password"
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
              data-testid="register-submit"
            >
              {submitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="mt-6 flex flex-col gap-3 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <button
                onClick={() => navigate(loginTarget)}
                className={`font-medium ${accentText} ${accentHoverText} hover:underline`}
                data-testid="register-goto-login"
              >
                Sign in
              </button>
            </p>
            <p className="text-muted-foreground">
              Are you a {otherLabel.toLowerCase()}?{' '}
              <button
                onClick={() => navigate(otherPortal)}
                className={`font-medium ${accentText} ${accentHoverText} hover:underline`}
                data-testid="register-switch-portal"
              >
                Register as {otherLabel}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
