import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { CATEGORY_LABELS, CATEGORY_OPTIONS, formatINR, priceForQty, STERILITY_LABELS } from '../lib/format';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search, ShieldCheck } from 'lucide-react';

export default function MarketplacePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [sterility, setSterility] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const params = {};
      if (category !== 'all') params.category = category;
      if (sterility !== 'all') params.sterility = sterility;
      if (search) params.search = search;
      const { data } = await api.get('/products', { params });
      setProducts(data.products || []);
      setLoading(false);
    })();
  }, [category, sterility, search]);

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto" data-testid="marketplace-page">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="label-overline text-[#C47055] mb-2">Consumables</div>
          <h1 className="font-heading text-4xl font-semibold">Browse catalogue</h1>
          <p className="text-[#5C635F] mt-2">Tier-priced medical consumables from verified sellers.</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5C635F]" />
          <Input
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="marketplace-search-input"
            className="pl-9 border-[#D5CEBD] focus-visible:ring-[#4A675B]"
          />
        </div>
      </header>

      {/* Filter bar */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <div>
          <label className="label-overline text-[#5C635F] block mb-1.5">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="border-[#D5CEBD]" data-testid="marketplace-category-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} data-testid={`marketplace-category-${o.value}`}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="label-overline text-[#5C635F] block mb-1.5">Sterility</label>
          <Select value={sterility} onValueChange={setSterility}>
            <SelectTrigger className="border-[#D5CEBD]" data-testid="marketplace-sterility-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="sterile">Sterile</SelectItem>
              <SelectItem value="non_sterile">Non-sterile</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-[#5C635F]" data-testid="marketplace-loading">Loading…</div>
      ) : products.length === 0 ? (
        <div className="text-[#5C635F] py-16 text-center" data-testid="marketplace-empty">No products match your filters.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="marketplace-grid">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }) {
  const startPrice = priceForQty(product.tierPricing, 1);
  const bestPrice = product.tierPricing && product.tierPricing.length
    ? Math.min(...product.tierPricing.map((t) => t.unitPrice)) : 0;
  return (
    <Link
      to={`/products/${product._id}`}
      data-testid={`product-card-${product._id}`}
      className="group bg-[#FDFBF7] border border-[#D5CEBD] rounded-md overflow-hidden flex flex-col transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="aspect-[4/3] bg-[#EAE5D9] overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : null}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="label-overline text-[#5C635F] mb-2">{CATEGORY_LABELS[product.category] || product.category}</div>
        <h3 className="font-heading text-lg font-semibold leading-tight mb-1 line-clamp-2">{product.name}</h3>
        <div className="text-xs text-[#5C635F] mb-3 flex items-center gap-2">
          <span>by {product.sellerOrg?.name || '—'}</span>
          {product.sterility === 'sterile' && (
            <span className="inline-flex items-center gap-1 text-[#4A675B]">
              <ShieldCheck className="h-3 w-3" /> Sterile
            </span>
          )}
        </div>
        <div className="mt-auto pt-3 border-t border-[#D5CEBD] flex items-baseline justify-between">
          <div>
            <div className="font-heading text-lg font-semibold text-[#4A675B]">{formatINR(startPrice)}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#5C635F]">From / per {product.unit}</div>
          </div>
          {bestPrice < startPrice && (
            <div className="text-xs text-[#C47055]">as low as {formatINR(bestPrice)}</div>
          )}
        </div>
      </div>
    </Link>
  );
}
