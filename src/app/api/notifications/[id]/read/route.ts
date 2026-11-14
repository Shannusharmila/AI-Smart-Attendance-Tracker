import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await db.notification.update({ where: { id }, data: { read: true } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
  }
}
