'use client';

import { useAppStore } from '@/lib/store';
import { useFetch } from '@/hooks/use-fetch';
import { AdminHome } from './admin-home';
import { AdminStudents } from './admin-students';
import { AdminTeachers } from './admin-teachers';
import { AdminClasses } from './admin-classes';
import { AdminAttendance } from './admin-attendance';
import { AdminReports } from './admin-reports';
import { AdminHolidays } from './admin-holidays';
import { AdminFeedback } from './admin-feedback';
import { AdminSettings } from './admin-settings';
import { AdminAlerts } from './admin-alerts';

export function AdminDashboard() {
  const section = useAppStore((s) => s.section);
  const currentUser = useAppStore((s) => s.currentUser);

  const { data, loading, refetch } = useFetch<any>(`/api/dashboard/admin`);

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
      return <AdminHome data={data} />;
    case 'students':
      return <AdminStudents />;
    case 'teachers':
      return <AdminTeachers />;
    case 'classes':
      return <AdminClasses />;
    case 'attendance':
      return <AdminAttendance />;
    case 'reports':
      return <AdminReports />;
    case 'holidays':
      return <AdminHolidays user={currentUser} />;
    case 'feedback':
      return <AdminFeedback />;
    case 'alerts':
      return <AdminAlerts data={data} refetch={refetch} />;
    case 'settings':
      return <AdminSettings />;
    default:
      return <AdminHome data={data} />;
  }
}
