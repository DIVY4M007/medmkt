import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../lib/auth';
import { CATEGORY_LABELS, formatCurrency, priceForQty } from '../lib/format';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ChevronLeft, ShoppingCart, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.product);
    })();
  }, [id]);

  if (!product) return <div className="p-12 text-[#5C635F]" data-testid="product-loading">Loading…</div>;

  const ownProduct = user?.organization?._id === product.sellerOrg?._id;
  const canAddToCart = user?.role === 'requestor' && !ownProduct;

  const unitPrice = priceForQty(product.tierPricing, qty);
  const lineTotal = unitPrice * qty;

  const addToCart = async () => {
    setBusy(true);
    try {
      await api.post('/cart/items', { productId: product._id, quantity: qty });
      toast.success(`${product.name} added to cart`);
      navigate('/cart');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not add to cart');
    } finally {
      setBusy(false);
    }
  };

  const meta = product.qualityMetadata || {};

  return (
    <div className="p-8 lg:p-12 max-w-6xl mx-auto" data-testid="product-detail-page">
      <Link to="/marketplace" className="inline-flex items-center gap-1 text-sm text-[#5C635F] hover:text-[#1F2321] mb-6" data-testid="back-to-marketplace">
        <ChevronLeft className="h-4 w-4" /> Marketplace
      </Link>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-6">
          <div className="aspect-[4/3] bg-[#EAE5D9] rounded-md overflow-hidden border border-[#D5CEBD]">
            {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />}
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="label-overline text-[#5C635F] mb-2">{CATEGORY_LABELS[product.category]}</div>
          <h1 className="font-heading text-3xl lg:text-4xl font-semibold leading-tight" data-testid="product-name">{product.name}</h1>
          <div className="text-sm text-[#5C635F] mt-2">Sold by <span className="font-medium text-[#1F2321]">{product.sellerOrg?.name}</span> · {product.sellerOrg?.type}</div>

          <p className="text-[#1F2321] leading-relaxed mt-6">{product.description}</p>

          {/* Tier pricing table */}
          <div className="mt-8 border border-[#D5CEBD] rounded-md overflow-hidden">
            <div className="bg-[#F4F1EA] px-4 py-3 border-b border-[#D5CEBD] flex items-center justify-between">
              <div className="label-overline text-[#5C635F]">Tier pricing</div>
              <div className="text-xs text-[#5C635F]">per {product.unit}</div>
            </div>
            <table className="w-full text-sm" data-testid="tier-pricing-table">
              <thead className="bg-[#F4F1EA] text-[#5C635F]">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">Min qty</th>
                  <th className="text-right px-4 py-2.5 font-medium">Unit price</th>
                  <th className="text-right px-4 py-2.5 font-medium">Savings</th>
                </tr>
              </thead>
              <tbody>
                {product.tierPricing.map((t, i) => {
                  const base = product.tierPricing[0].unitPrice;
                  const pct = base > 0 ? Math.round(((base - t.unitPrice) / base) * 100) : 0;
                  return (
                    <tr key={i} className={i % 2 ? 'bg-[#F4F1EA]/40' : ''}>
                      <td className="px-4 py-2.5">{t.minQty}+</td>
                      <td className="px-4 py-2.5 text-right font-heading">{formatCurrency(t.unitPrice)}</td>
                      <td className="px-4 py-2.5 text-right text-[#C47055]">{pct > 0 ? `−${pct}%` : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Quality metadata */}
          {(meta.material || meta.plasticGrade || (meta.certifications && meta.certifications.length)) && (
            <div className="mt-8 border border-[#D5CEBD] rounded-md p-5 bg-[#FDFBF7]">
              <div className="label-overline text-[#5C635F] mb-3 flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5" /> Quality metadata
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {meta.material && (<><dt className="text-[#5C635F]">Material</dt><dd>{meta.material}</dd></>)}
                {meta.plasticGrade && (<><dt className="text-[#5C635F]">Grade</dt><dd>{meta.plasticGrade}</dd></>)}
                {meta.certifications?.length > 0 && (
                  <><dt className="text-[#5C635F]">Certifications</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {meta.certifications.map((c) => (
                        <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-[#4A675B]/10 text-[#4A675B] font-medium">{c}</span>
                      ))}
                    </dd></>
                )}
              </dl>
            </div>
          )}

          {/* Used equipment specifics */}
          {product.isUsed && (
            <div className="mt-6 border border-[#C47055]/30 bg-[#C47055]/5 rounded-md p-5">
              <div className="label-overline text-[#C47055] mb-2">Used / Refurbished</div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <dt className="text-[#5C635F]">Condition</dt><dd className="capitalize">{product.condition?.replace('_', ' ')}</dd>
                {product.yearOfManufacture && (<><dt className="text-[#5C635F]">Year</dt><dd>{product.yearOfManufacture}</dd></>)}
                {product.usageDetails && (<><dt className="text-[#5C635F]">Usage details</dt><dd>{product.usageDetails}</dd></>)}
              </dl>
            </div>
          )}

          {/* Cart actions */}
          <div className="mt-8 border border-[#D5CEBD] rounded-md p-5 bg-[#F4F1EA]">
            <div className="flex items-end gap-4 flex-wrap">
              <div>
                <label className="label-overline text-[#5C635F] block mb-1.5">Quantity</label>
                <Input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  data-testid="qty-input"
                  className="w-32 border-[#D5CEBD]" />
              </div>
              <div>
                <div className="label-overline text-[#5C635F]">Unit price</div>
                <div className="font-heading text-2xl font-semibold text-[#4A675B]" data-testid="unit-price">{formatCurrency(unitPrice)}</div>
              </div>
              <div>
                <div className="label-overline text-[#5C635F]">Line total</div>
                <div className="font-heading text-2xl font-semibold" data-testid="line-total">{formatCurrency(lineTotal)}</div>
              </div>
              <div className="ml-auto">
                <Button
                  disabled={!canAddToCart || busy}
                  onClick={addToCart}
                  data-testid="add-to-cart-btn"
                  className="bg-[#4A675B] hover:bg-[#3D564C] text-white rounded-md"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" /> Add to cart
                </Button>
                {!canAddToCart && (
                  <div className="text-xs text-[#5C635F] mt-1.5">
                    {ownProduct ? 'Your own product' : 'Only requestors can add to cart'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
