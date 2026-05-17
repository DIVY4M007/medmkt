import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Stethoscope } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('alice@hospital.com');
  const [password, setPassword] = useState('Password123!');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      toast.success('Welcome back');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[#4A675B] text-white">
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
          <div className="label-overline text-white/70 mb-4">Procurement, simplified</div>
          <h2 className="font-heading text-4xl lg:text-5xl font-semibold leading-tight">
            One marketplace.<br/>
            Every supplier.<br/>
            Full audit trail.
          </h2>
          <p className="text-white/80 mt-6 max-w-md">
            Tiered pricing, multi-step approvals, and a complete order lifecycle for your network.
          </p>
        </div>
        <div className="text-xs text-white/60">© {new Date().getFullYear()} MedMarket</div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-8 lg:p-12 bg-[#FDFBF7]">
        <form onSubmit={onSubmit} className="w-full max-w-md space-y-6" data-testid="login-form">
          <div>
            <div className="label-overline text-[#C47055] mb-3">Sign in</div>
            <h1 className="font-heading text-3xl font-semibold">Welcome back</h1>
            <p className="text-[#5C635F] mt-2 text-sm">
              No account? <Link to="/register" className="text-[#4A675B] underline" data-testid="link-register">Register your organisation</Link>
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              data-testid="login-email-input"
              className="border-[#D5CEBD] focus-visible:ring-[#4A675B]" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              data-testid="login-password-input"
              className="border-[#D5CEBD] focus-visible:ring-[#4A675B]" />
          </div>

          <Button type="submit" disabled={busy} data-testid="login-submit-btn"
            className="w-full bg-[#4A675B] hover:bg-[#3D564C] text-white rounded-md">
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>

          <div className="text-xs text-[#5C635F] bg-[#F4F1EA] border border-[#D5CEBD] rounded-md p-4">
            <div className="font-medium text-[#1F2321] mb-2">Demo accounts (Password123!)</div>
            <div className="grid gap-1">
              <div>alice@hospital.com — Hospital Approver</div>
              <div>bob@hospital.com — Hospital Requestor</div>
              <div>eve@vendor.com — Vendor</div>
              <div>frank@distributor.com — Distributor</div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
