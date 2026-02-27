import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getBearerToken, verifyToken, hashPassword } from '@/lib/auth';

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).optional()
});

function getUserId(request: NextRequest): string | null {
  const token = getBearerToken(request.headers.get('authorization'));
  const payload = token ? verifyToken(token) : null;
  return payload?.sub ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { users: [{ id: user.id, email: user.email, name: user.name, createdAt: user.createdAt, updatedAt: user.updatedAt }] }
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createSchema.parse(body);

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: { email: data.email, name: data.name, passwordHash }
    });

    return NextResponse.json(
      { success: true, data: { user: { id: user.id, email: user.email, name: user.name } } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors.map((e) => e.message).join(', ') }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
  }
}

export default GET;
