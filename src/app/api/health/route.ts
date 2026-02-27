import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      success: true,
      data: { status: 'ok', uptime: process.uptime(), database: { connected: true } }
    });
  } catch {
    return NextResponse.json(
      { success: true, data: { status: 'ok', uptime: process.uptime(), database: { connected: false } } },
      { status: 200 }
    );
  }
}

export default GET;
