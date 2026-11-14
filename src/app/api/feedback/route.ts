import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parentId = searchParams.get('parentId');
  const status = searchParams.get('status');

  const where: { parentId?: string; status?: string } = {};
  if (parentId) where.parentId = parentId;
  if (status) where.status = status;

  const feedback = await db.feedback.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(feedback);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { parentId, subject, message, priority } = body;
    if (!parentId || !subject || !message) {
      return NextResponse.json({ error: 'Please complete all required fields' }, { status: 400 });
    }
    const parent = await db.parent.findUnique({ where: { id: parentId }, include: { student: true } });
    if (!parent) return NextResponse.json({ error: 'Parent not found' }, { status: 404 });
    const feedback = await db.feedback.create({
      data: {
        parentId,
        parentName: parent.name,
        studentId: parent.studentId,
        studentName: parent.student?.name || '',
        subject,
        message,
        priority: priority || 'MEDIUM',
        status: 'PENDING',
      },
    });
    // Notify all teachers
    const teachers = await db.teacher.findMany();
    for (const t of teachers) {
      await db.notification.create({
        data: {
          userId: t.userId,
          type: 'FEEDBACK',
          title: 'New Feedback Received',
          message: `${parent.name} submitted feedback: "${subject}"`,
        },
      });
    }
    return NextResponse.json(feedback);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
