'use client';

import { useAppStore } from '@/lib/store';
import { useFetch } from '@/hooks/use-fetch';
import { TeacherDashboardHome } from './teacher-dashboard-home';
import { TakeAttendance } from './take-attendance';
import { TeacherAttendanceHistory } from './teacher-attendance-history';
import { TeacherStudents } from './teacher-students';
import { TeacherMarks } from './teacher-marks';
import { TeacherReports } from './teacher-reports';
import { TeacherHolidays } from './teacher-holidays';
import { TeacherFeedback } from './teacher-feedback';
import { TeacherProfile } from './teacher-profile';

export function TeacherDashboard() {
  const section = useAppStore((s) => s.section);
  const currentUser = useAppStore((s) => s.currentUser);

  const { data, loading, refetch } = useFetch<any>(
    currentUser ? `/api/dashboard/teacher?userId=${currentUser.id}` : null
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-center text-slate-500 py-10">Failed to load dashboard. Please refresh.</p>;
  }

  switch (section) {
    case 'dashboard':
      return <TeacherDashboardHome data={data} refetch={refetch} />;
    case 'take-attendance':
      return <TakeAttendance teacher={data.teacher} onSaved={refetch} />;
    case 'attendance':
      return <TeacherAttendanceHistory teacherId={data.teacher.id} />;
    case 'students':
      return <TeacherStudents classes={data.teacher.classes} />;
    case 'marks':
      return <TeacherMarks classes={data.teacher.classes} teacherUserId={currentUser?.id} />;
    case 'reports':
      return <TeacherReports teacher={data.teacher} />;
    case 'holidays':
      return <TeacherHolidays user={currentUser} />;
    case 'feedback':
      return <TeacherFeedback teacherId={data.teacher.id} />;
    case 'profile':
      return <TeacherProfile teacher={data.teacher} user={currentUser} />;
    default:
      return <TeacherDashboardHome data={data} refetch={refetch} />;
  }
}
