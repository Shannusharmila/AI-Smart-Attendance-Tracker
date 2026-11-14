import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Teacher-specific: list subjects for a given class
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const className = searchParams.get('className');
  const teacherId = searchParams.get('teacherId');
  if (!className) return NextResponse.json({ error: 'className required' }, { status: 400 });
  const subjects = await db.subject.findMany({
    where: { className, ...(teacherId ? { teacherId } : {}) },
  });
  return NextResponse.json(subjects);
}
