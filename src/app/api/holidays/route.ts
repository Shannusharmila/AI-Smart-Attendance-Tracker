import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const holidays = await db.holiday.findMany({ orderBy: { date: 'asc' } });
  return NextResponse.json(holidays);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, date, description, createdBy } = body;
    if (!name || !date || !description) {
      return NextResponse.json({ error: 'Please complete all required fields' }, { status: 400 });
    }
    const holiday = await db.holiday.create({
      data: { name, date, description, createdBy: createdBy || null },
    });

    // Notify all parent users
    const parents = await db.parent.findMany();
    for (const p of parents) {
      await db.notification.create({
        data: {
          userId: p.userId,
          type: 'HOLIDAY',
          title: 'New Holiday Notification',
          message: `${name} — ${date}. ${description}`,
        },
      });
    }
    return NextResponse.json(holiday);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to add holiday' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  try {
    await db.holiday.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete holiday' }, { status: 500 });
  }
}
