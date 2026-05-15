'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api-client';
import { CATEGORY_OPTIONS } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface TierPrice {
  minQty: number;
  unitPrice: number;
}

interface QualityMetadata {
  material?: string;
  plasticGrade?: string;
  certifications?: string[];
}

interface ProductForm {
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  stock: number;
  unit: string;
  tierPricing: TierPrice[];
  sterility: string;
  disposable: boolean;
  packagingQty: number;
  manufacturer: string;
  material: string;
  plasticGrade: string;
  certifications: string;
}

const emptyForm: ProductForm = {
  name: '',
  description: '',
  category: '',
  imageUrl: '',
  stock: 100,
  unit: 'box',
  tierPricing: [{ minQty: 1, unitPrice: 0 }],
  sterility: '',
  disposable: true,
  packagingQty: 1,
  manufacturer: '',
  material: '',
  plasticGrade: '',
  certifications: '',
};

export default function SellerProductFormPage() {
  const { navigate, params } = useAppStore();
  const isEditing = !!params.id;

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    async function fetchProduct() {
      setLoading(true);
      try {
        const data = await api.get(`/products/${params.id}`);
        const p = data.product;
        let tiers: TierPrice[] = [{ minQty: 1, unitPrice: 0 }];
        try {
          const parsed = JSON.parse(p.tierPricing);
          if (Array.isArray(parsed) && parsed.length > 0) tiers = parsed;
        } catch {}
        let qualityMeta: QualityMetadata = {};
        try {
          if (p.qualityMetadata) qualityMeta = JSON.parse(p.qualityMetadata);
        } catch {}

        setForm({
          name: p.name || '',
          description: p.description || '',
          category: p.category || '',
          imageUrl: p.imageUrl || '',
          stock: p.stock ?? 100,
          unit: p.unit || 'box',
          tierPricing: tiers,
          sterility: p.sterility || '',
          disposable: p.disposable ?? true,
          packagingQty: p.packagingQty ?? 1,
          manufacturer: p.manufacturer || '',
          material: qualityMeta.material || '',
          plasticGrade: qualityMeta.plasticGrade || '',
          certifications: Array.isArray(qualityMeta.certifications)
            ? qualityMeta.certifications.join(', ')
            : '',
        });
      } catch (err) {
        console.error('Failed to fetch product:', err);
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [isEditing, params.id]);

  const updateField = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateTier = (index: number, field: keyof TierPrice, value: number) => {
    setForm((prev) => {
      const tiers = [...prev.tierPricing];
      tiers[index] = { ...tiers[index], [field]: value };
      return { ...prev, tierPricing: tiers };
    });
  };

  const addTier = () => {
    setForm((prev) => ({
      ...prev,
      tierPricing: [
        ...prev.tierPricing,
        { minQty: prev.tierPricing[prev.tierPricing.length - 1]?.minQty ?? 1, unitPrice: 0 },
      ],
    }));
  };

  const removeTier = (index: number) => {
    setForm((prev) => ({
      ...prev,
      tierPricing: prev.tierPricing.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!form.category) {
      toast.error('Category is required');
      return;
    }
    if (!form.sterility) {
      toast.error('Sterility is required');
      return;
    }

    const qualityMetadata: QualityMetadata = {};
    if (form.material.trim()) qualityMetadata.material = form.material.trim();
    if (form.plasticGrade.trim()) qualityMetadata.plasticGrade = form.plasticGrade.trim();
    if (form.certifications.trim()) {
      qualityMetadata.certifications = form.certifications
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
    }

    const body = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      category: form.category,
      imageUrl: form.imageUrl.trim() || null,
      stock: form.stock,
      unit: form.unit,
      tierPricing: form.tierPricing,
      sterility: form.sterility,
      disposable: form.disposable,
      packagingQty: form.packagingQty,
      manufacturer: form.manufacturer.trim() || null,
      qualityMetadata: Object.keys(qualityMetadata).length > 0 ? qualityMetadata : null,
    };

    setSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/products/${params.id}`, body);
        toast.success('Product updated');
      } else {
        await api.post('/products', body);
        toast.success('Product created');
      }
      navigate('seller-products');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#4A675B]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <button
        data-testid="back-to-products"
        onClick={() => navigate('seller-products')}
        className="mb-6 inline-flex items-center gap-1 text-sm text-[#4A675B] hover:underline"
      >
        <ChevronLeft className="h-4 w-4" />
        My products
      </button>

      {/* Title */}
      <h1 className="font-heading mb-6 text-2xl font-semibold text-[#1F2321]">
        {isEditing ? 'Edit consumable' : 'New consumable'}
      </h1>

      <div className="space-y-6">
        {/* Basics section */}
        <div className="rounded-xl border border-[#D5CEBD] bg-[#FDFBF7] p-6">
          <p className="label-overline text-[#5C635F] mb-4">Basics</p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="product-name" className="text-sm text-[#1F2321]">
                Name
              </Label>
              <Input
                id="product-name"
                data-testid="input-name"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g. Latex Surgical Gloves"
                className="mt-1.5 border-[#D5CEBD]"
              />
            </div>

            <div>
              <Label htmlFor="product-desc" className="text-sm text-[#1F2321]">
                Description
              </Label>
              <Textarea
                id="product-desc"
                data-testid="input-description"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Brief product description"
                className="mt-1.5 border-[#D5CEBD]"
                rows={3}
              />
            </div>

            <div>
              <Label className="text-sm text-[#1F2321]">Category</Label>
              <Select
                value={form.category}
                onValueChange={(val) => updateField('category', val)}
              >
                <SelectTrigger data-testid="select-category" className="mt-1.5 w-full border-[#D5CEBD]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product-unit" className="text-sm text-[#1F2321]">
                  Unit
                </Label>
                <Input
                  id="product-unit"
                  data-testid="input-unit"
                  value={form.unit}
                  onChange={(e) => updateField('unit', e.target.value)}
                  placeholder="e.g. box, pack"
                  className="mt-1.5 border-[#D5CEBD]"
                />
              </div>
              <div>
                <Label htmlFor="product-stock" className="text-sm text-[#1F2321]">
                  Stock
                </Label>
                <Input
                  id="product-stock"
                  data-testid="input-stock"
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => updateField('stock', parseInt(e.target.value) || 0)}
                  className="mt-1.5 border-[#D5CEBD]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="product-image" className="text-sm text-[#1F2321]">
                Image URL
              </Label>
              <Input
                id="product-image"
                data-testid="input-imageUrl"
                value={form.imageUrl}
                onChange={(e) => updateField('imageUrl', e.target.value)}
                placeholder="https://..."
                className="mt-1.5 border-[#D5CEBD]"
              />
            </div>
          </div>
        </div>

        {/* Tier pricing section */}
        <div className="rounded-xl border border-[#D5CEBD] bg-[#FDFBF7] p-6">
          <p className="label-overline text-[#5C635F] mb-4">Tier pricing</p>
          <div className="space-y-3">
            {form.tierPricing.map((tier, idx) => (
              <div key={idx} className="flex items-end gap-3">
                <div className="flex-1">
                  <Label className="text-xs text-[#5C635F]">Min quantity</Label>
                  <Input
                    data-testid={`input-tier-minQty-${idx}`}
                    type="number"
                    min={1}
                    value={tier.minQty}
                    onChange={(e) =>
                      updateTier(idx, 'minQty', parseInt(e.target.value) || 1)
                    }
                    className="mt-1 border-[#D5CEBD]"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-[#5C635F]">Unit price (₹)</Label>
                  <Input
                    data-testid={`input-tier-unitPrice-${idx}`}
                    type="number"
                    min={0}
                    step={0.01}
                    value={tier.unitPrice}
                    onChange={(e) =>
                      updateTier(idx, 'unitPrice', parseFloat(e.target.value) || 0)
                    }
                    className="mt-1 border-[#D5CEBD]"
                  />
                </div>
                {form.tierPricing.length > 1 && (
                  <Button
                    data-testid={`btn-remove-tier-${idx}`}
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTier(idx)}
                    className="mb-0.5 text-red-500 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              data-testid="btn-add-tier"
              type="button"
              variant="outline"
              size="sm"
              onClick={addTier}
              className="border-[#D5CEBD] text-[#4A675B] hover:bg-[#F4F1EA]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add tier
            </Button>
          </div>
        </div>

        {/* Consumable specifications section */}
        <div className="rounded-xl border border-[#D5CEBD] bg-[#FDFBF7] p-6">
          <p className="label-overline text-[#5C635F] mb-4">
            Consumable specifications
          </p>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-[#1F2321]">Sterility</Label>
              <Select
                value={form.sterility}
                onValueChange={(val) => updateField('sterility', val)}
              >
                <SelectTrigger data-testid="select-sterility" className="mt-1.5 w-full border-[#D5CEBD]">
                  <SelectValue placeholder="Select sterility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sterile">Sterile</SelectItem>
                  <SelectItem value="non_sterile">Non-sterile</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product-packagingQty" className="text-sm text-[#1F2321]">
                  Packaging quantity
                </Label>
                <Input
                  id="product-packagingQty"
                  data-testid="input-packagingQty"
                  type="number"
                  min={1}
                  value={form.packagingQty}
                  onChange={(e) =>
                    updateField('packagingQty', parseInt(e.target.value) || 1)
                  }
                  className="mt-1.5 border-[#D5CEBD]"
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  id="product-disposable"
                  data-testid="switch-disposable"
                  checked={form.disposable}
                  onCheckedChange={(val) => updateField('disposable', val)}
                />
                <Label htmlFor="product-disposable" className="text-sm text-[#1F2321]">
                  Disposable
                </Label>
              </div>
            </div>

            <div>
              <Label htmlFor="product-manufacturer" className="text-sm text-[#1F2321]">
                Manufacturer
              </Label>
              <Input
                id="product-manufacturer"
                data-testid="input-manufacturer"
                value={form.manufacturer}
                onChange={(e) => updateField('manufacturer', e.target.value)}
                placeholder="e.g. MedTech Industries"
                className="mt-1.5 border-[#D5CEBD]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product-material" className="text-sm text-[#1F2321]">
                  Material
                </Label>
                <Input
                  id="product-material"
                  data-testid="input-material"
                  value={form.material}
                  onChange={(e) => updateField('material', e.target.value)}
                  placeholder="e.g. Latex"
                  className="mt-1.5 border-[#D5CEBD]"
                />
              </div>
              <div>
                <Label htmlFor="product-plasticGrade" className="text-sm text-[#1F2321]">
                  Plastic grade
                </Label>
                <Input
                  id="product-plasticGrade"
                  data-testid="input-plasticGrade"
                  value={form.plasticGrade}
                  onChange={(e) => updateField('plasticGrade', e.target.value)}
                  placeholder="e.g. Medical Grade"
                  className="mt-1.5 border-[#D5CEBD]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="product-certifications" className="text-sm text-[#1F2321]">
                Certifications
              </Label>
              <Input
                id="product-certifications"
                data-testid="input-certifications"
                value={form.certifications}
                onChange={(e) => updateField('certifications', e.target.value)}
                placeholder="ISO 13485, CE, FDA (comma-separated)"
                className="mt-1.5 border-[#D5CEBD]"
              />
            </div>
          </div>
        </div>

        {/* Submit button */}
        <Button
          data-testid="btn-submit-product"
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-[#4A675B] hover:bg-[#3D564C] text-white rounded-xl btn-press"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEditing ? 'Save changes' : 'Create consumable'}
        </Button>
      </div>
    </div>
  );
}
