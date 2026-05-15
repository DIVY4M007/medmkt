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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-[#1F2321]">
          Products you sell
        </h1>
        <Button
          data-testid="btn-add-product"
          onClick={() => navigate('seller-product-form')}
          className="bg-[#4A675B] hover:bg-[#3D564C] text-white"
        >
          <Plus className="h-4 w-4" />
          Add product
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-[#4A675B]" />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-md border-2 border-dashed border-[#D5CEBD] p-12 text-center">
          <Package className="mx-auto mb-3 h-10 w-10 text-[#D5CEBD]" />
          <p className="text-sm text-[#5C635F]">
            You haven&apos;t listed any products yet.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-[#D5CEBD] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F4F1EA] border-b border-[#D5CEBD]">
                <th className="px-4 py-3 text-left font-medium text-[#5C635F]">Name</th>
                <th className="px-4 py-3 text-left font-medium text-[#5C635F]">Category</th>
                <th className="px-4 py-3 text-left font-medium text-[#5C635F]">Tiers</th>
                <th className="px-4 py-3 text-left font-medium text-[#5C635F]">From price</th>
                <th className="px-4 py-3 text-left font-medium text-[#5C635F]">Stock</th>
                <th className="px-4 py-3 text-right font-medium text-[#5C635F]"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const tiers = getTiers(product.tierPricing);
                return (
                  <tr
                    key={product.id}
                    className="border-b border-[#D5CEBD] last:border-b-0"
                  >
                    <td className="px-4 py-3 font-medium text-[#1F2321]">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 text-[#5C635F]">
                      {CATEGORY_LABELS[product.category] || product.category}
                    </td>
                    <td className="px-4 py-3 text-[#5C635F]">
                      {tiers.length} tier{tiers.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-3 text-[#1F2321]">
                      {getFromPrice(product.tierPricing)}
                    </td>
                    <td className="px-4 py-3 text-[#5C635F]">
                      {product.stock} {product.unit}
                      {product.unit !== 'box' ? 's' : 'es'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        data-testid={`btn-edit-product-${product.id}`}
                        onClick={() =>
                          navigate('seller-product-form', { id: product.id })
                        }
                        className="inline-flex items-center gap-1 text-sm text-[#4A675B] hover:underline"
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
