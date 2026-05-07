import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../lib/auth';
import StatusBadge from '../components/StatusBadge';
import { formatINR, formatDate } from '../lib/format';

export default function OrdersPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const view = params.get('view') || 'buyer';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await api.get(`/orders?view=${view}`);
      setOrders(data.orders || []);
      setLoading(false);
    })();
  }, [view]);

  const showSellerTab = user?.organization?.isSeller;
  const showBuyerTab = user?.organization?.isBuyer;

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto" data-testid="orders-page">
      <header className="mb-8">
        <div className="label-overline text-[#C47055] mb-2">Orders</div>
        <h1 className="font-heading text-4xl font-semibold">{view === 'seller' ? 'Sales orders' : 'Purchase orders'}</h1>
        <p className="text-[#5C635F] mt-2">
          {view === 'seller' ? 'Orders where your org is the seller.' : 'Orders where your org is the buyer.'}
        </p>
      </header>

      {(showSellerTab && showBuyerTab) && (
        <div className="flex gap-2 mb-8 border-b border-[#D5CEBD] pb-1">
          {showBuyerTab && (
            <button data-testid="orders-tab-buyer"
              onClick={() => setParams({ view: 'buyer' })}
              className={`px-4 py-2 text-sm font-medium rounded-md ${view === 'buyer' ? 'bg-[#4A675B] text-white' : 'text-[#5C635F] hover:bg-[#F4F1EA]'}`}>
              Purchases
            </button>
          )}
          {showSellerTab && (
            <button data-testid="orders-tab-seller"
              onClick={() => setParams({ view: 'seller' })}
              className={`px-4 py-2 text-sm font-medium rounded-md ${view === 'seller' ? 'bg-[#4A675B] text-white' : 'text-[#5C635F] hover:bg-[#F4F1EA]'}`}>
              Sales
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-[#5C635F]" data-testid="orders-loading">Loading…</div>
      ) : orders.length === 0 ? (
        <div className="border border-dashed border-[#D5CEBD] rounded-md p-16 text-center text-[#5C635F]" data-testid="orders-empty">
          No orders to show.
        </div>
      ) : (
        <div className="border border-[#D5CEBD] rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F4F1EA] text-[#5C635F]">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Order</th>
                <th className="text-left px-4 py-3 font-medium">{view === 'seller' ? 'Buyer' : 'Created by'}</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Items</th>
                <th className="text-right px-4 py-3 font-medium">Total</th>
                <th className="text-right px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-t border-[#D5CEBD] hover:bg-[#F4F1EA]/40" data-testid={`order-row-${o._id}`}>
                  <td className="px-4 py-4">
                    <Link to={`/orders/${o._id}`} className="font-medium text-[#1F2321] hover:text-[#4A675B]">
                      #{o._id.slice(-6).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-[#5C635F]">
                    {view === 'seller' ? o.buyerOrg?.name : o.createdBy?.name}
                  </td>
                  <td className="px-4 py-4"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-4 text-right">{o.items.length}</td>
                  <td className="px-4 py-4 text-right font-heading">{formatINR(o.total)}</td>
                  <td className="px-4 py-4 text-right text-[#5C635F]">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
