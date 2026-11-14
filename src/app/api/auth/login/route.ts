import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { User } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();
    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Please provide email, password and role' }, { status: 400 });
    }
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    if (user.role !== role) {
      return NextResponse.json({ error: `This account is not a ${role.toLowerCase()} account` }, { status: 403 });
    }
    let studentId: string | null = null;
    if (user.role === 'PARENT') {
      const parent = await db.parent.findUnique({ where: { userId: user.id } });
      if (parent) studentId = parent.studentId;
    }
    if (user.role === 'STUDENT') {
      // For student role, linkedId is the Student record id
      studentId = user.linkedId || null;
    }
    const safeUser: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as User['role'],
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      linkedId: user.linkedId,
      studentId,
    };
    return NextResponse.json({ user: safeUser });
  } catch (e) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
