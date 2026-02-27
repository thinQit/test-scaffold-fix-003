import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getBearerToken, verifyToken } from '@/lib/auth';

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional()
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

    const params = request.nextUrl.searchParams;
    const page = Number(params.get('page') || '1');
    const pageSize = Number(params.get('pageSize') || '10');
    const status = params.get('status');
    const priority = params.get('priority');
    const dueBefore = params.get('dueBefore');
    const dueAfter = params.get('dueAfter');
    const sortBy = params.get('sortBy') || 'createdAt';
    const sortOrder = params.get('sortOrder') || 'desc';

    const where: {
      userId: string;
      status?: string;
      priority?: string;
      dueDate?: { lte?: Date; gte?: Date };
    } = { userId };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (dueBefore || dueAfter) {
      where.dueDate = {};
      if (dueBefore) where.dueDate.lte = new Date(dueBefore);
      if (dueAfter) where.dueDate.gte = new Date(dueAfter);
    }

    const [total, tasks] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        tasks,
        meta: { total, page, pageSize }
      }
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch tasks' }, { status: 500 });
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

    const task = await prisma.task.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        status: data.status ?? 'todo',
        priority: data.priority ?? 'medium',
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        completedAt: data.status === 'done' ? new Date() : undefined
      }
    });

    return NextResponse.json({ success: true, data: { task } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors.map((e) => e.message).join(', ') }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create task' }, { status: 500 });
  }
}

export default GET;
