import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  // Total students
  const totalStudents = await db.student.count();
  const totalTeachers = await db.teacher.count();
  const totalClasses = await db.subject.groupBy({ by: ['className'] });

  // Today's attendance
  const today = new Date().toISOString().slice(0, 10);
  const todaySessions = await db.attendanceSession.findMany({ where: { date: today } });
  const todayRecords: Awaited<ReturnType<typeof db.attendanceRecord.findMany>> = [];
  for (const s of todaySessions) {
    const recs = await db.attendanceRecord.findMany({ where: { sessionId: s.id } });
    todayRecords.push(...recs);
  }
  const presentToday = todayRecords.filter((r) => r.status === 'PRESENT').length;
  const absentToday = todayRecords.filter((r) => r.status === 'ABSENT').length;
  const totalToday = todayRecords.length;
  const todayPct = totalToday > 0 ? Math.round((presentToday / totalToday) * 1000) / 10 : 0;

  // Average attendance across all students
  const allStudents = await db.student.findMany();
  const avgPct = allStudents.length > 0
    ? Math.round((allStudents.reduce((sum, s) => sum + s.attendancePercentage, 0) / allStudents.length) * 10) / 10
    : 0;

  // Low attendance students (< 75%)
  const lowAttendanceStudents = await db.student.findMany({
    where: { attendancePercentage: { lt: 75 } },
    orderBy: { attendancePercentage: 'asc' },
  });

  // Attendance by class
  const classes = ['CSE-A', 'CSE-B', 'IT-A'];
  const byClass: { className: string; present: number; absent: number; percentage: number; totalStudents: number }[] = [];
  for (const c of classes) {
    const sessions = await db.attendanceSession.findMany({ where: { className: c } });
    let p = 0, a = 0;
    for (const s of sessions) { p += s.presentCount; a += s.absentCount; }
    const total = p + a;
    byClass.push({
      className: c,
      present: p,
      absent: a,
      percentage: total > 0 ? Math.round((p / total) * 1000) / 10 : 0,
      totalStudents: await db.student.count({ where: { className: c } }),
    });
  }

  // Weekly trend (last 7 days)
  const trend: { date: string; present: number; absent: number; percentage: number }[] = [];
  for (let d = 6; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().slice(0, 10);
    const sessions = await db.attendanceSession.findMany({ where: { date: dateStr } });
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

  // Anomalies
  const anomalies = await db.anomaly.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });

  // Total feedback
  const totalFeedback = await db.feedback.count();
  const pendingFeedback = await db.feedback.count({ where: { status: 'PENDING' } });

  return NextResponse.json({
    stats: {
      totalStudents,
      totalTeachers,
      totalClasses: totalClasses.length,
      presentToday,
      absentToday,
      todayPct,
      avgPct,
      lowAttendanceCount: lowAttendanceStudents.length,
      totalFeedback,
      pendingFeedback,
    },
    byClass,
    trend,
    lowAttendanceStudents: lowAttendanceStudents.map((s) => ({
      id: s.id,
      name: s.name,
      rollNumber: s.rollNumber,
      className: s.className,
      attendancePercentage: s.attendancePercentage,
      parentName: s.parentName,
      parentPhone: s.parentPhone,
    })),
    anomalies: anomalies.map((a) => ({
      id: a.id,
      sessionId: a.sessionId,
      studentId: a.studentId,
      reason: a.reason,
      severity: a.severity,
      resolved: a.resolved,
      createdAt: a.createdAt,
    })),
  });
}
