'use client';

import { Card, CardContent } from '@/components/ui/card';
import { AvatarWithInitials } from '@/components/shared/avatar-with-initials';
import { Mail, Phone, User, Users, GraduationCap, CalendarDays, TrendingUp, Award, BookOpen } from 'lucide-react';
import { getGrade, getPercentageColor } from '@/lib/constants';

export function StudentProfile({ data, user }: { data: any; user: any }) {
  const { student, marks } = data;

  const avgPct = marks && marks.length > 0
    ? Math.round((marks.reduce((s: number, m: any) => s + m.percentage, 0) / marks.length) * 10) / 10
    : 0;

  return (
    <div className="space-y-4">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Profile</h1>

      <Card className="card-shadow border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
        <CardContent className="pt-6 pb-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <AvatarWithInitials name={student.name} size="xl" />
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-bold text-slate-900">{student.name}</h2>
            <p className="text-sm text-slate-600">Roll #{student.rollNumber} · {student.className}</p>
            <p className="text-xs text-slate-500 mt-0.5">Son/Daughter of {student.parentName}</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="card-shadow border-slate-200/80">
          <CardContent className="py-3 text-center">
            <TrendingUp className="h-5 w-5 text-emerald-600 mx-auto mb-0.5" />
            <p className={`text-xl font-bold ${student.attendancePercentage >= 75 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {student.attendancePercentage.toFixed(1)}%
            </p>
            <p className="text-[10px] text-slate-500">Attendance</p>
          </CardContent>
        </Card>
        <Card className="card-shadow border-slate-200/80">
          <CardContent className="py-3 text-center">
            <Award className="h-5 w-5 text-amber-500 mx-auto mb-0.5" />
            <p className={`text-xl font-bold ${getPercentageColor(avgPct)}`}>{avgPct}%</p>
            <p className="text-[10px] text-slate-500">Marks Avg · {getGrade(avgPct)}</p>
          </CardContent>
        </Card>
        <Card className="card-shadow border-slate-200/80">
          <CardContent className="py-3 text-center">
            <BookOpen className="h-5 w-5 text-sky-500 mx-auto mb-0.5" />
            <p className="text-xl font-bold text-slate-900">{marks?.length || 0}</p>
            <p className="text-[10px] text-slate-500">Exams Taken</p>
          </CardContent>
        </Card>
      </div>

      {/* Personal info */}
      <Card className="card-shadow border-slate-200/80">
        <CardContent className="pt-5 space-y-2.5">
          <p className="text-xs font-semibold text-slate-700 mb-1">Personal Information</p>
          <Row icon={User} label="Name" value={student.name} />
          <Row icon={GraduationCap} label="Class" value={`${student.class} - Section ${student.section}`} />
          <Row icon={Users} label="Roll No" value={student.rollNumber} />
          <Row icon={Users} label="Parent" value={student.parentName} />
          {student.parentPhone && <Row icon={Phone} label="Parent Phone" value={student.parentPhone} />}
          <Row icon={Mail} label="Email" value={user?.email || 'student@school.com'} />
        </CardContent>
      </Card>

      {/* Attendance summary */}
      <Card className="card-shadow border-slate-200/80">
        <CardContent className="pt-5">
          <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-emerald-600" /> Attendance Summary
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-emerald-50 p-3">
              <p className="text-xl font-bold text-emerald-700">{student.totalAttended}</p>
              <p className="text-[10px] text-slate-500">Present</p>
            </div>
            <div className="rounded-lg bg-rose-50 p-3">
              <p className="text-xl font-bold text-rose-700">{student.totalSessions - student.totalAttended}</p>
              <p className="text-[10px] text-slate-500">Absent</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xl font-bold text-slate-900">{student.totalSessions}</p>
              <p className="text-[10px] text-slate-500">Total</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Icon className="h-4 w-4 text-slate-400 shrink-0" />
      <span className="text-slate-500 w-28">{label}</span>
      <span className="text-slate-900 font-medium flex-1">{value}</span>
    </div>
  );
}
