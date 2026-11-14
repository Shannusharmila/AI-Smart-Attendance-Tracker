"use client";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { StatCard } from "@/components/shared/stat-card";
import { AvatarWithInitials } from "@/components/shared/avatar-with-initials";
import { useAppStore } from "@/lib/store";
import { CLASSES, gradeForPercentage } from "@/lib/constants";
import { EXAM_NAMES } from "@/lib/seed-data";
import { BookOpen, Plus, Award, TrendingDown, TrendingUp } from "lucide-react";
import type { Mark, Student } from "@/lib/types";

export function TeacherMarks() {
  const { currentUser } = useAppStore();
  const [marks, setMarks] = useState<(Mark & { student?: Student })[]>([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [className, setClassName] = useState("ALL");
  const [subject, setSubject] = useState("ALL");
  const [exam, setExam] = useState("ALL");

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (className !== "ALL") params.set("class", className);
      if (subject !== "ALL") params.set("subject", subject);
      if (exam !== "ALL") params.set("exam", exam);
      const res = await fetch(`/api/marks?${params.toString()}`);
      const d = await res.json();
      setMarks(d.marks ?? []);
    } catch {
      toast.error("Failed to load marks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetch("/api/students").then((r) => r.json()).then((d) => setStudents(d.students ?? []));
  }, []);

  useEffect(() => { load();   }, [className, subject, exam]);

  const summary = useMemo(() => {
    if (marks.length === 0) return { avg: 0, top: null as null | (Mark & { student?: Student }), low: null as null | (Mark & { student?: Student }) };
    const avg = Math.round(marks.reduce((a, m) => a + m.percentage, 0) / marks.length);
    const top = marks.reduce((acc, m) => (acc && acc.percentage >= m.percentage ? acc : m), marks[0]);
    const low = marks.reduce((acc, m) => (acc && acc.percentage <= m.percentage ? acc : m), marks[0]);
    return { avg, top, low };
  }, [marks]);

  return (
    <div className="space-y-4">
      <SectionHeader title="Marks Management" description="Record & view exam marks" icon={BookOpen} action={<Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add Marks</Button>} />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard title="Class Average" value={`${summary.avg}%`} hint={`${marks.length} records`} icon={TrendingUp} variant="emerald" />
        <StatCard title="Top Scorer" value={summary.top ? `${summary.top.student?.name ?? "—"} (${Math.round(summary.top.percentage)}%)` : "—"} hint={summary.top?.subjectName} icon={Award} variant="amber" />
        <StatCard title="Lowest Scorer" value={summary.low ? `${summary.low.student?.name ?? "—"} (${Math.round(summary.low.percentage)}%)` : "—"} hint={summary.low?.subjectName} icon={TrendingDown} variant="rose" />
      </div>

      {/* Filters */}
      <Card className="rounded-2xl p-3 sm:p-4 card-shadow">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Select value={className} onValueChange={setClassName}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Class" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Classes</SelectItem>
              {CLASSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Subject" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Subjects</SelectItem>
              {["Mathematics", "Computer Science", "Physics", "English"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={exam} onValueChange={setExam}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Exam" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Exams</SelectItem>
              {EXAM_NAMES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="rounded-2xl card-shadow overflow-hidden">
        {loading ? <LoadingSpinner label="Loading…" className="py-12" /> :
          marks.length === 0 ? <EmptyState icon={BookOpen} title="No marks recorded" description="Add marks to view them here." /> :
          <div className="max-h-[70vh] overflow-y-auto scrollbar-thin">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead className="hidden sm:table-cell">Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="hidden sm:table-cell">Exam</TableHead>
                  <TableHead>Obtained</TableHead>
                  <TableHead>%</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marks.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <AvatarWithInitials name={m.student?.name ?? "?"} size="sm" className="hidden sm:flex" />
                        <div className="min-w-0">
                          <p className="truncate">{m.student?.name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">{m.student?.className ?? "—"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs">{m.student?.className ?? "—"}</TableCell>
                    <TableCell className="text-xs">{m.subjectName}</TableCell>
                    <TableCell className="hidden sm:table-cell text-xs">{m.examName}</TableCell>
                    <TableCell className="text-xs">{m.obtainedMarks}/{m.maxMarks}</TableCell>
                    <TableCell className="text-xs">{Math.round(m.percentage)}%</TableCell>
                    <TableCell><span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-semibold">{gradeForPercentage(m.percentage)}</span></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        }
      </Card>

      <AddMarksDialog open={addOpen} onOpenChange={setAddOpen} students={students} onSaved={() => { setAddOpen(false); load(); }} teacherId={currentUser?.linkedId ?? ""} />
    </div>
  );
}

function AddMarksDialog({ open, onOpenChange, students, onSaved, teacherId }: { open: boolean; onOpenChange: (o: boolean) => void; students: Student[]; onSaved: () => void; teacherId: string }) {
  const [studentId, setStudentId] = useState("");
  const [subjectName, setSubjectName] = useState("Mathematics");
  const [examName, setExamName] = useState("Mid Term");
  const [maxMarks, setMaxMarks] = useState(100);
  const [obtainedMarks, setObtainedMarks] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!studentId || obtainedMarks === "") {
      toast.error("Please select a student and enter marks.");
      return;
    }
    if (Number(obtainedMarks) > Number(maxMarks)) {
      toast.error("Obtained marks cannot exceed max marks.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, subjectName, examName, maxMarks: Number(maxMarks), obtainedMarks: Number(obtainedMarks) }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed");
      toast.success("Marks saved. Parent will be notified.");
      setObtainedMarks("");
      onSaved();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Marks</DialogTitle>
          <DialogDescription>Record exam marks for a student. Percentage is auto-calculated.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label>Student *</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select student" /></SelectTrigger>
              <SelectContent>
                {students.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} · {s.className} #{s.rollNumber}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Select value={subjectName} onValueChange={setSubjectName}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Mathematics", "Computer Science", "Physics", "English"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Exam</Label>
            <Select value={examName} onValueChange={setExamName}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {EXAM_NAMES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Max Marks</Label>
            <Input type="number" value={maxMarks} onChange={(e) => setMaxMarks(Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Obtained Marks *</Label>
            <Input type="number" value={obtainedMarks} onChange={(e) => setObtainedMarks(e.target.value === "" ? "" : Number(e.target.value))} />
          </div>
          <div className="col-span-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800">
            Percentage: <strong>{obtainedMarks !== "" && maxMarks ? Math.round((Number(obtainedMarks) / Number(maxMarks)) * 100 * 10) / 10 : 0}%</strong> · Grade: <strong>{obtainedMarks !== "" && maxMarks ? gradeForPercentage((Number(obtainedMarks) / Number(maxMarks)) * 100) : "—"}</strong>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Marks"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
