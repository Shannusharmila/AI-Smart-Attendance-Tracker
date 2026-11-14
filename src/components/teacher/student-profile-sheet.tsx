"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { AvatarWithInitials } from "@/components/shared/avatar-with-initials";
import type { Student, AttendanceRecord, Mark } from "@/lib/types";
import { ConfidenceBar } from "@/components/shared/confidence-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { gradeForPercentage } from "@/lib/constants";
import { Award, BookOpen } from "lucide-react";

export function StudentProfileSheet({ student, open, onOpenChange }: { student: Student | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!student) return;
    let cancelled = false;
    // mark loading asynchronously (after current render commit) to satisfy lint
    Promise.resolve().then(() => { if (!cancelled) setLoading(true); });
    fetch(`/api/students/${student.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setRecords(d.records ?? []);
        setMarks(d.marks ?? []);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [student]);

  if (!student) return null;
  const pct = Math.round(student.attendancePercentage);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <AvatarWithInitials name={student.name} size="lg" />
            <div className="min-w-0">
              <p className="truncate">{student.name}</p>
              <p className="text-xs font-normal text-muted-foreground">Roll #{student.rollNumber} · {student.className}</p>
            </div>
          </SheetTitle>
          <SheetDescription>Student profile & records</SheetDescription>
        </SheetHeader>

        {/* Attendance summary with progress ring */}
        <div className="px-4 pb-8 space-y-4">
          <Card className="rounded-2xl p-4 card-shadow flex items-center gap-4">
            <ProgressRing value={pct} />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Attendance Percentage</p>
              <p className="text-xl font-bold">{pct}%</p>
              <p className="text-xs text-muted-foreground mt-1">{student.totalAttended} of {student.totalSessions} sessions attended</p>
            </div>
          </Card>

          {/* Parent info */}
          <Card className="rounded-2xl p-4 card-shadow">
            <p className="text-xs text-muted-foreground mb-2">Parent / Guardian</p>
            <p className="text-sm font-semibold">{student.parentName}</p>
            <p className="text-sm text-muted-foreground">{student.parentPhone ?? "—"}</p>
          </Card>

          {/* Marks summary */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-emerald-600" />
              <p className="text-sm font-semibold">Marks Summary</p>
            </div>
            {marks.length === 0 ? <p className="text-sm text-muted-foreground">No marks recorded yet.</p> :
              <div className="space-y-2">
                {marks.map((m) => {
                  const pct = Math.round(m.percentage);
                  return (
                    <div key={m.id} className="rounded-xl border border-border p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <p className="text-sm font-medium">{m.subjectName}</p>
                          <p className="text-xs text-muted-foreground">{m.examName} · {m.examDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{m.obtainedMarks}/{m.maxMarks} ({pct}%)</p>
                          <p className="text-xs font-semibold text-primary">Grade {gradeForPercentage(pct)}</p>
                        </div>
                      </div>
                      <ConfidenceBar value={pct} />
                    </div>
                  );
                })}
              </div>
            }
          </div>

          {/* Recent attendance */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-emerald-600" />
              <p className="text-sm font-semibold">Recent Attendance</p>
            </div>
            {loading ? <p className="text-sm text-muted-foreground">Loading…</p> :
              records.length === 0 ? <p className="text-sm text-muted-foreground">No attendance records yet.</p> :
              <div className="space-y-1.5 max-h-72 overflow-y-auto scrollbar-thin">
                {records.slice(0, 10).map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{r.date} · {r.session?.subjectName ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">Period {r.session?.period ?? "—"} · {r.method}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            }
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ProgressRing({ value }: { value: number }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const color = value >= 75 ? "#10b981" : value >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16">
      <circle cx="32" cy="32" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
      <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="6" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 32 32)" />
      <text x="32" y="36" textAnchor="middle" fontSize="13" fontWeight="700" fill={color}>{value}%</text>
    </svg>
  );
}
