import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'medmkt-dev-secret-key-2024';

export function signToken(user: { id: string; email: string; orgId: string; accountType: string; role: string }): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { id: string; email: string; orgId: string; accountType: string; role: string };
}

export async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const payload = verifyToken(authHeader.slice(7));
    const user = await db.user.findUnique({
      where: { id: payload.id },
      include: { org: true }
    });
    return user;
  } catch {
    return null;
  }
}

export function priceForQty(tierPricingJson: string | null, qty: number): number {
  if (!tierPricingJson) return 0;
  const tiers = JSON.parse(tierPricingJson) as Array<{ minQty: number; unitPrice: number }>;
  if (!Array.isArray(tiers) || tiers.length === 0) return 0;
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
  let chosen = sorted[0].unitPrice;
  for (const t of sorted) {
    if (qty >= t.minQty) chosen = t.unitPrice;
  }
  return chosen;
}

/**
 * Calculate line total with tier pricing + bulk discount applied.
 * Returns { unitPrice, lineTotal, discountAmount, discountPercent }
 */
export function calculateLineTotal(
  tierPricingJson: string | null,
  qty: number,
  discountPercent: number | null | undefined,
  minOrderForDiscount: number | null | undefined,
): { unitPrice: number; lineTotal: number; discountAmount: number; appliedDiscountPercent: number } {
  const unitPrice = priceForQty(tierPricingJson, qty);
  let lineTotal = unitPrice * qty;
  let discountAmount = 0;
  let appliedDiscountPercent = 0;

  if (discountPercent && discountPercent > 0 && minOrderForDiscount && qty >= minOrderForDiscount) {
    appliedDiscountPercent = discountPercent;
    discountAmount = lineTotal * (discountPercent / 100);
    lineTotal = lineTotal - discountAmount;
  }

  return { unitPrice, lineTotal, discountAmount, appliedDiscountPercent };
}

export function sanitizeUser(user: any) {
  if (!user) return user;
  const { passwordHash, ...safe } = user;
  return safe;
}

export function sanitizeOrder(order: any) {
  if (!order) return order;
  const result = { ...order };
  if (result.creator) {
    result.creator = sanitizeUser(result.creator);
  }
  if (result.createdBy) {
    result.createdBy = sanitizeUser(result.createdBy);
  }
  return result;
}
