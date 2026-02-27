import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getBearerToken, verifyToken } from '@/lib/auth';

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  dueDate: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : val === null ? null : val),
    z.union([z.string().datetime(), z.null()]).optional()
  ),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional()
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

    const task = await prisma.task.findFirst({ where: { id: params.id, userId } });
    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { task } });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch task' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.task.findFirst({ where: { id: params.id, userId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    const body = await request.json();
    const data = updateSchema.parse(body);

    const updated = await prisma.task.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate === null ? null : data.dueDate ? new Date(data.dueDate) : undefined,
        completedAt: data.status === 'done' ? new Date() : data.status ? null : undefined
      }
    });

    return NextResponse.json({ success: true, data: { task: updated } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors.map((e) => e.message).join(', ') }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.task.findFirst({ where: { id: params.id, userId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    await prisma.task.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, data: { success: true } });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete task' }, { status: 500 });
  }
}

export default GET;
