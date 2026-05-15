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
  const panelBg = isBuyer ? 'bg-[#4A675B]' : 'bg-[#C47055]';
  const accentColor = isBuyer ? '#4A675B' : '#C47055';
  const orgTypes = isBuyer ? BUYER_ORG_TYPES : SELLER_ORG_TYPES;
  const loginTarget = isBuyer ? 'buyer-login' : 'seller-login';
  const otherPortal = isBuyer ? 'seller-register' : 'buyer-register';
  const otherLabel = isBuyer ? 'Seller' : 'Buyer';

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
        className={`${panelBg} flex flex-col justify-between p-8 lg:p-12 lg:w-5/12 min-h-[280px] lg:min-h-screen`}
      >
        <div>
          <button
            onClick={() => navigate('register-portal')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-10"
            data-testid="register-back"
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
              ? 'Join the healthcare procurement network'
              : 'Expand your reach in healthcare'}
          </h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-sm">
            {isBuyer
              ? 'Register your organization to access verified suppliers, tier-based pricing, and streamlined order management.'
              : 'Register your business to list products, set pricing tiers, and connect with hospitals and pharmacies nationwide.'}
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
            Create account
          </h1>
          <p className="text-[#5C635F] text-sm mb-8">
            Set up your {isBuyer ? 'buyer' : 'seller'} organization on MedMarket
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="orgName" className="text-[#1F2321]">
                Organization name
              </Label>
              <Input
                id="orgName"
                type="text"
                placeholder={isBuyer ? 'City General Hospital' : 'MedSupply Co.'}
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="border-[#D5CEBD] bg-white focus-visible:border-[#4A675B]"
                data-testid="register-orgName"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orgType" className="text-[#1F2321]">
                Organization type
              </Label>
              <Select value={orgType} onValueChange={setOrgType}>
                <SelectTrigger
                  className="w-full border-[#D5CEBD] bg-white"
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
              <Label htmlFor="name" className="text-[#1F2321]">
                Your name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-[#D5CEBD] bg-white focus-visible:border-[#4A675B]"
                data-testid="register-name"
              />
            </div>

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
                data-testid="register-email"
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
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-[#D5CEBD] bg-white pr-10 focus-visible:border-[#4A675B]"
                  data-testid="register-password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C635F] hover:text-[#1F2321]"
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
              className="w-full rounded-md text-white font-medium h-10"
              style={{ backgroundColor: accentColor }}
              data-testid="register-submit"
            >
              {submitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="mt-6 flex flex-col gap-3 text-center text-sm">
            <p className="text-[#5C635F]">
              Already have an account?{' '}
              <button
                onClick={() => navigate(loginTarget)}
                className="font-medium hover:underline"
                style={{ color: accentColor }}
                data-testid="register-goto-login"
              >
                Sign in
              </button>
            </p>
            <p className="text-[#5C635F]">
              Are you a {otherLabel.toLowerCase()}?{' '}
              <button
                onClick={() => navigate(otherPortal)}
                className="font-medium hover:underline"
                style={{ color: accentColor }}
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
