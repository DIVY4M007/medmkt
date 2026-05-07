import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Stethoscope, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

// Shared login form, parameterised per portal so we don't duplicate UI.
export default function PortalLoginPage({ accountType, accent, defaults }) {
  const { loginWithPortal } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(defaults?.email || '');
  const [password, setPassword] = useState(defaults?.password || '');
  const [busy, setBusy] = useState(false);

  const isBuyer = accountType === 'buyer';
  const accentClass = accent || (isBuyer ? 'bg-[#4A675B]' : 'bg-[#C47055]');
  const hoverClass = isBuyer ? 'hover:bg-[#3D564C]' : 'hover:bg-[#B05F47]';

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await loginWithPortal(accountType, email, password);
      toast.success('Welcome back');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  const otherPortal = isBuyer ? '/seller/login' : '/buyer/login';
  const registerPath = isBuyer ? '/buyer/register' : '/seller/register';

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className={`hidden lg:flex flex-col justify-between p-12 ${accentClass} text-white`}>
        <Link to="/" className="flex items-center gap-2.5" data-testid="brand-link">
          <div className="h-9 w-9 rounded-md bg-white/15 flex items-center justify-center">
            <Stethoscope className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="font-heading font-semibold leading-tight">MedMarket</div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-white/70">B2B Healthcare</div>
          </div>
        </Link>
        <div>
          <div className="label-overline text-white/70 mb-4">{isBuyer ? 'Buyer portal' : 'Seller portal'}</div>
          <h2 className="font-heading text-4xl lg:text-5xl font-semibold leading-tight">
            {isBuyer ? <>Procure with<br/>confidence.</> : <>Sell to verified<br/>healthcare buyers.</>}
          </h2>
          <p className="text-white/80 mt-6 max-w-md">
            {isBuyer
              ? 'Hospitals & pharmacies — manage requestors, approvers and orders end-to-end.'
              : 'Vendors & distributors — list products with tier pricing and fulfil orders.'}
          </p>
        </div>
        <Link to="/login" className="text-xs text-white/70 inline-flex items-center gap-1 hover:text-white" data-testid="back-to-portal">
          <ArrowLeft className="h-3 w-3" /> Choose a different portal
        </Link>
      </div>

      <div className="flex items-center justify-center p-8 lg:p-12 bg-[#FDFBF7]">
        <form onSubmit={onSubmit} className="w-full max-w-md space-y-6" data-testid={`${accountType}-login-form`}>
          <div>
            <div className={`label-overline mb-3 ${isBuyer ? 'text-[#4A675B]' : 'text-[#C47055]'}`}>{isBuyer ? 'Buyer sign in' : 'Seller sign in'}</div>
            <h1 className="font-heading text-3xl font-semibold">Welcome back</h1>
            <p className="text-[#5C635F] mt-2 text-sm">
              No account?{' '}
              <Link to={registerPath} className="text-[#4A675B] underline" data-testid={`${accountType}-link-register`}>
                Register as a {accountType}
              </Link>
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              data-testid={`${accountType}-login-email`}
              className="border-[#D5CEBD] focus-visible:ring-[#4A675B]" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              data-testid={`${accountType}-login-password`}
              className="border-[#D5CEBD] focus-visible:ring-[#4A675B]" />
          </div>

          <Button type="submit" disabled={busy} data-testid={`${accountType}-login-submit`}
            className={`w-full ${accentClass} ${hoverClass} text-white rounded-md`}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>

          <div className="text-xs text-[#5C635F] bg-[#F4F1EA] border border-[#D5CEBD] rounded-md p-4">
            <div className="font-medium text-[#1F2321] mb-2">Demo {accountType} accounts (Password123!)</div>
            <div className="grid gap-1">
              {isBuyer ? (
                <>
                  <div>alice@hospital.com — Hospital · Approver</div>
                  <div>bob@hospital.com — Hospital · Requestor</div>
                  <div>carol@pharmacy.com — Pharmacy · Approver</div>
                  <div>dan@pharmacy.com — Pharmacy · Requestor</div>
                </>
              ) : (
                <>
                  <div>eve@vendor.com — Vendor</div>
                  <div>frank@distributor.com — Distributor</div>
                </>
              )}
            </div>
          </div>

          <div className="text-center text-xs text-[#5C635F]">
            Wrong portal?{' '}
            <Link to={otherPortal} className="text-[#4A675B] underline">
              Sign in as a {isBuyer ? 'seller' : 'buyer'}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
