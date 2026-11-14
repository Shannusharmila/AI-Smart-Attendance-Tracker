'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Role } from './types';

export type View = 'login' | 'teacher-dashboard' | 'parent-dashboard' | 'admin-dashboard' | 'student-dashboard';

export type TeacherSection =
  | 'dashboard'
  | 'attendance'
  | 'take-attendance'
  | 'students'
  | 'marks'
  | 'reports'
  | 'holidays'
  | 'feedback'
  | 'profile';

export type ParentSection =
  | 'dashboard'
  | 'attendance'
  | 'marks'
  | 'notifications'
  | 'feedback'
  | 'profile';

export type StudentSection =
  | 'dashboard'
  | 'timetable'
  | 'attendance'
  | 'marks'
  | 'exams'
  | 'notifications'
  | 'holidays'
  | 'feedback'
  | 'profile';

export type AdminSection =
  | 'dashboard'
  | 'students'
  | 'teachers'
  | 'classes'
  | 'attendance'
  | 'reports'
  | 'holidays'
  | 'feedback'
  | 'settings'
  | 'alerts';

export type Section = TeacherSection | ParentSection | AdminSection | StudentSection;

interface AppState {
  currentUser: User | null;
  view: View;
  section: Section;
  demoMode: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  setView: (view: View) => void;
  setSection: (section: Section) => void;
  setDemoMode: (v: boolean) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      view: 'login',
      section: 'dashboard',
      demoMode: true,
      setUser: (user) =>
        set({
          currentUser: user,
          view: user
            ? user.role === 'TEACHER'
              ? 'teacher-dashboard'
              : user.role === 'PARENT'
                ? 'parent-dashboard'
                : user.role === 'STUDENT'
                  ? 'student-dashboard'
                  : 'admin-dashboard'
            : 'login',
          section: 'dashboard',
        }),
      logout: () => set({ currentUser: null, view: 'login', section: 'dashboard' }),
      setView: (view) => set({ view }),
      setSection: (section) => set({ section }),
      setDemoMode: (v) => set({ demoMode: v }),
      reset: () => set({ currentUser: null, view: 'login', section: 'dashboard' }),
    }),
    {
      name: 'ai-attendance-storage',
      partialize: (s) => ({ currentUser: s.currentUser, view: s.view, section: s.section, demoMode: s.demoMode }),
    }
  )
);
