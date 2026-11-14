import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== 'STUDENT') return NextResponse.json({ error: 'Student not found' }, { status: 404 });

  const studentId = user.linkedId;
  if (!studentId) return NextResponse.json({ error: 'Student record not linked' }, { status: 404 });

  const student = await db.student.findUnique({ where: { id: studentId } });
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
  let todayAttendanceRecords: any[] = [];
  if (todaySessions.length > 0) {
    for (const s of todaySessions) {
      const rec = await db.attendanceRecord.findFirst({
        where: { sessionId: s.id, studentId: student.id },
      });
      if (rec) {
        todayAttendanceRecords.push({ subject: s.subjectName, period: s.period, status: rec.status, time: new Date(s.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) });
      }
    }
    if (todayAttendanceRecords.length > 0) {
      const first = todayAttendanceRecords[0];
      todayStatus = first.status;
      todayTime = first.time;
      todayPeriod = first.period;
      todaySubject = first.subject;
    }
  }

  // Recent attendance history
  const allRecords = await db.attendanceRecord.findMany({
    where: { studentId: student.id },
    orderBy: { date: 'desc' },
    take: 30,
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

  // Timetable for the student's class
  const timetable = await db.timetable.findMany({
    where: { className: student.className },
    orderBy: [{ day: 'asc' }, { period: 'asc' }],
  });

  // Exams for the student's class
  const exams = await db.exam.findMany({
    where: { className: student.className },
    orderBy: { date: 'asc' },
  });

  // Today's day name
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const todayDay = dayNames[new Date().getDay()];
  const todayTimetable = timetable.filter((t) => t.day === todayDay);

  return NextResponse.json({
    student: {
      id: student.id,
      name: student.name,
      rollNumber: student.rollNumber,
      class: student.class,
      section: student.section,
      className: student.className,
      parentName: student.parentName,
      attendancePercentage: student.attendancePercentage,
      totalAttended: student.totalAttended,
      totalSessions: student.totalSessions,
    },
    todayAttendance: {
      status: todayStatus,
      time: todayTime,
      period: todayPeriod,
      subject: todaySubject,
      date: today,
      records: todayAttendanceRecords,
    },
    todayTimetable,
    allTimetable: timetable,
    attendanceHistory: allRecords,
    marks,
    holidays,
    notifications,
    exams,
    todayDay,
  });
}
