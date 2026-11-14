"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { StatusBadge } from "@/components/shared/status-badge";
import { AvatarWithInitials } from "@/components/shared/avatar-with-initials";
import { useAppStore } from "@/lib/store";
import type { Feedback } from "@/lib/types";
import { MessageSquare, Send, Reply } from "lucide-react";

export function TeacherFeedback() {
  const { currentUser } = useAppStore();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [replyTo, setReplyTo] = useState<Feedback | null>(null);
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/feedback");
      const d = await res.json();
      setFeedback(d.feedback ?? []);
    } catch {
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const filtered = feedback
    .filter((f) => (statusFilter === "ALL" ? true : f.status === statusFilter))
    .filter((f) => (priorityFilter === "ALL" ? true : f.priority === priorityFilter));

  async function sendReply() {
    if (!replyTo) return;
    if (!replyText) { toast.error("Reply cannot be empty."); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/feedback/${replyTo.id}/reply`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherReply: replyText, repliedBy: currentUser?.id }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed");
      toast.success("Reply sent. Parent will be notified.");
      setReplyTo(null); setReplyText("");
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeader title="Feedback" description="Messages from parents" icon={MessageSquare} />

      <Card className="rounded-2xl p-3 sm:p-4 card-shadow">
        <div className="grid grid-cols-2 gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REPLIED">Replied</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priorities</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {loading ? <LoadingSpinner label="Loading…" className="py-12" /> :
        filtered.length === 0 ? <EmptyState icon={MessageSquare} title="No feedback" description="When parents send feedback, it will appear here." /> :
          <div className="space-y-3">
            {filtered.map((f) => (
              <Card key={f.id} className="rounded-2xl p-4 card-shadow">
                <div className="flex items-start gap-3">
                  <AvatarWithInitials name={f.parentName} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold truncate">{f.parentName}</p>
                      <span className="text-xs text-muted-foreground">· {f.studentName}</span>
                      <StatusBadge status={f.priority} className="!px-2" />
                      <StatusBadge status={f.status} className="!px-2" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Subject: {f.subject} · {new Date(f.createdAt).toLocaleDateString()}</p>
                    <p className="text-sm mt-2">{f.message}</p>
                    {f.teacherReply ? (
                      <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2">
                        <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1"><Reply className="h-3 w-3" /> Teacher reply</p>
                        <p className="text-sm text-emerald-800 mt-0.5">{f.teacherReply}</p>
                        {f.repliedAt ? <p className="text-xs text-emerald-600 mt-1">Replied on {new Date(f.repliedAt).toLocaleString()}</p> : null}
                      </div>
                    ) : null}
                  </div>
                  {f.status === "PENDING" ? (
                    <Button size="sm" onClick={() => { setReplyTo(f); setReplyText(""); }}>
                      <Reply className="h-3.5 w-3.5" /> Reply
                    </Button>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
      }

      <Dialog open={!!replyTo} onOpenChange={(o) => !o && setReplyTo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to {replyTo?.parentName ?? ""}</DialogTitle>
            <DialogDescription>Subject: {replyTo?.subject}</DialogDescription>
          </DialogHeader>
          <div className="rounded-xl bg-muted/40 px-3 py-2 text-sm">
            <p className="text-xs text-muted-foreground mb-1">Original message:</p>
            <p>{replyTo?.message}</p>
          </div>
          <div className="space-y-1.5">
            <Label>Reply</Label>
            <Textarea rows={4} value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type your reply…" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyTo(null)}>Cancel</Button>
            <Button onClick={sendReply} disabled={saving}><Send className="h-4 w-4" /> {saving ? "Sending…" : "Send Reply"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
