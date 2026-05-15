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
  ArrowLeft,
  AlertTriangle,
  ShoppingCart,
} from 'lucide-react';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
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
    } catch (err: any) {
      if (err.message?.includes('403') || err.message?.includes('Only buyers')) {
        // Not a buyer - handled in UI
      } else {
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
    } catch (err: any) {
      toast.error(err.message || 'Failed to update quantity');
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      setUpdatingItem(itemId);
      const data = await api.delete(`/cart/items/${itemId}`);
      setCart(data.cart);
      toast.success('Item removed from cart');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove item');
    } finally {
      setUpdatingItem(null);
    }
  };

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
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit order');
    } finally {
      setSubmitting(false);
    }
  };

  const isRequestor = user?.accountType === 'buyer' && user?.role === 'requestor';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-[#4A675B]" />
      </div>
    );
  }

  if (!isRequestor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <AlertTriangle className="size-12 text-[#C47055] mx-auto mb-4" />
          <h2 className="font-heading text-xl font-semibold text-[#1F2321] mb-2">
            Only requestors can build carts
          </h2>
          <p className="text-sm text-[#5C635F]">
            Approvers review and approve submitted orders.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="font-heading text-2xl font-semibold text-[#1F2321]">
          My draft order
        </h1>
        <Button
          variant="outline"
          className="border-[#D5CEBD] text-[#5C635F] hover:bg-[#F4F1EA] gap-1.5 rounded-lg"
          onClick={() => navigate('cart-upload')}
          data-testid="bulk-upload-btn"
        >
          <FileSpreadsheet className="size-4" />
          Bulk upload (Excel)
        </Button>
      </div>

      {/* Empty cart */}
      {items.length === 0 && (
        <div className="border-2 border-dashed border-[#D5CEBD] rounded-2xl py-16 flex flex-col items-center justify-center gap-4">
          <ShoppingBag className="size-12 text-[#D5CEBD]" />
          <p className="text-[#5C635F] text-sm">Your cart is empty</p>
          <Button
            onClick={() => navigate('marketplace')}
            className="bg-[#4A675B] hover:bg-[#3D564C] text-white btn-press"
            data-testid="browse-marketplace-btn"
          >
            <ShoppingCart className="size-4" />
            Browse marketplace
          </Button>
        </div>
      )}

      {/* Cart table */}
      {items.length > 0 && (
        <div className="border border-[#D5CEBD] rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-[#F4F1EA] text-xs font-medium text-[#5C635F]">
            <div className="col-span-4">Product</div>
            <div className="col-span-2">Seller</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-1 text-right">Unit</div>
            <div className="col-span-2 text-right">Line total</div>
            <div className="col-span-1" />
          </div>

          {/* Rows */}
          {items.map((item) => {
            const itemId = item.id || item.productId;
            const displayQty = editingQty[itemId] ?? item.quantity;
            const isUpdating = updatingItem === itemId;

            return (
              <div
                key={itemId}
                className="grid grid-cols-12 gap-2 px-4 py-3 border-t border-[#D5CEBD] items-center text-sm hover:bg-[#F4F1EA]/30 transition-colors"
              >
                <div className="col-span-4 text-[#1F2321] font-medium truncate">
                  {item.productName || item.name}
                </div>
                <div className="col-span-2 text-[#5C635F] truncate text-xs">
                  {item.sellerOrg?.name || '—'}
                </div>
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
                <div className="col-span-1 text-right text-[#5C635F] text-xs">
                  {formatINR(item.unitPrice)}
                </div>
                <div className="col-span-2 text-right text-[#1F2321] font-medium">
                  {formatINR(item.lineTotal)}
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-[#5C635F] hover:text-[#C47055] hover:bg-[#C47055]/10"
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

          {/* Footer total */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-[#F4F1EA] border-t border-[#D5CEBD]">
            <div className="col-span-8 text-sm font-medium text-[#1F2321]">
              Order total
            </div>
            <div className="col-span-4 text-right text-sm font-semibold text-[#4A675B]">
              {formatINR(cart?.total ?? 0)}
            </div>
          </div>
        </div>
      )}

      {/* Submit bar */}
      {items.length > 0 && (
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#C47055] hover:bg-[#B05F47] text-white gap-1.5 px-6 rounded-xl btn-press"
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
