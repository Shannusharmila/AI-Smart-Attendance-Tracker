import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const className = searchParams.get('className');
  const search = searchParams.get('search');

  const where: { className?: string; name?: { contains: string } } = {};
  if (className) where.className = className;
  if (search) where.name = { contains: search };

  const students = await db.student.findMany({
    where,
    orderBy: [{ className: 'asc' }, { rollNumber: 'asc' }],
  });
  return NextResponse.json(students);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, rollNumber, class: cls, section, parentName, parentPhone } = body;
    if (!name || !rollNumber || !cls || !section || !parentName) {
      return NextResponse.json({ error: 'Please complete all required fields' }, { status: 400 });
    }
    const className = `${cls}-${section}`;
    const existing = await db.student.findFirst({ where: { className, rollNumber } });
    if (existing) {
      return NextResponse.json({ error: 'A student with this roll number already exists in this class' }, { status: 409 });
    }
    const student = await db.student.create({
      data: {
        name,
        rollNumber,
        class: cls,
        section,
        className,
        parentName,
        parentPhone: parentPhone || null,
      },
    });
    return NextResponse.json(student);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to add student' }, { status: 500 });
  }
}
