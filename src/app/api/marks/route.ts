import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');
  if (!studentId) return NextResponse.json({ error: 'studentId required' }, { status: 400 });
  const marks = await db.mark.findMany({
    where: { studentId },
    orderBy: { examDate: 'desc' },
  });
  return NextResponse.json(marks);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, subjectName, examName, maxMarks, obtainedMarks, examDate } = body;
    if (!studentId || !subjectName || !examName || !maxMarks || obtainedMarks === undefined) {
      return NextResponse.json({ error: 'Please complete all required fields' }, { status: 400 });
    }
    if (obtainedMarks > maxMarks) {
      return NextResponse.json({ error: 'Obtained marks cannot exceed maximum marks' }, { status: 400 });
    }
    const percentage = Math.round((obtainedMarks / maxMarks) * 1000) / 10;
    const today = new Date().toISOString().slice(0, 10);
    const mark = await db.mark.create({
      data: {
        studentId,
        subjectName,
        examName,
        maxMarks: Number(maxMarks),
        obtainedMarks: Number(obtainedMarks),
        percentage,
        examDate: examDate || today,
      },
    });
    // Notify parent
    const parent = await db.parent.findUnique({ where: { studentId }, include: { student: true } });
    if (parent) {
      await db.notification.create({
        data: {
          userId: parent.userId,
          type: 'MARKS',
          title: 'Marks Published',
          message: `${parent.student?.name || 'Your child'} scored ${obtainedMarks}/${maxMarks} in ${subjectName} (${examName}).`,
        },
      });
    }
    return NextResponse.json(mark);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save marks' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, studentId, subjectName, examName, maxMarks, obtainedMarks, examDate } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    if (obtainedMarks > maxMarks) {
      return NextResponse.json({ error: 'Obtained marks cannot exceed maximum marks' }, { status: 400 });
    }
    const percentage = Math.round((obtainedMarks / maxMarks) * 1000) / 10;
    const mark = await db.mark.update({
      where: { id },
      data: {
        studentId,
        subjectName,
        examName,
        maxMarks: Number(maxMarks),
        obtainedMarks: Number(obtainedMarks),
        percentage,
        examDate,
      },
    });
    return NextResponse.json(mark);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update marks' }, { status: 500 });
  }
}
