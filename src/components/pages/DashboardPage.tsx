'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api-client';
import { formatINR, formatDate, STATUS_FLOW, ORG_TYPE_LABELS } from '@/lib/format';
import StatusBadge from '@/components/StatusBadge';
import { Store, ShoppingCart, Package, Users, ArrowRight, ChevronRight } from 'lucide-react';

interface Product { id: string; name: string; category: string; [key: string]: unknown }
interface OrderItem { productName: string; quantity: number; unitPrice: number; lineTotal: number; [key: string]: unknown }
interface Order {
  id: string; status: string; total: number; items: OrderItem[]; createdAt: string;
  buyerOrg?: { name: string }; creator?: { name: string }; [key: string]: unknown
}

export default function DashboardPage() {
  const { navigate, user } = useAppStore();
  const [productCount, setProductCount] = useState<number | null>(null);
  const [buyerOrders, setBuyerOrders] = useState<Order[]>([]);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const isBuyer = user?.accountType === 'buyer';
  const isSeller = user?.accountType === 'seller';
  const isApprover = user?.role === 'approver';
  const isRequestor = user?.role === 'requestor';

  const firstName = user?.name?.split(' ')[0] || 'User';
  const orgName = user?.org?.name || '';
  const orgType = user?.org?.type ? (ORG_TYPE_LABELS[user.org.type] || user.org.type) : '';
  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [productsRes, buyerRes] = await Promise.all([
          api.get('/products') as Promise<{ products: Product[] }>,
          isBuyer
            ? api.get('/orders?view=buyer') as Promise<{ orders: Order[] }>
            : Promise.resolve({ orders: [] }),
        ]);
        setProductCount(productsRes.products.length);
        setBuyerOrders(buyerRes.orders);

        if (isSeller) {
          try {
            const sellerRes = await api.get('/orders?view=seller') as Promise<{ orders: Order[] }>;
            setSellerOrders(sellerRes.orders);
          } catch {
            setSellerOrders([]);
          }
        }
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isBuyer, isSeller]);

  const awaitingApproval = buyerOrders.filter(o => o.status === 'pending_approval').length;
  const salesOrderCount = sellerOrders.length;
  const cartItemCount = buyerOrders.filter(o => o.status === 'draft').length;

  function shortId(id: string) {
    return id.slice(-6).toUpperCase();
  }

  const statCards = [
    {
      icon: <Store className="size-5" />,
      iconBg: 'bg-primary/10 text-primary',
      value: productCount ?? '—',
      label: 'Marketplace Catalogue',
      cta: 'Browse',
      onClick: () => navigate('marketplace'),
      testid: 'stat-marketplace',
    },
  ];

  if (isBuyer && isRequestor) {
    statCards.push({
      icon: <ShoppingCart className="size-5" />,
      iconBg: 'bg-accent/10 text-accent',
      value: cartItemCount,
      label: 'My Cart',
      cta: 'View cart',
      onClick: () => navigate('cart'),
      testid: 'stat-cart',
    });
  }

  if (isBuyer && isApprover) {
    statCards.push({
      icon: <ShoppingCart className="size-5" />,
      iconBg: 'bg-accent/10 text-accent',
      value: awaitingApproval,
      label: 'Awaiting Approval',
      cta: 'Review',
      onClick: () => navigate('orders'),
      testid: 'stat-approval',
    });
  }

  if (isSeller) {
    statCards.push({
      icon: <Package className="size-5" />,
      iconBg: 'bg-primary/10 text-primary',
      value: salesOrderCount,
      label: 'Sales Orders',
      cta: 'View orders',
      onClick: () => navigate('orders'),
      testid: 'stat-sales',
    });
  }

  statCards.push({
    icon: <Users className="size-5" />,
    iconBg: 'bg-muted text-muted-foreground',
    value: orgType,
    label: 'Organization Type',
    cta: 'Team',
    onClick: () => navigate('team'),
    testid: 'stat-org',
  });

  const recentBuyerOrders = buyerOrders.slice(0, 5);
  const recentSellerOrders = sellerOrders.slice(0, 5);

  /* ─── Loading Skeleton ─── */
  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        {/* Header skeleton */}
        <div className="gradient-mesh rounded-2xl p-6 sm:p-8 space-y-3">
          <div className="skeleton h-9 w-56" />
          <div className="skeleton h-4 w-72" />
        </div>

        {/* Stat cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-card rounded-xl border border-border p-5 space-y-3">
              <div className="skeleton h-10 w-10 rounded-xl" />
              <div className="skeleton h-8 w-20" />
              <div className="skeleton h-4 w-32" />
              <div className="skeleton h-3 w-16" />
            </div>
          ))}
        </div>

        {/* Lifecycle skeleton */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <div className="skeleton h-6 w-36" />
          <div className="flex gap-3 items-center">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="skeleton h-6 w-24 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ─── Dashboard ─── */
  return (
    <div className="space-y-8">
      {/* ── Welcome Header ── */}
      <div className="gradient-mesh rounded-2xl p-6 sm:p-8 animate-fade-in-up">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
          Hello, <span className="gradient-text">{firstName}</span>
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          {[orgName, orgType, roleLabel].filter(Boolean).join(' · ')}
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up stagger-children">
        {statCards.map((card) => (
          <button
            key={card.testid}
            data-testid={card.testid}
            onClick={card.onClick}
            className="bg-card rounded-xl border border-border p-5 card-hover btn-press transition-all text-left group cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                {card.icon}
              </div>
              <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="mt-3 text-2xl font-heading font-semibold text-foreground">
              {card.value}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-2.5 text-xs font-semibold text-primary group-hover:text-accent transition-colors">
              {card.cta} →
            </p>
          </button>
        ))}
      </div>

      {/* ── Order Lifecycle Flow ── */}
      <div className="bg-card rounded-xl border border-border p-5 card-hover animate-fade-in-up">
        <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
          Order Lifecycle
        </h2>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {STATUS_FLOW.map((status, i) => (
            <div key={status} className="flex items-center gap-2 sm:gap-3">
              <StatusBadge status={status} testid={`lifecycle-${status}`} />
              {i < STATUS_FLOW.length - 1 && (
                <ChevronRight className="size-4 text-border" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent Purchase Orders (Buyer) ── */}
      {isBuyer && (
        <div className="bg-card rounded-xl border border-border animate-fade-in-up">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Recent Purchase Orders
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your latest procurement activity
              </p>
            </div>
            <button
              data-testid="view-all-buyer-orders"
              onClick={() => navigate('orders')}
              className="text-xs font-semibold text-primary hover:text-accent transition-colors flex items-center gap-1"
            >
              View all
              <ArrowRight className="size-3" />
            </button>
          </div>
          {recentBuyerOrders.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="size-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No orders yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Start by browsing the marketplace
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentBuyerOrders.map((order) => (
                <button
                  key={order.id}
                  data-testid={`buyer-order-${shortId(order.id)}`}
                  onClick={() => navigate('order-detail', { id: order.id })}
                  className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-muted/60 transition-colors text-left group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-sm font-mono font-semibold text-primary shrink-0">
                      #{shortId(order.id)}
                    </span>
                    <span className="text-sm text-muted-foreground shrink-0">
                      {formatDate(order.createdAt)}
                    </span>
                    <span className="text-sm text-muted-foreground hidden sm:inline">
                      {Array.isArray(order.items) ? order.items.length : 0} item{Array.isArray(order.items) && order.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold text-foreground">
                      {formatINR(order.total)}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Recent Sales Orders (Seller) ── */}
      {isSeller && (
        <div className="bg-card rounded-xl border border-border animate-fade-in-up">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Recent Sales Orders
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Incoming orders from buyers
              </p>
            </div>
            <button
              data-testid="view-all-seller-orders"
              onClick={() => navigate('orders')}
              className="text-xs font-semibold text-primary hover:text-accent transition-colors flex items-center gap-1"
            >
              View all
              <ArrowRight className="size-3" />
            </button>
          </div>
          {recentSellerOrders.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="size-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No sales orders yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Orders will appear when buyers purchase your products
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentSellerOrders.map((order) => (
                <button
                  key={order.id}
                  data-testid={`seller-order-${shortId(order.id)}`}
                  onClick={() => navigate('order-detail', { id: order.id })}
                  className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-muted/60 transition-colors text-left group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-sm font-mono font-semibold text-primary shrink-0">
                      #{shortId(order.id)}
                    </span>
                    <span className="text-sm text-muted-foreground shrink-0">
                      {formatDate(order.createdAt)}
                    </span>
                    <span className="text-sm text-muted-foreground hidden sm:inline">
                      {Array.isArray(order.items) ? order.items.length : 0} item{Array.isArray(order.items) && order.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold text-foreground">
                      {formatINR(order.total)}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
