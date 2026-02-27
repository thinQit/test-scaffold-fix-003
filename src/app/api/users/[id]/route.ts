import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getBearerToken, verifyToken, hashPassword } from '@/lib/auth';

const updateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  name: z.string().min(1).optional()
});

function getUserId(request: NextRequest): string | null {
  const token = getBearerToken(request.headers.get('authorization'));
  const payload = token ? verifyToken(token) : null;
  return payload?.sub ?? null;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (userId !== params.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt, updatedAt: user.updatedAt } }
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (userId !== params.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data = updateSchema.parse(body);

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        email: data.email,
        name: data.name,
        passwordHash: data.password ? await hashPassword(data.password) : undefined
      }
    });

    return NextResponse.json({
      success: true,
      data: { user: { id: updated.id, email: updated.email, name: updated.name } }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors.map((e) => e.message).join(', ') }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (userId !== params.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await prisma.user.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, data: { success: true } });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 });
  }
}

export default GET;
