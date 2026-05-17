import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, priceForQty, calculateLineTotal, sanitizeOrder } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.accountType !== 'buyer') {
      return NextResponse.json({ error: 'Only buyers can add to cart' }, { status: 403 });
    }

    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json({ error: 'productId and valid quantity are required' }, { status: 400 });
    }

    // Get the product
    const product = await db.product.findUnique({
      where: { id: productId },
      include: { sellerOrg: true }
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'Product not found or inactive' }, { status: 404 });
    }

    // Cannot buy own org's products
    if (product.sellerOrgId === user.orgId) {
      return NextResponse.json({ error: "Cannot purchase your own organization's products" }, { status: 400 });
    }

    // Get or create draft order
    let cart = await db.order.findFirst({
      where: {
        buyerOrgId: user.orgId,
        createdById: user.id,
        status: 'draft'
      }
    });

    if (!cart) {
      cart = await db.order.create({
        data: {
          buyerOrgId: user.orgId,
          createdById: user.id,
          status: 'draft',
          items: '[]',
          total: 0
        }
      });
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

    // Calculate tier price + discount
    const pricing = calculateLineTotal(product.tierPricing, quantity, product.discountPercent, product.minOrderForDiscount);

    // Check if product already in cart - merge
    const existingIndex = items.findIndex((item) => item.productId === productId);
    if (existingIndex >= 0) {
      const newQty = items[existingIndex].quantity + quantity;
      const newPricing = calculateLineTotal(product.tierPricing, newQty, product.discountPercent, product.minOrderForDiscount);
      items[existingIndex].quantity = newQty;
      items[existingIndex].unitPrice = newPricing.unitPrice;
      items[existingIndex].lineTotal = newPricing.lineTotal;
      items[existingIndex].discountAmount = newPricing.discountAmount;
      items[existingIndex].discountPercent = newPricing.appliedDiscountPercent;
    } else {
      items.push({
        productId: product.id,
        name: product.name,
        quantity,
        unitPrice: pricing.unitPrice,
        lineTotal: pricing.lineTotal,
        discountAmount: pricing.discountAmount,
        discountPercent: pricing.appliedDiscountPercent,
        sellerOrgId: product.sellerOrgId
      });
    }

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
    console.error('Add to cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
