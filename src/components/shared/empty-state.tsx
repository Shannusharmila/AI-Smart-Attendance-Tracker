"use client";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: { icon: LucideIcon; title: string; description?: string; actionLabel?: string; onAction?: () => void; }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 rounded-2xl border border-dashed border-border bg-muted/30">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description ? <p className="text-sm text-muted-foreground mt-1 max-w-md">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button className="mt-4" size="sm" onClick={onAction}>{actionLabel}</Button>
      ) : null}
    </div>
  );
}
