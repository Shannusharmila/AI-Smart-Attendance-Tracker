import { NextRequest, NextResponse } from 'next/server';

// Simulated GPS verification — DEMO MODE
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const fail = body?.fail === true;

    if (fail) {
      return NextResponse.json({
        verified: false,
        schoolName: 'Seshadri Rao Gudlavalleru Engineering College / Demo School',
        distance: 1520, // 1.5km — out of radius
        radius: 200,
        status: 'Location verification failed. Attendance cannot be automatically submitted.',
        demoMode: true,
      });
    }
    return NextResponse.json({
      verified: true,
      schoolName: 'Seshadri Rao Gudlavalleru Engineering College / Demo School',
      distance: 35,
      radius: 200,
      status: 'Student attendance can be recorded.',
      demoMode: true,
    });
  } catch (e) {
    return NextResponse.json({ error: 'GPS verification failed' }, { status: 500 });
  }
}
