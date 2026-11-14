'use client';

import { useState } from 'react';
import { GraduationCap, LogOut, Menu, X, Bell, LayoutDashboard, Camera, ClipboardList, Users, BookOpen, FileBarChart, CalendarOff, MessageSquare, UserCircle, School, ShieldAlert, Settings, CalendarDays, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { APP_NAME, SCHOOL_SHORT_NAME } from '@/lib/constants';
import { DemoModeBadge } from '@/components/shared/badges';
import { toast } from 'sonner';
import type { Role } from '@/lib/types';

interface NavItem {
  id: string;
  label: string;
}

const TEACHER_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'take-attendance', label: 'Take Attendance' },
  { id: 'attendance', label: 'History' },
  { id: 'students', label: 'Students' },
  { id: 'marks', label: 'Marks' },
  { id: 'reports', label: 'Reports' },
  { id: 'holidays', label: 'Holidays' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'profile', label: 'Profile' },
];

const PARENT_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Home' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'marks', label: 'Marks' },
  { id: 'notifications', label: 'Alerts' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'profile', label: 'Profile' },
];

const STUDENT_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Home' },
  { id: 'timetable', label: 'Timetable' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'marks', label: 'Marks' },
  { id: 'exams', label: 'Exams' },
  { id: 'notifications', label: 'Alerts' },
  { id: 'holidays', label: 'Holidays' },
  { id: 'profile', label: 'Profile' },
];

const ADMIN_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'students', label: 'Students' },
  { id: 'teachers', label: 'Teachers' },
  { id: 'classes', label: 'Classes' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'reports', label: 'Reports' },
  { id: 'holidays', label: 'Holidays' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'settings', label: 'Settings' },
];

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  'take-attendance': Camera,
  attendance: ClipboardList,
  students: Users,
  marks: BookOpen,
  reports: FileBarChart,
  holidays: CalendarOff,
  feedback: MessageSquare,
  profile: UserCircle,
  notifications: Bell,
  teachers: GraduationCap,
  classes: School,
  alerts: ShieldAlert,
  settings: Settings,
  timetable: CalendarDays,
  exams: Award,
};

function getNav(role: Role): NavItem[] {
  if (role === 'TEACHER') return TEACHER_NAV;
  if (role === 'PARENT') return PARENT_NAV;
  if (role === 'STUDENT') return STUDENT_NAV;
  return ADMIN_NAV;
}

export function AppShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const section = useAppStore((s) => s.section);
  const setSection = useAppStore((s) => s.setSection);
  const logout = useAppStore((s) => s.logout);
  const currentUser = useAppStore((s) => s.currentUser);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const nav = getNav(role);

  function handleLogout() {
    toast.success('Logged out successfully');
    logout();
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top app bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <button
            className="lg:hidden p-1.5 -ml-1 rounded-lg hover:bg-slate-100"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="min-w-0 hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 truncate leading-tight">{APP_NAME}</p>
              <p className="text-[11px] text-slate-500 truncate leading-tight">{SCHOOL_SHORT_NAME}</p>
            </div>
            <p className="sm:hidden text-sm font-semibold text-slate-900 truncate">SmartAttend</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <DemoModeBadge />
          <button
            className="p-1.5 rounded-lg hover:bg-slate-100 relative"
            aria-label="Notifications"
            onClick={() => setSection('notifications' as never)}
          >
            <Bell className="h-5 w-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-slate-900 leading-tight">{currentUser?.name}</p>
              <p className="text-[11px] text-slate-500 capitalize leading-tight">{role.toLowerCase()}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-600 hover:text-rose-600"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Desktop layout: sidebar + main */}
      <div className="flex-1 flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-60 border-r border-slate-200 bg-white shrink-0">
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5 scrollbar-thin">
            {nav.map((item) => {
              const Icon = ICONS[item.id] || LayoutDashboard;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id as never)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition',
                    active
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-emerald-600' : 'text-slate-400')} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="border-t border-slate-200 p-3">
            <p className="text-[10px] text-slate-400 leading-tight">© 2026 {SCHOOL_SHORT_NAME}</p>
          </div>
        </aside>

        {/* Mobile drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col animate-in slide-in-from-left">
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 leading-tight">SmartAttend</p>
                    <p className="text-[11px] text-slate-500 leading-tight">{SCHOOL_SHORT_NAME}</p>
                  </div>
                </div>
                <button onClick={() => setMobileNavOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin">
                {nav.map((item) => {
                  const Icon = ICONS[item.id] || LayoutDashboard;
                  const active = section === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSection(item.id as never);
                        setMobileNavOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition',
                        active ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      <Icon className={cn('h-4 w-4', active ? 'text-emerald-600' : 'text-slate-400')} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="border-t border-slate-200 p-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main content area */}
        <main className="flex-1 min-w-0 pb-16 lg:pb-0">
          <div className="max-w-6xl mx-auto p-3 sm:p-5 lg:p-6">{children}</div>
        </main>
      </div>

      {/* Mobile bottom nav (only top 5) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 grid grid-cols-5 px-1 py-1">
        {nav.slice(0, 5).map((item) => {
          const Icon = ICONS[item.id] || LayoutDashboard;
          const active = section === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSection(item.id as never)}
              className={cn(
                'flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[10px] font-medium transition',
                active ? 'text-emerald-700' : 'text-slate-500'
              )}
            >
              <Icon className={cn('h-5 w-5', active ? 'text-emerald-600' : 'text-slate-400')} />
              <span className="truncate max-w-full">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
