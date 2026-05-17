import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../lib/auth';
import StatusBadge from '../components/StatusBadge';
import { formatINR, formatDate, STATUS_FLOW } from '../lib/format';
import { Button } from '../components/ui/button';
import { ChevronLeft, Check, X, CreditCard, Truck } from 'lucide-react';
import { toast } from 'sonner';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await api.get(`/orders/${id}`);
    setOrder(data.order);
  };
  useEffect(() => { load(); }, [id]);

  if (!order) return <div className="p-12 text-[#5C635F]" data-testid="order-loading">Loading…</div>;

  const isBuyerOrg = user?.organization?._id === order.buyerOrg?._id;
  const isSellerOrg = order.items.some((it) => it.sellerOrg && (it.sellerOrg._id === user?.organization?._id));

  const ACTION_TOAST = {
    approve: 'Order approved',
    pay: 'Order marked as paid',
    deliver: 'Order marked as delivered',
    reject: 'Order rejected',
  };

  const act = async (action) => {
    setBusy(true);
    try {
      const body = action === 'reject' ? { reason: 'Not approved' } : {};
      const { data } = await api.post(`/orders/${id}/${action}`, body);
      setOrder(data.order);
      toast.success(ACTION_TOAST[action] || 'Order updated');
    } catch (err) {
      toast.error(err?.response?.data?.error || `Could not ${action}`);
    } finally {
      setBusy(false);
    }
  };

  const canApprove = isBuyerOrg && user?.role === 'approver' && order.status === 'pending_approval';
  const canPay = isBuyerOrg && user?.role === 'approver' && order.status === 'approved';
  const canDeliver = isSellerOrg && order.status === 'paid';

  return (
    <div className="p-8 lg:p-12 max-w-6xl mx-auto" data-testid="order-detail-page">
      <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-[#5C635F] hover:text-[#1F2321] mb-6" data-testid="back-to-orders">
        <ChevronLeft className="h-4 w-4" /> Orders
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-6 mb-8">
        <div>
          <div className="label-overline text-[#C47055] mb-2">Order</div>
          <h1 className="font-heading text-3xl lg:text-4xl font-semibold">#{order._id.slice(-6).toUpperCase()}</h1>
          <p className="text-[#5C635F] mt-2 text-sm">
            Placed by {order.createdBy?.name} · {formatDate(order.createdAt)} · Buyer: {order.buyerOrg?.name}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </header>

      {/* Lifecycle */}
      <div className="bg-[#F4F1EA] border border-[#D5CEBD] rounded-md p-5 mb-8">
        <div className="label-overline text-[#5C635F] mb-3">Lifecycle</div>
        <div className="flex flex-wrap items-center gap-3">
          {STATUS_FLOW.map((s, i) => {
            const reached = STATUS_FLOW.indexOf(order.status) >= i;
            return (
              <div key={s} className={`flex items-center gap-3 ${reached ? '' : 'opacity-40'}`}>
                <StatusBadge status={s} />
                {i < STATUS_FLOW.length - 1 && <span className="text-[#5C635F]">→</span>}
              </div>
            );
          })}
          {order.status === 'rejected' && <StatusBadge status="rejected" />}
        </div>
      </div>

      {/* Items */}
      <div className="border border-[#D5CEBD] rounded-md overflow-hidden mb-8">
        <table className="w-full text-sm" data-testid="order-items-table">
          <thead className="bg-[#F4F1EA] text-[#5C635F]">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Product</th>
              <th className="text-left px-4 py-3 font-medium">Seller</th>
              <th className="text-right px-4 py-3 font-medium">Qty</th>
              <th className="text-right px-4 py-3 font-medium">Unit</th>
              <th className="text-right px-4 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it) => (
              <tr key={it._id} className="border-t border-[#D5CEBD]">
                <td className="px-4 py-3">{it.productName}</td>
                <td className="px-4 py-3 text-[#5C635F]">{it.sellerOrg?.name || '—'}</td>
                <td className="px-4 py-3 text-right">{it.quantity}</td>
                <td className="px-4 py-3 text-right">{formatINR(it.unitPrice)}</td>
                <td className="px-4 py-3 text-right font-heading">{formatINR(it.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[#F4F1EA]">
              <td colSpan={4} className="px-4 py-3 text-right font-medium">Order total</td>
              <td className="px-4 py-3 text-right font-heading text-xl text-[#4A675B]" data-testid="order-total">{formatINR(order.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Actions */}
      {(canApprove || canPay || canDeliver) && (
        <div className="border border-[#D5CEBD] rounded-md p-5 bg-[#FDFBF7]">
          <div className="label-overline text-[#5C635F] mb-3">Actions</div>
          <div className="flex flex-wrap gap-3">
            {canApprove && (
              <>
                <Button onClick={() => act('approve')} disabled={busy} data-testid="approve-order-btn"
                  className="bg-[#4A675B] hover:bg-[#3D564C] text-white rounded-md">
                  <Check className="h-4 w-4 mr-2" /> Approve order
                </Button>
                <Button onClick={() => act('reject')} disabled={busy} variant="outline" data-testid="reject-order-btn"
                  className="border-red-300 text-red-700 hover:bg-red-50 rounded-md">
                  <X className="h-4 w-4 mr-2" /> Reject
                </Button>
              </>
            )}
            {canPay && (
              <Button onClick={() => act('pay')} disabled={busy} data-testid="pay-order-btn"
                className="bg-[#C47055] hover:bg-[#B05F47] text-white rounded-md">
                <CreditCard className="h-4 w-4 mr-2" /> Mark as paid (mock)
              </Button>
            )}
            {canDeliver && (
              <Button onClick={() => act('deliver')} disabled={busy} data-testid="deliver-order-btn"
                className="bg-[#4A675B] hover:bg-[#3D564C] text-white rounded-md">
                <Truck className="h-4 w-4 mr-2" /> Mark as delivered
              </Button>
            )}
          </div>
        </div>
      )}

      {order.status === 'rejected' && (
        <div className="border border-red-300 bg-red-50 rounded-md p-4 text-red-800 text-sm">
          Rejected: {order.rejectionReason || '—'}
        </div>
      )}
    </div>
  );
}
