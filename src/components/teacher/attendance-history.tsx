"use client";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { StatusBadge } from "@/components/shared/status-badge";
import { AnomalyBadge } from "@/components/shared/recognition-badge";
import { useAppStore } from "@/lib/store";
import { CLASSES } from "@/lib/constants";
import { FileText, Download, Search } from "lucide-react";
import type { AttendanceRecord } from "@/lib/types";

export function TeacherAttendanceHistory() {
  const { currentUser } = useAppStore();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState("");
  const [className, setClassName] = useState("ALL");
  const [section, setSection] = useState("ALL");
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("ALL");
  const [selected, setSelected] = useState<AttendanceRecord | null>(null);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (date) params.set("date", date);
      if (className !== "ALL") params.set("class", className);
      if (section !== "ALL") params.set("section", section);
      if (subject !== "ALL") params.set("subject", subject);
      if (currentUser?.linkedId) params.set("teacherId", currentUser.linkedId);
      const res = await fetch(`/api/attendance?${params.toString()}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed");
      setRecords(d.records ?? []);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load();   }, [date, className, section, subject]);

  const filtered = useMemo(() => {
    if (!q) return records;
    const ql = q.toLowerCase();
    return records.filter((r) => r.studentName.toLowerCase().includes(ql) || r.rollNumber.includes(q));
  }, [records, q]);

  function exportCsv() {
    const rows = [
      ["Date", "Student", "Roll No", "Class", "Status", "Method", "Confidence", "Anomaly"],
      ...filtered.map((r) => [r.date, r.studentName, r.rollNumber, r.className, r.status, r.method, r.confidence ?? "", r.anomalyFlag ? "Yes" : "No"]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-history-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded.");
  }

  return (
    <div className="space-y-4">
      <SectionHeader title="Attendance History" description="View & export recorded attendance" icon={FileText} action={<Button variant="outline" size="sm" onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</Button>} />

      <Card className="rounded-2xl p-3 sm:p-4 card-shadow">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Select value={className} onValueChange={setClassName}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Class" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Classes</SelectItem>
              {CLASSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={section} onValueChange={setSection}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Section" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Sections</SelectItem>
              {["A", "B"].map((s) => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Subject" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Subjects</SelectItem>
              {["Mathematics", "Computer Science", "Physics", "English"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search student…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl card-shadow overflow-hidden">
        {loading ? <LoadingSpinner label="Loading…" className="py-12" /> :
         filtered.length === 0 ? <EmptyState icon={FileText} title="No records" description="No attendance records match the current filters." /> :
          <div className="max-h-[70vh] overflow-y-auto scrollbar-thin">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="hidden sm:table-cell">Roll No</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Method</TableHead>
                  <TableHead className="hidden sm:table-cell">Confidence</TableHead>
                  <TableHead>Anomaly</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => setSelected(r)}>
                    <TableCell className="text-xs">{r.date}</TableCell>
                    <TableCell className="font-medium">{r.studentName}</TableCell>
                    <TableCell className="hidden sm:table-cell text-xs">{r.rollNumber}</TableCell>
                    <TableCell className="text-xs">{r.className}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell className="hidden sm:table-cell text-xs">{r.method}</TableCell>
                    <TableCell className="hidden sm:table-cell text-xs">{r.confidence ? `${r.confidence}%` : "—"}</TableCell>
                    <TableCell>{r.anomalyFlag ? <AnomalyBadge reason={r.anomalyReason} /> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        }
      </Card>

      {/* Record detail sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle>{selected.studentName} — {selected.rollNumber}</SheetTitle>
                <SheetDescription>Attendance record on {selected.date}</SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-8 space-y-3 text-sm">
                <Row label="Class" value={selected.className} />
                <Row label="Date" value={selected.date} />
                <Row label="Status" value={<StatusBadge status={selected.status} />} />
                <Row label="Method" value={selected.method} />
                <Row label="Confidence" value={selected.confidence ? `${selected.confidence}%` : "—"} />
                <Row label="Manually modified" value={selected.manuallyModified ? "Yes" : "No"} />
                <Row label="Anomaly flag" value={selected.anomalyFlag ? <AnomalyBadge reason={selected.anomalyReason} /> : "No"} />
                <Row label="Recorded at" value={new Date(selected.createdAt).toLocaleString()} />
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
