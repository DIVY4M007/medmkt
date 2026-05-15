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
  FileText,
  CheckCircle2,
  Banknote,
  Truck,
} from 'lucide-react';

const ORDER_STEPS = [
  { label: 'Draft', icon: FileText, variant: 'muted' as const },
  { label: 'Approval', icon: CheckCircle2, variant: 'muted' as const },
  { label: 'Paid', icon: Banknote, variant: 'primary' as const },
  { label: 'Delivered', icon: Truck, variant: 'accent' as const },
];

const FEATURES = [
  {
    icon: Layers,
    title: 'Tier-based pricing',
    description:
      'Volume-based pricing tiers automatically applied per product. Transparent pricing that scales with your order volume, no negotiation needed.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-based approvals',
    description:
      'Configurable approval workflows for purchase orders. Buyers can create orders while approvers maintain spending control.',
  },
  {
    icon: BadgeCheck,
    title: 'Quality metadata',
    description:
      'Every product listing carries certification and compliance metadata. Make informed procurement decisions with verified quality data.',
  },
];

export default function LandingPage() {
  const { navigate } = useAppStore();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ===== Sticky Navigation ===== */}
      <nav className="sticky top-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-semibold text-lg leading-tight text-foreground">
                MedMkt
              </span>
              <span className="text-[10px] text-muted-foreground leading-none tracking-wide uppercase">
                Healthcare B2B
              </span>
            </div>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground btn-press"
              data-testid="nav-signin"
              onClick={() => navigate('login-portal')}
            >
              Sign in
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg btn-press"
              data-testid="nav-create-account"
              onClick={() => navigate('register-portal')}
            >
              Get started
            </Button>
          </div>
        </div>
      </nav>

      {/* ===== Hero Section ===== */}
      <section className="flex-1 relative dot-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center animate-fade-in-up">
            {/* Left Column */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <span className="label-overline text-muted-foreground">
                Trusted procurement &middot; Verified suppliers
              </span>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.08] gradient-text">
                The procurement backbone for modern healthcare networks.
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                MedMkt connects hospitals, pharmacies, vendors, and distributors
                on a single platform with tier-based pricing, role-based
                approvals, and end-to-end order visibility.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 mt-2">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg btn-press"
                  data-testid="hero-get-started"
                  onClick={() => navigate('register-portal')}
                >
                  Get started
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border text-foreground hover:bg-secondary rounded-lg btn-press"
                  data-testid="hero-signin"
                  onClick={() => navigate('login-portal')}
                >
                  Sign in
                </Button>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-8 mt-4">
                <div className="flex flex-col">
                  <span className="font-heading text-2xl font-bold text-primary">
                    4
                  </span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Org types
                  </span>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex flex-col">
                  <span className="font-heading text-2xl font-bold text-primary">
                    5
                  </span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Order states
                  </span>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex flex-col">
                  <span className="font-heading text-2xl font-bold text-primary">
                    &#8734;
                  </span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Pricing tiers
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column — Decorative Gradient Mesh Panel */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden gradient-mesh bg-card border border-border shadow-lg min-h-[420px] flex items-center justify-center">
                {/* Central decorative content */}
                <div className="relative z-10 w-full p-8 flex flex-col items-center gap-6">
                  {/* Floating lifecycle cards */}
                  <div className="w-full space-y-4 stagger-children">
                    {ORDER_STEPS.map((step, idx) => {
                      const Icon = step.icon;
                      return (
                        <div
                          key={step.label}
                          className="animate-float bg-card border border-border rounded-xl p-4 flex items-center gap-4 card-hover shadow-sm"
                          style={{ animationDelay: `${idx * 0.4}s` }}
                        >
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                              step.variant === 'accent'
                                ? 'bg-accent/10 text-accent'
                                : step.variant === 'primary'
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-secondary text-muted-foreground'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-heading font-semibold text-foreground text-sm">
                              {step.label}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {idx === 0 && 'Create your order'}
                              {idx === 1 && 'Manager reviews & approves'}
                              {idx === 2 && 'Payment confirmed'}
                              {idx === 3 && 'Shipment delivered'}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-border shrink-0" />
                        </div>
                      );
                    })}
                  </div>

                  {/* Connecting progress hint */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                    <span className="inline-block w-8 h-0.5 bg-border rounded-full" />
                    <span className="inline-block w-2 h-2 rounded-full bg-primary/50" />
                    <span className="inline-block w-8 h-0.5 bg-border rounded-full" />
                    <span className="inline-block w-2 h-2 rounded-full bg-accent/70" />
                    <span className="inline-block w-8 h-0.5 bg-border rounded-full" />
                    <span className="inline-block w-2 h-2 rounded-full bg-accent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Features Section ===== */}
      <section className="py-20 lg:py-28 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-14">
            <span className="label-overline text-muted-foreground">
              Platform features
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mt-3">
              Built for healthcare procurement
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Everything you need to streamline procurement workflows, from
              pricing to compliance.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-card border border-border rounded-2xl p-8 card-hover"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-card border-t border-border py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} MedMkt. All rights reserved.
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Trusted B2B healthcare procurement platform
          </p>
        </div>
      </footer>
    </div>
  );
}
