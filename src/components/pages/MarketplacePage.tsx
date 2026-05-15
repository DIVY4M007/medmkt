'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api-client';
import { formatINR, CATEGORY_LABELS, CATEGORY_OPTIONS } from '@/lib/format';
import { Search, SlidersHorizontal, ShieldCheck, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface TierPrice { minQty: number; unitPrice: number }

interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  imageUrl?: string;
  unit: string;
  tierPricing: string;
  sterility: string;
  sellerOrg?: { name: string };
  [key: string]: unknown;
}

export default function MarketplacePage() {
  const { navigate } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sterility, setSterility] = useState('all');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (category && category !== 'all') params.set('category', category);
      if (sterility && sterility !== 'all') params.set('sterility', sterility);

      const res = await api.get(`/products?${params.toString()}`) as { products: Product[] };
      setProducts(res.products);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, sterility]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function getTierInfo(tierPricingJson: string) {
    try {
      const tiers: TierPrice[] = JSON.parse(tierPricingJson);
      if (!Array.isArray(tiers) || tiers.length === 0) return { base: 0, best: null, unit: 'unit' };
      const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
      const base = sorted[0].unitPrice;
      const best = sorted[sorted.length - 1].unitPrice;
      return { base, best: best < base ? best : null };
    } catch {
      return { base: 0, best: null };
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-[#1F2321]">
            Browse catalogue
          </h1>
          <p className="mt-1 text-sm text-[#5C635F]">
            {products.length} product{products.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#5C635F]" />
          <Input
            data-testid="marketplace-search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-[#D5CEBD] bg-[#FDFBF7]"
          />
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <SlidersHorizontal className="size-4 text-[#5C635F] hidden sm:block" />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger data-testid="filter-category" className="w-[180px] border-[#D5CEBD] bg-[#FDFBF7]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sterility} onValueChange={setSterility}>
          <SelectTrigger data-testid="filter-sterility" className="w-[160px] border-[#D5CEBD] bg-[#FDFBF7]">
            <SelectValue placeholder="Sterility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="sterile">Sterile</SelectItem>
            <SelectItem value="non_sterile">Non-Sterile</SelectItem>
          </SelectContent>
        </Select>

        {(category !== 'all' || sterility !== 'all' || search) && (
          <Button
            variant="ghost"
            size="sm"
            data-testid="clear-filters"
            onClick={() => {
              setSearch('');
              setCategory('all');
              setSterility('all');
            }}
            className="text-[#C47055] hover:text-[#C47055]"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="size-8 animate-spin text-[#4A675B]" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-[#5C635F]">
          <Search className="size-12 mb-4 opacity-30" />
          <p className="text-lg font-heading font-semibold">No products found</p>
          <p className="text-sm mt-1">Try adjusting your filters or search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product) => {
            const { base, best } = getTierInfo(product.tierPricing);
            const categoryLabel = CATEGORY_LABELS[product.category] || product.category;
            const isSterile = product.sterility === 'sterile';

            return (
              <button
                key={product.id}
                data-testid={`product-card-${product.id}`}
                onClick={() => navigate('product-detail', { id: product.id })}
                className="border border-[#D5CEBD] rounded-md bg-[#FDFBF7] hover:-translate-y-1 hover:shadow-lg transition-all text-left overflow-hidden group cursor-pointer"
              >
                {/* Product Image */}
                <div className="relative aspect-[4/3] bg-[#EAE5D9] overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Search className="size-8 text-[#D5CEBD]" />
                    </div>
                  )}
                  {isSterile && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold tracking-wide bg-white/90 text-[#4A675B] backdrop-blur-sm shadow-sm">
                      <ShieldCheck className="size-3" />
                      Sterile
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-2">
                  <p className="label-overline text-[#C47055]">{categoryLabel}</p>
                  <h3 className="font-heading text-lg font-semibold text-[#1F2321] leading-snug line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-[#5C635F]">
                    {product.sellerOrg?.name || 'Unknown seller'}
                  </p>

                  {/* Pricing */}
                  <div className="pt-2 border-t border-[#D5CEBD]/50">
                    {base > 0 ? (
                      <>
                        <p className="text-sm text-[#1F2321]">
                          From <span className="font-semibold">{formatINR(base)}</span> / per {product.unit}
                        </p>
                        {best !== null && (
                          <p className="text-xs text-[#4A675B] mt-0.5">
                            as low as {formatINR(best)}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-[#5C635F]">Contact for pricing</p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
