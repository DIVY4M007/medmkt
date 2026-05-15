import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, sanitizeOrder } from '@/lib/auth-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const order = await db.order.findUnique({
      where: { id },
      include: { buyerOrg: true, creator: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Must be part of seller org
    const items = JSON.parse(order.items);
    const sellerOrgIds = items.map((item: any) => item.sellerOrgId).filter(Boolean);
    if (!sellerOrgIds.includes(user.orgId)) {
      return NextResponse.json({ error: 'Only the seller org can mark as delivered' }, { status: 403 });
    }
    if (order.status !== 'paid') {
      return NextResponse.json({ error: 'Order must be in paid status to deliver' }, { status: 400 });
    }

    const updatedOrder = await db.order.update({
      where: { id },
      data: { status: 'delivered' },
      include: { buyerOrg: true, creator: true }
    });

    return NextResponse.json({
      order: sanitizeOrder({
        ...updatedOrder,
        items: JSON.parse(updatedOrder.items)
      })
    });
  } catch (error) {
    console.error('Deliver order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
