'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AvatarWithInitials } from '@/components/shared/avatar-with-initials';
import { Mail, Phone, BookOpen, Users, GraduationCap } from 'lucide-react';

export function TeacherProfile({ teacher, user }: { teacher: any; user: any }) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Profile</h1>

      <Card className="card-shadow border-slate-200/80">
        <CardContent className="pt-6 pb-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <AvatarWithInitials name={teacher.name} size="xl" />
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-bold text-slate-900">{teacher.name}</h2>
            <p className="text-sm text-slate-500">{teacher.subject} Teacher</p>
            <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
              {teacher.classes.map((c: string) => (
                <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">{c}</span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-shadow border-slate-200/80">
        <CardHeader className="pb-2"><CardTitle className="text-base">Contact Information</CardTitle></CardHeader>
        <CardContent className="space-y-2.5">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-slate-400" />
            <span className="text-slate-700">{teacher.email || user?.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-slate-400" />
            <span className="text-slate-700">{teacher.phone || user?.phone || 'N/A'}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="card-shadow border-slate-200/80">
        <CardHeader className="pb-2"><CardTitle className="text-base">Teaching Details</CardTitle></CardHeader>
        <CardContent className="space-y-2.5">
          <Row label="Subject" value={teacher.subject} icon={BookOpen} />
          <Row label="Classes" value={`${teacher.classes.length} classes`} icon={Users} />
          <Row label="Role" value="Teacher" icon={GraduationCap} />
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Icon className="h-4 w-4 text-slate-400" />
      <span className="text-slate-500 w-20">{label}</span>
      <span className="text-slate-900 font-medium">{value}</span>
    </div>
  );
}
