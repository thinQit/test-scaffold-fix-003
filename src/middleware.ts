import { NextRequest, NextResponse } from 'next/server';
import { getBearerToken, verifyToken } from '@/lib/auth';

export const runtime = 'nodejs';

const protectedPrefixes = ['/api/tasks', '/api/dashboard', '/api/auth/me', '/api/auth/logout', '/api/users'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = getBearerToken(request.headers.get('authorization'));
  const payload = token ? verifyToken(token) : null;

  if (!payload) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

export default middleware;
