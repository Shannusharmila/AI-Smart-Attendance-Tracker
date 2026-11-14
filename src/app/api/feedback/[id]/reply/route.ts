import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { teacherReply, repliedBy, resolved } = body;
    if (!teacherReply) {
      return NextResponse.json({ error: 'Reply message is required' }, { status: 400 });
    }
    const feedback = await db.feedback.update({
      where: { id },
      data: {
        teacherReply,
        repliedAt: new Date(),
        repliedBy: repliedBy || null,
        status: resolved ? 'RESOLVED' : 'REPLIED',
      },
    });
    // Notify the parent
    await db.notification.create({
      data: {
        userId: (await db.parent.findUnique({ where: { id: feedback.parentId } }))?.userId || '',
        type: 'FEEDBACK',
        title: 'Feedback Reply Received',
        message: `Teacher replied to your feedback: "${feedback.subject}"`,
      },
    });
    return NextResponse.json(feedback);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to reply to feedback' }, { status: 500 });
  }
}
