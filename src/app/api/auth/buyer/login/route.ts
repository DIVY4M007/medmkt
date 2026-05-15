import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signToken, sanitizeUser } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { org: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.accountType !== 'buyer') {
      return NextResponse.json({ error: 'Not a buyer account' }, { status: 403 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      orgId: user.orgId,
      accountType: user.accountType,
      role: user.role
    });

    return NextResponse.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error('Buyer login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
