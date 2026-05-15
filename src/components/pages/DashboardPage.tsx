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
      icon: <Store className="size-5 text-[#4A675B]" />,
      value: productCount ?? '—',
      label: 'Marketplace catalogue',
      cta: 'Browse',
      onClick: () => navigate('marketplace'),
      testid: 'stat-marketplace',
    },
  ];

  if (isBuyer && isRequestor) {
    statCards.push({
      icon: <ShoppingCart className="size-5 text-[#C47055]" />,
      value: cartItemCount,
      label: 'My Cart',
      cta: 'View cart',
      onClick: () => navigate('cart'),
      testid: 'stat-cart',
    });
  }

  if (isBuyer && isApprover) {
    statCards.push({
      icon: <ShoppingCart className="size-5 text-[#C47055]" />,
      value: awaitingApproval,
      label: 'Awaiting approval',
      cta: 'Review',
      onClick: () => navigate('orders'),
      testid: 'stat-approval',
    });
  }

  if (isSeller) {
    statCards.push({
      icon: <Package className="size-5 text-[#4A675B]" />,
      value: salesOrderCount,
      label: 'Sales orders',
      cta: 'View orders',
      onClick: () => navigate('orders'),
      testid: 'stat-sales',
    });
  }

  statCards.push({
    icon: <Users className="size-5 text-muted-foreground" />,
    value: orgType,
    label: 'Organization type',
    cta: 'Team',
    onClick: () => navigate('team'),
    testid: 'stat-org',
  });

  const recentBuyerOrders = buyerOrders.slice(0, 5);
  const recentSellerOrders = sellerOrders.slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="skeleton h-8 w-48" />
          <div className="skeleton h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="border border-[#D5CEBD] rounded-xl p-5 space-y-3">
              <div className="skeleton h-10 w-10 rounded-lg" />
              <div className="skeleton h-8 w-20" />
              <div className="skeleton h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4A675B]/5 to-transparent -mx-1 px-1 pt-1 pb-2 rounded-xl">
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-[#1F2321]">
          Hello, {firstName}
        </h1>
        <p className="mt-1 text-sm text-[#5C635F]">
          {[orgName, orgType, roleLabel].filter(Boolean).join(' · ')}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up stagger-children">
        {statCards.map((card) => (
          <button
            key={card.testid}
            data-testid={card.testid}
            onClick={card.onClick}
            className="border-2 border-[#D5CEBD]/60 rounded-xl p-5 bg-[#FDFBF7] card-hover btn-press transition-all text-left group cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-xl bg-[#F4F1EA]">{card.icon}</div>
              <ArrowRight className="size-4 text-[#5C635F] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="mt-3 text-2xl font-heading font-semibold text-[#1F2321]">{card.value}</p>
            <p className="mt-0.5 text-sm text-[#5C635F]">{card.label}</p>
            <p className="mt-2 text-xs font-medium text-[#4A675B] group-hover:text-[#C47055] transition-colors">
              {card.cta} →
            </p>
          </button>
        ))}
      </div>

      {/* Order Lifecycle Flow */}
      <div className="border border-[#D5CEBD] rounded-xl p-5 bg-[#FDFBF7] card-hover">
        <h2 className="font-heading text-lg font-semibold text-[#1F2321] mb-4">Order lifecycle</h2>
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FLOW.map((status, i) => (
            <div key={status} className="flex items-center gap-2">
              <StatusBadge status={status} testid={`lifecycle-${status}`} />
              {i < STATUS_FLOW.length - 1 && (
                <ChevronRight className="size-4 text-[#D5CEBD]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Purchase Orders (Buyer) */}
      {isBuyer && (
        <div className="border border-[#D5CEBD] rounded-xl bg-[#FDFBF7]">
          <div className="p-5 border-b border-[#D5CEBD] flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-[#1F2321]">Recent purchase orders</h2>
            <button
              data-testid="view-all-buyer-orders"
              onClick={() => navigate('orders')}
              className="text-xs font-medium text-[#4A675B] hover:text-[#C47055] transition-colors"
            >
              View all →
            </button>
          </div>
          {recentBuyerOrders.length === 0 ? (
            <div className="p-5 text-sm text-[#5C635F] text-center">No orders yet</div>
          ) : (
            <div className="divide-y divide-[#D5CEBD]">
              {recentBuyerOrders.map((order) => (
                <button
                  key={order.id}
                  data-testid={`buyer-order-${shortId(order.id)}`}
                  onClick={() => navigate('order-detail', { id: order.id })}
                  className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-[#F4F1EA] transition-colors text-left"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-sm font-mono font-semibold text-[#4A675B] shrink-0">
                      #{shortId(order.id)}
                    </span>
                    <span className="text-sm text-[#5C635F] shrink-0">
                      {formatDate(order.createdAt)}
                    </span>
                    <span className="text-sm text-[#5C635F] hidden sm:inline">
                      {Array.isArray(order.items) ? order.items.length : 0} item{Array.isArray(order.items) && order.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold text-[#1F2321]">
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

      {/* Recent Sales Orders (Seller) */}
      {isSeller && (
        <div className="border border-[#D5CEBD] rounded-xl bg-[#FDFBF7]">
          <div className="p-5 border-b border-[#D5CEBD] flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-[#1F2321]">Recent sales orders</h2>
            <button
              data-testid="view-all-seller-orders"
              onClick={() => navigate('orders')}
              className="text-xs font-medium text-[#4A675B] hover:text-[#C47055] transition-colors"
            >
              View all →
            </button>
          </div>
          {recentSellerOrders.length === 0 ? (
            <div className="p-5 text-sm text-[#5C635F] text-center">No sales orders yet</div>
          ) : (
            <div className="divide-y divide-[#D5CEBD]">
              {recentSellerOrders.map((order) => (
                <button
                  key={order.id}
                  data-testid={`seller-order-${shortId(order.id)}`}
                  onClick={() => navigate('order-detail', { id: order.id })}
                  className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-[#F4F1EA] transition-colors text-left"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-sm font-mono font-semibold text-[#4A675B] shrink-0">
                      #{shortId(order.id)}
                    </span>
                    <span className="text-sm text-[#5C635F] shrink-0">
                      {formatDate(order.createdAt)}
                    </span>
                    <span className="text-sm text-[#5C635F] hidden sm:inline">
                      {Array.isArray(order.items) ? order.items.length : 0} item{Array.isArray(order.items) && order.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold text-[#1F2321]">
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
