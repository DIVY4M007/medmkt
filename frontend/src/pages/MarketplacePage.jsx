import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { CATEGORY_LABELS, formatCurrency, priceForQty } from '../lib/format';
import { Input } from '../components/ui/input';
import { Search, Tag } from 'lucide-react';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'medicines', label: 'Medicines' },
  { value: 'consumables', label: 'Consumables' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'used_equipment', label: 'Used / Refurbished' },
];

export default function MarketplacePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const params = {};
      if (tab !== 'all') params.category = tab;
      if (search) params.search = search;
      const { data } = await api.get('/products', { params });
      setProducts(data.products || []);
      setLoading(false);
    })();
  }, [tab, search]);

  const filtered = useMemo(() => products, [products]);

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto" data-testid="marketplace-page">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="label-overline text-[#C47055] mb-2">Marketplace</div>
          <h1 className="font-heading text-4xl font-semibold">Browse catalogue</h1>
          <p className="text-[#5C635F] mt-2">Tier-priced products from verified sellers in your network.</p>
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

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-[#D5CEBD] pb-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            data-testid={`marketplace-tab-${t.value}`}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === t.value ? 'bg-[#4A675B] text-white' : 'text-[#5C635F] hover:bg-[#F4F1EA]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-[#5C635F]" data-testid="marketplace-loading">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-[#5C635F] py-16 text-center" data-testid="marketplace-empty">No products match your filters.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="marketplace-grid">
          {filtered.map((p) => <ProductCard key={p._id} product={p} />)}
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
        <div className="label-overline text-[#5C635F] mb-2">{CATEGORY_LABELS[product.category]}</div>
        <h3 className="font-heading text-lg font-semibold leading-tight mb-1 line-clamp-2">{product.name}</h3>
        <div className="text-xs text-[#5C635F] mb-3">
          by {product.sellerOrg?.name || '—'}
          {product.isUsed && product.condition && (
            <span className="ml-2 inline-flex items-center gap-1 text-[#C47055]">
              <Tag className="h-3 w-3" /> {product.condition.replace('_', ' ')}
            </span>
          )}
        </div>
        <div className="mt-auto pt-3 border-t border-[#D5CEBD] flex items-baseline justify-between">
          <div>
            <div className="font-heading text-lg font-semibold text-[#4A675B]">{formatCurrency(startPrice)}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#5C635F]">From / per {product.unit}</div>
          </div>
          {bestPrice < startPrice && (
            <div className="text-xs text-[#C47055]">as low as {formatCurrency(bestPrice)}</div>
          )}
        </div>
      </div>
    </Link>
  );
}
