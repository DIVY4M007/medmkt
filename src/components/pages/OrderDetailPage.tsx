'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api-client';
import { formatINR, formatDate, STATUS_FLOW } from '@/lib/format';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowRight, ChevronLeft, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

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

export default function OrderDetailPage() {
  const { navigate, user, params } = useAppStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true);
      try {
        const data = await api.get(`/orders/${params.id}`);
        setOrder(data.order);
      } catch (err) {
        console.error('Failed to fetch order:', err);
        toast.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchOrder();
  }, [params.id]);

  const items: OrderItem[] = order
    ? Array.isArray(order.items)
      ? order.items
      : []
    : [];

  // Determine available actions
  const isBuyerApprover =
    user?.accountType === 'buyer' && user?.role === 'approver';
  const isSeller = user?.accountType === 'seller';
  const isBuyerOrg = order?.buyerOrgId === user?.orgId;

  // Check if user is part of a seller org in this order
  const isSellerForOrder =
    isSeller &&
    items.some((item) => item.sellerOrgId === user?.orgId);

  const canApprove = isBuyerApprover && isBuyerOrg && order?.status === 'pending_approval';
  const canPay = isBuyerApprover && isBuyerOrg && order?.status === 'approved';
  const canDeliver = isSellerForOrder && order?.status === 'paid';

  const handleAction = async (action: string, body?: Record<string, string>) => {
    if (!order) return;
    setActionLoading(true);
    try {
      const data = await api.post(`/orders/${order.id}/${action}`, body);
      setOrder(data.order);
      toast.success(`Order ${action}d successfully`);
      setShowRejectBox(false);
      setRejectReason('');
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action} order`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#4A675B]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-[#5C635F]">Order not found.</p>
      </div>
    );
  }

  const currentStatusIdx = STATUS_FLOW.indexOf(order.status);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <button
        data-testid="back-to-orders"
        onClick={() => navigate('orders')}
        className="mb-6 inline-flex items-center gap-1 text-sm text-[#4A675B] hover:underline"
      >
        <ChevronLeft className="h-4 w-4" />
        Orders
      </button>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-[#1F2321]">
            Order {order.id.slice(-6).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-[#5C635F]">
            Placed by {order.creator?.name || '—'} on {formatDate(order.createdAt)}
            {order.buyerOrg && (
              <>
                {' '}
                &middot; {order.buyerOrg.name}
              </>
            )}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Lifecycle section */}
      <div className="mb-6 rounded-md border border-[#D5CEBD] bg-[#F4F1EA] p-5">
        <p className="label-overline text-[#5C635F] mb-3">Lifecycle</p>
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FLOW.map((status, idx) => {
            const isReached = idx <= currentStatusIdx;
            const isCurrent = status === order.status;
            return (
              <div key={status} className="flex items-center gap-2">
                {idx > 0 && (
                  <ArrowRight className="h-3.5 w-3.5 text-[#D5CEBD]" />
                )}
                <StatusBadge
                  status={status}
                  dimmed={!isReached && order.status !== 'rejected'}
                  className={isCurrent ? 'ring-2 ring-[#4A675B]/30' : ''}
                />
              </div>
            );
          })}
          {order.status === 'rejected' && (
            <>
              <ArrowRight className="h-3.5 w-3.5 text-[#D5CEBD]" />
              <StatusBadge status="rejected" />
            </>
          )}
        </div>
      </div>

      {/* Items table */}
      <div className="mb-6 rounded-md border border-[#D5CEBD] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F4F1EA] border-b border-[#D5CEBD]">
              <th className="px-4 py-3 text-left font-medium text-[#5C635F]">Product</th>
              <th className="px-4 py-3 text-left font-medium text-[#5C635F]">Seller</th>
              <th className="px-4 py-3 text-right font-medium text-[#5C635F]">Qty</th>
              <th className="px-4 py-3 text-right font-medium text-[#5C635F]">Unit price</th>
              <th className="px-4 py-3 text-right font-medium text-[#5C635F]">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={idx}
                className="border-b border-[#D5CEBD] last:border-b-0"
              >
                <td className="px-4 py-3 text-[#1F2321]">{item.productName || '—'}</td>
                <td className="px-4 py-3 text-[#5C635F]">
                  {item.sellerOrgName || '—'}
                </td>
                <td className="px-4 py-3 text-right text-[#5C635F]">{item.quantity}</td>
                <td className="px-4 py-3 text-right text-[#5C635F]">
                  {formatINR(item.unitPrice)}
                </td>
                <td className="px-4 py-3 text-right font-medium text-[#1F2321]">
                  {formatINR(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[#F4F1EA] border-t border-[#D5CEBD]">
              <td colSpan={4} className="px-4 py-3 text-right font-medium text-[#1F2321]">
                Order total
              </td>
              <td className="px-4 py-3 text-right font-semibold text-[#4A675B]">
                {formatINR(order.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Rejection reason */}
      {order.status === 'rejected' && order.rejectionReason && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">Rejection reason</p>
              <p className="mt-1 text-sm text-red-700">{order.rejectionReason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {(canApprove || canPay || canDeliver) && (
        <div className="rounded-md border border-[#D5CEBD] bg-[#FDFBF7] p-5">
          <p className="label-overline text-[#5C635F] mb-3">Actions</p>
          <div className="flex flex-wrap items-start gap-3">
            {canApprove && (
              <>
                <Button
                  data-testid="btn-approve"
                  onClick={() => handleAction('approve')}
                  disabled={actionLoading}
                  className="bg-[#4A675B] hover:bg-[#3D564C] text-white"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Approve
                </Button>
                <Button
                  data-testid="btn-reject"
                  variant="outline"
                  onClick={() => setShowRejectBox(!showRejectBox)}
                  disabled={actionLoading}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Reject
                </Button>
              </>
            )}
            {canPay && (
              <Button
                data-testid="btn-pay"
                onClick={() => handleAction('pay')}
                disabled={actionLoading}
                className="bg-[#4A675B] hover:bg-[#3D564C] text-white"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Pay
              </Button>
            )}
            {canDeliver && (
              <Button
                data-testid="btn-deliver"
                onClick={() => handleAction('deliver')}
                disabled={actionLoading}
                className="bg-[#4A675B] hover:bg-[#3D564C] text-white"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Deliver
              </Button>
            )}
          </div>

          {/* Rejection reason input */}
          {showRejectBox && (
            <div className="mt-4 space-y-3 rounded-md border border-red-200 bg-red-50 p-4">
              <label className="text-sm font-medium text-red-800">
                Reason for rejection
              </label>
              <Textarea
                data-testid="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Provide a reason..."
                className="border-red-300 bg-white focus-visible:ring-red-300"
              />
              <Button
                data-testid="btn-confirm-reject"
                size="sm"
                onClick={() => handleAction('reject', { reason: rejectReason })}
                disabled={actionLoading || !rejectReason.trim()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Confirm rejection
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
