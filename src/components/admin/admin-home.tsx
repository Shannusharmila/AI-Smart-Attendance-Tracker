'use client';

import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/badges';
import { Users, GraduationCap, UserCheck, TrendingUp, UserX, ShieldAlert, AlertTriangle, Bell, School } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAppStore } from '@/lib/store';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

export function AdminHome({ data }: { data: any }) {
  const setSection = useAppStore((s) => s.setSection);
  const { stats, byClass, trend, lowAttendanceStudents, anomalies } = data;

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  const pieData = [
    { name: 'Present', value: stats.presentToday, color: '#10b981' },
    { name: 'Absent', value: stats.absentToday, color: '#f43f5e' },
  ];

  const trendData = trend.map((t: any) => ({
    date: format(parseISO(t.date), 'EEE'),
    percentage: t.percentage,
  }));

  const classData = byClass.map((c: any) => ({
    name: c.className,
    percentage: c.percentage,
  }));

  async function sendAlert(student: any) {
    try {
      const res = await fetch('/api/alerts/low-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student.id }),
      });
      if (res.ok) {
        toast.success(`Alert sent to parent of ${student.name}`);
      } else {
        toast.error('Failed to send alert');
      }
    } catch {
      toast.error('Network error');
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          {greeting}, Administrator 👋
        </h1>
        <p className="text-sm text-slate-500">{format(today, 'EEEE, dd MMMM yyyy')}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard label="Total Students" value={stats.totalStudents} icon={Users} variant="emerald" />
        <StatCard label="Total Teachers" value={stats.totalTeachers} icon={GraduationCap} variant="teal" />
        <StatCard label="Today's %" value={`${stats.todayPct}%`} icon={UserCheck} variant="emerald" />
        <StatCard label="Avg %" value={`${stats.avgPct}%`} icon={TrendingUp} variant="teal" />
        <StatCard label="Absent Today" value={stats.absentToday} icon={UserX} variant="rose" />
        <StatCard label="Low Attendance" value={stats.lowAttendanceCount} icon={ShieldAlert} variant={stats.lowAttendanceCount > 0 ? 'rose' : 'emerald'} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="card-shadow border-slate-200/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <School className="h-4 w-4 text-emerald-600" /> Attendance by Class
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={classData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="percentage" fill="#10b981" radius={[4, 4, 0, 0]} name="Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-shadow border-slate-200/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" /> Weekly Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="percentage" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} name="Attendance %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Today's distribution + Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="card-shadow border-slate-200/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Today&apos;s Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {(stats.presentToday + stats.absentToday) > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={UserCheck} title="No attendance today" description="Records will appear once teachers take attendance." />
            )}
          </CardContent>
        </Card>

        <Card className="card-shadow border-slate-200/80 lg:col-span-2">
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" /> Attendance Anomalies
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setSection('alerts')} className="text-emerald-700 h-8">View all</Button>
          </CardHeader>
          <CardContent>
            {anomalies.length === 0 ? (
              <EmptyState icon={ShieldAlert} title="No anomalies detected" description="Anomaly alerts will appear here." />
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                {anomalies.slice(0, 5).map((a: any) => (
                  <div key={a.id} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">{a.reason}</p>
                      <p className="text-[10px] text-slate-500">{format(new Date(a.createdAt), 'dd MMM, HH:mm')}</p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
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

      {/* Low attendance students */}
      <Card className="card-shadow border-rose-200/80">
        <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-600" /> Low Attendance Students
            <span className="text-xs text-rose-700 font-normal">(below 75%)</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setSection('alerts')} className="text-emerald-700 h-8">View all</Button>
        </CardHeader>
        <CardContent>
          {lowAttendanceStudents.length === 0 ? (
            <EmptyState icon={ShieldAlert} title="No low attendance students" description="All students have attendance above 75%." />
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
              {lowAttendanceStudents.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 font-semibold text-sm">
                      {s.name.slice(0, 2).toUpperCase()}
                    </div>
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
                    <Button
                      size="sm"
                      onClick={() => sendAlert(s)}
                      className="h-8 bg-rose-600 hover:bg-rose-700 text-white"
                    >
                      <Bell className="h-3.5 w-3.5" /> Alert Parent
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
