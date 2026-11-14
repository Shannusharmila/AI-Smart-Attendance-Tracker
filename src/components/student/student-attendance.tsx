'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState, StatusBadge } from '@/components/shared/badges';
import { format, parseISO, isSameDay } from 'date-fns';
import { CalendarDays, CheckCircle2, XCircle } from 'lucide-react';

export function StudentAttendance({ data }: { data: any }) {
  const { student, attendanceHistory } = data;

  // Build a calendar map of last 30 days
  const today = new Date();
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const records = (attendanceHistory || []).filter((r: any) => r.date === dateStr);
    days.push({
      date: d,
      dateStr,
      status: records.length > 0 ? records[0].status : null,
      multiple: records.length > 1 ? records.length : null,
    });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Attendance</h1>

      <Card className="card-shadow border-slate-200/80">
        <CardContent className="pt-5 pb-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-emerald-700">{student.totalAttended}</p>
              <p className="text-xs text-slate-500">Present</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-rose-700">{student.totalSessions - student.totalAttended}</p>
              <p className="text-xs text-slate-500">Absent</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${student.attendancePercentage >= 75 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {student.attendancePercentage.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500">Overall</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card className="card-shadow border-slate-200/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-emerald-600" /> Last 30 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((d, i) => {
              let bgClass = 'bg-slate-50 text-slate-400';
              if (d.status === 'PRESENT') bgClass = 'bg-emerald-500 text-white';
              else if (d.status === 'ABSENT') bgClass = 'bg-rose-500 text-white';
              else if (isSameDay(d.date, today)) bgClass = 'bg-amber-100 text-amber-700 border-2 border-amber-300';
              return (
                <div
                  key={i}
                  className={`h-10 rounded-lg flex flex-col items-center justify-center text-[10px] font-medium ${bgClass}`}
                  title={`${format(d.date, 'dd MMM')}: ${d.status || 'No record'}`}
                >
                  <span>{format(d.date, 'd')}</span>
                  {d.status && (
                    <span className="text-[8px]">{d.status === 'PRESENT' ? 'P' : 'A'}</span>
                  )}
                  {d.multiple && d.multiple > 1 && (
                    <span className="text-[8px] absolute mt-7 text-[8px] px-1 rounded-full bg-slate-800 text-white">×{d.multiple}</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-emerald-500" /> Present</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-rose-500" /> Absent</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-slate-100" /> No record</span>
          </div>
        </CardContent>
      </Card>

      {/* Subject-wise */}
      <Card className="card-shadow border-slate-200/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Subject-wise Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const bySubject: Record<string, { present: number; total: number }> = {};
            (attendanceHistory || []).forEach((r: any) => {
              const subj = (r as any).subjectName || 'General';
              if (!bySubject[subj]) bySubject[subj] = { present: 0, total: 0 };
              bySubject[subj].total++;
              if ((r as any).status === 'PRESENT') bySubject[subj].present++;
            });
            const subjects = Object.keys(bySubject);
            if (subjects.length === 0) {
              return <EmptyState icon={CalendarDays} title="No attendance yet" />;
            }
            return (
              <div className="space-y-2">
                {subjects.map((subj) => {
                  const s = bySubject[subj];
                  const pct = s.total > 0 ? Math.round((s.present / s.total) * 1000) / 10 : 0;
                  return (
                    <div key={subj} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-medium text-slate-900">{subj}</p>
                        <span className={`text-sm font-semibold ${pct >= 75 ? 'text-emerald-700' : 'text-rose-700'}`}>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full ${pct >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">{s.present}/{s.total} classes attended</p>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* History */}
      <Card className="card-shadow border-slate-200/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent History</CardTitle>
        </CardHeader>
        <CardContent>
          {!attendanceHistory || attendanceHistory.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No attendance history" />
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto scrollbar-thin">
              {(attendanceHistory || []).slice(0, 14).map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3">
                    {r.status === 'PRESENT' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-900">{format(parseISO(r.date), 'dd MMM yyyy')}</p>
                      <p className="text-[10px] text-slate-500">{r.method} · {r.className}</p>
                    </div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
