'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/use-fetch';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/badges';
import { Plus, CalendarOff, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO, differenceInCalendarDays } from 'date-fns';

export function TeacherHolidays({ user }: { user: any }) {
  const { data, loading, refetch } = useFetch<any[]>('/api/holidays');
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Holidays</h1>
          <p className="text-sm text-slate-500">{data?.length || 0} upcoming holiday{(data?.length || 0) !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white h-10">
          <Plus className="h-4 w-4" /> Add Holiday
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="h-6 w-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      ) : !data || data.length === 0 ? (
        <Card><CardContent><EmptyState icon={CalendarOff} title="No holidays scheduled" description="Add a holiday to notify all parents." action={<Button onClick={() => setAddOpen(true)} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">Add First Holiday</Button>} /></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.map((h: any) => {
            const days = differenceInCalendarDays(parseISO(h.date), new Date());
            const isUpcoming = days >= 0;
            return (
              <Card key={h.id} className="card-shadow border-slate-200/80">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className={`h-12 w-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${isUpcoming ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                      <span className="text-[10px] font-medium">{format(parseISO(h.date), 'MMM').toUpperCase()}</span>
                      <span className="text-base font-bold leading-none">{format(parseISO(h.date), 'dd')}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{h.name}</p>
                      <p className="text-xs text-slate-500">{format(parseISO(h.date), 'EEEE, dd MMMM yyyy')}</p>
                      <p className="text-xs text-slate-600 mt-1">{h.description}</p>
                      {isUpcoming && (
                        <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                          In {days} day{days !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AddHolidayDialog open={addOpen} onOpenChange={setAddOpen} onAdded={refetch} userId={user?.id} />
    </div>
  );
}

function AddHolidayDialog({ open, onOpenChange, onAdded, userId }: { open: boolean; onOpenChange: (v: boolean) => void; onAdded: () => void; userId?: string }) {
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name || !date || !description) {
      toast.error('Please complete all required fields');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, date, description, createdBy: userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to add holiday');
        return;
      }
      toast.success('Holiday added. All parents will be notified.');
      onAdded();
      onOpenChange(false);
      setName(''); setDescription('');
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
          <DialogTitle>Add Holiday</DialogTitle>
          <DialogDescription>All parents will be notified automatically.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label className="text-xs">Holiday Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Diwali Festival" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Date *</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Description *</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. School will remain closed." className="mt-1" rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {saving ? 'Saving…' : <><Send className="h-4 w-4" /> Add & Notify</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
