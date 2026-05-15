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
import StatusBadge from '@/components/StatusBadge';
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
  Tag,
  Loader2,
  AlertTriangle,
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
    } catch (err: any) {
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id, fetchProduct]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-[#4A675B]" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('marketplace')}
          className="text-[#4A675B] hover:underline text-sm mb-6 inline-flex items-center gap-1"
        >
          <ArrowLeft className="size-4" /> Marketplace
        </button>
        <div className="text-center py-16">
          <AlertTriangle className="size-12 text-[#C47055] mx-auto mb-4" />
          <p className="text-[#5C635F]">{error || 'Product not found'}</p>
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
  const lineTotal = unitPrice * quantity;

  const basePrice = sortedTiers.length > 0 ? sortedTiers[0].unitPrice : 0;

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
    } catch (err: any) {
      toast.error(err.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Back link */}
      <button
        onClick={() => navigate('marketplace')}
        className="text-[#4A675B] hover:underline text-sm mb-6 inline-flex items-center gap-1 transition-colors"
        data-testid="back-link"
      >
        <ArrowLeft className="size-4" /> Marketplace
      </button>

      {/* Grid: Image + Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Product Image */}
        <div className="aspect-[4/3] bg-[#EAE5D9] rounded-lg overflow-hidden flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="size-16 text-[#D5CEBD]" />
          )}
        </div>

        {/* Right: Details */}
        <div className="flex flex-col gap-5">
          {/* Category + Name */}
          <div>
            <span className="label-overline text-[#5C635F]">
              {CATEGORY_LABELS[product.category] || product.category}
            </span>
            <h1 className="font-heading text-3xl font-semibold text-[#1F2321] mt-1">
              {product.name}
            </h1>
            <p className="text-sm text-[#5C635F] mt-1 flex items-center gap-1.5">
              <Building2 className="size-3.5" />
              {product.sellerOrg.name}
              <span className="text-[#D5CEBD]">•</span>
              {ORG_TYPE_LABELS[product.sellerOrg.type] || product.sellerOrg.type}
            </p>
          </div>

          {/* Status chips */}
          <div className="flex flex-wrap gap-2">
            {product.sterility === 'sterile' && (
              <Badge
                variant="outline"
                className="border-emerald-300 bg-emerald-50 text-emerald-700 gap-1"
              >
                <ShieldCheck className="size-3" />
                {STERILITY_LABELS[product.sterility]}
              </Badge>
            )}
            {product.sterility === 'non_sterile' && (
              <Badge
                variant="outline"
                className="border-[#D5CEBD] bg-[#F4F1EA] text-[#5C635F] gap-1"
              >
                <ShieldCheck className="size-3" />
                {STERILITY_LABELS[product.sterility]}
              </Badge>
            )}
            {product.disposable ? (
              <Badge
                variant="outline"
                className="border-[#C47055]/30 bg-[#C47055]/10 text-[#C47055] gap-1"
              >
                <Recycle className="size-3" />
                Disposable
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-[#4A675B]/30 bg-[#4A675B]/10 text-[#4A675B] gap-1"
              >
                <Layers className="size-3" />
                Reusable
              </Badge>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-[#5C635F] leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Tier Pricing Table */}
          {sortedTiers.length > 0 && (
            <div className="border border-[#D5CEBD] rounded-md overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#F4F1EA]">
                <span className="text-sm font-medium text-[#1F2321]">
                  Tier pricing
                </span>
                <span className="text-xs text-[#5C635F]">
                  per {product.unit}
                </span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#D5CEBD]">
                    <th className="text-left px-4 py-2 text-[#5C635F] font-medium">
                      Min qty
                    </th>
                    <th className="text-left px-4 py-2 text-[#5C635F] font-medium">
                      Unit price
                    </th>
                    <th className="text-left px-4 py-2 text-[#5C635F] font-medium">
                      Savings
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
                        className={
                          idx % 2 === 1 ? 'bg-[#F4F1EA]/40' : ''
                        }
                      >
                        <td className="px-4 py-2 text-[#1F2321]">
                          {tier.minQty}+
                        </td>
                        <td className="px-4 py-2 text-[#1F2321] font-medium">
                          {formatINR(tier.unitPrice)}
                        </td>
                        <td className="px-4 py-2 text-[#4A675B] font-medium">
                          {savings > 0 ? `${savings.toFixed(0)}%` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Specifications */}
          <div>
            <h3 className="text-sm font-medium text-[#1F2321] mb-3">
              Specifications
            </h3>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="flex flex-col">
                <dt className="text-[#5C635F]">Sterility</dt>
                <dd className="text-[#1F2321]">
                  {STERILITY_LABELS[product.sterility] || product.sterility}
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-[#5C635F]">Use</dt>
                <dd className="text-[#1F2321]">
                  {product.disposable ? 'Disposable' : 'Reusable'}
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-[#5C635F]">Packaging qty</dt>
                <dd className="text-[#1F2321]">
                  {product.packagingQty} / {product.unit}
                </dd>
              </div>
              {product.manufacturer && (
                <div className="flex flex-col">
                  <dt className="text-[#5C635F]">Manufacturer</dt>
                  <dd className="text-[#1F2321]">{product.manufacturer}</dd>
                </div>
              )}
              {quality?.material && (
                <div className="flex flex-col">
                  <dt className="text-[#5C635F]">Material</dt>
                  <dd className="text-[#1F2321]">{quality.material}</dd>
                </div>
              )}
              {quality?.plasticGrade && (
                <div className="flex flex-col">
                  <dt className="text-[#5C635F]">Grade</dt>
                  <dd className="text-[#1F2321]">{quality.plasticGrade}</dd>
                </div>
              )}
            </dl>
            {quality?.certifications && quality.certifications.length > 0 && (
              <div className="mt-3">
                <dt className="text-[#5C635F] text-sm mb-1.5">Certifications</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {quality.certifications.map((cert) => (
                    <Badge
                      key={cert}
                      variant="outline"
                      className="border-[#D5CEBD] bg-[#F4F1EA]/60 text-[#5C635F] text-xs gap-1"
                    >
                      <Award className="size-3" />
                      {cert}
                    </Badge>
                  ))}
                </dd>
              </div>
            )}
          </div>

          {/* Cart Actions */}
          <div className="bg-[#F4F1EA] border border-[#D5CEBD] rounded-md p-5">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="qty-input"
                  className="text-xs text-[#5C635F] font-medium"
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
                  className="w-24"
                  data-testid="quantity-input"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-[#5C635F] font-medium">
                  Unit price
                </span>
                <span className="text-sm font-semibold text-[#1F2321]">
                  {formatINR(unitPrice)}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-[#5C635F] font-medium">
                  Line total
                </span>
                <span className="text-sm font-semibold text-[#4A675B]">
                  {formatINR(lineTotal)}
                </span>
              </div>
              <div className="flex-1" />
              <Button
                onClick={handleAddToCart}
                disabled={!canAddToCart || addingToCart}
                className="bg-[#4A675B] hover:bg-[#3D564C] text-white"
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
              <p className="text-xs text-[#C47055] mt-3 flex items-center gap-1">
                <AlertTriangle className="size-3" />
                Sign in as a buyer requestor to add items to cart.
              </p>
            )}
            {isOwnProduct && (
              <p className="text-xs text-[#C47055] mt-3 flex items-center gap-1">
                <AlertTriangle className="size-3" />
                You cannot purchase your own organization&apos;s products.
              </p>
            )}
            {isNotBuyer && (
              <p className="text-xs text-[#C47055] mt-3 flex items-center gap-1">
                <AlertTriangle className="size-3" />
                Only buyer accounts can add items to cart.
              </p>
            )}
            {isNotRequestor && !isOwnProduct && (
              <p className="text-xs text-[#C47055] mt-3 flex items-center gap-1">
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
