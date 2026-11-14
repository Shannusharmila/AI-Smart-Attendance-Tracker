'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/use-fetch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/shared/badges';
import { StatusBadge } from '@/components/shared/badges';
import { AvatarWithInitials } from '@/components/shared/avatar-with-initials';
import { MessageSquare, Reply, Send } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAppStore } from '@/lib/store';

export function TeacherFeedback({ teacherId }: { teacherId: string }) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [replyOpen, setReplyOpen] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [saving, setSaving] = useState(false);
  const { data, loading, refetch } = useFetch<any[]>(`/api/feedback${statusFilter && statusFilter !== 'ALL' ? `?status=${statusFilter}` : ''}`);
  const currentUser = useAppStore((s) => s.currentUser);

  const feedback = (data || []).filter((f: any) => statusFilter === 'ALL' || f.status === statusFilter);

  async function sendReply(id: string, resolve: boolean) {
    if (!replyText.trim()) {
      toast.error('Please type a reply');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/feedback/${id}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherReply: replyText, repliedBy: currentUser?.id, resolved: resolve }),
      });
      if (!res.ok) {
        toast.error('Failed to send reply');
        return;
      }
      toast.success(resolve ? 'Reply sent and feedback resolved' : 'Reply sent. Parent will be notified.');
      setReplyOpen(null);
      setReplyText('');
      refetch();
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Feedback</h1>
          <p className="text-sm text-slate-500">Parent messages and replies</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="REPLIED">Replied</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="h-6 w-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      ) : feedback.length === 0 ? (
        <Card><CardContent><EmptyState icon={MessageSquare} title="No feedback yet" description="Parent feedback will appear here." /></CardContent></Card>
      ) : (
        <div className="space-y-2.5">
          {feedback.map((f: any) => (
            <Card key={f.id} className="card-shadow border-slate-200/80">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <AvatarWithInitials name={f.parentName} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-900">{f.parentName}</p>
                      <span className="text-[11px] text-slate-500">· {f.studentName}</span>
                      <StatusBadge status={f.status} />
                      <StatusBadge status={f.priority} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{format(new Date(f.createdAt), 'dd MMM yyyy, HH:mm')}</p>
                    <p className="text-sm font-medium text-slate-900 mt-1.5">{f.subject}</p>
                    <p className="text-sm text-slate-700 mt-0.5">{f.message}</p>
                    {f.teacherReply && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                        <p className="text-[10px] font-semibold text-emerald-700 mb-0.5">Teacher Reply</p>
                        <p className="text-xs text-slate-800">{f.teacherReply}</p>
                        {f.repliedAt && <p className="text-[10px] text-slate-500 mt-1">{format(new Date(f.repliedAt), 'dd MMM yyyy, HH:mm')}</p>}
                      </div>
                    )}
                    {f.status === 'PENDING' && (
                      <Button
                        size="sm"
                        className="mt-2.5 h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => { setReplyOpen(f.id); setReplyText(''); }}
                      >
                        <Reply className="h-3.5 w-3.5" /> Reply
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reply dialog */}
      <Dialog open={!!replyOpen} onOpenChange={(v) => !v && setReplyOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Feedback</DialogTitle>
            <DialogDescription>Send a reply to the parent. They will be notified.</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label className="text-xs">Reply Message</Label>
            <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type your reply…" rows={4} className="mt-1" />
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setReplyOpen(null)}>Cancel</Button>
            <Button variant="outline" onClick={() => sendReply(replyOpen!, true)} disabled={saving} className="border-emerald-300 text-emerald-700">
              {saving ? 'Sending…' : 'Reply & Resolve'}
            </Button>
            <Button onClick={() => sendReply(replyOpen!, false)} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {saving ? 'Sending…' : <><Send className="h-4 w-4" /> Send Reply</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
