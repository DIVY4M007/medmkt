'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api-client';
import { formatINR, formatDate } from '@/lib/format';
import StatusBadge from '@/components/StatusBadge';
import { FileText } from 'lucide-react';

interface OrderItem {
  product?: string;
  productName: string;
  sellerOrg?: string;
  sellerOrgId?: string;
  sellerOrgName?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface Order {
  id: string;
  buyerOrgId: string;
  createdById: string;
  status: string;
  items: OrderItem[];
  total: number;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  buyerOrg?: { id: string; name: string; type: string };
  creator?: { id: string; name: string; email: string };
}

export default function OrdersPage() {
  const { navigate, user, params } = useAppStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const isBoth = user?.org?.accountType === 'both';
  const defaultView = user?.accountType === 'seller' ? 'seller' : 'buyer';
  const view = params.view || defaultView;

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const data = await api.get(`/orders?view=${view}`);
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [view]);

  const handleTabChange = (newView: string) => {
    navigate('orders', { view: newView });
  };

  const headerTitle = view === 'seller' ? 'Sales orders' : 'Purchase orders';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-[#1F2321]">
          {headerTitle}
        </h1>
      </div>

      {/* Tabs */}
      {isBoth && (
        <div className="mb-6 flex gap-1 rounded-lg border border-[#D5CEBD] p-1 w-fit">
          <button
            data-testid="tab-purchases"
            onClick={() => handleTabChange('buyer')}
            className={`rounded px-4 py-1.5 text-sm font-medium transition-colors ${
              view === 'buyer'
                ? 'bg-[#4A675B] text-white'
                : 'text-[#5C635F] hover:bg-[#F4F1EA]'
            }`}
          >
            Purchases
          </button>
          <button
            data-testid="tab-sales"
            onClick={() => handleTabChange('seller')}
            className={`rounded px-4 py-1.5 text-sm font-medium transition-colors ${
              view === 'seller'
                ? 'bg-[#4A675B] text-white'
                : 'text-[#5C635F] hover:bg-[#F4F1EA]'
            }`}
          >
            Sales
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="skeleton h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[#D5CEBD] p-12 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-[#D5CEBD]" />
          <p className="text-sm text-[#5C635F]">No orders to show</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#D5CEBD] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F4F1EA] border-b border-[#D5CEBD]">
                <th className="px-4 py-3 text-left font-medium text-[#5C635F]">Order</th>
                <th className="px-4 py-3 text-left font-medium text-[#5C635F]">
                  {view === 'seller' ? 'Buyer' : 'Created by'}
                </th>
                <th className="px-4 py-3 text-left font-medium text-[#5C635F]">Status</th>
                <th className="px-4 py-3 text-left font-medium text-[#5C635F]">Items</th>
                <th className="px-4 py-3 text-left font-medium text-[#5C635F]">Total</th>
                <th className="px-4 py-3 text-left font-medium text-[#5C635F]">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const items = Array.isArray(order.items) ? order.items : [];
                const displayName =
                  view === 'seller'
                    ? order.buyerOrg?.name || '—'
                    : order.creator?.name || '—';

                return (
                  <tr
                    key={order.id}
                    data-testid={`order-row-${order.id}`}
                    onClick={() => navigate('order-detail', { id: order.id })}
                    className="border-b border-[#D5CEBD] last:border-b-0 cursor-pointer hover:bg-[#F4F1EA] transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-medium text-[#4A675B]">
                      {order.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-[#1F2321]">{displayName}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-[#5C635F]">{items.length}</td>
                    <td className="px-4 py-3 font-medium text-[#1F2321]">
                      {formatINR(order.total)}
                    </td>
                    <td className="px-4 py-3 text-[#5C635F]">
                      {formatDate(order.createdAt)}
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
