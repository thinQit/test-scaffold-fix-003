import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getBearerToken, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = getBearerToken(request.headers.get('authorization'));
    const payload = token ? verifyToken(token) : null;

    if (!payload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt.toISOString() } }
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch user' }, { status: 500 });
  }
}

export default GET;
