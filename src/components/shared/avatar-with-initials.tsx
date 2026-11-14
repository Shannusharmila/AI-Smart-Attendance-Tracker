'use client';

import { cn } from '@/lib/utils';

interface AvatarWithInitialsProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const COLOR_CLASSES = [
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700',
  'bg-lime-100 text-lime-700',
  'bg-cyan-100 text-cyan-700',
  'bg-fuchsia-100 text-fuchsia-700',
];

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
};

export function AvatarWithInitials({ name, size = 'md', className }: AvatarWithInitialsProps) {
  const colorIdx = hashName(name) % COLOR_CLASSES.length;
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold shrink-0',
        SIZES[size],
        COLOR_CLASSES[colorIdx],
        className
      )}
      aria-label={`Avatar for ${name}`}
    >
      {initials(name)}
    </div>
  );
}
