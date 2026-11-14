import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Send low-attendance alert to a student's parent
export async function POST(req: NextRequest) {
  try {
    const { studentId } = await req.json();
    if (!studentId) return NextResponse.json({ error: 'studentId required' }, { status: 400 });
    const student = await db.student.findUnique({ where: { id: studentId } });
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    const parent = await db.parent.findUnique({ where: { studentId } });
    if (!parent) return NextResponse.json({ error: 'Parent not found' }, { status: 404 });
    await db.notification.create({
      data: {
        userId: parent.userId,
        type: 'ALERT',
        title: 'Attendance Alert',
        message: `Your child ${student.name} (${student.className}) has attendance of ${student.attendancePercentage}%, which is below the required 75%. Please contact the class teacher.`,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to send alert' }, { status: 500 });
  }
}
