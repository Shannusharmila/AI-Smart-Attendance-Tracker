import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const teacher = await db.teacher.findUnique({ where: { userId } });
  if (!teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });

  const classList: string[] = JSON.parse(teacher.classes || '[]');

  // Total students across teacher's classes
  const students = await db.student.findMany({ where: { className: { in: classList } } });
  const totalStudents = students.length;

  // Today's attendance
  const today = new Date().toISOString().slice(0, 10);
  const todaySessions = await db.attendanceSession.findMany({
    where: { teacherId: teacher.id, date: today },
  });
  const todayRecords: Awaited<ReturnType<typeof db.attendanceRecord.findMany>> = [];
  for (const s of todaySessions) {
    const recs = await db.attendanceRecord.findMany({ where: { sessionId: s.id } });
    todayRecords.push(...recs);
  }
  const presentToday = todayRecords.filter((r) => r.status === 'PRESENT').length;
  const absentToday = todayRecords.filter((r) => r.status === 'ABSENT').length;
  const totalToday = todayRecords.length;
  const attendancePct = totalToday > 0 ? Math.round((presentToday / totalToday) * 1000) / 10 : 0;

  // Pending sessions = classes for today that don't have a session yet
  // We'll just compute "pendingClasses" as the count of teacher's classes (since teacher can take attendance any time)
  // For the prototype, we treat "today's classes minus today's sessions" as pending.
  const pendingCount = Math.max(0, classList.length - todaySessions.length);

  // Recent attendance records (latest 5 sessions)
  const recentSessions = await db.attendanceSession.findMany({
    where: { teacherId: teacher.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  const recent = [];
  for (const s of recentSessions) {
    recent.push({
      id: s.id,
      className: s.className,
      subjectName: s.subjectName,
      date: s.date,
      period: s.period,
      presentCount: s.presentCount,
      absentCount: s.absentCount,
      totalStudents: s.totalStudents,
      method: s.method,
    });
  }

  // 7-day attendance trend
  const trend: { date: string; present: number; absent: number; percentage: number }[] = [];
  for (let d = 6; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().slice(0, 10);
    const sessions = await db.attendanceSession.findMany({
      where: { teacherId: teacher.id, date: dateStr },
    });
    let p = 0, a = 0;
    for (const s of sessions) { p += s.presentCount; a += s.absentCount; }
    const total = p + a;
    trend.push({
      date: dateStr,
      present: p,
      absent: a,
      percentage: total > 0 ? Math.round((p / total) * 1000) / 10 : 0,
    });
  }

  return NextResponse.json({
    teacher: {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      subject: teacher.subject,
      classes: classList,
    },
    stats: {
      totalStudents,
      presentToday,
      absentToday,
      attendancePct,
      pendingCount,
    },
    recent,
    trend,
  });
}
