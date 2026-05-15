'use client';

import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Stethoscope,
  ArrowRight,
  Layers,
  ShieldCheck,
  BadgeCheck,
  ChevronRight,
} from 'lucide-react';

export default function LandingPage() {
  const { navigate } = useAppStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-[#D5CEBD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-[#4A675B] flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-semibold text-lg leading-tight text-[#1F2321]">
                MedMarket
              </span>
              <span className="text-[10px] text-[#5C635F] leading-none tracking-wide uppercase">
                B2B Healthcare
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-[#5C635F] hover:text-[#1F2321]"
              data-testid="nav-signin"
              onClick={() => navigate('login-portal')}
            >
              Sign in
            </Button>
            <Button
              className="bg-[#4A675B] hover:bg-[#3D564C] text-white rounded-md btn-press"
              data-testid="nav-create-account"
              onClick={() => navigate('register-portal')}
            >
              Create account
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center animate-fade-in-up">
            {/* Left Column */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <span className="label-overline text-[#5C635F]">
                Trusted procurement &middot; Verified suppliers
              </span>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-[#1F2321]">
                The procurement backbone for modern healthcare networks.
              </h1>

              <p className="text-lg text-[#5C635F] max-w-xl leading-relaxed">
                MedMarket connects hospitals, pharmacies, vendors, and
                distributors on a single platform with tier-based pricing,
                role-based approvals, and end-to-end order visibility.
              </p>

              <div className="flex flex-wrap gap-3 mt-2">
                <Button
                  size="lg"
                  className="bg-[#4A675B] hover:bg-[#3D564C] text-white rounded-md btn-press"
                  data-testid="hero-get-started"
                  onClick={() => navigate('register-portal')}
                >
                  Get started
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#D5CEBD] text-[#4A675B] hover:bg-[#F4F1EA] rounded-md btn-press"
                  data-testid="hero-signin"
                  onClick={() => navigate('login-portal')}
                >
                  Sign in
                </Button>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-8 mt-4">
                <div className="flex flex-col">
                  <span className="font-heading text-2xl font-bold text-[#4A675B]">
                    4
                  </span>
                  <span className="text-xs text-[#5C635F] uppercase tracking-wide">
                    Org types
                  </span>
                </div>
                <div className="w-px h-8 bg-[#D5CEBD]" />
                <div className="flex flex-col">
                  <span className="font-heading text-2xl font-bold text-[#4A675B]">
                    5
                  </span>
                  <span className="text-xs text-[#5C635F] uppercase tracking-wide">
                    Order states
                  </span>
                </div>
                <div className="w-px h-8 bg-[#D5CEBD]" />
                <div className="flex flex-col">
                  <span className="font-heading text-2xl font-bold text-[#4A675B]">
                    &#8734;
                  </span>
                  <span className="text-xs text-[#5C635F] uppercase tracking-wide">
                    Pricing tiers
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1710074213379-2a9c2653046a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwyfHxob3NwaXRhbCUyMGJlZHxlbnwwfHx8fDE3Nzc4NTE1MDh8MA&ixlib=rb-4.1.0&q=85"
                  alt="Modern hospital facility"
                  className="w-full h-80 lg:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F2321]/60 via-transparent to-transparent" />
              </div>

              {/* Floating Card */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm border border-[#D5CEBD] rounded-lg p-4 shadow-lg card-hover">
                <p className="text-xs text-[#5C635F] mb-2 font-medium">
                  Order lifecycle
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-2.5 py-1 bg-[#F4F1EA] text-[#4A675B] rounded-md font-medium text-xs">
                    Draft
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#D5CEBD]" />
                  <span className="px-2.5 py-1 bg-[#F4F1EA] text-[#4A675B] rounded-md font-medium text-xs">
                    Approval
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#D5CEBD]" />
                  <span className="px-2.5 py-1 bg-[#4A675B] text-white rounded-md font-medium text-xs">
                    Paid
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#D5CEBD]" />
                  <span className="px-2.5 py-1 bg-[#C47055] text-white rounded-md font-medium text-xs">
                    Delivered
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-[#F4F1EA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="label-overline text-[#5C635F]">Platform features</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1F2321] mt-3">
              Built for healthcare procurement
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
            {/* Feature 1 */}
            <div className="bg-[#FDFBF7] border-2 border-[#D5CEBD] rounded-xl p-8 card-hover">
              <div className="w-12 h-12 rounded-md bg-[#4A675B]/10 flex items-center justify-center mb-4">
                <Layers className="w-6 h-6 text-[#4A675B]" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#1F2321] mb-2">
                Tier-based pricing
              </h3>
              <p className="text-sm text-[#5C635F] leading-relaxed">
                Volume-based pricing tiers automatically applied per product.
                Transparent pricing that scales with your order volume, no
                negotiation needed.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#FDFBF7] border-2 border-[#D5CEBD] rounded-xl p-8 card-hover">
              <div className="w-12 h-12 rounded-md bg-[#4A675B]/10 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-[#4A675B]" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#1F2321] mb-2">
                Role-based approvals
              </h3>
              <p className="text-sm text-[#5C635F] leading-relaxed">
                Configurable approval workflows for purchase orders. Buyers can
                create orders while approvers maintain spending control.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#FDFBF7] border-2 border-[#D5CEBD] rounded-xl p-8 card-hover">
              <div className="w-12 h-12 rounded-md bg-[#4A675B]/10 flex items-center justify-center mb-4">
                <BadgeCheck className="w-6 h-6 text-[#4A675B]" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#1F2321] mb-2">
                Quality metadata
              </h3>
              <p className="text-sm text-[#5C635F] leading-relaxed">
                Every product listing carries certification and compliance
                metadata. Make informed procurement decisions with verified
                quality data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#FDFBF7] border-t border-[#D5CEBD] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-[#4A675B]" />
            <span className="text-sm text-[#5C635F]">
              &copy; {new Date().getFullYear()} MedMarket. All rights reserved.
            </span>
          </div>
          <p className="text-xs text-[#5C635F]">
            Trusted B2B healthcare procurement platform
          </p>
        </div>
      </footer>
    </div>
  );
}
