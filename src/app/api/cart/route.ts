import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, sanitizeOrder } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.accountType !== 'buyer') {
      return NextResponse.json({ error: 'Only buyers can access cart' }, { status: 403 });
    }

    // Get or create draft order for the user
    let cart = await db.order.findFirst({
      where: {
        buyerOrgId: user.orgId,
        createdById: user.id,
        status: 'draft'
      },
      include: { buyerOrg: true, creator: true }
    });

    if (!cart) {
      cart = await db.order.create({
        data: {
          buyerOrgId: user.orgId,
          createdById: user.id,
          status: 'draft',
          items: '[]',
          total: 0
        },
        include: { buyerOrg: true, creator: true }
      });
    }

    // Parse items and enrich with seller org names
    const parsedItems = JSON.parse(cart.items);
    const sellerOrgIds = [...new Set(parsedItems.map((item: any) => item.sellerOrgId).filter(Boolean))];
    const sellerOrgs = await Promise.all(
      sellerOrgIds.map((id: string) => db.organization.findUnique({ where: { id } }))
    );
    const sellerOrgMap = new Map(sellerOrgs.filter(Boolean).map((org: any) => [org.id, org]));

    const enrichedItems = parsedItems.map((item: any) => ({
      ...item,
      id: item.productId,
      productName: item.name,
      sellerOrg: sellerOrgMap.get(item.sellerOrgId) || { id: item.sellerOrgId, name: 'Unknown Seller' },
    }));

    const cartData = sanitizeOrder({
      ...cart,
      items: enrichedItems
    });

    return NextResponse.json({ cart: cartData });
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
