'use client';

import { Card, CardContent } from '@/components/ui/card';
import { AvatarWithInitials } from '@/components/shared/avatar-with-initials';
import { Mail, Phone, User, Users, GraduationCap } from 'lucide-react';

export function ParentProfile({ data }: { data: any }) {
  const { parent, student } = data;
  return (
    <div className="space-y-4">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Profile</h1>

      <Card className="card-shadow border-slate-200/80">
        <CardContent className="pt-6 pb-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <AvatarWithInitials name={parent.name} size="xl" />
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-bold text-slate-900">{parent.name}</h2>
            <p className="text-sm text-slate-500">Parent of {student.name}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="card-shadow border-slate-200/80">
        <CardContent className="pt-5 space-y-2.5">
          <p className="text-xs font-semibold text-slate-700 mb-1">Contact</p>
          <Row icon={Mail} label="Email" value={parent.email} />
          <Row icon={Phone} label="Phone" value={parent.phone || 'N/A'} />
          <Row icon={User} label="Role" value="Parent" />
        </CardContent>
      </Card>

      <Card className="card-shadow border-slate-200/80">
        <CardContent className="pt-5 space-y-2.5">
          <p className="text-xs font-semibold text-slate-700 mb-1">Child Information</p>
          <Row icon={GraduationCap} label="Name" value={student.name} />
          <Row icon={Users} label="Class" value={student.className} />
          <Row icon={User} label="Roll No" value={student.rollNumber} />
          <div className="pt-2 border-t border-slate-100">
            <Row icon={GraduationCap} label="Attendance" value={`${student.attendancePercentage.toFixed(1)}%`} />
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
      <span className="text-slate-500 w-20">{label}</span>
      <span className="text-slate-900 font-medium">{value}</span>
    </div>
  );
}
