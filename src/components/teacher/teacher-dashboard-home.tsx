'use client';

import { useAppStore } from '@/lib/store';
import { StatCard } from '@/components/shared/stat-card';
import { EmptyState } from '@/components/shared/badges';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, UserX, TrendingUp, Clock, Camera, CalendarDays, ArrowRight } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';

interface Props {
  data: any;
  refetch: () => void;
}

export function TeacherDashboardHome({ data, refetch }: Props) {
  const setSection = useAppStore((s) => s.setSection);
  const { stats, recent, trend, teacher } = data;

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  const presentVsAbsentData = trend.map((t: any) => ({
    date: format(parseISO(t.date), 'EEE'),
    present: t.present,
    absent: t.absent,
  }));

  const trendData = trend.map((t: any) => ({
    date: format(parseISO(t.date), 'EEE'),
    percentage: t.percentage,
  }));

  const todayPieData = [
    { name: 'Present', value: stats.presentToday, color: '#10b981' },
    { name: 'Absent', value: stats.absentToday, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {greeting}, {teacher.name.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-500">
            {format(today, 'EEEE, dd MMMM yyyy')} · {teacher.subject} teacher
          </p>
        </div>
        <Button
          onClick={() => setSection('take-attendance')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white h-11 self-start sm:self-auto"
        >
          <Camera className="h-4 w-4" /> Take Attendance
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Students" value={stats.totalStudents} icon={Users} variant="emerald" subtitle={`${teacher.classes.length} classes`} />
        <StatCard label="Present Today" value={stats.presentToday} icon={UserCheck} variant="teal" subtitle={`${stats.attendancePct}% of total`} />
        <StatCard label="Absent Today" value={stats.absentToday} icon={UserX} variant="rose" subtitle={stats.absentToday > 0 ? 'Review absences' : 'All present!'} />
        <StatCard label="Pending Sessions" value={stats.pendingCount} icon={Clock} variant="amber" subtitle="Awaiting attendance" />
      </div>

      {/* Pending sessions CTA */}
      {stats.pendingCount > 0 && (
        <Card className="border-amber-200 bg-amber-50/70 card-shadow">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900">
                {stats.pendingCount} pending attendance session{stats.pendingCount > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-amber-700">Take attendance for today&apos;s classes to keep records up to date.</p>
            </div>
            <Button
              size="sm"
              onClick={() => setSection('take-attendance')}
              className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
            >
              Take Now
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="card-shadow border-slate-200/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" /> Attendance Trend (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="percentage" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Attendance %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-shadow border-slate-200/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-600" /> Present vs Absent (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={presentVsAbsentData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="present" stackId="a" fill="#10b981" name="Present" radius={[0, 0, 0, 0]} />
                <Bar dataKey="absent" stackId="a" fill="#f43f5e" name="Absent" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Today's distribution + Recent records */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="card-shadow border-slate-200/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Today&apos;s Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.presentToday + stats.absentToday > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={todayPieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
                    {todayPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={CalendarDays} title="No attendance recorded today" description="Take attendance to see the breakdown." />
            )}
          </CardContent>
        </Card>

        <Card className="card-shadow border-slate-200/80 lg:col-span-2">
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent Attendance Records</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setSection('attendance')} className="text-emerald-700 h-8">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <EmptyState icon={CalendarDays} title="No attendance yet" description="Sessions you record will appear here." />
            ) : (
              <div className="space-y-2">
                {recent.slice(0, 5).map((r: any) => (
                  <button
                    key={r.id}
                    onClick={() => setSection('attendance')}
                    className="w-full flex items-center justify-between gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-semibold text-sm">
                        {r.className.split('-')[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{r.subjectName} · {r.className}</p>
                        <p className="text-[11px] text-slate-500">
                          {format(parseISO(r.date), 'dd MMM yyyy')} · Period {r.period} · {r.method}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs shrink-0">
                      <span className="text-emerald-700 font-medium">{r.presentCount} P</span>
                      <span className="text-rose-600 font-medium">{r.absentCount} A</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
