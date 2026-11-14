import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const className = searchParams.get('className');
  const studentId = searchParams.get('studentId');
  const subject = searchParams.get('subject');

  const sessionWhere: { date?: string; className?: string; subjectName?: string } = {};
  if (date) sessionWhere.date = date;
  if (className) sessionWhere.className = className;
  if (subject) sessionWhere.subjectName = subject;

  const sessions = await db.attendanceSession.findMany({
    where: sessionWhere,
    orderBy: { createdAt: 'desc' },
  });

  let records: Awaited<ReturnType<typeof db.attendanceRecord.findMany>> = [];
  for (const s of sessions) {
    const recs = await db.attendanceRecord.findMany({
      where: { sessionId: s.id, studentId: studentId || undefined },
    });
    records.push(...recs);
  }

  // If no sessions but studentId filter, return all records for that student
  if (studentId && sessions.length === 0) {
    records = await db.attendanceRecord.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
      take: 100,
    });
  }

  // Sort by date desc
  records.sort((a, b) => (a.date < b.date ? 1 : -1));

  return NextResponse.json({ sessions, records });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      className,
      section,
      subjectId,
      subjectName,
      date,
      period,
      teacherId,
      gpsVerified,
      gpsDistance,
      method,
      records,
    } = body;

    if (!className || !date || !teacherId || !records || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Please complete all required fields' }, { status: 400 });
    }

    const periodNum = Number(period);
    if (isNaN(periodNum)) {
      return NextResponse.json({ error: 'Period must be a number' }, { status: 400 });
    }

    // Check for duplicate session
    const existing = await db.attendanceSession.findFirst({
      where: { className, date, period: periodNum, subjectName },
    });
    if (existing) {
      return NextResponse.json({ error: 'Attendance has already been recorded for this period' }, { status: 409 });
    }

    const present = records.filter((r: { status: string }) => r.status === 'PRESENT').length;
    const absent = records.filter((r: { status: string }) => r.status === 'ABSENT').length;

    const session = await db.attendanceSession.create({
      data: {
        className,
        section,
        subjectId: subjectId || null,
        subjectName: subjectName || 'General',
        date,
        period: periodNum,
        teacherId,
        totalStudents: records.length,
        presentCount: present,
        absentCount: absent,
        gpsVerified: Boolean(gpsVerified),
        gpsDistance: gpsDistance || null,
        method: method || 'AI',
      },
    });

    // Create records
    for (const r of records) {
      await db.attendanceRecord.create({
        data: {
          sessionId: session.id,
          studentId: r.studentId,
          studentName: r.studentName,
          rollNumber: r.rollNumber,
          status: r.status,
          method: r.method || 'AI',
          confidence: r.confidence || null,
          manuallyModified: r.manuallyModified || false,
          anomalyFlag: r.anomalyFlag || false,
          anomalyReason: r.anomalyReason || null,
          date,
          className,
        },
      });

      // Update student attendance stats
      const student = await db.student.findUnique({ where: { id: r.studentId } });
      if (student) {
        const newTotalSessions = student.totalSessions + 1;
        const newTotalAttended = r.status === 'PRESENT' ? student.totalAttended + 1 : student.totalAttended;
        const newPct = Math.round((newTotalAttended / newTotalSessions) * 1000) / 10;
        await db.student.update({
          where: { id: student.id },
          data: {
            totalSessions: newTotalSessions,
            totalAttended: newTotalAttended,
            attendancePercentage: newPct,
          },
        });
      }
    }

    // Create notifications for all parents of students in this class
    const parents = await db.parent.findMany({
      where: { student: { className } },
      include: { student: true },
    });
    for (const r of records) {
      const parent = parents.find((p) => p.studentId === r.studentId);
      if (parent) {
        await db.notification.create({
          data: {
            userId: parent.userId,
            type: 'ATTENDANCE',
            title: 'Attendance Update',
            message: `${r.studentName} was marked ${r.status} on ${date}.`,
          },
        });
      }
    }

    // If any anomalyFlag records, create Anomaly entries
    for (const r of records) {
      if (r.anomalyFlag) {
        await db.anomaly.create({
          data: {
            sessionId: session.id,
            studentId: r.studentId,
            reason: r.anomalyReason || 'Anomaly detected during attendance',
            severity: 'MEDIUM',
            resolved: false,
          },
        });
      }
    }

    return NextResponse.json({ ok: true, sessionId: session.id });
  } catch (e) {
    console.error('Attendance save error:', e);
    return NextResponse.json({ error: 'Failed to save attendance' }, { status: 500 });
  }
}
