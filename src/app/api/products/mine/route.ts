import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.accountType !== 'seller') {
      return NextResponse.json({ error: 'Only sellers can view their products' }, { status: 403 });
    }

    const products = await db.product.findMany({
      where: { sellerOrgId: user.orgId },
      include: { sellerOrg: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Get my products error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
