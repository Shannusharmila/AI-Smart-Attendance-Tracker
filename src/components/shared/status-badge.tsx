"use client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const s = status.toUpperCase();
  const cls = s === "PRESENT" ? "bg-emerald-100 text-emerald-700 border-emerald-200"
    : s === "ABSENT" ? "bg-rose-100 text-rose-700 border-rose-200"
    : s === "LATE" ? "bg-amber-100 text-amber-700 border-amber-200"
    : s === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-200"
    : s === "REPLIED" ? "bg-sky-100 text-sky-700 border-sky-200"
    : s === "RESOLVED" ? "bg-emerald-100 text-emerald-700 border-emerald-200"
    : s === "HIGH" ? "bg-rose-100 text-rose-700 border-rose-200"
    : s === "MEDIUM" ? "bg-amber-100 text-amber-700 border-amber-200"
    : s === "LOW" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-muted text-muted-foreground";
  return <Badge className={cn(cls, className)}>{s}</Badge>;
}
