'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api-client';
import {
  formatINR,
  priceForQty,
  CATEGORY_LABELS,
  STERILITY_LABELS,
  ORG_TYPE_LABELS,
} from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ShoppingCart,
  ShieldCheck,
  Recycle,
  Package,
  Building2,
  Award,
  Layers,
  AlertTriangle,
  Loader2,
  Tag,
} from 'lucide-react';
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

interface SellerOrg {
  id: string;
  name: string;
  type: string;
  accountType: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  imageUrl: string | null;
  stock: number;
  unit: string;
  tierPricing: string;
  sterility: string;
  disposable: boolean;
  packagingQty: number;
  manufacturer: string | null;
  qualityMetadata: string | null;
  discountPercent: number | null;
  minOrderForDiscount: number | null;
  sellerOrgId: string;
  sellerOrg: SellerOrg;
  isActive: boolean;
}

export default function ProductDetailPage() {
  const { navigate, user, params } = useAppStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get(`/products/${params.id}`);
      setProduct(data.product);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load product';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id, fetchProduct]);

  // Loading state
  if (loading) {
    return (
      <div className="animate-fade-in-up">
        <div className="skeleton h-4 w-28 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="skeleton aspect-[4/3] rounded-2xl" />
          <div className="space-y-4">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-8 w-3/4" />
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-32 w-full rounded-xl" />
            <div className="skeleton h-24 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="animate-fade-in-up">
        <button
          onClick={() => navigate('marketplace')}
          className="text-primary hover:underline text-sm mb-6 inline-flex items-center gap-1 transition-colors"
          data-testid="back-link"
        >
          <ArrowLeft className="size-4" /> Marketplace
        </button>
        <div className="text-center py-16">
          <AlertTriangle className="size-12 text-accent mx-auto mb-4" />
          <p className="text-muted-foreground">{error || 'Product not found'}</p>
        </div>
      </div>
    );
  }

  const tiers: TierPrice[] = product.tierPricing
    ? JSON.parse(product.tierPricing)
    : [];
  const sortedTiers = [...tiers].sort((a, b) => a.minQty - b.minQty);

  const quality: QualityMetadata | null = product.qualityMetadata
    ? JSON.parse(product.qualityMetadata)
    : null;

  const unitPrice = priceForQty(product.tierPricing, quantity);
  let lineTotal = unitPrice * quantity;
  const basePrice = sortedTiers.length > 0 ? sortedTiers[0].unitPrice : 0;

  // Apply discount if applicable
  const hasDiscount = product.discountPercent && product.discountPercent > 0 && product.minOrderForDiscount;
  const discountApplies = hasDiscount && quantity >= (product.minOrderForDiscount ?? Infinity);
  const discountAmount = discountApplies ? lineTotal * (product.discountPercent! / 100) : 0;
  if (discountApplies) {
    lineTotal = lineTotal - discountAmount;
  }

  const canAddToCart =
    user &&
    user.accountType === 'buyer' &&
    user.role === 'requestor' &&
    product.sellerOrgId !== user.orgId;

  const isOwnProduct = user && product.sellerOrgId === user.orgId;
  const isNotBuyer = user && user.accountType !== 'buyer';
  const isNotRequestor = user && user.accountType === 'buyer' && user.role !== 'requestor';

  const handleAddToCart = async () => {
    if (!canAddToCart) return;
    try {
      setAddingToCart(true);
      await api.post('/cart/items', { productId: product.id, quantity });
      toast.success(`${product.name} added to cart`, {
        action: {
          label: 'View cart',
          onClick: () => navigate('cart'),
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add to cart';
      toast.error(message);
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      {/* Back link */}
      <button
        onClick={() => navigate('marketplace')}
        className="text-primary hover:underline text-sm mb-6 inline-flex items-center gap-1 transition-colors"
        data-testid="back-link"
      >
        <ArrowLeft className="size-4" /> Marketplace
      </button>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Product Image */}
        <div className="aspect-[4/3] bg-secondary rounded-2xl overflow-hidden flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="size-16 text-muted-foreground/30" />
          )}
        </div>

        {/* Right: Product Details */}
        <div className="flex flex-col gap-5">
          {/* Category + Name + Seller */}
          <div>
            <span className="label-overline text-accent">
              {CATEGORY_LABELS[product.category] || product.category}
            </span>
            <h1 className="font-heading text-3xl font-semibold text-foreground mt-1">
              {product.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-1.5">
              <Building2 className="size-3.5" />
              {product.sellerOrg.name}
              <span className="text-border">·</span>
              {ORG_TYPE_LABELS[product.sellerOrg.type] || product.sellerOrg.type}
            </p>
          </div>

          {/* Status chips */}
          <div className="flex flex-wrap gap-2">
            {product.sterility === 'sterile' && (
              <Badge
                variant="outline"
                className="border-emerald-300 bg-emerald-50 text-emerald-700 gap-1 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              >
                <ShieldCheck className="size-3" />
                {STERILITY_LABELS[product.sterility]}
              </Badge>
            )}
            {product.sterility === 'non_sterile' && (
              <Badge
                variant="outline"
                className="border-border bg-secondary text-muted-foreground gap-1"
              >
                <ShieldCheck className="size-3" />
                {STERILITY_LABELS[product.sterility]}
              </Badge>
            )}
            {product.disposable ? (
              <Badge
                variant="outline"
                className="border-teal-300 bg-teal-50 text-teal-700 gap-1 dark:border-teal-700 dark:bg-teal-950 dark:text-teal-300"
              >
                <Recycle className="size-3" />
                Disposable
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-orange-300 bg-orange-50 text-orange-700 gap-1 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-300"
              >
                <Layers className="size-3" />
                Reusable
              </Badge>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Tier Pricing Table */}
          {sortedTiers.length > 0 && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-secondary">
                <span className="text-sm font-medium text-foreground">
                  Tier pricing
                </span>
                <span className="text-xs text-muted-foreground">
                  per {product.unit}
                </span>
              </div>
              <table className="w-full text-sm premium-table">
                <thead>
                  <tr className="border-b border-border bg-secondary">
                    <th className="text-left px-4 py-2 text-muted-foreground font-medium">
                      Min qty
                    </th>
                    <th className="text-left px-4 py-2 text-muted-foreground font-medium">
                      Unit price
                    </th>
                    <th className="text-left px-4 py-2 text-muted-foreground font-medium">
                      Savings %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTiers.map((tier, idx) => {
                    const savings =
                      basePrice > 0
                        ? ((basePrice - tier.unitPrice) / basePrice) * 100
                        : 0;
                    return (
                      <tr
                        key={idx}
                        className={idx % 2 === 1 ? 'bg-secondary/40' : ''}
                      >
                        <td className="px-4 py-2 text-foreground">
                          {tier.minQty}+
                        </td>
                        <td className="px-4 py-2 text-foreground font-medium">
                          {formatINR(tier.unitPrice)}
                        </td>
                        <td className="px-4 py-2 text-primary font-medium">
                          {savings > 0 ? `${savings.toFixed(0)}%` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* Discount info */}
              {hasDiscount && (
                <div className={`px-4 py-2.5 border-t border-border flex items-center gap-2 ${discountApplies ? 'bg-emerald-50' : 'bg-secondary/40'}`}>
                  <Tag className="size-4 text-emerald-600" />
                  <span className={`text-xs font-medium ${discountApplies ? 'text-emerald-700' : 'text-muted-foreground'}`}>
                    {discountApplies
                      ? `${product.discountPercent}% bulk discount applied! (ordered ${quantity} ≥ ${product.minOrderForDiscount} min)`
                      : `${product.discountPercent}% discount available on orders of ${product.minOrderForDiscount}+ units`
                    }
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Specifications grid */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">
              Specifications
            </h3>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
              <div className="flex flex-col">
                <dt className="text-muted-foreground">Sterility</dt>
                <dd className="text-foreground">
                  {STERILITY_LABELS[product.sterility] || product.sterility}
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-muted-foreground">Use</dt>
                <dd className="text-foreground">
                  {product.disposable ? 'Disposable' : 'Reusable'}
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-muted-foreground">Packaging qty</dt>
                <dd className="text-foreground">
                  {product.packagingQty} / {product.unit}
                </dd>
              </div>
              {product.manufacturer && (
                <div className="flex flex-col">
                  <dt className="text-muted-foreground">Manufacturer</dt>
                  <dd className="text-foreground">{product.manufacturer}</dd>
                </div>
              )}
              {quality?.material && (
                <div className="flex flex-col">
                  <dt className="text-muted-foreground">Material</dt>
                  <dd className="text-foreground">{quality.material}</dd>
                </div>
              )}
              {quality?.plasticGrade && (
                <div className="flex flex-col">
                  <dt className="text-muted-foreground">Grade</dt>
                  <dd className="text-foreground">{quality.plasticGrade}</dd>
                </div>
              )}
            </dl>

            {/* Certifications */}
            {quality?.certifications && quality.certifications.length > 0 && (
              <div className="mt-4">
                <dt className="text-muted-foreground text-sm mb-1.5">Certifications</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {quality.certifications.map((cert) => (
                    <Badge
                      key={cert}
                      variant="outline"
                      className="border-border bg-secondary/60 text-muted-foreground text-xs gap-1"
                    >
                      <Award className="size-3" />
                      {cert}
                    </Badge>
                  ))}
                </dd>
              </div>
            )}
          </div>

          {/* Cart Action Box */}
          <div className="bg-secondary rounded-xl border border-border p-5">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="qty-input"
                  className="text-xs text-muted-foreground font-medium"
                >
                  Quantity ({product.unit})
                </label>
                <Input
                  id="qty-input"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-24 bg-card border-border"
                  data-testid="quantity-input"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground font-medium">
                  Unit price
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formatINR(unitPrice)}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground font-medium">
                  Line total
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-primary">
                    {formatINR(lineTotal)}
                  </span>
                  {discountApplies && discountAmount > 0 && (
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
                      −{formatINR(discountAmount)} saved
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-1" />
              <Button
                onClick={handleAddToCart}
                disabled={!canAddToCart || addingToCart}
                className="bg-primary hover:bg-primary/90 text-primary-foreground btn-press"
                data-testid="add-to-cart-btn"
              >
                {addingToCart ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ShoppingCart className="size-4" />
                )}
                Add to cart
              </Button>
            </div>

            {/* Restriction messages */}
            {!user && (
              <p className="text-xs text-accent mt-3 flex items-center gap-1">
                <AlertTriangle className="size-3" />
                Sign in as a buyer requestor to add items to cart.
              </p>
            )}
            {isOwnProduct && (
              <p className="text-xs text-accent mt-3 flex items-center gap-1">
                <AlertTriangle className="size-3" />
                You cannot purchase your own organization&apos;s products.
              </p>
            )}
            {isNotBuyer && (
              <p className="text-xs text-accent mt-3 flex items-center gap-1">
                <AlertTriangle className="size-3" />
                Only buyer accounts can add items to cart.
              </p>
            )}
            {isNotRequestor && !isOwnProduct && (
              <p className="text-xs text-accent mt-3 flex items-center gap-1">
                <AlertTriangle className="size-3" />
                Only requestors can add items to cart. Approvers review and approve orders.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
