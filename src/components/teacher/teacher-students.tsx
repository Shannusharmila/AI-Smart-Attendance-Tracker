'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/use-fetch';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AvatarWithInitials } from '@/components/shared/avatar-with-initials';
import { EmptyState } from '@/components/shared/badges';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Users, Search, Plus, Phone, CalendarDays, BookOpen, Eye, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';

export function TeacherStudents({ classes }: { classes: string[] }) {
  const [className, setClassName] = useState('ALL');
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const url = `/api/students?${new URLSearchParams({
    ...(className && className !== 'ALL' && { className }),
    ...(search && { search }),
  }).toString()}`;

  const { data, loading, refetch } = useFetch<any[]>(url, [className, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Students</h1>
          <p className="text-sm text-slate-500">{data?.length || 0} students</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white h-10">
          <Plus className="h-4 w-4" /> Add Student
        </Button>
      </div>

      {/* Filters */}
      <Card className="card-shadow border-slate-200/80">
        <CardContent className="pt-5 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={className} onValueChange={setClassName}>
            <SelectTrigger><SelectValue placeholder="All classes" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All classes</SelectItem>
              {classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Student cards */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="h-6 w-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      ) : !data || data.length === 0 ? (
        <Card><CardContent><EmptyState icon={Users} title="No students found" description="Add a new student or adjust your search." /></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.map((s: any) => (
            <Card key={s.id} className="card-shadow border-slate-200/80 hover:shadow-md transition">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <AvatarWithInitials name={s.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{s.name}</p>
                    <p className="text-xs text-slate-500">Roll #{s.rollNumber} · {s.className}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-xs font-semibold ${s.attendancePercentage >= 75 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {s.attendancePercentage.toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-slate-400">attendance</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Users className="h-3.5 w-3.5 text-slate-400" /> {s.parentName}
                  </div>
                  {s.parentPhone && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Phone className="h-3.5 w-3.5 text-slate-400" /> {s.parentPhone}
                    </div>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => setSelectedStudent(s)}>
                    <Eye className="h-3.5 w-3.5" /> Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Student Dialog */}
      <AddStudentDialog open={addOpen} onOpenChange={setAddOpen} onAdded={refetch} classes={classes} />

      {/* Profile sheet */}
      <Sheet open={!!selectedStudent} onOpenChange={(v) => !v && setSelectedStudent(null)}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          {selectedStudent && <StudentProfile studentId={selectedStudent.id} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function AddStudentDialog({ open, onOpenChange, onAdded, classes }: { open: boolean; onOpenChange: (v: boolean) => void; onAdded: () => void; classes: string[] }) {
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [className, setClassName] = useState(classes[0] || 'CSE-A');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name || !rollNumber || !parentName) {
      toast.error('Please complete all required fields');
      return;
    }
    setSaving(true);
    try {
      const cls = className.split('-')[0];
      const section = className.split('-')[1] || 'A';
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rollNumber, class: cls, section, parentName, parentPhone }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to add student');
        return;
      }
      toast.success(`${name} added to ${className}`);
      onAdded();
      onOpenChange(false);
      setName(''); setRollNumber(''); setParentName(''); setParentPhone('');
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>Create a new student record.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label className="text-xs">Student Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aarav Kumar" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Roll No *</Label>
              <Input value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} placeholder="01" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Class</Label>
              <Select value={className} onValueChange={setClassName}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Parent Name *</Label>
            <Input value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="e.g. Mr. Kumar" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Parent Phone</Label>
            <Input value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="9876543210" className="mt-1" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {saving ? 'Saving…' : 'Add Student'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StudentProfile({ studentId }: { studentId: string }) {
  const { data, loading } = useFetch<any>(`/api/students/${studentId}`);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-6 w-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }
  if (!data) return <p className="text-center text-slate-500 py-10">Failed to load</p>;

  const { student, attendanceHistory, marks } = data;
  return (
    <>
      <SheetHeader>
        <SheetTitle>Student Profile</SheetTitle>
        <SheetDescription>Full student details</SheetDescription>
      </SheetHeader>
      <div className="px-4 pb-4 space-y-4">
        <div className="flex items-center gap-3">
          <AvatarWithInitials name={student.name} size="xl" />
          <div>
            <p className="text-base font-semibold text-slate-900">{student.name}</p>
            <p className="text-sm text-slate-500">Roll #{student.rollNumber} · {student.className}</p>
            <p className="text-xs text-slate-500 mt-0.5">{student.parentName}</p>
          </div>
        </div>

        {/* Attendance summary */}
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-emerald-600" /> Attendance Summary
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xl font-bold text-emerald-700">{student.totalAttended}</p>
              <p className="text-[10px] text-slate-500">Present</p>
            </div>
            <div>
              <p className="text-xl font-bold text-rose-700">{student.totalSessions - student.totalAttended}</p>
              <p className="text-[10px] text-slate-500">Absent</p>
            </div>
            <div>
              <p className={`text-xl font-bold ${student.attendancePercentage >= 75 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {student.attendancePercentage.toFixed(1)}%
              </p>
              <p className="text-[10px] text-slate-500">Attendance</p>
            </div>
          </div>
        </div>

        {/* Marks */}
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-emerald-600" /> Marks
          </p>
          {marks.length === 0 ? (
            <p className="text-xs text-slate-500">No marks recorded.</p>
          ) : (
            <div className="space-y-1.5">
              {marks.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{m.subjectName}</p>
                    <p className="text-[10px] text-slate-500">{m.examName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{m.obtainedMarks}/{m.maxMarks}</p>
                    <p className={`text-[10px] ${m.percentage >= 75 ? 'text-emerald-700' : 'text-amber-700'}`}>{m.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent attendance */}
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-emerald-600" /> Recent Attendance
          </p>
          {attendanceHistory.length === 0 ? (
            <p className="text-xs text-slate-500">No records yet.</p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin">
              {attendanceHistory.slice(0, 10).map((r: any) => (
                <div key={r.id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">{r.date}</span>
                  <span className={`font-medium ${r.status === 'PRESENT' ? 'text-emerald-700' : 'text-rose-700'}`}>{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
