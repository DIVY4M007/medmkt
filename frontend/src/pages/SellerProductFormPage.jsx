import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { CATEGORY_OPTIONS } from '../lib/format';
import { Trash2, Plus, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

const empty = {
  name: '',
  description: '',
  category: CATEGORY_OPTIONS[0].value,
  imageUrl: '',
  stock: 100,
  unit: 'box',
  tierPricing: [{ minQty: 1, unitPrice: 10 }],
  sterility: 'non_sterile',
  disposable: true,
  packagingQty: 1,
  manufacturer: '',
  qualityMetadata: { material: '', plasticGrade: '', certifications: [] },
};

export default function SellerProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [certText, setCertText] = useState('');

  useEffect(() => {
    if (!editing) return;
    api.get(`/products/${id}`).then(({ data }) => {
      const p = data.product;
      setForm({
        ...empty,
        ...p,
        qualityMetadata: {
          material: p.qualityMetadata?.material || '',
          plasticGrade: p.qualityMetadata?.plasticGrade || '',
          certifications: p.qualityMetadata?.certifications || [],
        },
      });
      setCertText((p.qualityMetadata?.certifications || []).join(', '));
    });
  }, [id, editing]);

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setQ = (k) => (e) => setForm((f) => ({ ...f, qualityMetadata: { ...f.qualityMetadata, [k]: e.target.value } }));
  const updateTier = (i, k, v) => setForm((f) => {
    const tiers = [...f.tierPricing];
    tiers[i] = { ...tiers[i], [k]: Number(v) };
    return { ...f, tierPricing: tiers };
  });
  const addTier = () => setForm((f) => ({ ...f, tierPricing: [...f.tierPricing, { minQty: 1, unitPrice: 0 }] }));
  const removeTier = (i) => setForm((f) => ({ ...f, tierPricing: f.tierPricing.filter((_, idx) => idx !== i) }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        stock: Number(form.stock),
        packagingQty: Number(form.packagingQty),
        qualityMetadata: {
          ...form.qualityMetadata,
          certifications: certText.split(',').map((s) => s.trim()).filter(Boolean),
        },
      };
      if (editing) {
        await api.put(`/products/${id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }
      navigate('/seller/products');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-8 lg:p-12 max-w-3xl mx-auto" data-testid="seller-form-page">
      <Link to="/seller/products" className="inline-flex items-center gap-1 text-sm text-[#5C635F] hover:text-[#1F2321] mb-6">
        <ChevronLeft className="h-4 w-4" /> My products
      </Link>
      <h1 className="font-heading text-3xl font-semibold mb-8">{editing ? 'Edit consumable' : 'New consumable'}</h1>

      <form onSubmit={submit} className="space-y-6">
        <Section title="Basics">
          <Field label="Name"><Input required value={form.name} onChange={setField('name')} data-testid="form-name" className="border-[#D5CEBD]" /></Field>
          <Field label="Description"><Textarea value={form.description} onChange={setField('description')} data-testid="form-description" className="border-[#D5CEBD]" rows={3} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger className="border-[#D5CEBD]" data-testid="form-category"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {CATEGORY_OPTIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value} data-testid={`form-category-${c.value}`}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Unit (box, vial, pack…)"><Input value={form.unit} onChange={setField('unit')} data-testid="form-unit" className="border-[#D5CEBD]" /></Field>
            <Field label="Stock"><Input type="number" min={0} value={form.stock} onChange={setField('stock')} data-testid="form-stock" className="border-[#D5CEBD]" /></Field>
            <Field label="Image URL"><Input value={form.imageUrl} onChange={setField('imageUrl')} data-testid="form-image" className="border-[#D5CEBD]" /></Field>
          </div>
        </Section>

        <Section title="Tier pricing">
          <div className="space-y-2">
            {form.tierPricing.map((t, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <label className="text-xs text-[#5C635F]">Min qty</label>
                  <Input type="number" min={1} value={t.minQty} onChange={(e) => updateTier(i, 'minQty', e.target.value)} data-testid={`tier-minQty-${i}`} className="border-[#D5CEBD]" />
                </div>
                <div className="col-span-6">
                  <label className="text-xs text-[#5C635F]">Unit price</label>
                  <Input type="number" min={0} step="0.01" value={t.unitPrice} onChange={(e) => updateTier(i, 'unitPrice', e.target.value)} data-testid={`tier-price-${i}`} className="border-[#D5CEBD]" />
                </div>
                <div className="col-span-1 pt-5">
                  {form.tierPricing.length > 1 && (
                    <button type="button" onClick={() => removeTier(i)} className="text-[#5C635F] hover:text-red-600" data-testid={`tier-remove-${i}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" onClick={addTier} className="mt-3 border-[#D5CEBD] rounded-md" data-testid="add-tier-btn">
            <Plus className="h-4 w-4 mr-2" /> Add tier
          </Button>
        </Section>

        <Section title="Consumable specifications">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Sterility">
              <Select value={form.sterility} onValueChange={(v) => setForm((f) => ({ ...f, sterility: v }))}>
                <SelectTrigger className="border-[#D5CEBD]" data-testid="form-sterility"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sterile">Sterile</SelectItem>
                  <SelectItem value="non_sterile">Non-sterile</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Packaging qty (pieces per pack)">
              <Input type="number" min={1} value={form.packagingQty} onChange={setField('packagingQty')} data-testid="form-packagingQty" className="border-[#D5CEBD]" />
            </Field>
            <div className="col-span-2 flex items-center gap-3 pt-2">
              <Switch checked={form.disposable} onCheckedChange={(v) => setForm((f) => ({ ...f, disposable: v }))} data-testid="form-disposable" />
              <Label>Disposable (uncheck for reusable)</Label>
            </div>
            <Field label="Manufacturer">
              <Input value={form.manufacturer} onChange={setField('manufacturer')} data-testid="form-manufacturer" className="border-[#D5CEBD]" />
            </Field>
            <Field label="Material">
              <Input value={form.qualityMetadata.material} onChange={setQ('material')} data-testid="form-material" className="border-[#D5CEBD]" />
            </Field>
            <Field label="Plastic grade (if applicable)">
              <Input value={form.qualityMetadata.plasticGrade} onChange={setQ('plasticGrade')} data-testid="form-plasticGrade" className="border-[#D5CEBD]" />
            </Field>
            <Field label="Certifications (comma-separated)">
              <Input value={certText} onChange={(e) => setCertText(e.target.value)} placeholder="ISO-13485, CE, FDA" data-testid="form-certifications" className="border-[#D5CEBD]" />
            </Field>
          </div>
        </Section>

        <div className="flex justify-end">
          <Button type="submit" disabled={busy} data-testid="form-submit-btn"
            className="bg-[#4A675B] hover:bg-[#3D564C] text-white rounded-md">
            {busy ? 'Saving…' : (editing ? 'Save changes' : 'Create consumable')}
          </Button>
        </div>
      </form>
    </div>
  );
}

const Section = ({ title, children }) => (
  <div className="border border-[#D5CEBD] rounded-md p-6 bg-[#FDFBF7]">
    <div className="label-overline text-[#5C635F] mb-4">{title}</div>
    <div className="space-y-4">{children}</div>
  </div>
);
const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <Label>{label}</Label>
    {children}
  </div>
);
