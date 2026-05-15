import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-helpers';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'approver') return NextResponse.json({ error: 'Only approvers can remove users' }, { status: 403 });

    const body = await request.json().catch(() => ({}));
    const { password } = body as { password?: string };

    if (!password) {
      return NextResponse.json({ error: 'Your password is required to confirm this action' }, { status: 400 });
    }

    // Verify approver's password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    const { id: targetUserId } = await params;

    // Cannot delete yourself
    if (targetUserId === user.id) return NextResponse.json({ error: 'You cannot remove yourself' }, { status: 400 });

    // Find target user
    const targetUser = await db.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Must be in same org
    if (targetUser.orgId !== user.orgId) return NextResponse.json({ error: 'User not in your organization' }, { status: 403 });

    // Cannot delete last approver
    if (targetUser.role === 'approver') {
      const approverCount = await db.user.count({ where: { orgId: user.orgId, role: 'approver' } });
      if (approverCount <= 1) return NextResponse.json({ error: 'Cannot remove the last approver in the organization' }, { status: 400 });
    }

    await db.user.delete({ where: { id: targetUserId } });
    return NextResponse.json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Delete org user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
