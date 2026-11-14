'use client';

import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface ConfidenceBarProps {
  value: number; // 0-100
  className?: string;
}

export function ConfidenceBar({ value, className }: ConfidenceBarProps) {
  const color = value >= 90 ? 'bg-emerald-500' : value >= 75 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
      <span className={cn('text-xs font-medium tabular-nums', value >= 90 ? 'text-emerald-700' : value >= 75 ? 'text-amber-700' : 'text-rose-700')}>
        {value.toFixed(1)}%
      </span>
    </div>
  );
}

export function RecognitionBadge({ recognized, confidence }: { recognized: boolean; confidence: number }) {
  if (recognized && confidence >= 80) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
        Recognized
      </span>
    );
  }
  if (recognized && confidence < 80) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
        <AlertTriangle className="h-3 w-3" />
        Low confidence
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-medium">
      Not recognized
    </span>
  );
}
