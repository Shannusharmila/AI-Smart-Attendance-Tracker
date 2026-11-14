'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/use-fetch';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/badges';
import { AvatarWithInitials } from '@/components/shared/avatar-with-initials';
import { Plus, GraduationCap, Mail, Phone, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export function AdminTeachers() {
  const { data, loading, refetch } = useFetch<any[]>('/api/teachers');
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Teachers</h1>
          <p className="text-sm text-slate-500">{data?.length || 0} teaching staff</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white h-10">
          <Plus className="h-4 w-4" /> Add Teacher
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10"><div className="h-6 w-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" /></div>
      ) : !data || data.length === 0 ? (
        <Card><CardContent><EmptyState icon={GraduationCap} title="No teachers" /></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.map((t: any) => (
            <Card key={t.id} className="card-shadow border-slate-200/80">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <AvatarWithInitials name={t.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{t.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1"><BookOpen className="h-3 w-3" /> {t.subject}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(t.classes || []).map((c: string) => (
                        <span key={c} className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                  <p className="flex items-center gap-2"><Mail className="h-3 w-3 text-slate-400" /> {t.email}</p>
                  {t.phone && <p className="flex items-center gap-2"><Phone className="h-3 w-3 text-slate-400" /> {t.phone}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddTeacherDialog open={addOpen} onOpenChange={setAddOpen} onAdded={refetch} />
    </div>
  );
}

function AddTeacherDialog({ open, onOpenChange, onAdded }: { open: boolean; onOpenChange: (v: boolean) => void; onAdded: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [classes, setClasses] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  function toggleClass(c: string) {
    setClasses((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }

  async function save() {
    if (!name || !email || !subject || classes.length === 0) {
      toast.error('Please complete all required fields');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, classes }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed'); return; }
      toast.success(`${name} added. Default password: teacher123`);
      onAdded();
      onOpenChange(false);
      setName(''); setEmail(''); setPhone(''); setClasses([]);
    } catch {
      toast.error('Network error');
    } finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Teacher</DialogTitle>
          <DialogDescription>Default password is teacher123. They can change it after login.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div><Label className="text-xs">Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mr. Rajesh Kumar" className="mt-1" /></div>
          <div><Label className="text-xs">Email *</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teacher@school.com" className="mt-1" /></div>
          <div><Label className="text-xs">Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" className="mt-1" /></div>
          <div>
            <Label className="text-xs">Subject *</Label>
            <Select value={subject} onValueChange={setSubject}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
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
            <Label className="text-xs">Classes *</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {['CSE-A', 'CSE-B', 'IT-A'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleClass(c)}
                  className={`py-2 rounded-lg border-2 text-xs font-medium transition ${
                    classes.includes(c) ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">{saving ? 'Saving…' : 'Add Teacher'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
