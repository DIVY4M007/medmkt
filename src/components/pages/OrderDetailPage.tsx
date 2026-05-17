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
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function OrderDetailPage() {
  const { navigate, user, params } = useAppStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  /* ---- Fetch order ---- */
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

  /* ---- Parsed items ---- */
  const items: OrderItem[] = order
    ? Array.isArray(order.items)
      ? order.items
      : []
    : [];

  /* ---- Permission checks ---- */
  const isBuyerApprover = user?.accountType === 'buyer' && user?.role === 'approver';
  const isSeller = user?.accountType === 'seller';
  const isBuyerOrg = order?.buyerOrgId === user?.orgId;

  const isSellerForOrder =
    isSeller && items.some((item) => item.sellerOrgId === user?.orgId);

  const canApprove = isBuyerApprover && isBuyerOrg && order?.status === 'pending_approval';
  const canPay = isBuyerApprover && isBuyerOrg && order?.status === 'approved';
  const canDeliver = isSellerForOrder && order?.status === 'paid';

  /* ---- Actions ---- */
  const handleAction = async (action: string, body?: Record<string, string>) => {
    if (!order) return;
    setActionLoading(true);
    try {
      const data = await api.post(`/orders/${order.id}/${action}`, body);
      setOrder(data.order);
      toast.success(`Order ${action}ed successfully`);
      setShowRejectBox(false);
      setRejectReason('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : `Failed to ${action} order`);
    } finally {
      setActionLoading(false);
    }
  };

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  /* ---- Not found ---- */
  if (!order) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Order not found.</p>
      </div>
    );
  }

  const currentStatusIdx = STATUS_FLOW.indexOf(order.status);

  /* ================================================================ */
  /*  Render                                                            */
  /* ================================================================ */
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in-up">
      {/* ---- Back link ---- */}
      <button
        data-testid="back-to-orders"
        onClick={() => navigate('orders')}
        className="mb-6 inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium transition-colors"
      >
        <ChevronLeft className="size-4" />
        Orders
      </button>

      {/* ---- Header ---- */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Order{' '}
            <span className="font-mono">{order.id.slice(-6).toUpperCase()}</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed by {order.creator?.name || '—'} on {formatDate(order.createdAt)}
            {order.buyerOrg && (
              <>
                {' '}&middot; {order.buyerOrg.name}
              </>
            )}
          </p>
        </div>
        <StatusBadge status={order.status} className="shrink-0" />
      </div>

      {/* ---- Lifecycle section ---- */}
      <div className="mb-6 bg-secondary rounded-xl p-5">
        <p className="label-overline text-muted-foreground mb-3">Lifecycle</p>
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FLOW.map((status, idx) => {
            const isReached = idx <= currentStatusIdx;
            const isCurrent = status === order.status;

            return (
              <div key={status} className="flex items-center gap-2">
                {idx > 0 && (
                  <ArrowRight className="size-3.5 text-muted-foreground/40" />
                )}
                <StatusBadge
                  status={status}
                  dimmed={!isReached && order.status !== 'rejected'}
                  className={isCurrent ? 'ring-2 ring-primary/30' : ''}
                />
              </div>
            );
          })}
          {order.status === 'rejected' && (
            <>
              <ArrowRight className="size-3.5 text-muted-foreground/40" />
              <StatusBadge status="rejected" className="ring-2 ring-destructive/30" />
            </>
          )}
        </div>
      </div>

      {/* ---- Items table ---- */}
      <div className="mb-6 bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm premium-table">
          <thead>
            <tr className="bg-secondary border-b border-border">
              <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">
                Product
              </th>
              <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">
                Seller
              </th>
              <th className="px-4 py-3 text-right font-medium text-xs uppercase tracking-wider text-muted-foreground">
                Qty
              </th>
              <th className="px-4 py-3 text-right font-medium text-xs uppercase tracking-wider text-muted-foreground">
                Unit price
              </th>
              <th className="px-4 py-3 text-right font-medium text-xs uppercase tracking-wider text-muted-foreground">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3 text-foreground">{item.productName || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {item.sellerOrgName || '—'}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {item.quantity}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {formatINR(item.unitPrice)}
                </td>
                <td className="px-4 py-3 text-right font-medium text-foreground">
                  {formatINR(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-secondary border-t border-border">
              <td colSpan={4} className="px-4 py-3 text-right font-medium text-foreground">
                Order total
              </td>
              <td className="px-4 py-3 text-right font-semibold text-primary">
                {formatINR(order.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ---- Rejection reason ---- */}
      {order.status === 'rejected' && order.rejectionReason && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="size-4 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-semibold text-destructive">Rejection reason</p>
              <p className="mt-1 text-sm text-destructive/80">{order.rejectionReason}</p>
            </div>
          </div>
        </div>
      )}

      {/* ---- Actions card ---- */}
      {(canApprove || canPay || canDeliver) && (
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="label-overline text-muted-foreground mb-3">Actions</p>
          <div className="flex flex-wrap items-start gap-3">
            {canApprove && (
              <>
                <Button
                  data-testid="btn-approve"
                  onClick={() => handleAction('approve')}
                  disabled={actionLoading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground btn-press"
                >
                  {actionLoading && <Loader2 className="size-4 animate-spin" />}
                  Approve
                </Button>
                <Button
                  data-testid="btn-reject"
                  variant="outline"
                  onClick={() => setShowRejectBox(!showRejectBox)}
                  disabled={actionLoading}
                  className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50 btn-press"
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
                className="bg-primary hover:bg-primary/90 text-primary-foreground btn-press"
              >
                {actionLoading && <Loader2 className="size-4 animate-spin" />}
                Pay
              </Button>
            )}
            {canDeliver && (
              <Button
                data-testid="btn-deliver"
                onClick={() => handleAction('deliver')}
                disabled={actionLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground btn-press"
              >
                {actionLoading && <Loader2 className="size-4 animate-spin" />}
                Deliver
              </Button>
            )}
          </div>

          {/* Rejection reason textarea */}
          {showRejectBox && (
            <div className="mt-4 space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 animate-fade-in-up">
              <label className="text-sm font-semibold text-destructive">
                Reason for rejection
              </label>
              <Textarea
                data-testid="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Provide a reason..."
                className="border-destructive/30 bg-card focus-visible:ring-destructive/30"
              />
              <Button
                data-testid="btn-confirm-reject"
                size="sm"
                onClick={() => handleAction('reject', { reason: rejectReason })}
                disabled={actionLoading || !rejectReason.trim()}
                className="bg-destructive hover:bg-destructive/90 text-white btn-press"
              >
                {actionLoading && <Loader2 className="size-4 animate-spin" />}
                Confirm rejection
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
