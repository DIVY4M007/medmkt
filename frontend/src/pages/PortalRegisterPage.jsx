import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Stethoscope, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const BUYER_ORG_TYPES = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'pharmacy', label: 'Pharmacy' },
];
const SELLER_ORG_TYPES = [
  { value: 'vendor', label: 'Vendor' },
  { value: 'distributor', label: 'Distributor' },
];

// Shared registration UI parameterised per portal — only the org type list and accent change.
export default function PortalRegisterPage({ accountType }) {
  const { registerWithPortal } = useAuth();
  const navigate = useNavigate();
  const orgTypes = accountType === 'buyer' ? BUYER_ORG_TYPES : SELLER_ORG_TYPES;
  const isBuyer = accountType === 'buyer';
  const accentClass = isBuyer ? 'bg-[#4A675B]' : 'bg-[#C47055]';
  const hoverClass = isBuyer ? 'hover:bg-[#3D564C]' : 'hover:bg-[#B05F47]';

  const [form, setForm] = useState({
    orgName: '',
    orgType: orgTypes[0].value,
    name: '',
    email: '',
    password: '',
  });
  const [busy, setBusy] = useState(false);

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await registerWithPortal(accountType, form);
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
          <div className="label-overline text-white/70 mb-4">{isBuyer ? 'Buyer registration' : 'Seller registration'}</div>
          <h2 className="font-heading text-4xl lg:text-5xl font-semibold leading-tight">
            {isBuyer ? <>Onboard your<br/>procurement team.</> : <>List your products.<br/>Reach the network.</>}
          </h2>
          <p className="text-white/80 mt-6 max-w-md">
            You'll be the first user — an approver — and can invite teammates afterward.
          </p>
        </div>
        <Link to="/register" className="text-xs text-white/70 inline-flex items-center gap-1 hover:text-white" data-testid="back-to-portal">
          <ArrowLeft className="h-3 w-3" /> Choose a different portal
        </Link>
      </div>

      <div className="flex items-center justify-center p-8 lg:p-12 bg-[#FDFBF7]">
        <form onSubmit={onSubmit} className="w-full max-w-md space-y-5" data-testid={`${accountType}-register-form`}>
          <div>
            <div className={`label-overline mb-3 ${isBuyer ? 'text-[#4A675B]' : 'text-[#C47055]'}`}>
              {isBuyer ? 'Create a buyer org' : 'Create a seller org'}
            </div>
            <h1 className="font-heading text-3xl font-semibold">
              {isBuyer ? 'Register your organisation' : 'Register your business'}
            </h1>
            <p className="text-[#5C635F] mt-2 text-sm">
              Already onboard?{' '}
              <Link to={`/${accountType}/login`} className="text-[#4A675B] underline" data-testid={`${accountType}-link-login`}>
                Sign in
              </Link>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <Label>Organisation name</Label>
              <Input required value={form.orgName} onChange={setField('orgName')} data-testid={`${accountType}-reg-orgName`}
                className="border-[#D5CEBD] focus-visible:ring-[#4A675B]" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Organisation type</Label>
              <Select value={form.orgType} onValueChange={(v) => setForm((f) => ({ ...f, orgType: v }))}>
                <SelectTrigger className="border-[#D5CEBD]" data-testid={`${accountType}-reg-orgType`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {orgTypes.map((o) => (
                    <SelectItem key={o.value} value={o.value} data-testid={`${accountType}-reg-orgType-${o.value}`}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Your name</Label>
              <Input required value={form.name} onChange={setField('name')} data-testid={`${accountType}-reg-name`}
                className="border-[#D5CEBD] focus-visible:ring-[#4A675B]" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Email</Label>
              <Input type="email" required value={form.email} onChange={setField('email')} data-testid={`${accountType}-reg-email`}
                className="border-[#D5CEBD] focus-visible:ring-[#4A675B]" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Password</Label>
              <Input type="password" required minLength={6} value={form.password} onChange={setField('password')} data-testid={`${accountType}-reg-password`}
                className="border-[#D5CEBD] focus-visible:ring-[#4A675B]" />
            </div>
          </div>

          <Button type="submit" disabled={busy} data-testid={`${accountType}-register-submit`}
            className={`w-full ${accentClass} ${hoverClass} text-white rounded-md`}>
            {busy ? 'Creating…' : `Create ${accountType} organisation`}
          </Button>
        </form>
      </div>
    </div>
  );
}
