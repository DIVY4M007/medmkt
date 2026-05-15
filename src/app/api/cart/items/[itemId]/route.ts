import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, priceForQty, calculateLineTotal, sanitizeOrder } from '@/lib/auth-helpers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.accountType !== 'buyer') {
      return NextResponse.json({ error: 'Only buyers can update cart' }, { status: 403 });
    }

    const { itemId } = await params;
    const body = await request.json();
    const { quantity } = body;

    if (!quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Valid quantity is required' }, { status: 400 });
    }

    // Get the draft cart
    const cart = await db.order.findFirst({
      where: {
        buyerOrgId: user.orgId,
        createdById: user.id,
        status: 'draft'
      }
    });

    if (!cart) {
      return NextResponse.json({ error: 'No cart found' }, { status: 404 });
    }

    const items: Array<{
      productId: string;
      name: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
      discountAmount: number;
      discountPercent: number;
      sellerOrgId: string;
    }> = JSON.parse(cart.items);

    const itemIndex = items.findIndex((item) => item.productId === itemId);
    if (itemIndex < 0) {
      return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
    }

    // Get product for tier pricing + discount
    const product = await db.product.findUnique({
      where: { id: itemId }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Recalculate tier price + discount and line total
    const pricing = calculateLineTotal(product.tierPricing, quantity, product.discountPercent, product.minOrderForDiscount);
    items[itemIndex].quantity = quantity;
    items[itemIndex].unitPrice = pricing.unitPrice;
    items[itemIndex].lineTotal = pricing.lineTotal;
    items[itemIndex].discountAmount = pricing.discountAmount;
    items[itemIndex].discountPercent = pricing.appliedDiscountPercent;

    // Recalculate total
    const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

    const updatedCart = await db.order.update({
      where: { id: cart.id },
      data: {
        items: JSON.stringify(items),
        total
      },
      include: { buyerOrg: true, creator: true }
    });

    return NextResponse.json({
      cart: sanitizeOrder({
        ...updatedCart,
        items: JSON.parse(updatedCart.items)
      })
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.accountType !== 'buyer') {
      return NextResponse.json({ error: 'Only buyers can modify cart' }, { status: 403 });
    }

    const { itemId } = await params;

    // Get the draft cart
    const cart = await db.order.findFirst({
      where: {
        buyerOrgId: user.orgId,
        createdById: user.id,
        status: 'draft'
      }
    });

    if (!cart) {
      return NextResponse.json({ error: 'No cart found' }, { status: 404 });
    }

    const items: Array<{
      productId: string;
      name: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
      discountAmount: number;
      discountPercent: number;
      sellerOrgId: string;
    }> = JSON.parse(cart.items);

    const itemIndex = items.findIndex((item) => item.productId === itemId);
    if (itemIndex < 0) {
      return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
    }

    items.splice(itemIndex, 1);

    // Recalculate total
    const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

    const updatedCart = await db.order.update({
      where: { id: cart.id },
      data: {
        items: JSON.stringify(items),
        total
      },
      include: { buyerOrg: true, creator: true }
    });

    return NextResponse.json({
      cart: sanitizeOrder({
        ...updatedCart,
        items: JSON.parse(updatedCart.items)
      })
    });
  } catch (error) {
    console.error('Delete cart item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
