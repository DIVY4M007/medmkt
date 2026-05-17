import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { CATEGORY_LABELS, formatINR } from '../lib/format';
import { Plus } from 'lucide-react';

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products/mine').then(({ data }) => {
      setProducts(data.products || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto" data-testid="seller-products-page">
      <header className="flex items-end justify-between mb-8">
        <div>
          <div className="label-overline text-[#C47055] mb-2">My catalogue</div>
          <h1 className="font-heading text-4xl font-semibold">Products you sell</h1>
        </div>
        <Link to="/seller/products/new">
          <Button className="bg-[#4A675B] hover:bg-[#3D564C] text-white rounded-md" data-testid="new-product-btn">
            <Plus className="h-4 w-4 mr-2" /> Add product
          </Button>
        </Link>
      </header>

      {loading ? (
        <div className="text-[#5C635F]">Loading…</div>
      ) : products.length === 0 ? (
        <div className="border border-dashed border-[#D5CEBD] rounded-md p-16 text-center text-[#5C635F]" data-testid="seller-empty">
          You haven't listed any products yet.
        </div>
      ) : (
        <div className="border border-[#D5CEBD] rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F4F1EA] text-[#5C635F]">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-right px-4 py-3 font-medium">Tiers</th>
                <th className="text-right px-4 py-3 font-medium">From</th>
                <th className="text-right px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-t border-[#D5CEBD]" data-testid={`seller-product-row-${p._id}`}>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-[#5C635F]">{CATEGORY_LABELS[p.category]}</td>
                  <td className="px-4 py-3 text-right">{p.tierPricing?.length || 0}</td>
                  <td className="px-4 py-3 text-right font-heading">{formatINR(p.tierPricing?.[0]?.unitPrice || 0)}</td>
                  <td className="px-4 py-3 text-right">{p.stock}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/seller/products/${p._id}/edit`} className="text-xs text-[#4A675B] hover:underline" data-testid={`edit-product-${p._id}`}>Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
