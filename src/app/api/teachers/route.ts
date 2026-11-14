import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const teachers = await db.teacher.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(teachers.map((t) => ({
    id: t.id,
    userId: t.userId,
    name: t.name,
    email: t.email,
    phone: t.phone,
    subject: t.subject,
    classes: JSON.parse(t.classes || '[]'),
  })));
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, subject, classes } = await req.json();
    if (!name || !email || !subject || !Array.isArray(classes)) {
      return NextResponse.json({ error: 'Please complete all required fields' }, { status: 400 });
    }
    // Create user with default password
    const user = await db.user.create({
      data: {
        email,
        password: 'teacher123',
        name,
        role: 'TEACHER',
        phone,
      },
    });
    const teacher = await db.teacher.create({
      data: {
        userId: user.id,
        name,
        email,
        phone,
        subject,
        classes: JSON.stringify(classes),
      },
    });
    await db.user.update({ where: { id: user.id }, data: { linkedId: teacher.id } });
    return NextResponse.json(teacher);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to add teacher' }, { status: 500 });
  }
}
