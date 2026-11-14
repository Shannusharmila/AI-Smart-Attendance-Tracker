'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/badges';
import { StatusBadge } from '@/components/shared/badges';
import { format, parseISO, isSameDay } from 'date-fns';
import { CalendarDays, CheckCircle2, XCircle } from 'lucide-react';

export function ParentAttendance({ data }: { data: any }) {
  const { student, attendanceHistory } = data;

  // Build a calendar map of last 30 days
  const today = new Date();
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const record = (attendanceHistory || []).find((r: any) => r.date === dateStr);
    days.push({ date: d, dateStr, status: record?.status });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Attendance</h1>

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
                    <span className="text-[8px]">
                      {d.status === 'PRESENT' ? 'P' : 'A'}
                    </span>
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

      {/* History */}
      <Card className="card-shadow border-slate-200/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent History</CardTitle>
        </CardHeader>
        <CardContent>
          {!attendanceHistory || attendanceHistory.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No attendance history" description="Records will appear once attendance is taken." />
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto scrollbar-thin">
              {attendanceHistory.slice(0, 14).map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3">
                    {r.status === 'PRESENT' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-900">{format(parseISO(r.date), 'dd MMM yyyy')}</p>
                      <p className="text-[10px] text-slate-500">{r.method} · {r.className} · Period {r.sessionId ? '' : ''}{r.confidence ? `${r.confidence.toFixed(1)}%` : ''}</p>
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
