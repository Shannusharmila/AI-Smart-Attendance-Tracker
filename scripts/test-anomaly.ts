// Quick debug script for anomaly query
import { db } from '../src/lib/db';

async function test() {
  try {
    const anomalies = await db.anomaly.findMany({ orderBy: { createdAt: 'desc' as any }, take: 10 });
    console.log('Anomalies:', anomalies);
  } catch (e: any) {
    console.error('Error:', e.message);
    console.error('Code:', e.code);
    console.error('Meta:', JSON.stringify(e.meta));
  }
  process.exit(0);
}
test();
