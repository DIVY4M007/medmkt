import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Stethoscope } from 'lucide-react';
import { toast } from 'sonner';

const ORG_TYPES = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'distributor', label: 'Distributor' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    orgName: '', orgType: 'hospital', name: '', email: '', password: '',
  });
  const [busy, setBusy] = useState(false);

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register(form);
      toast.success('Organisation created');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
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
          <div className="label-overline text-white/70 mb-4">Onboard your org</div>
          <h2 className="font-heading text-4xl lg:text-5xl font-semibold leading-tight">
            Bring your team.<br/>Bring your suppliers.<br/>Bring order to chaos.
          </h2>
          <p className="text-white/80 mt-6 max-w-md">
            You'll be the first user — an approver — and can invite teammates as requestors or approvers.
          </p>
        </div>
        <div className="text-xs text-white/60">© {new Date().getFullYear()} MedMarket</div>
      </div>

      <div className="flex items-center justify-center p-8 lg:p-12 bg-[#FDFBF7]">
        <form onSubmit={onSubmit} className="w-full max-w-md space-y-5" data-testid="register-form">
          <div>
            <div className="label-overline text-[#C47055] mb-3">Get started</div>
            <h1 className="font-heading text-3xl font-semibold">Create your organisation</h1>
            <p className="text-[#5C635F] mt-2 text-sm">
              Already onboard? <Link to="/login" className="text-[#4A675B] underline" data-testid="link-login">Sign in</Link>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <Label>Organisation name</Label>
              <Input required value={form.orgName} onChange={setField('orgName')} data-testid="reg-orgName-input"
                className="border-[#D5CEBD] focus-visible:ring-[#4A675B]" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Organisation type</Label>
              <Select value={form.orgType} onValueChange={(v) => setForm((f) => ({ ...f, orgType: v }))}>
                <SelectTrigger className="border-[#D5CEBD]" data-testid="reg-orgType-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORG_TYPES.map((o) => (
                    <SelectItem key={o.value} value={o.value} data-testid={`reg-orgType-option-${o.value}`}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Your name</Label>
              <Input required value={form.name} onChange={setField('name')} data-testid="reg-name-input"
                className="border-[#D5CEBD] focus-visible:ring-[#4A675B]" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Email</Label>
              <Input type="email" required value={form.email} onChange={setField('email')} data-testid="reg-email-input"
                className="border-[#D5CEBD] focus-visible:ring-[#4A675B]" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Password</Label>
              <Input type="password" required minLength={6} value={form.password} onChange={setField('password')} data-testid="reg-password-input"
                className="border-[#D5CEBD] focus-visible:ring-[#4A675B]" />
            </div>
          </div>

          <Button type="submit" disabled={busy} data-testid="register-submit-btn"
            className="w-full bg-[#4A675B] hover:bg-[#3D564C] text-white rounded-md">
            {busy ? 'Creating…' : 'Create organisation'}
          </Button>
        </form>
      </div>
    </div>
  );
}
