'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'emerald' | 'amber' | 'rose' | 'teal' | 'slate' | 'orange';
  subtitle?: string;
  onClick?: () => void;
}

const VARIANTS = {
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  rose: 'bg-rose-50 text-rose-700',
  teal: 'bg-teal-50 text-teal-700',
  slate: 'bg-slate-100 text-slate-700',
  orange: 'bg-orange-50 text-orange-700',
};

export function StatCard({ label, value, icon: Icon, variant = 'emerald', subtitle, onClick }: StatCardProps) {
  return (
    <Card
      className={cn('p-4 card-shadow border-slate-200/60', onClick && 'cursor-pointer hover:shadow-md transition-shadow')}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">{label}</p>
          <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
        </div>
        <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', VARIANTS[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
