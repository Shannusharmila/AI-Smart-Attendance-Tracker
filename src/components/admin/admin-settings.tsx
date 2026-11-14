'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { AlertCircle, Save, RefreshCw, Settings as SettingsIcon, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_LOW_ATTENDANCE_THRESHOLD, SCHOOL_NAME } from '@/lib/constants';

export function AdminSettings() {
  const [schoolName, setSchoolName] = useState(SCHOOL_NAME);
  const [threshold, setThreshold] = useState(DEFAULT_LOW_ATTENDANCE_THRESHOLD);
  const [resetting, setResetting] = useState(false);

  function save() {
    toast.success('Settings saved');
  }

  async function resetDemo() {
    if (!confirm('This will re-seed the database. Continue?')) return;
    setResetting(true);
    try {
      // Call the seed script via API
      const res = await fetch('/api/seed', { method: 'POST' });
      toast.info('Demo data reset. Please re-run the seed script from terminal: bun run scripts/seed.ts');
    } catch {
      toast.error('Failed to reset');
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Settings</h1>

      <Card className="card-shadow border-slate-200/80">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><SettingsIcon className="h-4 w-4 text-emerald-600" /> School Information</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">School Name</Label>
            <Input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="mt-1" />
          </div>
        </CardContent>
      </Card>

      <Card className="card-shadow border-rose-200/80">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-rose-600" /> Low Attendance Threshold</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">Threshold (%)</Label>
              <span className="text-sm font-bold text-rose-700">{threshold}%</span>
            </div>
            <Slider value={[threshold]} onValueChange={(v) => setThreshold(v[0])} min={50} max={90} step={5} />
            <p className="text-xs text-slate-500 mt-2">Students with attendance below this percentage will be flagged for alerts.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="card-shadow border-slate-200/80">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><AlertCircle className="h-4 w-4 text-amber-600" /> Demo Mode</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-3">
            This prototype runs in Demo Mode. AI face recognition and GPS verification are simulated.
            To reset the demo data, run the seed script from the terminal:
          </p>
          <code className="block bg-slate-900 text-emerald-400 px-3 py-2 rounded-lg text-xs font-mono mb-3">bun run scripts/seed.ts</code>
          <Button onClick={resetDemo} disabled={resetting} variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
            <RefreshCw className={`h-4 w-4 ${resetting ? 'animate-spin' : ''}`} /> Reset Demo Data
          </Button>
        </CardContent>
      </Card>

      <Button onClick={save} className="bg-emerald-600 hover:bg-emerald-700 text-white h-11 w-full sm:w-auto">
        <Save className="h-4 w-4" /> Save Settings
      </Button>
    </div>
  );
}
