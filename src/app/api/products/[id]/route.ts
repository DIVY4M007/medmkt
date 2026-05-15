import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.product.findUnique({
      where: { id },
      include: { sellerOrg: true }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.accountType !== 'seller') {
      return NextResponse.json({ error: 'Only sellers can update products' }, { status: 403 });
    }

    const { id } = await params;
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    if (existing.sellerOrgId !== user.orgId) {
      return NextResponse.json({ error: 'You do not own this product' }, { status: 403 });
    }

    const body = await request.json();
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.stock !== undefined) updateData.stock = body.stock;
    if (body.unit !== undefined) updateData.unit = body.unit;
    if (body.tierPricing !== undefined) updateData.tierPricing = JSON.stringify(body.tierPricing);
    if (body.sterility !== undefined) updateData.sterility = body.sterility;
    if (body.disposable !== undefined) updateData.disposable = body.disposable;
    if (body.packagingQty !== undefined) updateData.packagingQty = body.packagingQty;
    if (body.manufacturer !== undefined) updateData.manufacturer = body.manufacturer;
    if (body.qualityMetadata !== undefined) updateData.qualityMetadata = JSON.stringify(body.qualityMetadata);
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.discountPercent !== undefined) updateData.discountPercent = body.discountPercent;
    if (body.minOrderForDiscount !== undefined) updateData.minOrderForDiscount = body.minOrderForDiscount;

    const product = await db.product.update({
      where: { id },
      data: updateData,
      include: { sellerOrg: true }
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.accountType !== 'seller') {
      return NextResponse.json({ error: 'Only sellers can delete products' }, { status: 403 });
    }

    const { id } = await params;
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    if (existing.sellerOrgId !== user.orgId) {
      return NextResponse.json({ error: 'You do not own this product' }, { status: 403 });
    }

    const product = await db.product.update({
      where: { id },
      data: { isActive: false },
      include: { sellerOrg: true }
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
