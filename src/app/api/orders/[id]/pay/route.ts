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

    // Must be approver in the buyer org
    if (order.buyerOrgId !== user.orgId) {
      return NextResponse.json({ error: 'Only the buyer org can pay' }, { status: 403 });
    }
    if (user.role !== 'approver') {
      return NextResponse.json({ error: 'Only approvers can pay for orders' }, { status: 403 });
    }
    if (order.status !== 'approved') {
      return NextResponse.json({ error: 'Order must be in approved status to pay' }, { status: 400 });
    }

    const updatedOrder = await db.order.update({
      where: { id },
      data: { status: 'paid' },
      include: { buyerOrg: true, creator: true }
    });

    return NextResponse.json({
      order: sanitizeOrder({
        ...updatedOrder,
        items: JSON.parse(updatedOrder.items)
      })
    });
  } catch (error) {
    console.error('Pay order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
