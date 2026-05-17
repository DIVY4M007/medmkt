'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api-client';
import { formatINR, CATEGORY_LABELS } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Package, Pencil } from 'lucide-react';

interface TierPrice {
  minQty: number;
  unitPrice: number;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  imageUrl?: string;
  stock: number;
  unit: string;
  tierPricing: string;
  sterility: string;
  disposable: boolean;
  packagingQty: number;
  manufacturer?: string;
  qualityMetadata?: string;
  sellerOrgId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sellerOrg?: { id: string; name: string; type: string };
}

export default function SellerProductsPage() {
  const { navigate } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const data = await api.get('/products/mine');
        setProducts(data.products || []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const getTiers = (tierPricing: string): TierPrice[] => {
    try {
      const parsed = JSON.parse(tierPricing);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const getFromPrice = (tierPricing: string): string => {
    const tiers = getTiers(tierPricing);
    if (tiers.length === 0) return '—';
    const sorted = [...tiers].sort((a, b) => a.unitPrice - b.unitPrice);
    return formatINR(sorted[0].unitPrice);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in-up">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Products you sell
        </h1>
        <Button
          data-testid="btn-add-product"
          onClick={() => navigate('seller-product-form')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg btn-press shrink-0"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add product
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border p-12 text-center animate-fade-in-up">
          <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            You haven&apos;t listed any products yet.
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in-up">
          <table className="w-full text-sm premium-table">
            <thead>
              <tr className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3.5 text-left font-medium">Name</th>
                <th className="px-5 py-3.5 text-left font-medium">Category</th>
                <th className="px-5 py-3.5 text-left font-medium">Tiers</th>
                <th className="px-5 py-3.5 text-left font-medium">From price</th>
                <th className="px-5 py-3.5 text-left font-medium">Stock</th>
                <th className="px-5 py-3.5 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody className="stagger-children">
              {products.map((product) => {
                const tiers = getTiers(product.tierPricing);
                return (
                  <tr
                    key={product.id}
                    className="border-b border-border last:border-b-0 group"
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      {product.name}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {CATEGORY_LABELS[product.category] || product.category}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {tiers.length} tier{tiers.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-5 py-3.5 text-foreground font-medium">
                      {getFromPrice(product.tierPricing)}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {product.stock} {product.unit}
                      {product.unit !== 'box' ? 's' : 'es'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        data-testid={`btn-edit-product-${product.id}`}
                        onClick={() =>
                          navigate('seller-product-form', { id: product.id })
                        }
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
