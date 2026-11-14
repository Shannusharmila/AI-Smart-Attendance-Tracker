// Shared TypeScript types

export type Role = 'TEACHER' | 'PARENT' | 'ADMIN' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string | null;
  avatarUrl?: string | null;
  linkedId?: string | null;
  studentId?: string | null; // for parent role
}

export interface Teacher {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  classes: string[];
}

export interface Parent {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string | null;
  studentId: string;
  student?: Student;
}

export interface Student {
  id: string;
  rollNumber: string;
  name: string;
  class: string;
  section: string;
  className: string;
  photoUrl?: string | null;
  parentName: string;
  parentPhone?: string | null;
  attendancePercentage: number;
  totalAttended: number;
  totalSessions: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  className: string;
  teacherId: string;
}

export interface AttendanceSession {
  id: string;
  className: string;
  section: string;
  subjectId?: string | null;
  subjectName: string;
  date: string;
  period: number;
  teacherId: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  gpsVerified: boolean;
  gpsDistance?: number | null;
  method: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  method: 'AI' | 'MANUAL';
  confidence?: number | null;
  manuallyModified: boolean;
  anomalyFlag: boolean;
  anomalyReason?: string | null;
  date: string;
  className: string;
}

export interface Mark {
  id: string;
  studentId: string;
  subjectName: string;
  examName: string;
  maxMarks: number;
  obtainedMarks: number;
  percentage: number;
  examDate: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  description: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'ATTENDANCE' | 'HOLIDAY' | 'FEEDBACK' | 'MARKS' | 'ALERT';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface FeedbackItem {
  id: string;
  parentId: string;
  parentName: string;
  studentId: string;
  studentName: string;
  subject: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'REPLIED' | 'RESOLVED';
  teacherReply?: string | null;
  repliedAt?: string | null;
  createdAt: string;
}

export interface Anomaly {
  id: string;
  sessionId?: string | null;
  studentId?: string | null;
  reason: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  resolved: boolean;
  createdAt: string;
}
