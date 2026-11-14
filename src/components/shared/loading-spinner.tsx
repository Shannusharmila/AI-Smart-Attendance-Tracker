"use client";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({ size = 24, className, label }: { size?: number; className?: string; label?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-2 text-muted-foreground", className)} role="status" aria-live="polite">
      <Loader2 className="animate-spin" style={{ width: size, height: size }} aria-hidden="true" />
      {label ? <span className="text-sm">{label}</span> : null}
      <span className="sr-only">Loading</span>
    </div>
  );
}
