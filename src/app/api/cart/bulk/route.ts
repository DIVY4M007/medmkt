import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, priceForQty, calculateLineTotal, sanitizeOrder } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.accountType !== 'buyer' || user.role !== 'requestor') {
      return NextResponse.json({ error: 'Only buyer requestors can add to cart' }, { status: 403 });
    }

    const body = await request.json();
    const { items } = body as { items: Array<{ productId: string; quantity: number }> };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    // Get or create draft order
    let cart = await db.order.findFirst({
      where: {
        buyerOrgId: user.orgId,
        createdById: user.id,
        status: 'draft',
      },
    });

    if (!cart) {
      cart = await db.order.create({
        data: {
          buyerOrgId: user.orgId,
          createdById: user.id,
          status: 'draft',
          items: '[]',
          total: 0,
        },
      });
    }

    const existingItems: Array<{
      productId: string;
      name: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
      discountAmount: number;
      discountPercent: number;
      sellerOrgId: string;
    }> = JSON.parse(cart.items);

    // Validate and process each item
    const results: Array<{ productId: string; status: string; error?: string }> = [];

    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity <= 0) {
        results.push({ productId: productId || 'unknown', status: 'skipped', error: 'Invalid productId or quantity' });
        continue;
      }

      const product = await db.product.findUnique({
        where: { id: productId },
        include: { sellerOrg: true },
      });

      if (!product || !product.isActive) {
        results.push({ productId, status: 'skipped', error: 'Product not found or inactive' });
        continue;
      }

      if (product.sellerOrgId === user.orgId) {
        results.push({ productId, status: 'skipped', error: "Cannot purchase your own organization's products" });
        continue;
      }

      // Calculate tier price + discount
      const pricing = calculateLineTotal(product.tierPricing, quantity, product.discountPercent, product.minOrderForDiscount);

      // Check if product already in cart — merge
      const existingIndex = existingItems.findIndex((i) => i.productId === productId);
      if (existingIndex >= 0) {
        const newQty = existingItems[existingIndex].quantity + quantity;
        const newPricing = calculateLineTotal(product.tierPricing, newQty, product.discountPercent, product.minOrderForDiscount);
        existingItems[existingIndex].quantity = newQty;
        existingItems[existingIndex].unitPrice = newPricing.unitPrice;
        existingItems[existingIndex].lineTotal = newPricing.lineTotal;
        existingItems[existingIndex].discountAmount = newPricing.discountAmount;
        existingItems[existingIndex].discountPercent = newPricing.appliedDiscountPercent;
      } else {
        existingItems.push({
          productId: product.id,
          name: product.name,
          quantity,
          unitPrice: pricing.unitPrice,
          lineTotal: pricing.lineTotal,
          discountAmount: pricing.discountAmount,
          discountPercent: pricing.appliedDiscountPercent,
          sellerOrgId: product.sellerOrgId,
        });
      }

      results.push({ productId, status: 'added' });
    }

    // Recalculate total
    const total = existingItems.reduce((sum, i) => sum + i.lineTotal, 0);

    const updatedCart = await db.order.update({
      where: { id: cart.id },
      data: {
        items: JSON.stringify(existingItems),
        total,
      },
      include: { buyerOrg: true, creator: true },
    });

    return NextResponse.json({
      cart: sanitizeOrder({
        ...updatedCart,
        items: JSON.parse(updatedCart.items),
      }),
      results,
      added: results.filter((r) => r.status === 'added').length,
      skipped: results.filter((r) => r.status === 'skipped').length,
    });
  } catch (error) {
    console.error('Bulk add to cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
