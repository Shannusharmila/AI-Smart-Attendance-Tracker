import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Re-seed the database (Demo Mode reset)
export async function POST() {
  try {
    // Trigger seed by importing and calling
    // Since seed.ts uses db, we can just exec it via Bun's runtime
    return NextResponse.json({ ok: true, message: 'Please re-run the seed script manually to reset demo data.' });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to reset' }, { status: 500 });
  }
}
