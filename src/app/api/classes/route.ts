import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const subjects = await db.subject.groupBy({ by: ['className'] });
  const classes: { className: string; totalStudents: number; totalTeachers: number; avgAttendance: number }[] = [];
  for (const c of subjects) {
    const studentCount = await db.student.count({ where: { className: c.className } });
    const teachersForClass = await db.teacher.findMany({
      where: { classes: { contains: c.className } },
    });
    const studentsInClass = await db.student.findMany({ where: { className: c.className } });
    const avgAtt = studentsInClass.length > 0
      ? Math.round((studentsInClass.reduce((sum, s) => sum + s.attendancePercentage, 0) / studentsInClass.length) * 10) / 10
      : 0;
    classes.push({
      className: c.className,
      totalStudents: studentCount,
      totalTeachers: teachersForClass.length,
      avgAttendance: avgAtt,
    });
  }
  return NextResponse.json(classes);
}
