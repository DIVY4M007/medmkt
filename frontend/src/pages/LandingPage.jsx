import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Stethoscope, ArrowRight, ShieldCheck, BadgeCheck, Layers } from 'lucide-react';

const HERO = 'https://images.unsplash.com/photo-1710074213379-2a9c2653046a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwyfHxob3NwaXRhbCUyMGJlZHxlbnwwfHx8fDE3Nzc4NTE1MDh8MA&ixlib=rb-4.1.0&q=85';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1F2321]">
      {/* Top nav */}
      <nav className="flex items-center justify-between px-8 lg:px-16 py-6 border-b border-[#D5CEBD]" data-testid="landing-nav">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-md bg-[#4A675B] flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-white" strokeWidth={1.75} />
          </div>
          <div>
            <div className="font-heading font-semibold leading-tight">MedMarket</div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-[#5C635F]">B2B Healthcare</div>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login"><Button variant="ghost" data-testid="nav-login-btn">Sign in</Button></Link>
          <Link to="/register">
            <Button className="bg-[#4A675B] hover:bg-[#3D564C] text-white rounded-md" data-testid="nav-register-btn">
              Create account
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="grid lg:grid-cols-12 gap-12 px-8 lg:px-16 py-16 lg:py-24">
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="label-overline text-[#C47055] mb-6">Trusted procurement · Verified suppliers</div>
          <h1 className="font-heading text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] mb-6">
            The procurement<br/>
            <span className="text-[#4A675B]">backbone</span> for modern<br/>
            healthcare networks.
          </h1>
          <p className="text-lg text-[#5C635F] leading-relaxed max-w-xl mb-10">
            Connect hospitals, pharmacies, vendors and distributors on one marketplace —
            with tier pricing, multi-step approvals, and a full audit trail from cart to delivery.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-[#4A675B] hover:bg-[#3D564C] text-white rounded-md gap-2" data-testid="hero-cta-register">
                Get started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-[#4A675B] text-[#4A675B] hover:bg-[#F4F1EA] rounded-md" data-testid="hero-cta-login">
                Sign in to your org
              </Button>
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-3 gap-6 max-w-xl">
            <Stat label="Org types" value="4" />
            <Stat label="Order states" value="5" />
            <Stat label="Pricing tiers" value="∞" />
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="relative rounded-lg overflow-hidden border border-[#D5CEBD]">
            <img src={HERO} alt="Hospital ward" className="w-full h-[520px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#4A675B]/55 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 backdrop-blur-md bg-[#FDFBF7]/85 border border-[#D5CEBD] rounded-md p-5">
              <div className="label-overline text-[#5C635F] mb-1.5">Workflow</div>
              <div className="font-heading text-lg font-semibold">Draft → Approval → Paid → Delivered</div>
              <p className="text-sm text-[#5C635F] mt-1">Requestors build carts. Approvers sign off. Sellers fulfil.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 lg:px-16 py-16 border-t border-[#D5CEBD] bg-[#F4F1EA]">
        <div className="grid md:grid-cols-3 gap-8">
          <Feature icon={Layers} title="Tier-based pricing"
            body="Quantity breaks defined per product. Buyers always see the right unit price for their order size." />
          <Feature icon={ShieldCheck} title="Role-based approvals"
            body="Requestors propose, approvers commit. Every state change is logged and attributable." />
          <Feature icon={BadgeCheck} title="Quality metadata"
            body="Capture material, plastic grade, sterility, certifications and packaging — all structured." />
        </div>
      </section>

      <footer className="px-8 lg:px-16 py-8 border-t border-[#D5CEBD] text-sm text-[#5C635F] flex justify-between">
        <div>© {new Date().getFullYear()} MedMarket — Demo build</div>
        <div className="text-[#4A675B] font-medium">Built for procurement teams</div>
      </footer>
    </div>
  );
}

const Stat = ({ label, value }) => (
  <div>
    <div className="font-heading text-3xl font-semibold text-[#4A675B]">{value}</div>
    <div className="label-overline text-[#5C635F] mt-1">{label}</div>
  </div>
);

const Feature = ({ icon: Icon, title, body }) => (
  <div className="bg-[#FDFBF7] border border-[#D5CEBD] rounded-md p-8 transition-all hover:-translate-y-1 hover:shadow-lg">
    <div className="h-10 w-10 rounded-md bg-[#4A675B]/10 flex items-center justify-center mb-5">
      <Icon className="h-5 w-5 text-[#4A675B]" strokeWidth={1.75} />
    </div>
    <h3 className="font-heading text-xl font-semibold mb-2">{title}</h3>
    <p className="text-sm text-[#5C635F] leading-relaxed">{body}</p>
  </div>
);
