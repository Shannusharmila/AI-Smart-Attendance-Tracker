"use client";
import { Badge } from "@/components/ui/badge";
import { Check, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function RecognitionBadge({ recognized }: { recognized: boolean }) {
  return recognized ? (
    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
      <Check className="h-3 w-3" /> Recognized
    </Badge>
  ) : (
    <Badge className="bg-rose-100 text-rose-700 border-rose-200">
      <X className="h-3 w-3" /> Not Recognized
    </Badge>
  );
}

export function AnomalyBadge({ reason, className }: { reason?: string | null; className?: string }) {
  return (
    <Badge className={cn("bg-amber-100 text-amber-700 border-amber-200", className)}>
      <AlertTriangle className="h-3 w-3" /> {reason ?? "Anomaly"}
    </Badge>
  );
}
