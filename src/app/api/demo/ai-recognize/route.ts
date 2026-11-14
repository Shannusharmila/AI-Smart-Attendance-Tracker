import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Simulated AI face recognition — DEMO MODE
// Takes a list of student IDs and returns simulated recognition results.
export async function POST(req: NextRequest) {
  try {
    const { studentIds } = await req.json();
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: 'No students selected' }, { status: 400 });
    }
    const students = await db.student.findMany({ where: { id: { in: studentIds } } });

    // Deterministic simulation: 90% recognized with confidence 88-99, 10% not recognized
    // Use a hash of student id to make it deterministic but varied per student
    const results = students.map((s, idx) => {
      const hash = s.id.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
      const recognized = (hash + idx) % 10 !== 0; // ~90% recognized
      const confidence = recognized
        ? 88 + ((hash + idx) % 12) // 88-99
        : 30 + ((hash + idx) % 30); // 30-59 for unrecognized
      const status = recognized ? 'PRESENT' : 'ABSENT';
      return {
        studentId: s.id,
        studentName: s.name,
        rollNumber: s.rollNumber,
        recognized,
        confidence: Math.min(99, Math.max(30, confidence)),
        status,
      };
    });

    const detected = results.length;
    const recognized = results.filter((r) => r.recognized).length;
    const notRecognized = detected - recognized;

    return NextResponse.json({
      detected,
      recognized,
      notRecognized,
      results,
      demoMode: true,
    });
  } catch (e) {
    return NextResponse.json({ error: 'AI recognition failed' }, { status: 500 });
  }
}
