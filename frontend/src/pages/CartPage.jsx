import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { formatINR } from '../lib/format';
import { Trash2, Send, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

export default function CartPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const { data } = await api.get('/cart');
    setCart(data.cart);
  };

  useEffect(() => { refresh(); }, []);

  if (user?.role !== 'requestor') {
    return (
      <div className="p-12 max-w-3xl">
        <h1 className="font-heading text-3xl font-semibold">Cart unavailable</h1>
        <p className="text-[#5C635F] mt-2">Only requestors can build carts. Approvers review submitted orders in <Link to="/orders?view=buyer" className="underline">Purchase orders</Link>.</p>
      </div>
    );
  }

  if (!cart) return <div className="p-12 text-[#5C635F]" data-testid="cart-loading">Loading…</div>;

  const updateQty = async (itemId, quantity) => {
    if (quantity < 1) return;
    const { data } = await api.patch(`/cart/items/${itemId}`, { quantity });
    setCart(data.cart);
  };
  const removeItem = async (itemId) => {
    await api.delete(`/cart/items/${itemId}`);
    refresh();
  };
  const submit = async () => {
    setBusy(true);
    try {
      const { data } = await api.post('/cart/submit');
      toast.success('Submitted for approval');
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not submit');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-8 lg:p-12 max-w-5xl mx-auto" data-testid="cart-page">
      <header className="mb-8">
        <div className="label-overline text-[#C47055] mb-2">Cart</div>
        <h1 className="font-heading text-4xl font-semibold">My draft order</h1>
        <p className="text-[#5C635F] mt-2">Build your cart, then submit it for approval.</p>
      </header>

      {cart.items.length === 0 ? (
        <div className="border border-dashed border-[#D5CEBD] rounded-md p-16 text-center" data-testid="cart-empty">
          <ShoppingBag className="h-10 w-10 text-[#5C635F] mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-[#5C635F]">Your cart is empty.</p>
          <Link to="/marketplace"><Button className="mt-6 bg-[#4A675B] hover:bg-[#3D564C] text-white rounded-md" data-testid="browse-marketplace-btn">Browse marketplace</Button></Link>
        </div>
      ) : (
        <div className="border border-[#D5CEBD] rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F4F1EA] text-[#5C635F]">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-left px-4 py-3 font-medium">Seller</th>
                <th className="text-center px-4 py-3 font-medium w-32">Qty</th>
                <th className="text-right px-4 py-3 font-medium">Unit</th>
                <th className="text-right px-4 py-3 font-medium">Line total</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map((it) => (
                <tr key={it._id} className="border-t border-[#D5CEBD]" data-testid={`cart-row-${it._id}`}>
                  <td className="px-4 py-4">
                    <div className="font-medium">{it.productName}</div>
                  </td>
                  <td className="px-4 py-4 text-[#5C635F]">{it.sellerOrg?.name || '—'}</td>
                  <td className="px-4 py-4">
                    <Input type="number" min={1} value={it.quantity}
                      onChange={(e) => updateQty(it._id, Math.max(1, parseInt(e.target.value, 10) || 1))}
                      data-testid={`cart-qty-${it._id}`}
                      className="w-20 text-center mx-auto border-[#D5CEBD]" />
                  </td>
                  <td className="px-4 py-4 text-right">{formatINR(it.unitPrice)}</td>
                  <td className="px-4 py-4 text-right font-heading">{formatINR(it.lineTotal)}</td>
                  <td className="px-4 py-4 text-right">
                    <button onClick={() => removeItem(it._id)} data-testid={`cart-remove-${it._id}`}
                      className="text-[#5C635F] hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#F4F1EA] border-t border-[#D5CEBD]">
                <td colSpan={4} className="px-4 py-4 text-right font-medium">Order total</td>
                <td className="px-4 py-4 text-right font-heading text-xl text-[#4A675B]" data-testid="cart-total">{formatINR(cart.total)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
          <div className="bg-[#FDFBF7] p-5 flex justify-end border-t border-[#D5CEBD]">
            <Button disabled={busy} onClick={submit} data-testid="submit-cart-btn"
              className="bg-[#C47055] hover:bg-[#B05F47] text-white rounded-md">
              <Send className="h-4 w-4 mr-2" /> Submit for approval
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
