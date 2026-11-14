'use client';

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const s = status.toUpperCase();
  const cls =
    s === 'PRESENT'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : s === 'ABSENT'
        ? 'bg-rose-100 text-rose-700 border-rose-200'
        : s === 'LATE'
          ? 'bg-amber-100 text-amber-700 border-amber-200'
          : s === 'PENDING'
            ? 'bg-amber-100 text-amber-700 border-amber-200'
            : s === 'REPLIED'
              ? 'bg-sky-100 text-sky-700 border-sky-200'
              : s === 'RESOLVED'
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                : s === 'HIGH' || s === 'MEDIUM'
                  ? 'bg-orange-100 text-orange-700 border-orange-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', cls, className)}>
      {s}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const cls =
    role === 'TEACHER'
      ? 'bg-emerald-100 text-emerald-700'
      : role === 'PARENT'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-rose-100 text-rose-700';
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', cls)}>
      {role.charAt(0) + role.slice(1).toLowerCase()}
    </span>
  );
}

export function DemoModeBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
      DEMO MODE
    </span>
  );
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <Icon className="h-7 w-7 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {description && <p className="text-xs text-slate-500 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
