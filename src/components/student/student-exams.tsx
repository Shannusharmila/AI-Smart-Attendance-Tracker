'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/badges';
import { format, parseISO, differenceInCalendarDays } from 'date-fns';
import { GraduationCap, Clock, MapPin, BookOpen, CalendarDays, CheckCircle2 } from 'lucide-react';

export function StudentExams({ data }: { data: any }) {
  const { exams, student } = data;
  const today = new Date();

  const upcoming = (exams || []).filter((e: any) => new Date(e.date) >= today);
  const past = (exams || []).filter((e: any) => new Date(e.date) < today);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Exams</h1>
        <p className="text-sm text-slate-500">{student.className} · {upcoming.length} upcoming · {past.length} completed</p>
      </div>

      {/* Upcoming exams */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-amber-600" /> Upcoming Exams
        </h3>
        {upcoming.length === 0 ? (
          <Card><CardContent><EmptyState icon={GraduationCap} title="No upcoming exams" description="Check back later for the next exam schedule." /></CardContent></Card>
        ) : (
          <div className="space-y-2.5">
            {upcoming.map((e: any) => {
              const days = differenceInCalendarDays(parseISO(e.date), today);
              const isUrgent = days <= 7;
              return (
                <Card key={e.id} className={`card-shadow ${isUrgent ? 'border-amber-200' : 'border-slate-200/80'}`}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <div className={`h-14 w-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${isUrgent ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        <span className="text-[10px] font-medium">{format(parseISO(e.date), 'MMM').toUpperCase()}</span>
                        <span className="text-base font-bold leading-none">{format(parseISO(e.date), 'dd')}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-900">{e.examName}</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">{e.subjectName}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{format(parseISO(e.date), 'EEEE, dd MMMM yyyy')}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {e.startTime}-{e.endTime}</span>
                          {e.room && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Room {e.room}</span>}
                          <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {e.maxMarks} marks</span>
                        </div>
                        {e.syllabus && (
                          <p className="text-[11px] text-slate-500 mt-1.5 p-2 rounded bg-slate-50 border border-slate-100">
                            <strong className="text-slate-700">Syllabus:</strong> {e.syllabus}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-lg font-bold ${isUrgent ? 'text-amber-700' : 'text-emerald-700'}`}>{days}</p>
                        <p className="text-[10px] text-slate-500">day{days !== 1 ? 's' : ''} left</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Past exams */}
      {past.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-slate-500" /> Completed Exams
          </h3>
          <Card className="card-shadow border-slate-200/80">
            <CardContent className="pt-4">
              <div className="space-y-2">
                {past.map((e: any) => (
                  <div key={e.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="h-10 w-10 rounded-lg bg-slate-200 text-slate-600 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[9px] font-medium">{format(parseISO(e.date), 'MMM').toUpperCase()}</span>
                      <span className="text-xs font-bold leading-none">{format(parseISO(e.date), 'dd')}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{e.examName} · {e.subjectName}</p>
                      <p className="text-[10px] text-slate-500">{format(parseISO(e.date), 'dd MMM yyyy')} · {e.startTime}-{e.endTime}</p>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600 font-medium">Done</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {upcoming.length === 0 && past.length === 0 && (
        <Card className="card-shadow border-slate-200/80">
          <CardContent>
            <EmptyState icon={CalendarDays} title="No exams scheduled" description="Your exam timetable will appear here." />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
