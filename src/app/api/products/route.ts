import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sellerOrg = searchParams.get('sellerOrg');
    const sterility = searchParams.get('sterility');
    const hasDiscount = searchParams.get('hasDiscount');

    const where: any = { isActive: true };

    if (category) where.category = category;
    if (sellerOrg) where.sellerOrgId = sellerOrg;
    if (sterility) where.sterility = sterility;
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (hasDiscount === 'true') {
      where.discountPercent = { gt: 0 };
    }

    const products = await db.product.findMany({
      where,
      include: { sellerOrg: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.accountType !== 'seller') {
      return NextResponse.json({ error: 'Only sellers can create products' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name, description, category, imageUrl, stock, unit,
      tierPricing, sterility, disposable, packagingQty,
      manufacturer, qualityMetadata,
      discountPercent, minOrderForDiscount
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }
    if (!sterility) {
      return NextResponse.json({ error: 'Sterility is required' }, { status: 400 });
    }

    const product = await db.product.create({
      data: {
        name,
        description: description || null,
        category,
        imageUrl: imageUrl || null,
        stock: stock ?? 100,
        unit: unit || 'box',
        tierPricing: tierPricing ? JSON.stringify(tierPricing) : '[]',
        sterility,
        disposable: disposable ?? true,
        packagingQty: packagingQty ?? 1,
        manufacturer: manufacturer || null,
        qualityMetadata: qualityMetadata ? JSON.stringify(qualityMetadata) : null,
        discountPercent: discountPercent ?? null,
        minOrderForDiscount: minOrderForDiscount ?? null,
        sellerOrgId: user.orgId
      },
      include: { sellerOrg: true }
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
