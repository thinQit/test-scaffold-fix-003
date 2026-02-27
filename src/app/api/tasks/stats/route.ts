import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getBearerToken, verifyToken } from '@/lib/auth';

function getUserId(request: NextRequest): string | null {
  const token = getBearerToken(request.headers.get('authorization'));
  const payload = token ? verifyToken(token) : null;
  return payload?.sub ?? null;
}

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const counts = await prisma.task.groupBy({
      by: ['status'],
      where: { userId },
      _count: { status: true }
    });

    const byStatus = { todo: 0, in_progress: 0, done: 0 };
    counts.forEach((entry) => {
      if (entry.status === 'todo') byStatus.todo = entry._count.status;
      if (entry.status === 'in_progress') byStatus.in_progress = entry._count.status;
      if (entry.status === 'done') byStatus.done = entry._count.status;
    });

    const now = new Date();
    const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingDue = await prisma.task.findMany({
      where: {
        userId,
        dueDate: { gte: now, lte: inSevenDays },
        status: { not: 'done' }
      },
      orderBy: { dueDate: 'asc' },
      take: 5
    });

    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

    const completedTasks = await prisma.task.findMany({
      where: {
        userId,
        completedAt: { gte: fourWeeksAgo }
      },
      select: { completedAt: true }
    });

    const weekMap = new Map<string, number>();
    completedTasks.forEach((task) => {
      if (!task.completedAt) return;
      const weekStart = startOfWeek(task.completedAt).toISOString();
      weekMap.set(weekStart, (weekMap.get(weekStart) || 0) + 1);
    });

    const completedPerWeek: { weekStart: string; count: number }[] = [];
    for (let i = 3; i >= 0; i -= 1) {
      const weekStartDate = startOfWeek(new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000));
      const key = weekStartDate.toISOString();
      completedPerWeek.push({ weekStart: key, count: weekMap.get(key) || 0 });
    }

    return NextResponse.json({
      success: true,
      data: { byStatus, upcomingDue, completedPerWeek }
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}

export default GET;
