'use client';

import { useAppStore } from '@/lib/store';
import { useFetch } from '@/hooks/use-fetch';
import { StudentHome } from './student-home';
import { StudentTimetable } from './student-timetable';
import { StudentAttendance } from './student-attendance';
import { StudentMarks } from './student-marks';
import { StudentExams } from './student-exams';
import { StudentNotifications } from './student-notifications';
import { StudentHolidays } from './student-holidays';
import { StudentProfile } from './student-profile';

export function StudentDashboard() {
  const section = useAppStore((s) => s.section);
  const currentUser = useAppStore((s) => s.currentUser);

  const { data, loading, refetch } = useFetch<any>(
    currentUser ? `/api/dashboard/student?userId=${currentUser.id}` : null
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
      return <StudentHome data={data} refetch={refetch} />;
    case 'timetable':
      return <StudentTimetable data={data} />;
    case 'attendance':
      return <StudentAttendance data={data} />;
    case 'marks':
      return <StudentMarks data={data} />;
    case 'exams':
      return <StudentExams data={data} />;
    case 'notifications':
      return <StudentNotifications data={data} refetch={refetch} />;
    case 'holidays':
      return <StudentHolidays data={data} />;
    case 'profile':
      return <StudentProfile data={data} user={currentUser} />;
    default:
      return <StudentHome data={data} refetch={refetch} />;
  }
}
