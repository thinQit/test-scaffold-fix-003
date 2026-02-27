import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';
import { Prisma } from '@prisma/client';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 400 });
    }

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: { email: data.email, name: data.name, passwordHash }
    });

    const token = signToken(user.id);
    return NextResponse.json(
      {
        success: true,
        data: { user: { id: user.id, email: user.email, name: user.name }, token }
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors.map((e) => e.message).join(', ') }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Registration failed' }, { status: 500 });
  }
}

export default POST;
