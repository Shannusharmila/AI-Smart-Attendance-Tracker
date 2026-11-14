"use client";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { AvatarWithInitials } from "@/components/shared/avatar-with-initials";
import { StudentProfileSheet } from "./student-profile-sheet";
import { useAppStore } from "@/lib/store";
import { CLASSES } from "@/lib/constants";
import type { Student } from "@/lib/types";
import { Users, Search, UserPlus, Eye, Phone } from "lucide-react";

export function TeacherStudents() {
  const { currentUser } = useAppStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [className, setClassName] = useState("ALL");
  const [q, setQ] = useState("");
  const [profileStudent, setProfileStudent] = useState<Student | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/students?className=${encodeURIComponent(className)}&q=${encodeURIComponent(q)}`);
      const d = await res.json();
      setStudents(d.students ?? []);
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load();   }, [className]);

  const filtered = useMemo(() => {
    if (!q) return students;
    const ql = q.toLowerCase();
    return students.filter((s) => s.name.toLowerCase().includes(ql) || s.rollNumber.includes(q) || s.parentName.toLowerCase().includes(ql));
  }, [students, q]);

  function openProfile(s: Student) {
    setProfileStudent(s);
    setProfileOpen(true);
  }

  return (
    <div className="space-y-4">
      <SectionHeader title="Students" description="Manage student records" icon={Users} action={<Button size="sm" onClick={() => setAddOpen(true)}><UserPlus className="h-4 w-4" /> Add Student</Button>} />

      <Card className="rounded-2xl p-3 sm:p-4 card-shadow">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search name, roll, parent…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={className} onValueChange={setClassName}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Class" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Classes</SelectItem>
              {CLASSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {loading ? <LoadingSpinner label="Loading students…" className="py-12" /> :
        filtered.length === 0 ? <EmptyState icon={Users} title="No students found" description="Try changing the search or class filter." /> :
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((s) => (
            <Card key={s.id} className="rounded-2xl p-4 card-shadow">
              <div className="flex items-start gap-3">
                <AvatarWithInitials name={s.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">Roll #{s.rollNumber} · {s.className}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Parent: {s.parentName}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> {s.parentPhone ?? "—"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div>
                  <p className={`text-sm font-bold ${s.attendancePercentage >= 75 ? "text-emerald-600" : "text-rose-600"}`}>{Math.round(s.attendancePercentage)}%</p>
                  <p className="text-[10px] text-muted-foreground">Attendance</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => openProfile(s)}><Eye className="h-3.5 w-3.5" /> View Profile</Button>
              </div>
            </Card>
          ))}
        </div>
      }

      <StudentProfileSheet student={profileStudent} open={profileOpen} onOpenChange={setProfileOpen} />

      <AddStudentDialog open={addOpen} onOpenChange={setAddOpen} onCreated={() => { setAddOpen(false); load(); }} />
    </div>
  );
}

function AddStudentDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [cls, setCls] = useState("CSE");
  const [section, setSection] = useState("A");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name || !roll || !parentName) {
      toast.error("Please complete all required fields.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rollNumber: roll, class: cls, section, parentName, parentPhone }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed");
      toast.success("Student added successfully.");
      setName(""); setRoll(""); setParentName(""); setParentPhone("");
      onCreated();
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
          <DialogTitle>Add Student</DialogTitle>
          <DialogDescription>Add a new student record to the school.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label>Full Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Aarav Kumar" />
          </div>
          <div className="space-y-1.5">
            <Label>Roll No *</Label>
            <Input value={roll} onChange={(e) => setRoll(e.target.value)} placeholder="e.g., 11" />
          </div>
          <div className="space-y-1.5">
            <Label>Class</Label>
            <Select value={cls} onValueChange={setCls}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["CSE", "IT"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Section</Label>
            <Select value={section} onValueChange={setSection}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["A", "B"].map((s) => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Parent / Guardian *</Label>
            <Input value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="e.g., Anil Kumar" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Parent Phone</Label>
            <Input value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="e.g., +91 90000 00000" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Student"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
