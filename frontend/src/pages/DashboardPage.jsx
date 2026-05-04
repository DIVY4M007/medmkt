import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import api from '../lib/api';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatDate, STATUS_FLOW } from '../lib/format';
import { Store, ShoppingCart, Package, Users, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const org = user?.organization;
  const [stats, setStats] = useState({ products: 0, buyerOrders: [], sellerOrders: [], pendingApprovals: 0 });

  useEffect(() => {
    (async () => {
      const [productsRes, buyerOrdersRes, sellerOrdersRes] = await Promise.all([
        api.get('/products').catch(() => ({ data: { products: [] } })),
        api.get('/orders?view=buyer').catch(() => ({ data: { orders: [] } })),
        org?.isSeller ? api.get('/orders?view=seller').catch(() => ({ data: { orders: [] } })) : Promise.resolve({ data: { orders: [] } }),
      ]);
      const buyerOrders = buyerOrdersRes.data.orders || [];
      const sellerOrders = sellerOrdersRes.data.orders || [];
      setStats({
        products: productsRes.data.products?.length || 0,
        buyerOrders,
        sellerOrders,
        pendingApprovals: buyerOrders.filter((o) => o.status === 'pending_approval').length,
      });
    })();
  }, [org?.isSeller]);

  const recentBuyer = stats.buyerOrders.slice(0, 5);
  const recentSeller = stats.sellerOrders.slice(0, 5);

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto" data-testid="dashboard-page">
      <header className="mb-10">
        <div className="label-overline text-[#C47055] mb-2">Dashboard</div>
        <h1 className="font-heading text-4xl font-semibold">Hello, {user?.name?.split(' ')[0]}</h1>
        <p className="text-[#5C635F] mt-2">
          {org?.name} · <span className="capitalize">{org?.type}</span> ·{' '}
          <span className="capitalize">{user?.role}</span>
        </p>
      </header>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard icon={Store} label="Marketplace catalogue" value={stats.products} cta="Browse" to="/marketplace" testid="stat-marketplace" />
        {org?.isBuyer && user?.role === 'requestor' && (
          <StatCard icon={ShoppingCart} label="My cart" value="—" cta="View cart" to="/cart" testid="stat-cart" />
        )}
        {org?.isBuyer && user?.role === 'approver' && (
          <StatCard icon={ShoppingCart} label="Awaiting approval" value={stats.pendingApprovals} cta="Review" to="/orders?view=buyer" testid="stat-approvals" />
        )}
        {org?.isSeller && (
          <StatCard icon={Package} label="Sales orders" value={stats.sellerOrders.length} cta="Manage" to="/orders?view=seller" testid="stat-sales" />
        )}
        <StatCard icon={Users} label="Org type" value={org?.type} cta="Team" to="/team" testid="stat-team" />
      </div>

      {/* Workflow steps */}
      <div className="bg-[#F4F1EA] border border-[#D5CEBD] rounded-md p-8 mb-12">
        <div className="label-overline text-[#5C635F] mb-4">Order lifecycle</div>
        <div className="flex flex-wrap items-center gap-3">
          {STATUS_FLOW.map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <StatusBadge status={s} testid={`flow-${s}`} />
              {i < STATUS_FLOW.length - 1 && <ArrowRight className="h-4 w-4 text-[#5C635F]" />}
            </div>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="grid lg:grid-cols-2 gap-8">
        {org?.isBuyer && (
          <Section title="Recent purchase orders" link="/orders?view=buyer" testid="section-buyer-orders">
            {recentBuyer.length === 0 ? (
              <Empty msg="No purchase orders yet." />
            ) : (
              <ul className="divide-y divide-[#D5CEBD]">
                {recentBuyer.map((o) => (
                  <OrderRow key={o._id} order={o} />
                ))}
              </ul>
            )}
          </Section>
        )}
        {org?.isSeller && (
          <Section title="Recent sales orders" link="/orders?view=seller" testid="section-seller-orders">
            {recentSeller.length === 0 ? (
              <Empty msg="No sales yet." />
            ) : (
              <ul className="divide-y divide-[#D5CEBD]">
                {recentSeller.map((o) => (
                  <OrderRow key={o._id} order={o} />
                ))}
              </ul>
            )}
          </Section>
        )}
      </div>
    </div>
  );
}

const StatCard = ({ icon: Icon, label, value, cta, to, testid }) => (
  <Link to={to} data-testid={testid}
    className="bg-[#FDFBF7] border border-[#D5CEBD] rounded-md p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg block">
    <div className="flex items-center justify-between mb-4">
      <div className="h-9 w-9 rounded-md bg-[#4A675B]/10 flex items-center justify-center">
        <Icon className="h-4.5 w-4.5 text-[#4A675B]" strokeWidth={1.75} />
      </div>
      <ArrowRight className="h-4 w-4 text-[#5C635F]" />
    </div>
    <div className="font-heading text-3xl font-semibold capitalize">{value}</div>
    <div className="label-overline text-[#5C635F] mt-2">{label}</div>
    <div className="text-xs text-[#4A675B] mt-3">{cta} →</div>
  </Link>
);

const Section = ({ title, link, children, testid }) => (
  <div className="bg-[#FDFBF7] border border-[#D5CEBD] rounded-md p-6" data-testid={testid}>
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-heading text-lg font-semibold">{title}</h3>
      <Link to={link} className="text-xs text-[#4A675B] hover:underline">View all →</Link>
    </div>
    {children}
  </div>
);

const Empty = ({ msg }) => <div className="text-sm text-[#5C635F] py-6 text-center">{msg}</div>;

const OrderRow = ({ order }) => (
  <Link to={`/orders/${order._id}`} className="flex items-center justify-between py-3 hover:bg-[#F4F1EA] -mx-2 px-2 rounded-md">
    <div>
      <div className="font-medium text-sm">#{order._id.slice(-6).toUpperCase()}</div>
      <div className="text-xs text-[#5C635F]">{formatDate(order.createdAt)} · {order.items.length} item(s)</div>
    </div>
    <div className="flex items-center gap-3">
      <span className="font-heading text-sm">{formatCurrency(order.total)}</span>
      <StatusBadge status={order.status} />
    </div>
  </Link>
);
