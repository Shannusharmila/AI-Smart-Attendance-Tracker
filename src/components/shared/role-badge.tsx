"use client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  const cls = role === "TEACHER" ? "bg-emerald-100 text-emerald-700 border-emerald-200"
    : role === "PARENT" ? "bg-amber-100 text-amber-700 border-amber-200"
    : "bg-violet-100 text-violet-700 border-violet-200";
  return <Badge className={cn(cls, className)}>{role}</Badge>;
}
