import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await db.student.findUnique({ where: { id } });
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  const records = await db.attendanceRecord.findMany({
    where: { studentId: id },
    orderBy: { date: 'desc' },
    take: 30,
  });
  const marks = await db.mark.findMany({
    where: { studentId: id },
    orderBy: { examDate: 'desc' },
  });
  return NextResponse.json({ student, attendanceHistory: records, marks });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { name, rollNumber, class: cls, section, parentName, parentPhone } = body;
    const className = `${cls}-${section}`;
    const student = await db.student.update({
      where: { id },
      data: { name, rollNumber, class: cls, section, className, parentName, parentPhone },
    });
    return NextResponse.json(student);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await db.student.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
