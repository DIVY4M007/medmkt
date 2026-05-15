'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api-client';
import { formatINR, formatDate } from '@/lib/format';
import StatusBadge from '@/components/StatusBadge';
import { FileText } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Skeleton rows                                                      */
/* ------------------------------------------------------------------ */

function SkeletonRows() {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-6 gap-2 px-4 py-3 bg-secondary text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <div>Order</div>
        <div>Party</div>
        <div>Status</div>
        <div>Items</div>
        <div>Total</div>
        <div>Date</div>
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="grid grid-cols-6 gap-2 px-4 py-3 border-t border-border items-center"
        >
          <div className="skeleton h-4 w-16 rounded" />
          <div className="skeleton h-4 w-20 rounded" />
          <div className="skeleton h-5 w-20 rounded-full" />
          <div className="skeleton h-4 w-8 rounded" />
          <div className="skeleton h-4 w-16 rounded" />
          <div className="skeleton h-4 w-20 rounded" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

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
  const partyLabel = view === 'seller' ? 'Buyer' : 'Created by';

  /* ================================================================ */
  /*  Render                                                            */
  /* ================================================================ */
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in-up">
      {/* ---- Header ---- */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          {headerTitle}
        </h1>
      </div>

      {/* ---- Tabs (if user has both buyer + seller) ---- */}
      {isBoth && (
        <div className="mb-6 inline-flex gap-1 rounded-full bg-secondary p-1">
          <button
            data-testid="tab-purchases"
            onClick={() => handleTabChange('buyer')}
            className={`rounded-full px-5 py-1.5 text-sm font-medium transition-colors btn-press ${
              view === 'buyer'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Purchases
          </button>
          <button
            data-testid="tab-sales"
            onClick={() => handleTabChange('seller')}
            className={`rounded-full px-5 py-1.5 text-sm font-medium transition-colors btn-press ${
              view === 'seller'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sales
          </button>
        </div>
      )}

      {/* ---- Loading ---- */}
      {loading && <SkeletonRows />}

      {/* ---- Empty state ---- */}
      {!loading && orders.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center animate-fade-in-up">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-secondary">
            <FileText className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No orders to show</p>
        </div>
      )}

      {/* ---- Orders table ---- */}
      {!loading && orders.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-6 gap-2 px-4 py-3 bg-secondary text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <div>Order</div>
            <div>{partyLabel}</div>
            <div>Status</div>
            <div>Items</div>
            <div>Total</div>
            <div>Date</div>
          </div>

          {/* Rows */}
          <div className="stagger-children">
            {orders.map((order) => {
              const orderItems = Array.isArray(order.items) ? order.items : [];
              const displayName =
                view === 'seller'
                  ? order.buyerOrg?.name || '—'
                  : order.creator?.name || '—';

              return (
                <button
                  key={order.id}
                  data-testid={`order-row-${order.id}`}
                  onClick={() => navigate('order-detail', { id: order.id })}
                  className="w-full grid grid-cols-6 gap-2 px-4 py-3 border-t border-border items-center text-sm hover:bg-secondary/50 transition-colors text-left cursor-pointer"
                >
                  {/* Order ID */}
                  <span className="font-mono text-xs font-semibold text-primary">
                    {order.id.slice(-6).toUpperCase()}
                  </span>

                  {/* Buyer / Created by */}
                  <span className="text-foreground truncate">{displayName}</span>

                  {/* Status */}
                  <span>
                    <StatusBadge status={order.status} />
                  </span>

                  {/* Items count */}
                  <span className="text-muted-foreground">
                    {orderItems.length}
                  </span>

                  {/* Total */}
                  <span className="font-medium text-foreground">
                    {formatINR(order.total)}
                  </span>

                  {/* Date */}
                  <span className="text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
