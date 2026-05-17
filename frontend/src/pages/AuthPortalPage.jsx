import { Link } from 'react-router-dom';
import { Stethoscope, ShoppingCart, Store, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';

// Portal selector — picks between the buyer and seller authentication paths.
export default function AuthPortalPage({ mode }) {
  // mode = 'login' | 'register'
  const isLogin = mode === 'login';

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      <header className="px-8 lg:px-16 py-6 border-b border-[#D5CEBD]">
        <Link to="/" className="flex items-center gap-2.5 w-fit" data-testid="brand-link">
          <div className="h-9 w-9 rounded-md bg-[#4A675B] flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-white" strokeWidth={1.75} />
          </div>
          <div>
            <div className="font-heading font-semibold leading-tight">MedMarket</div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-[#5C635F]">B2B Healthcare</div>
          </div>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <div className="label-overline text-[#C47055] mb-3">{isLogin ? 'Sign in' : 'Get started'}</div>
            <h1 className="font-heading text-4xl lg:text-5xl font-semibold tracking-tight">
              {isLogin ? 'Welcome back' : 'Choose your account type'}
            </h1>
            <p className="text-[#5C635F] mt-3 max-w-xl mx-auto">
              {isLogin
                ? 'Pick the portal that matches your account.'
                : 'Are you procuring supplies for a hospital or pharmacy, or selling them as a vendor or distributor?'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <PortalCard
              testid="portal-buyer"
              icon={ShoppingCart}
              title="I'm a Buyer"
              subtitle="Hospitals · Pharmacies"
              body="Procure medical consumables — syringes, gloves, PPE, IV sets, gauze and more. Build carts, get them approved, track delivery."
              cta={isLogin ? 'Sign in as buyer' : 'Register as buyer'}
              to={isLogin ? '/buyer/login' : '/buyer/register'}
            />
            <PortalCard
              testid="portal-seller"
              icon={Store}
              title="I'm a Seller"
              subtitle="Vendors · Distributors"
              body="List products with tier pricing, manage your catalogue, fulfil and deliver buyer orders."
              cta={isLogin ? 'Sign in as seller' : 'Register as seller'}
              to={isLogin ? '/seller/login' : '/seller/register'}
              accent
            />
          </div>

          <div className="text-center mt-10 text-sm text-[#5C635F]">
            {isLogin ? (
              <>New to MedMarket? <Link to="/register" className="text-[#4A675B] underline" data-testid="link-register">Create an account</Link></>
            ) : (
              <>Already have an account? <Link to="/login" className="text-[#4A675B] underline" data-testid="link-login">Sign in</Link></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const PortalCard = ({ icon: Icon, title, subtitle, body, cta, to, accent, testid }) => (
  <Link
    to={to}
    data-testid={testid}
    className={`group block bg-[#FDFBF7] border rounded-md p-8 transition-all hover:-translate-y-1 hover:shadow-lg ${
      accent ? 'border-[#C47055]/40 hover:border-[#C47055]' : 'border-[#D5CEBD] hover:border-[#4A675B]'
    }`}
  >
    <div className={`h-12 w-12 rounded-md flex items-center justify-center mb-6 ${accent ? 'bg-[#C47055]/10' : 'bg-[#4A675B]/10'}`}>
      <Icon className={`h-6 w-6 ${accent ? 'text-[#C47055]' : 'text-[#4A675B]'}`} strokeWidth={1.75} />
    </div>
    <div className="label-overline text-[#5C635F] mb-1">{subtitle}</div>
    <h2 className="font-heading text-2xl font-semibold mb-3">{title}</h2>
    <p className="text-sm text-[#5C635F] leading-relaxed mb-6">{body}</p>
    <div className={`inline-flex items-center gap-1 text-sm font-medium ${accent ? 'text-[#C47055]' : 'text-[#4A675B]'}`}>
      {cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </div>
  </Link>
);

// Convenience exports so App.js can mount each mode separately.
export const LoginPortal = () => <AuthPortalPage mode="login" />;
export const RegisterPortal = () => <AuthPortalPage mode="register" />;
