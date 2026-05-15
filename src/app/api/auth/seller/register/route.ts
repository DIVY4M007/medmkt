import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signToken, sanitizeUser } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orgName, orgType, name, email, password } = body;

    if (!orgName || !orgType || !name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!['vendor', 'distributor'].includes(orgType)) {
      return NextResponse.json({ error: 'orgType must be vendor or distributor' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const org = await db.organization.create({
      data: { name: orgName, type: orgType, accountType: 'seller' }
    });

    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        orgId: org.id,
        accountType: 'seller',
        role: 'approver'
      },
      include: { org: true }
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      orgId: user.orgId,
      accountType: user.accountType,
      role: user.role
    });

    return NextResponse.json({ token, user: sanitizeUser(user) }, { status: 201 });
  } catch (error) {
    console.error('Seller registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
