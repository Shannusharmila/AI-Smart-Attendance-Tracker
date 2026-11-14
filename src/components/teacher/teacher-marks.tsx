'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/use-fetch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/badges';
import { AvatarWithInitials } from '@/components/shared/avatar-with-initials';
import { Plus, BookOpen, Award, TrendingDown } from 'lucide-react';
import { getGrade } from '@/lib/constants';
import { toast } from 'sonner';
import { EXAM_TYPES } from '@/lib/constants';

export function TeacherMarks({ classes, teacherUserId }: { classes: string[]; teacherUserId?: string }) {
  const [className, setClassName] = useState('ALL');
  const [subject, setSubject] = useState('');
  const [exam, setExam] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(0);

  const url = className && className !== 'ALL' ? `/api/students?className=${className}` : `/api/students`;
  const { data: students, loading } = useFetch<any[]>(url, [className]);

  // For each student, fetch their marks
  const [marksByStudent, setMarksByStudent] = useState<Record<string, any[]>>({});
  async function loadMarks(studentId: string) {
    if (marksByStudent[studentId]) return;
    try {
      const res = await fetch(`/api/marks?studentId=${studentId}`);
      const data = await res.json();
      setMarksByStudent((prev) => ({ ...prev, [studentId]: data }));
    } catch {}
  }
  // Trigger marks load for all visible students when list changes
  if (students && students.length > 0) {
    students.forEach((s: any) => {
      if (!marksByStudent[s.id]) loadMarks(s.id);
    });
  }

  const filteredStudents = students || [];

  // Stats
  const allMarks = filteredStudents.flatMap((s: any) => (marksByStudent[s.id] || []));
  const avgPct = allMarks.length > 0
    ? Math.round((allMarks.reduce((sum, m) => sum + m.percentage, 0) / allMarks.length) * 10) / 10
    : 0;
  const topMark = allMarks.length > 0 ? allMarks.reduce((max, m) => m.percentage > max.percentage ? m : max) : null;
  const lowMark = allMarks.length > 0 ? allMarks.reduce((min, m) => m.percentage < min.percentage ? m : min) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Marks Management</h1>
          <p className="text-sm text-slate-500">Enter and view student marks</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white h-10">
          <Plus className="h-4 w-4" /> Add Marks
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="card-shadow border-slate-200/80">
          <CardContent className="py-3">
            <p className="text-xs text-slate-500">Class Avg</p>
            <p className={`text-xl font-bold ${avgPct >= 75 ? 'text-emerald-700' : 'text-amber-700'}`}>{avgPct}%</p>
          </CardContent>
        </Card>
        <Card className="card-shadow border-slate-200/80">
          <CardContent className="py-3">
            <p className="text-xs text-slate-500 flex items-center gap-1"><Award className="h-3 w-3 text-amber-500" /> Top Score</p>
            <p className="text-xs font-medium text-slate-900 truncate">{topMark ? `${topMark.percentage}%` : '-'}</p>
          </CardContent>
        </Card>
        <Card className="card-shadow border-slate-200/80">
          <CardContent className="py-3">
            <p className="text-xs text-slate-500 flex items-center gap-1"><TrendingDown className="h-3 w-3 text-rose-500" /> Lowest</p>
            <p className="text-xs font-medium text-slate-900 truncate">{lowMark ? `${lowMark.percentage}%` : '-'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card className="card-shadow border-slate-200/80">
        <CardContent className="pt-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Select value={className} onValueChange={setClassName}>
            <SelectTrigger><SelectValue placeholder="All classes" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All classes</SelectItem>
              {classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Marks list */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="h-6 w-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <Card><CardContent><EmptyState icon={BookOpen} title="No students" description="Select a class to view students." /></CardContent></Card>
      ) : (
        <Card className="card-shadow border-slate-200/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto scrollbar-thin">
              {filteredStudents.map((s: any) => {
                const marks = marksByStudent[s.id] || [];
                return (
                  <div key={s.id} className="rounded-xl border border-slate-100 p-3">
                    <div className="flex items-center gap-2.5 mb-2">
                      <AvatarWithInitials name={s.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{s.name}</p>
                        <p className="text-[10px] text-slate-500">Roll #{s.rollNumber} · {s.className}</p>
                      </div>
                    </div>
                    {marks.length === 0 ? (
                      <p className="text-xs text-slate-400 pl-9">No marks recorded.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-9">
                        {marks.map((m: any) => (
                          <div key={m.id} className="flex items-center justify-between text-xs p-2 rounded bg-slate-50">
                            <div>
                              <p className="font-medium text-slate-800">{m.subjectName}</p>
                              <p className="text-[10px] text-slate-500">{m.examName}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-slate-900">{m.obtainedMarks}/{m.maxMarks}</p>
                              <p className={`text-[10px] ${m.percentage >= 75 ? 'text-emerald-700' : 'text-amber-700'}`}>{m.percentage}% · {getGrade(m.percentage)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <AddMarksDialog open={addOpen} onOpenChange={setAddOpen} onSaved={() => { setJustSaved((n) => n + 1); setMarksByStudent({}); }} classes={classes} />
    </div>
  );
}

function AddMarksDialog({ open, onOpenChange, onSaved, classes }: { open: boolean; onOpenChange: (v: boolean) => void; onSaved: () => void; classes: string[] }) {
  const [className, setClassName] = useState(classes[0] || 'CSE-A');
  const [studentId, setStudentId] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [examName, setExamName] = useState(EXAM_TYPES[0]);
  const [maxMarks, setMaxMarks] = useState('100');
  const [obtainedMarks, setObtainedMarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState<any[]>([]);

  async function loadStudents(cls: string) {
    const res = await fetch(`/api/students?className=${cls}`);
    const data = await res.json();
    setStudents(data);
    setStudentId('');
  }
  // Load students when dialog opens
  if (open && students.length === 0) loadStudents(className);

  const obtained = parseFloat(obtainedMarks);
  const max = parseFloat(maxMarks);
  const pct = !isNaN(obtained) && !isNaN(max) && max > 0 ? Math.round((obtained / max) * 1000) / 10 : 0;

  async function save() {
    if (!studentId || !subjectName || !examName || !obtainedMarks) {
      toast.error('Please complete all required fields');
      return;
    }
    if (obtained > max) {
      toast.error('Obtained marks cannot exceed maximum marks');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, subjectName, examName, maxMarks: max, obtainedMarks: obtained }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to save marks');
        return;
      }
      toast.success('Marks saved. Parent notified.');
      onSaved();
      onOpenChange(false);
      setObtainedMarks('');
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
          <DialogTitle>Add Marks</DialogTitle>
          <DialogDescription>Enter marks for a student. Percentage is auto-calculated.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Class</Label>
              <Select value={className} onValueChange={(v) => { setClassName(v); loadStudents(v); }}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Student *</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} (#{s.rollNumber})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Subject *</Label>
              <Select value={subjectName} onValueChange={setSubjectName}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Data Structures">Data Structures</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Exam *</Label>
              <Select value={examName} onValueChange={setExamName}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXAM_TYPES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Max Marks *</Label>
              <Input type="number" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Obtained *</Label>
              <Input type="number" value={obtainedMarks} onChange={(e) => setObtainedMarks(e.target.value)} className="mt-1" placeholder="0" />
            </div>
          </div>
          {obtainedMarks && maxMarks && !isNaN(obtained) && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center">
              <p className="text-xs text-emerald-700">Calculated Percentage</p>
              <p className="text-2xl font-bold text-emerald-800">{pct}% · {getGrade(pct)}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {saving ? 'Saving…' : 'Save Marks'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
