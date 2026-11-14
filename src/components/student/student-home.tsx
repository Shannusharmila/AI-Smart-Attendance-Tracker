'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { format, parseISO } from 'date-fns';
import { CheckCircle2, XCircle, CalendarDays, BookOpen, Bell, CalendarOff, Clock, GraduationCap, Award, TrendingUp } from 'lucide-react';
import { getGrade } from '@/lib/constants';

interface Props {
  data: any;
  refetch: () => void;
}

export function StudentHome({ data, refetch }: Props) {
  const setSection = useAppStore((s) => s.setSection);
  const { student, todayAttendance, todayTimetable, marks, holidays, notifications, exams, todayDay } = data;

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const present = student.totalAttended;
  const absent = student.totalSessions - student.totalAttended;
  const pct = student.attendancePercentage;

  const upcomingExams = (exams || []).filter((e: any) => new Date(e.date) >= new Date()).slice(0, 3);
  const upcomingHolidays = (holidays || []).filter((h: any) => new Date(h.date) >= new Date()).slice(0, 2);
  const recentNotifs = (notifications || []).slice(0, 4);
  const unreadCount = (notifications || []).filter((n: any) => !n.read).length;
  const latestMark = marks && marks.length > 0 ? marks[0] : null;
  const avgPct = marks && marks.length > 0
    ? Math.round((marks.reduce((s: number, m: any) => s + m.percentage, 0) / marks.length) * 10) / 10
    : 0;

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          {greeting}, {student.name.split(' ')[0]}! 👋
        </h1>
        <p className="text-sm text-slate-500">{format(today, 'EEEE, dd MMMM yyyy')} · Roll #{student.rollNumber} · {student.className}</p>
      </div>

      {/* Today's attendance + attendance % */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="card-shadow border-slate-200/80">
          <CardContent className="py-4">
            <p className="text-xs text-slate-500 uppercase">Today's Attendance</p>
            {todayAttendance.status === 'PRESENT' ? (
              <div className="flex items-center gap-2 mt-1">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                <div>
                  <p className="text-base font-bold text-emerald-700">PRESENT ✓</p>
                  {todayAttendance.time && <p className="text-[10px] text-slate-500">{todayAttendance.subject} · {todayAttendance.time}</p>}
                </div>
              </div>
            ) : todayAttendance.status === 'ABSENT' ? (
              <div className="flex items-center gap-2 mt-1">
                <XCircle className="h-7 w-7 text-rose-600" />
                <p className="text-base font-bold text-rose-700">ABSENT</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <CalendarDays className="h-7 w-7 text-slate-400" />
                <p className="text-sm text-slate-500">Not recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="card-shadow border-slate-200/80">
          <CardContent className="py-4">
            <p className="text-xs text-slate-500 uppercase flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Attendance %</p>
            <p className={`text-3xl font-bold ${pct >= 75 ? 'text-emerald-700' : 'text-rose-700'}`}>{pct.toFixed(1)}%</p>
            <p className="text-[10px] text-slate-500">{present} present · {absent} absent</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-4 gap-2">
        <Button onClick={() => setSection('timetable')} variant="outline" className="flex flex-col items-center gap-1 h-20 bg-white hover:bg-emerald-50 border-emerald-200">
          <CalendarDays className="h-5 w-5 text-emerald-600" />
          <span className="text-[10px] text-slate-700">Timetable</span>
        </Button>
        <Button onClick={() => setSection('attendance')} variant="outline" className="flex flex-col items-center gap-1 h-20 bg-white hover:bg-emerald-50 border-emerald-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span className="text-[10px] text-slate-700">Attendance</span>
        </Button>
        <Button onClick={() => setSection('marks')} variant="outline" className="flex flex-col items-center gap-1 h-20 bg-white hover:bg-emerald-50 border-emerald-200">
          <BookOpen className="h-5 w-5 text-emerald-600" />
          <span className="text-[10px] text-slate-700">Marks</span>
        </Button>
        <Button onClick={() => setSection('exams')} variant="outline" className="flex flex-col items-center gap-1 h-20 bg-white hover:bg-emerald-50 border-emerald-200 relative">
          <GraduationCap className="h-5 w-5 text-emerald-600" />
          <span className="text-[10px] text-slate-700">Exams</span>
        </Button>
      </div>

      {/* Today's timetable */}
      <Card className="card-shadow border-slate-200/80">
        <CardContent className="pt-5 pb-3">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-emerald-600" /> Today&apos;s Schedule ({todayDay})
          </h3>
          {todayTimetable.length === 0 ? (
            <p className="text-sm text-slate-500 py-2">No classes scheduled for today.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
              {todayTimetable.map((t: any) => (
                <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-center min-w-[60px]">
                    <p className="text-xs font-medium text-emerald-700">{t.startTime}</p>
                    <p className="text-[10px] text-slate-400">{t.endTime}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{t.subjectName}</p>
                    <p className="text-[10px] text-slate-500">{t.teacherName} · Room {t.room}</p>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium shrink-0">P{t.period}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Latest marks + avg */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="card-shadow border-slate-200/80">
          <CardContent className="py-4">
            <p className="text-xs text-slate-500 uppercase flex items-center gap-1"><Award className="h-3 w-3" /> Latest Mark</p>
            {latestMark ? (
              <>
                <p className="text-3xl font-bold text-slate-900">{latestMark.percentage}%</p>
                <p className="text-[10px] text-slate-500">{latestMark.subjectName} · {latestMark.examName}</p>
              </>
            ) : (
              <p className="text-sm text-slate-400 mt-2">No marks yet</p>
            )}
          </CardContent>
        </Card>
        <Card className="card-shadow border-slate-200/80">
          <CardContent className="py-4">
            <p className="text-xs text-slate-500 uppercase">Overall Avg</p>
            <p className={`text-3xl font-bold ${avgPct >= 75 ? 'text-emerald-700' : 'text-amber-700'}`}>{avgPct}%</p>
            <p className="text-[10px] text-slate-500">Grade: {getGrade(avgPct)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming exams */}
      {upcomingExams.length > 0 && (
        <Card className="card-shadow border-amber-200/80">
          <CardContent className="pt-5 pb-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
              <GraduationCap className="h-4 w-4 text-amber-600" /> Upcoming Exams
            </h3>
            <div className="space-y-2">
              {upcomingExams.map((e: any) => {
                const days = Math.ceil((new Date(e.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={e.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="h-9 w-9 rounded-lg bg-amber-100 text-amber-700 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[9px] font-medium">{format(parseISO(e.date), 'MMM').toUpperCase()}</span>
                      <span className="text-xs font-bold leading-none">{format(parseISO(e.date), 'dd')}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{e.examName} · {e.subjectName}</p>
                      <p className="text-[10px] text-slate-500">{e.startTime}-{e.endTime} · Room {e.room}</p>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-800 font-medium shrink-0">
                      {days}d left
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent notifications */}
      <Card className="card-shadow border-slate-200/80">
        <CardContent className="pt-5 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Bell className="h-4 w-4 text-emerald-600" /> Recent Notifications
              {unreadCount > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-semibold">{unreadCount}</span>}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setSection('notifications')} className="text-emerald-700 h-7 text-xs">View all</Button>
          </div>
          {recentNotifs.length === 0 ? (
            <p className="text-sm text-slate-500 py-2">No notifications.</p>
          ) : (
            <div className="space-y-2">
              {recentNotifs.map((n: any) => (
                <div key={n.id} className={`p-2.5 rounded-lg ${n.read ? 'bg-slate-50' : 'bg-emerald-50 border border-emerald-200'}`}>
                  <p className="text-sm font-medium text-slate-900">{n.title}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{format(new Date(n.createdAt), 'dd MMM, HH:mm')}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming holidays */}
      {upcomingHolidays.length > 0 && (
        <Card className="card-shadow border-slate-200/80">
          <CardContent className="pt-5 pb-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
              <CalendarOff className="h-4 w-4 text-amber-600" /> Upcoming Holidays
            </h3>
            <div className="space-y-2">
              {upcomingHolidays.map((h: any) => (
                <div key={h.id} className="flex items-center gap-3 p-2 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="h-9 w-9 rounded-lg bg-amber-100 text-amber-700 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[9px] font-medium">{format(parseISO(h.date), 'MMM').toUpperCase()}</span>
                    <span className="text-xs font-bold leading-none">{format(parseISO(h.date), 'dd')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{h.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{h.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
