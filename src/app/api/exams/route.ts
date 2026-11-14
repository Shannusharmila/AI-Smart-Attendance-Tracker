import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const className = searchParams.get('className');
  const where: { className?: string } = {};
  if (className) where.className = className;
  const exams = await db.exam.findMany({
    where,
    orderBy: { date: 'asc' },
  });
  return NextResponse.json(exams);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { examName, subjectName, className, date, startTime, endTime, room, maxMarks, syllabus } = body;
    if (!examName || !subjectName || !className || !date || !startTime || !endTime) {
      return NextResponse.json({ error: 'Please complete all required fields' }, { status: 400 });
    }
    const exam = await db.exam.create({
      data: {
        examName,
        subjectName,
        className,
        date,
        startTime,
        endTime,
        room: room || null,
        maxMarks: Number(maxMarks) || 100,
        syllabus: syllabus || null,
      },
    });

    // Notify all student users in this class
    const studentsInClass = await db.student.findMany({ where: { className } });
    for (const s of studentsInClass) {
      const studentUser = await db.user.findFirst({ where: { linkedId: s.id, role: 'STUDENT' } });
      if (studentUser) {
        await db.notification.create({
          data: {
            userId: studentUser.id,
            type: 'ALERT',
            title: 'New Exam Scheduled',
            message: `${examName} — ${subjectName} on ${date} (${startTime}-${endTime}) in ${room || 'TBD'}.`,
          },
        });
      }
      // Also notify parent users
      const parents = await db.parent.findMany({ where: { studentId: s.id } });
      for (const p of parents) {
        await db.notification.create({
          data: {
            userId: p.userId,
            type: 'ALERT',
            title: 'New Exam Scheduled',
            message: `${examName} — ${subjectName} for ${s.name} on ${date} (${startTime}-${endTime}).`,
          },
        });
      }
    }

    return NextResponse.json(exam);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to add exam' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  try {
    await db.exam.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
