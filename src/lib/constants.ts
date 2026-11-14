// App constants

export const SCHOOL_NAME = 'Seshadri Rao Gudlavalleru Engineering College';
export const SCHOOL_SHORT_NAME = 'Gudlavalleru Engineering College';
export const APP_NAME = 'AI-Based Smart Attendance Tracker';
export const APP_TAGLINE = 'Smart, AI-powered attendance for modern schools';

// School location (for GPS verification demo)
export const SCHOOL_LOCATION = {
  name: 'Seshadri Rao Gudlavalleru Engineering College / Demo School',
  lat: 16.0517,
  lng: 80.9254,
  address: 'Gudlavalleru, Andhra Pradesh 521356',
  radiusMeters: 200,
};

export const DEMO_ACCOUNTS = [
  {
    role: 'TEACHER' as const,
    email: 'teacher@school.com',
    password: 'teacher123',
    name: 'Mr. Rajesh Kumar',
    label: 'Teacher',
    description: 'Take attendance, manage students, view reports',
  },
  {
    role: 'PARENT' as const,
    email: 'parent@school.com',
    password: 'parent123',
    name: 'Mr. Anil Kumar',
    label: 'Parent',
    description: "View child's attendance, marks, notifications",
  },
  {
    role: 'STUDENT' as const,
    email: 'student@school.com',
    password: 'student123',
    name: 'Aarav Kumar',
    label: 'Student',
    description: 'View your timetable, attendance, exam scores',
  },
  {
    role: 'ADMIN' as const,
    email: 'admin@school.com',
    password: 'admin123',
    name: 'Dr. Seshadri Rao',
    label: 'Administrator',
    description: 'School-wide management, reports, settings',
  },
];

export const CLASSES = ['CSE-A', 'CSE-B', 'IT-A'];
export const SECTIONS = ['A', 'B'];
export const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export const SUBJECTS_BY_CLASS: Record<string, string[]> = {
  'CSE-A': ['Mathematics', 'Computer Science', 'English'],
  'CSE-B': ['Mathematics', 'Physics', 'English'],
  'IT-A': ['Computer Science', 'Mathematics', 'Data Structures'],
};

export const EXAM_TYPES = ['Unit Test 1', 'Unit Test 2', 'Mid Term', 'Final'];

export const DEFAULT_LOW_ATTENDANCE_THRESHOLD = 75;

// Helper to compute letter grade from percentage
export function getGrade(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}

// Helper to get color class based on percentage
export function getPercentageColor(p: number): string {
  if (p >= 90) return 'text-emerald-600';
  if (p >= 75) return 'text-amber-600';
  if (p >= 60) return 'text-orange-600';
  return 'text-rose-600';
}
