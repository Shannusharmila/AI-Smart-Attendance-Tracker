'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/badges';
import { AvatarWithInitials } from '@/components/shared/avatar-with-initials';
import { AlertTriangle, ShieldAlert, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function AdminAlerts({ data, refetch }: { data: any; refetch: () => void }) {
  const { anomalies, lowAttendanceStudents } = data;

  async function sendAlert(s: any) {
    try {
      const res = await fetch('/api/alerts/low-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: s.id }),
      });
      if (res.ok) toast.success(`Alert sent to parent of ${s.name}`);
      else toast.error('Failed');
    } catch {
      toast.error('Network error');
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Alerts & Anomalies</h1>

      {/* Low attendance */}
      <Card className="card-shadow border-rose-200/80">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-rose-600" /> Low Attendance Students</CardTitle></CardHeader>
        <CardContent>
          {lowAttendanceStudents.length === 0 ? (
            <EmptyState icon={ShieldAlert} title="No low attendance students" description="All students above 75%." />
          ) : (
            <div className="space-y-2">
              {lowAttendanceStudents.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-rose-50 border border-rose-200">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <AvatarWithInitials name={s.name} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{s.name}</p>
                      <p className="text-xs text-slate-500">Roll #{s.rollNumber} · {s.className}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold text-rose-700">{s.attendancePercentage.toFixed(1)}%</p>
                      <p className="text-[10px] text-rose-500">LOW</p>
                    </div>
                    <Button onClick={() => sendAlert(s)} size="sm" className="h-8 bg-rose-600 hover:bg-rose-700 text-white">
                      <Bell className="h-3.5 w-3.5" /> Alert Parent
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Anomalies */}
      <Card className="card-shadow border-amber-200/80">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" /> Attendance Anomalies</CardTitle></CardHeader>
        <CardContent>
          {anomalies.length === 0 ? (
            <EmptyState icon={AlertTriangle} title="No anomalies" description="No suspicious attendance patterns detected." />
          ) : (
            <div className="space-y-2">
              {anomalies.map((a: any) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">{a.reason}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{format(new Date(a.createdAt), 'dd MMM yyyy, HH:mm')}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    a.severity === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                    a.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>{a.severity}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
