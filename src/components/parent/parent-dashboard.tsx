'use client';

import { useAppStore } from '@/lib/store';
import { useFetch } from '@/hooks/use-fetch';
import { ParentHome } from './parent-home';
import { ParentAttendance } from './parent-attendance';
import { ParentMarks } from './parent-marks';
import { ParentNotifications } from './parent-notifications';
import { ParentFeedback } from './parent-feedback';
import { ParentProfile } from './parent-profile';

export function ParentDashboard() {
  const section = useAppStore((s) => s.section);
  const currentUser = useAppStore((s) => s.currentUser);

  const { data, loading, refetch } = useFetch<any>(
    currentUser ? `/api/dashboard/parent?userId=${currentUser.id}` : null
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
      return <ParentHome data={data} refetch={refetch} />;
    case 'attendance':
      return <ParentAttendance data={data} />;
    case 'marks':
      return <ParentMarks data={data} />;
    case 'notifications':
      return <ParentNotifications data={data} refetch={refetch} />;
    case 'feedback':
      return <ParentFeedback parentId={data.parent.id} studentName={data.student.name} studentId={data.student.id} refetch={refetch} />;
    case 'profile':
      return <ParentProfile data={data} />;
    default:
      return <ParentHome data={data} refetch={refetch} />;
  }
}
