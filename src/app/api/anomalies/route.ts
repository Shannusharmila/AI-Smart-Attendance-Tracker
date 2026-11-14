import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const anomalies = await db.anomaly.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  // Also include anomaly-flagged attendance records
  const flaggedRecords = await db.attendanceRecord.findMany({
    where: { anomalyFlag: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json({ anomalies, flaggedRecords });
}
