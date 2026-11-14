'use client';

import { useAppStore } from '@/lib/store';
import { LoginScreen } from '@/components/login/login-screen';
import { TeacherDashboard } from '@/components/teacher/teacher-dashboard';
import { ParentDashboard } from '@/components/parent/parent-dashboard';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { StudentDashboard } from '@/components/student/student-dashboard';
import { AppShell } from '@/components/app-shell';

export default function Home() {
  const currentUser = useAppStore((s) => s.currentUser);

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <AppShell role={currentUser.role}>
      {currentUser.role === 'TEACHER' && <TeacherDashboard />}
      {currentUser.role === 'PARENT' && <ParentDashboard />}
      {currentUser.role === 'STUDENT' && <StudentDashboard />}
      {currentUser.role === 'ADMIN' && <AdminDashboard />}
    </AppShell>
  );
}
