import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, sanitizeUser } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await db.user.findMany({
      where: { orgId: user.orgId },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ users: users.map(sanitizeUser) });
  } catch (error) {
    console.error('Get org users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'approver') {
      return NextResponse.json({ error: 'Only approvers can add users' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!['approver', 'requestor', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        orgId: user.orgId,
        accountType: user.accountType,
        role
      },
      include: { org: true }
    });

    return NextResponse.json({ user: sanitizeUser(newUser) }, { status: 201 });
  } catch (error) {
    console.error('Add org user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
