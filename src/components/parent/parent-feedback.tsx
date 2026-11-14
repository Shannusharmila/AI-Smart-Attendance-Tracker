'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/use-fetch';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/shared/badges';
import { StatusBadge } from '@/components/shared/badges';
import { AvatarWithInitials } from '@/components/shared/avatar-with-initials';
import { MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Props {
  parentId: string;
  studentName: string;
  studentId: string;
  refetch: () => void;
}

export function ParentFeedback({ parentId, studentName, studentId, refetch }: Props) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [saving, setSaving] = useState(false);

  const { data: feedback, loading, refetch: refetchFeedback } = useFetch<any[]>(`/api/feedback?parentId=${parentId}`);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject || !message) {
      toast.error('Please complete all required fields');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId, subject, message, priority, studentId }),
      });
      const d = await res.json();
      if (!res.ok) {
        toast.error(d.error || 'Failed to submit');
        return;
      }
      toast.success('Feedback sent to teacher');
      setSubject('');
      setMessage('');
      setPriority('MEDIUM');
      refetchFeedback();
      refetch();
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Feedback</h1>
        <p className="text-sm text-slate-500">Send a message to the teacher about {studentName}</p>
      </div>

      {/* Submit form */}
      <Card className="card-shadow border-emerald-200/80">
        <CardContent className="pt-5 pb-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Send className="h-4 w-4 text-emerald-600" /> Send New Feedback
          </h3>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label className="text-xs">Subject *</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. About attendance" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Message *</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message…" rows={3} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={saving} className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white">
              {saving ? 'Sending…' : <><Send className="h-4 w-4" /> Send Feedback</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Previous feedback */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Previous Feedback</h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : !feedback || feedback.length === 0 ? (
          <Card><CardContent><EmptyState icon={MessageSquare} title="No feedback yet" description="Your previous messages will appear here." /></CardContent></Card>
        ) : (
          <div className="space-y-2.5">
            {feedback.map((f: any) => (
              <Card key={f.id} className="card-shadow border-slate-200/80">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <p className="text-sm font-semibold text-slate-900">{f.subject}</p>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={f.status} />
                      <StatusBadge status={f.priority} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mb-1.5">{format(new Date(f.createdAt), 'dd MMM yyyy, HH:mm')}</p>
                  <p className="text-sm text-slate-700 mb-2">{f.message}</p>
                  {f.teacherReply ? (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                      <p className="text-[10px] font-semibold text-emerald-700 mb-0.5">Teacher Reply</p>
                      <p className="text-xs text-slate-800">{f.teacherReply}</p>
                      {f.repliedAt && <p className="text-[10px] text-slate-500 mt-1">{format(new Date(f.repliedAt), 'dd MMM yyyy, HH:mm')}</p>}
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <p className="text-xs text-slate-500">Awaiting teacher reply…</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
