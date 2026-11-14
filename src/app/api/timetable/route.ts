import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const className = searchParams.get('className');
  const where: { className?: string } = {};
  if (className) where.className = className;
  const timetables = await db.timetable.findMany({
    where,
    orderBy: [{ day: 'asc' }, { period: 'asc' }],
  });
  return NextResponse.json(timetables);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { className, day, period, subjectName, teacherName, startTime, endTime, room } = body;
    if (!className || !day || !period || !subjectName || !startTime || !endTime) {
      return NextResponse.json({ error: 'Please complete all required fields' }, { status: 400 });
    }
    // Check for duplicate
    const existing = await db.timetable.findFirst({ where: { className, day, period: Number(period) } });
    if (existing) {
      return NextResponse.json({ error: 'A class already exists for this day/period' }, { status: 409 });
    }
    const tt = await db.timetable.create({
      data: {
        className,
        day,
        period: Number(period),
        subjectName,
        teacherName,
        startTime,
        endTime,
        room: room || null,
      },
    });
    return NextResponse.json(tt);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to add timetable entry' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  try {
    await db.timetable.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
