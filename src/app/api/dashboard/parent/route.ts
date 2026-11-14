import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const parent = await db.parent.findUnique({ where: { userId } });
  if (!parent) return NextResponse.json({ error: 'Parent not found' }, { status: 404 });

  const student = await db.student.findUnique({ where: { id: parent.studentId } });
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

  // Today's attendance
  const today = new Date().toISOString().slice(0, 10);
  const todaySessions = await db.attendanceSession.findMany({
    where: { className: student.className, date: today },
  });
  let todayStatus: 'PRESENT' | 'ABSENT' | 'NOT_RECORDED' = 'NOT_RECORDED';
  let todayTime: string | null = null;
  let todayPeriod: number | null = null;
  let todaySubject: string | null = null;
  if (todaySessions.length > 0) {
    for (const s of todaySessions) {
      const rec = await db.attendanceRecord.findFirst({
        where: { sessionId: s.id, studentId: student.id },
      });
      if (rec) {
        todayStatus = rec.status as 'PRESENT' | 'ABSENT';
        todayTime = new Date(s.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        todayPeriod = s.period;
        todaySubject = s.subjectName;
        break;
      }
    }
  }

  // Recent attendance history (last 14)
  const allRecords = await db.attendanceRecord.findMany({
    where: { studentId: student.id },
    orderBy: { date: 'desc' },
    take: 14,
  });

  // Marks
  const marks = await db.mark.findMany({
    where: { studentId: student.id },
    orderBy: { examDate: 'desc' },
  });

  // Holidays
  const holidays = await db.holiday.findMany({ orderBy: { date: 'asc' } });

  // Notifications
  const notifications = await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    parent: { id: parent.id, name: parent.name, email: parent.email, phone: parent.phone },
    student: {
      id: student.id,
      name: student.name,
      rollNumber: student.rollNumber,
      class: student.class,
      section: student.section,
      className: student.className,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      attendancePercentage: student.attendancePercentage,
      totalAttended: student.totalAttended,
      totalSessions: student.totalSessions,
    },
    todayAttendance: { status: todayStatus, time: todayTime, period: todayPeriod, subject: todaySubject, date: today },
    attendanceHistory: allRecords,
    marks,
    holidays,
    notifications,
  });
}
