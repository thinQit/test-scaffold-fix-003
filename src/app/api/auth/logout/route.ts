import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ success: true, data: { success: true } });
}

export default POST;
