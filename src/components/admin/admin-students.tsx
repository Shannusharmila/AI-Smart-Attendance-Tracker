'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/use-fetch';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AvatarWithInitials } from '@/components/shared/avatar-with-initials';
import { EmptyState } from '@/components/shared/badges';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Users, Search, Plus, Phone } from 'lucide-react';
import { toast } from 'sonner';

export function AdminStudents() {
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
          <p className="text-sm text-slate-500">{data?.length || 0} total</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white h-10">
          <Plus className="h-4 w-4" /> Add Student
        </Button>
      </div>

      <Card className="card-shadow border-slate-200/80">
        <CardContent className="pt-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={className} onValueChange={setClassName}>
            <SelectTrigger><SelectValue placeholder="All classes" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All classes</SelectItem>
              <SelectItem value="CSE-A">CSE-A</SelectItem>
              <SelectItem value="CSE-B">CSE-B</SelectItem>
              <SelectItem value="IT-A">IT-A</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="h-6 w-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      ) : !data || data.length === 0 ? (
        <Card><CardContent><EmptyState icon={Users} title="No students found" /></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.map((s: any) => (
            <Card key={s.id} className="card-shadow border-slate-200/80">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <AvatarWithInitials name={s.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{s.name}</p>
                    <p className="text-xs text-slate-500">Roll #{s.rollNumber} · {s.className}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-xs font-semibold ${s.attendancePercentage >= 75 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {s.attendancePercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                  <p className="flex items-center gap-2"><Users className="h-3 w-3 text-slate-400" /> {s.parentName}</p>
                  {s.parentPhone && <p className="flex items-center gap-2"><Phone className="h-3 w-3 text-slate-400" /> {s.parentPhone}</p>}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2 h-8 text-xs" onClick={() => setSelectedStudent(s)}>View Profile</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddStudentDialog open={addOpen} onOpenChange={setAddOpen} onAdded={refetch} />
      <Sheet open={!!selectedStudent} onOpenChange={(v) => !v && setSelectedStudent(null)}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          {selectedStudent && <ProfileView studentId={selectedStudent.id} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function AddStudentDialog({ open, onOpenChange, onAdded }: { open: boolean; onOpenChange: (v: boolean) => void; onAdded: () => void }) {
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [cls, setCls] = useState('CSE');
  const [section, setSection] = useState('A');
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
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rollNumber, class: cls, section, parentName, parentPhone }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed'); return; }
      toast.success(`${name} added`);
      onAdded();
      onOpenChange(false);
      setName(''); setRollNumber(''); setParentName(''); setParentPhone('');
    } catch {
      toast.error('Network error');
    } finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>Add a new student record.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div><Label className="text-xs">Student Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">Roll No *</Label><Input value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} className="mt-1" /></div>
            <div><Label className="text-xs">Class</Label>
              <Select value={cls} onValueChange={setCls}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="CSE">CSE</SelectItem><SelectItem value="IT">IT</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div><Label className="text-xs">Section</Label>
            <Select value={section} onValueChange={setSection}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Parent Name *</Label><Input value={parentName} onChange={(e) => setParentName(e.target.value)} className="mt-1" /></div>
          <div><Label className="text-xs">Parent Phone</Label><Input value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} className="mt-1" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">{saving ? 'Saving…' : 'Add Student'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProfileView({ studentId }: { studentId: string }) {
  const { data, loading } = useFetch<any>(`/api/students/${studentId}`);
  if (loading) return <div className="flex justify-center py-10"><div className="h-6 w-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" /></div>;
  if (!data) return <p className="text-center text-slate-500 py-10">Not found</p>;
  const { student, attendanceHistory, marks } = data;
  return (
    <>
      <SheetHeader>
        <SheetTitle>Student Profile</SheetTitle>
        <SheetDescription>{student.name}</SheetDescription>
      </SheetHeader>
      <div className="px-4 pb-4 space-y-4">
        <div className="flex items-center gap-3">
          <AvatarWithInitials name={student.name} size="xl" />
          <div>
            <p className="text-base font-semibold text-slate-900">{student.name}</p>
            <p className="text-sm text-slate-500">Roll #{student.rollNumber} · {student.className}</p>
            <p className="text-xs text-slate-500">{student.parentName}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div><p className="text-lg font-bold text-emerald-700">{student.totalAttended}</p><p className="text-[10px] text-slate-500">Present</p></div>
          <div><p className="text-lg font-bold text-rose-700">{student.totalSessions - student.totalAttended}</p><p className="text-[10px] text-slate-500">Absent</p></div>
          <div><p className={`text-lg font-bold ${student.attendancePercentage >= 75 ? 'text-emerald-700' : 'text-rose-700'}`}>{student.attendancePercentage.toFixed(1)}%</p><p className="text-[10px] text-slate-500">Attendance</p></div>
        </div>
        {marks && marks.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-1">Marks</p>
            <div className="space-y-1">
              {marks.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between text-sm p-2 rounded bg-slate-50">
                  <span>{m.subjectName} · {m.examName}</span>
                  <span className="font-semibold">{m.obtainedMarks}/{m.maxMarks} · {m.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {attendanceHistory && attendanceHistory.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-1">Recent Attendance</p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {attendanceHistory.slice(0, 10).map((r: any) => (
                <div key={r.id} className="flex justify-between text-xs p-1.5">
                  <span>{r.date}</span>
                  <span className={`font-medium ${r.status === 'PRESENT' ? 'text-emerald-700' : 'text-rose-700'}`}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
