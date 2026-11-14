"use client";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function DemoModeBanner({ className, title = "Demo Mode Active", description = "Use demo accounts to explore all roles." }: { className?: string; title?: string; description?: string }) {
  return (
    <div className={cn("flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800", className)} role="status">
      <Sparkles className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
      <div className="flex flex-wrap items-baseline gap-x-2 min-w-0">
        <span className="font-semibold">{title}.</span>
        <span className="text-amber-700/90">{description}</span>
      </div>
    </div>
  );
}

export function DemoModeChip({ className }: { className?: string }) {
  return (
    <Badge className={cn("bg-amber-100 text-amber-700 border-amber-200 gap-1", className)}>
      <Sparkles className="h-3 w-3" /> DEMO
    </Badge>
  );
}
