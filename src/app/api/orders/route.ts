import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, sanitizeOrder } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'buyer';

    let orders;

    if (view === 'seller') {
      // Seller view: orders where any item has a sellerOrgId matching user's org
      const allOrders = await db.order.findMany({
        where: {
          status: { not: 'draft' }
        },
        include: { buyerOrg: true, creator: true },
        orderBy: { createdAt: 'desc' }
      });

      // Filter orders where at least one item belongs to the seller's org
      orders = allOrders.filter((order) => {
        try {
          const items = JSON.parse(order.items);
          return items.some((item: any) => item.sellerOrgId === user.orgId);
        } catch {
          return false;
        }
      });
    } else {
      // Buyer view: orders where user's org is the buyer
      orders = await db.order.findMany({
        where: {
          buyerOrgId: user.orgId,
          status: { not: 'draft' }
        },
        include: { buyerOrg: true, creator: true },
        orderBy: { createdAt: 'desc' }
      });
    }

    // Parse items JSON and sanitize for each order
    const parsedOrders = orders.map((order) =>
      sanitizeOrder({
        ...order,
        items: JSON.parse(order.items)
      })
    );

    return NextResponse.json({ orders: parsedOrders });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
