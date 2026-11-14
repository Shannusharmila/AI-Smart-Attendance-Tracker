'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/shared/badges';
import { CalendarDays, Clock, MapPin } from 'lucide-react';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_SHORT: Record<string, string> = {
  MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun'
};

export function StudentTimetable({ data }: { data: any }) {
  const { allTimetable, student, todayDay } = data;
  const [selectedDay, setSelectedDay] = useState<string>(todayDay || 'MONDAY');

  const daySchedule = (allTimetable || []).filter((t: any) => t.day === selectedDay).sort((a: any, b: any) => a.period - b.period);
  const daysWithData = DAYS.filter((d) => (allTimetable || []).some((t: any) => t.day === d));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Timetable</h1>
        <p className="text-sm text-slate-500">{student.className} · Weekly schedule</p>
      </div>

      {/* Day selector */}
      <Card className="card-shadow border-slate-200/80">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-medium text-slate-700">Select day</p>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {daysWithData.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`py-2.5 rounded-lg text-xs font-medium transition ${
                  selectedDay === d
                    ? 'bg-emerald-600 text-white'
                    : d === todayDay
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {DAY_SHORT[d]}
              </button>
            ))}
          </div>
          {selectedDay === todayDay && (
            <p className="text-[10px] text-emerald-600 mt-2 font-medium">Today</p>
          )}
        </CardContent>
      </Card>

      {/* Day schedule */}
      <Card className="card-shadow border-slate-200/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{selectedDay.charAt(0) + selectedDay.slice(1).toLowerCase()} Schedule · {daySchedule.length} class{daySchedule.length !== 1 ? 'es' : ''}</CardTitle>
        </CardHeader>
        <CardContent>
          {daySchedule.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No classes" description="Enjoy your day off!" />
          ) : (
            <div className="space-y-2">
              {daySchedule.map((t: any) => (
                <div key={t.id} className="flex items-stretch gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
                  <div className="flex flex-col items-center justify-center min-w-[64px] bg-emerald-50 rounded-lg p-2">
                    <p className="text-xs font-semibold text-emerald-700">{t.startTime}</p>
                    <p className="text-[10px] text-slate-400">{t.endTime}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-900">{t.subjectName}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">Period {t.period}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {t.teacherName}</span>
                      {t.room && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Room {t.room}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly overview grid */}
      <Card className="card-shadow border-slate-200/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Weekly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-1 px-1">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-8 gap-1.5 text-[10px] font-medium text-slate-500 mb-2">
                <div>Day</div>
                <div className="text-center">P1</div>
                <div className="text-center">P2</div>
                <div className="text-center">P3</div>
                <div className="text-center">P4</div>
                <div className="text-center">P5</div>
                <div className="text-center">P6</div>
                <div className="text-center">P7</div>
              </div>
              {DAYS.filter((d) => daysWithData.includes(d)).map((d) => {
                const dayClasses = (allTimetable || []).filter((t: any) => t.day === d);
                return (
                  <div key={d} className="grid grid-cols-8 gap-1.5 mb-1.5">
                    <div className={`flex items-center text-[11px] font-medium ${d === todayDay ? 'text-emerald-700' : 'text-slate-600'}`}>
                      {DAY_SHORT[d]}
                    </div>
                    {[1, 2, 3, 4, 5, 6, 7].map((p) => {
                      const cls = dayClasses.find((c: any) => c.period === p);
                      if (!cls) return <div key={p} className="h-8 rounded bg-slate-50" />;
                      // Color by subject
                      const subjColor = cls.subjectName === 'Mathematics' ? 'bg-emerald-100 text-emerald-700' :
                        cls.subjectName === 'Computer Science' ? 'bg-teal-100 text-teal-700' :
                        cls.subjectName === 'English' ? 'bg-amber-100 text-amber-700' :
                        cls.subjectName === 'Physics' ? 'bg-rose-100 text-rose-700' :
                        cls.subjectName === 'Data Structures' ? 'bg-sky-100 text-sky-700' :
                        cls.subjectName === 'Library' ? 'bg-slate-200 text-slate-700' :
                        'bg-orange-100 text-orange-700';
                      return (
                        <div key={p} className={`h-8 rounded text-[9px] font-medium flex items-center justify-center text-center px-1 ${subjColor}`} title={`${cls.subjectName} (${cls.startTime}-${cls.endTime})`}>
                          {cls.subjectName.split(' ').map((w: string) => w[0]).join('').slice(0, 4)}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
