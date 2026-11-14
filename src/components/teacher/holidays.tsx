"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useAppStore } from "@/lib/store";
import type { Holiday } from "@/lib/types";
import { CalendarDays, Plus } from "lucide-react";

export function TeacherHolidays() {
  const { currentUser } = useAppStore();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/holidays");
      const d = await res.json();
      setHolidays(d.holidays ?? []);
    } catch {
      toast.error("Failed to load holidays");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!name || !date) { toast.error("Please provide a name and date."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, date, description, createdBy: currentUser?.id }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed");
      toast.success("Holiday added. Parents will be notified.");
      setName(""); setDate(""); setDescription(""); setOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  function daysUntil(dateStr: string): number {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
    return Math.round((d.getTime() - today.getTime()) / 86400000);
  }

  return (
    <div className="space-y-4">
      <SectionHeader title="Holidays" description="Upcoming & scheduled holidays" icon={CalendarDays} action={<Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add Holiday</Button>} />

      {loading ? <LoadingSpinner label="Loading…" className="py-12" /> :
        holidays.length === 0 ? <EmptyState icon={CalendarDays} title="No holidays" description="Add a holiday to notify parents." actionLabel="Add Holiday" onAction={() => setOpen(true)} /> :
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {holidays.map((h) => {
              const days = daysUntil(h.date);
              return (
                <Card key={h.id} className="rounded-2xl p-4 sm:p-5 card-shadow">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                      <CalendarDays className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{h.name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(h.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                      <p className="text-xs text-muted-foreground mt-1">{h.description}</p>
                    </div>
                    <div className="text-right">
                      {days > 0 ? (
                        <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-1 text-xs font-medium">In {days} days</span>
                      ) : days === 0 ? (
                        <span className="rounded-full bg-amber-100 text-amber-700 px-2 py-1 text-xs font-medium">Today</span>
                      ) : (
                        <span className="rounded-full bg-muted text-muted-foreground px-2 py-1 text-xs">{Math.abs(days)} days ago</span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
      }

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Holiday</DialogTitle>
            <DialogDescription>Parents will be automatically notified.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Holiday Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Diwali Festival" />
            </div>
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description…" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Add Holiday"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
