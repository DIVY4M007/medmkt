'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api-client';
import { formatINR, CATEGORY_LABELS, CATEGORY_OPTIONS } from '@/lib/format';
import { Search, ShieldCheck, Package, SlidersHorizontal, X, Tag } from 'lucide-react';
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
  discountPercent?: number | null;
  minOrderForDiscount?: number | null;
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
  const [discountOnly, setDiscountOnly] = useState(false);

  // Debounce search input (300ms)
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
      if (discountOnly) params.set('hasDiscount', 'true');

      const res = await api.get(`/products?${params.toString()}`) as { products: Product[] };
      setProducts(res.products);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, sterility, discountOnly]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const hasFilters = category !== 'all' || sterility !== 'all' || search !== '' || discountOnly;

  function clearFilters() {
    setSearch('');
    setCategory('all');
    setSterility('all');
    setDiscountOnly(false);
  }

  function getTierInfo(tierPricingJson: string) {
    try {
      const tiers: TierPrice[] = JSON.parse(tierPricingJson);
      if (!Array.isArray(tiers) || tiers.length === 0) return { base: 0, best: null };
      const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
      const base = sorted[0].unitPrice;
      const best = sorted[sorted.length - 1].unitPrice;
      return { base, best: best < base ? best : null };
    } catch {
      return { base: 0, best: null };
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground">
            Browse catalogue
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} product{products.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            data-testid="marketplace-search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card rounded-xl border-border"
          />
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <SlidersHorizontal className="size-4 text-muted-foreground hidden sm:block" />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger
            data-testid="filter-category"
            className="w-[180px] bg-card rounded-xl border-border"
          >
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
          <SelectTrigger
            data-testid="filter-sterility"
            className="w-[160px] bg-card rounded-xl border-border"
          >
            <SelectValue placeholder="Sterility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="sterile">Sterile</SelectItem>
            <SelectItem value="non_sterile">Non-Sterile</SelectItem>
          </SelectContent>
        </Select>

        <button
          onClick={() => setDiscountOnly(!discountOnly)}
          data-testid="filter-discount"
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
            discountOnly
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border bg-card text-muted-foreground hover:bg-secondary'
          }`}
        >
          <Tag className="size-4" />
          Discount
        </button>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            data-testid="clear-filters"
            onClick={clearFilters}
            className="text-accent hover:text-accent"
          >
            <X className="size-3.5 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="skeleton aspect-[4/3]" />
              <div className="p-4 space-y-2">
                <div className="skeleton h-3 w-20" />
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
                <div className="skeleton h-4 w-24 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-muted-foreground animate-fade-in-up">
          <Search className="size-12 mb-4 opacity-30" />
          <p className="text-lg font-heading font-semibold text-foreground">No products found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {products.map((product) => {
            const { base, best } = getTierInfo(product.tierPricing);
            const categoryLabel = CATEGORY_LABELS[product.category] || product.category;
            const isSterile = product.sterility === 'sterile';

            return (
              <button
                key={product.id}
                data-testid={`product-card-${product.id}`}
                onClick={() => navigate('product-detail', { id: product.id })}
                className="bg-card rounded-xl border border-border overflow-hidden card-hover text-left cursor-pointer group btn-press"
              >
                {/* Product Image */}
                <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="size-10 text-muted-foreground/30" />
                    </div>
                  )}
                  {isSterile && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold tracking-wide bg-card/90 text-primary backdrop-blur-sm shadow-sm">
                      <ShieldCheck className="size-3" />
                      Sterile
                    </span>
                  )}
                  {product.discountPercent && product.discountPercent > 0 && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold tracking-wide bg-emerald-50/95 text-emerald-700 backdrop-blur-sm shadow-sm border border-emerald-200">
                      <Tag className="size-3" />
                      {product.discountPercent}% off
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-2">
                  <p className="label-overline text-accent">{categoryLabel}</p>
                  <h3 className="font-heading text-lg font-semibold text-foreground leading-snug line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {product.sellerOrg?.name || 'Unknown seller'}
                  </p>

                  {/* Pricing */}
                  <div className="pt-2 border-t border-border/50">
                    {base > 0 ? (
                      <>
                        <p className="text-sm text-foreground">
                          From <span className="font-semibold">{formatINR(base)}</span> / per {product.unit}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {best !== null && (
                            <p className="text-xs text-primary font-medium">
                              as low as {formatINR(best)}
                            </p>
                          )}
                          {product.discountPercent && product.discountPercent > 0 && product.minOrderForDiscount && (
                            <p className="text-xs text-emerald-600 font-medium">
                              +{product.discountPercent}% off at {product.minOrderForDiscount}+ units
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">Contact for pricing</p>
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
