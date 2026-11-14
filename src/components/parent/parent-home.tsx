'use client';

import { Card, CardContent } from '@/components/ui/card';
import { AvatarWithInitials } from '@/components/shared/avatar-with-initials';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { format, parseISO } from 'date-fns';
import { CheckCircle2, XCircle, CalendarDays, BookOpen, Bell, Award, MessageSquare, ArrowRight, CalendarOff } from 'lucide-react';
import { getGrade } from '@/lib/constants';

interface Props {
  data: any;
  refetch: () => void;
}

export function ParentHome({ data, refetch }: Props) {
  const setSection = useAppStore((s) => s.setSection);
  const { student, todayAttendance, attendanceHistory, marks, holidays, notifications } = data;

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  const present = student.totalAttended;
  const absent = student.totalSessions - student.totalAttended;
  const pct = student.attendancePercentage;

  // Recent notifications (unread + recent 3)
  const recentNotifs = (notifications || []).slice(0, 4);
  const unreadCount = (notifications || []).filter((n: any) => !n.read).length;

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          {greeting}, {data.parent.name.split(' ').slice(0, 2).join(' ')}! 👋
        </h1>
        <p className="text-sm text-slate-500">{format(today, 'EEEE, dd MMMM yyyy')}</p>
      </div>

      {/* Child card */}
      <Card className="card-shadow border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
        <CardContent className="pt-5 pb-5 flex items-center gap-3">
          <AvatarWithInitials name={student.name} size="xl" />
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-slate-900">{student.name}</p>
            <p className="text-sm text-slate-600">Roll #{student.rollNumber} · {student.className}</p>
            <div className="flex gap-3 mt-2">
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Attendance</p>
                <p className={`text-sm font-bold ${pct >= 75 ? 'text-emerald-700' : 'text-rose-700'}`}>{pct.toFixed(1)}%</p>
              </div>
              <div className="border-l border-slate-300 pl-3">
                <p className="text-[10px] text-slate-500 uppercase">Total</p>
                <p className="text-sm font-bold text-slate-700">{present + absent}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's attendance */}
      <Card className="card-shadow border-slate-200/80">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <p className="text-xs text-slate-500 uppercase">Today&apos;s Attendance</p>
              <p className="text-xs text-slate-400">{format(today, 'dd MMMM yyyy')}</p>
            </div>
            {todayAttendance.status === 'PRESENT' ? (
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
            ) : todayAttendance.status === 'ABSENT' ? (
              <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center">
                <XCircle className="h-7 w-7 text-rose-600" />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                <CalendarDays className="h-7 w-7 text-slate-400" />
              </div>
            )}
          </div>
          {todayAttendance.status === 'PRESENT' ? (
            <div>
              <p className="text-lg font-bold text-emerald-700">PRESENT ✓</p>
              {todayAttendance.time && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Period {todayAttendance.period} · {todayAttendance.subject} · {todayAttendance.time}
                </p>
              )}
            </div>
          ) : todayAttendance.status === 'ABSENT' ? (
            <p className="text-lg font-bold text-rose-700">ABSENT</p>
          ) : (
            <p className="text-sm text-slate-500">Attendance not yet recorded for today.</p>
          )}
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="card-shadow border-slate-200/80">
          <CardContent className="py-4">
            <p className="text-xs text-slate-500 uppercase">Attendance %</p>
            <p className={`text-3xl font-bold ${pct >= 75 ? 'text-emerald-700' : 'text-rose-700'}`}>{pct.toFixed(1)}%</p>
            <p className="text-xs text-slate-500">{present} present · {absent} absent</p>
          </CardContent>
        </Card>
        <Card className="card-shadow border-slate-200/80">
          <CardContent className="py-4">
            <p className="text-xs text-slate-500 uppercase flex items-center gap-1"><Award className="h-3 w-3" /> Latest Mark</p>
            {marks && marks.length > 0 ? (
              <>
                <p className="text-3xl font-bold text-slate-900">{marks[0].percentage}%</p>
                <p className="text-xs text-slate-500">{marks[0].subjectName} · {marks[0].examName}</p>
              </>
            ) : (
              <p className="text-sm text-slate-400 mt-2">No marks yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick navigation */}
      <div className="grid grid-cols-4 gap-2">
        <Button onClick={() => setSection('attendance')} variant="outline" className="flex flex-col items-center gap-1 h-20 bg-white hover:bg-emerald-50 border-emerald-200">
          <CalendarDays className="h-5 w-5 text-emerald-600" />
          <span className="text-[10px] text-slate-700">Attendance</span>
        </Button>
        <Button onClick={() => setSection('marks')} variant="outline" className="flex flex-col items-center gap-1 h-20 bg-white hover:bg-emerald-50 border-emerald-200">
          <BookOpen className="h-5 w-5 text-emerald-600" />
          <span className="text-[10px] text-slate-700">Marks</span>
        </Button>
        <Button onClick={() => setSection('notifications')} variant="outline" className="flex flex-col items-center gap-1 h-20 bg-white hover:bg-emerald-50 border-emerald-200 relative">
          <Bell className="h-5 w-5 text-emerald-600" />
          <span className="text-[10px] text-slate-700">Alerts</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-2 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">{unreadCount}</span>
          )}
        </Button>
        <Button onClick={() => setSection('feedback')} variant="outline" className="flex flex-col items-center gap-1 h-20 bg-white hover:bg-emerald-50 border-emerald-200">
          <MessageSquare className="h-5 w-5 text-emerald-600" />
          <span className="text-[10px] text-slate-700">Feedback</span>
        </Button>
      </div>

      {/* Recent notifications */}
      <Card className="card-shadow border-slate-200/80">
        <CardContent className="pt-5 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Bell className="h-4 w-4 text-emerald-600" /> Recent Notifications
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setSection('notifications')} className="text-emerald-700 h-7 text-xs">
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          {recentNotifs.length === 0 ? (
            <p className="text-sm text-slate-500 py-2">No notifications yet.</p>
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
      {(holidays || []).length > 0 && (
        <Card className="card-shadow border-slate-200/80">
          <CardContent className="pt-5 pb-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
              <CalendarOff className="h-4 w-4 text-amber-600" /> Upcoming Holidays
            </h3>
            <div className="space-y-2">
              {holidays.filter((h: any) => new Date(h.date) >= new Date()).slice(0, 3).map((h: any) => (
                <div key={h.id} className="flex items-center gap-3 p-2 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="h-9 w-9 rounded-lg bg-amber-100 text-amber-700 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[9px] font-medium">{format(parseISO(h.date), 'MMM').toUpperCase()}</span>
                    <span className="text-xs font-bold leading-none">{format(parseISO(h.date), 'dd')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{h.name}</p>
                    <p className="text-xs text-slate-500 truncate">{h.description}</p>
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
