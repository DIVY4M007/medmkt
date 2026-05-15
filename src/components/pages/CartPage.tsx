'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api-client';
import { formatINR } from '@/lib/format';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ShoppingBag,
  Send,
  Trash2,
  FileSpreadsheet,
  Loader2,
  AlertTriangle,
  ShoppingCart,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  discountAmount?: number;
  discountPercent?: number;
  sellerOrgId: string;
  sellerOrg?: {
    id: string;
    name: string;
    type: string;
  };
}

interface Cart {
  id: string;
  buyerOrgId: string;
  createdById: string;
  status: string;
  items: CartItem[] | string;
  total: number;
  buyerOrg?: { id: string; name: string };
  creator?: { id: string; name: string };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function parseItems(items: CartItem[] | string): CartItem[] {
  if (typeof items === 'string') {
    try {
      return JSON.parse(items);
    } catch {
      return [];
    }
  }
  return Array.isArray(items) ? items : [];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CartPage() {
  const { navigate, user } = useAppStore();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingQty, setEditingQty] = useState<Record<string, number>>({});
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get('/cart');
      setCart(data.cart);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (!message.includes('403') && !message.includes('Only buyers')) {
        toast.error('Failed to load cart');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const items = cart ? parseItems(cart.items) : [];

  /* ---- Quantity ---- */
  const handleQuantityChange = async (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      setUpdatingItem(itemId);
      const data = await api.patch(`/cart/items/${itemId}`, { quantity: newQty });
      setCart(data.cart);
      setEditingQty((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update quantity');
    } finally {
      setUpdatingItem(null);
    }
  };

  /* ---- Delete ---- */
  const handleDeleteItem = async (itemId: string) => {
    try {
      setUpdatingItem(itemId);
      const data = await api.delete(`/cart/items/${itemId}`);
      setCart(data.cart);
      toast.success('Item removed from cart');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove item');
    } finally {
      setUpdatingItem(null);
    }
  };

  /* ---- Submit ---- */
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const data = await api.post('/cart/submit');
      toast.success('Order submitted for approval!', {
        action: {
          label: 'View order',
          onClick: () => navigate('order-detail', { id: data.order.id }),
        },
      });
      navigate('dashboard');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit order');
    } finally {
      setSubmitting(false);
    }
  };

  /* ---- Access check ---- */
  const isRequestor = user?.accountType === 'buyer' && user?.role === 'requestor';

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  /* ---- Not a requestor ---- */
  if (!isRequestor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-fade-in-up text-center py-16">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-accent/10">
            <AlertTriangle className="size-7 text-accent" />
          </div>
          <h2 className="font-heading text-xl font-semibold text-foreground mb-2">
            Only requestors can build carts
          </h2>
          <p className="text-sm text-muted-foreground">
            Approvers review and approve submitted orders.
          </p>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  Main Render                                                      */
  /* ================================================================ */
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8 animate-fade-in-up">
      {/* ---- Header ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          My draft order
        </h1>
        <Button
          variant="outline"
          className="border-border text-muted-foreground hover:bg-secondary gap-1.5 rounded-lg"
          onClick={() => navigate('cart-upload')}
          data-testid="bulk-upload-btn"
        >
          <FileSpreadsheet className="size-4" />
          Quick add
        </Button>
      </div>

      {/* ---- Empty cart ---- */}
      {items.length === 0 && (
        <div className="border-2 border-dashed border-border rounded-2xl py-16 flex flex-col items-center justify-center gap-4 stagger-children">
          <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
            <ShoppingBag className="size-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">Your cart is empty</p>
          <Button
            onClick={() => navigate('marketplace')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground btn-press"
            data-testid="browse-marketplace-btn"
          >
            <ShoppingCart className="size-4" />
            Browse marketplace
          </Button>
        </div>
      )}

      {/* ---- Cart items table ---- */}
      {items.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-secondary text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <div className="col-span-3">Product</div>
            <div className="col-span-2">Seller</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-1 text-right">Unit price</div>
            <div className="col-span-2 text-right">Line total</div>
            <div className="col-span-2" />
          </div>

          {/* Rows */}
          <div className="stagger-children">
            {items.map((item) => {
              const itemId = item.id || item.productId;
              const displayQty = editingQty[itemId] ?? item.quantity;
              const isUpdating = updatingItem === itemId;

              return (
                <div
                  key={itemId}
                  className="grid grid-cols-12 gap-2 px-4 py-3 border-t border-border items-center text-sm hover:bg-secondary/50 transition-colors"
                >
                  {/* Product */}
                  <div className="col-span-3 text-foreground font-medium truncate">
                    {item.productName || item.name}
                    {item.discountAmount && item.discountAmount > 0 && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Tag className="size-2.5" />
                        {item.discountPercent}% off
                      </span>
                    )}
                  </div>

                  {/* Seller */}
                  <div className="col-span-2 text-muted-foreground truncate text-xs">
                    {item.sellerOrg?.name || '—'}
                  </div>

                  {/* Qty */}
                  <div className="col-span-2 flex justify-center">
                    <Input
                      type="number"
                      min={1}
                      value={displayQty}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setEditingQty((prev) => ({ ...prev, [itemId]: val }));
                      }}
                      onBlur={() => {
                        if (editingQty[itemId] !== undefined && editingQty[itemId] !== item.quantity) {
                          handleQuantityChange(itemId, editingQty[itemId]);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (editingQty[itemId] !== undefined && editingQty[itemId] !== item.quantity) {
                            handleQuantityChange(itemId, editingQty[itemId]);
                          }
                        }
                      }}
                      className="w-20 h-8 text-center text-sm"
                      disabled={isUpdating}
                      data-testid={`qty-input-${itemId}`}
                    />
                  </div>

                  {/* Unit price */}
                  <div className="col-span-1 text-right text-muted-foreground text-xs">
                    {formatINR(item.unitPrice)}
                  </div>

                  {/* Line total */}
                  <div className="col-span-2 text-right">
                    <div className="text-foreground font-medium">{formatINR(item.lineTotal)}</div>
                    {item.discountAmount && item.discountAmount > 0 && (
                      <div className="text-[10px] text-emerald-600 font-medium">−{formatINR(item.discountAmount)} saved</div>
                    )}
                  </div>

                  {/* Delete */}
                  <div className="col-span-2 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteItem(itemId)}
                      disabled={isUpdating}
                      data-testid={`delete-item-${itemId}`}
                    >
                      {isUpdating ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer total */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-secondary border-t border-border">
            <div className="col-span-6 text-sm font-medium text-foreground">
              Order total
            </div>
            <div className="col-span-6 text-right">
              {items.some((i) => i.discountAmount && i.discountAmount > 0) && (
                <div className="text-xs text-emerald-600 font-medium mb-0.5">
                  Total saved: {formatINR(items.reduce((sum, i) => sum + (i.discountAmount || 0), 0))}
                </div>
              )}
              <div className="text-sm font-semibold text-primary">
                {formatINR(cart?.total ?? 0)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- Submit bar ---- */}
      {items.length > 0 && (
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5 px-6 rounded-xl btn-press"
            data-testid="submit-order-btn"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Submit for approval
          </Button>
        </div>
      )}
    </div>
  );
}
