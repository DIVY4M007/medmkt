import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, sanitizeOrder } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.accountType !== 'buyer') {
      return NextResponse.json({ error: 'Only buyers can submit orders' }, { status: 403 });
    }

    // Get the draft cart
    const cart = await db.order.findFirst({
      where: {
        buyerOrgId: user.orgId,
        createdById: user.id,
        status: 'draft'
      },
      include: { buyerOrg: true, creator: true }
    });

    if (!cart) {
      return NextResponse.json({ error: 'No cart found' }, { status: 404 });
    }

    const items = JSON.parse(cart.items);
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Change status to pending_approval
    const order = await db.order.update({
      where: { id: cart.id },
      data: { status: 'pending_approval' },
      include: { buyerOrg: true, creator: true }
    });

    return NextResponse.json({
      order: sanitizeOrder({
        ...order,
        items: JSON.parse(order.items)
      })
    });
  } catch (error) {
    console.error('Submit cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
