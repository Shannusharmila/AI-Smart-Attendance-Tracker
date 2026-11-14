"use client";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useAppStore } from "@/lib/store";
import { CLASSES } from "@/lib/constants";
import type { AttendanceRecord, Student } from "@/lib/types";
import { GraduationCap, Download, Printer, FileText } from "lucide-react";

function isoDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
function isoFirstDayOfMonth() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

export function TeacherReports() {
  const { currentUser } = useAppStore();
  const [tab, setTab] = useState("daily");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(isoDaysAgo(0));
  const [className, setClassName] = useState("ALL");
  const [studentId, setStudentId] = useState("ALL");

  useEffect(() => {
    fetch("/api/students").then((r) => r.json()).then((d) => { setStudents(d.students ?? []); if (d.students?.[0]) setStudentId(d.students[0].id); });
  }, []);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (className !== "ALL") params.set("class", className);
      if (currentUser?.linkedId) params.set("teacherId", currentUser.linkedId);
      const res = await fetch(`/api/attendance?${params.toString()}`);
      const d = await res.json();
      setRecords(d.records ?? []);
    } catch {
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load();   }, [className]);

  // daily: filter by date
  const daily = useMemo(() => records.filter((r) => r.date === date), [records, date]);
  // weekly: last 7 days
  const weekly = useMemo(() => {
    const start = isoDaysAgo(6);
    return records.filter((r) => r.date >= start && r.date <= isoDaysAgo(0));
  }, [records]);
  // monthly: this month
  const monthly = useMemo(() => {
    const start = isoFirstDayOfMonth();
    return records.filter((r) => r.date >= start);
  }, [records]);

  // student-wise: records for selected student
  const studentRecords = useMemo(() => records.filter((r) => r.studentId === studentId), [records, studentId]);
  const student = students.find((s) => s.id === studentId);

  // class-wise: aggregate by class
  const byClass = useMemo(() => {
    const map: Record<string, { present: number; absent: number; total: number }> = {};
    records.forEach((r) => {
      const c = r.className;
      if (!map[c]) map[c] = { present: 0, absent: 0, total: 0 };
      map[c].total++;
      if (r.status === "PRESENT") map[c].present++;
      else map[c].absent++;
    });
    return Object.entries(map).map(([c, v]) => ({ className: c, ...v, pct: v.total ? Math.round((v.present / v.total) * 100) : 0 }));
  }, [records]);

  function printReport() {
    window.print();
  }
  function exportCsv() {
    const rows = [["Date", "Student", "Roll", "Class", "Status", "Method", "Confidence"],
      ...records.map((r) => [r.date, r.studentName, r.rollNumber, r.className, r.status, r.method, r.confidence ?? ""])];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `report-${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url);
    toast.success("CSV exported.");
  }

  const dailyData = daily.length ? [
    { name: "Present", value: daily.filter((r) => r.status === "PRESENT").length, color: "#10b981" },
    { name: "Absent", value: daily.filter((r) => r.status === "ABSENT").length, color: "#ef4444" },
  ] : [];

  const weeklyTrend = useMemo(() => {
    const days: { date: string; label: string; present: number; absent: number; pct: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = isoDaysAgo(i);
      const recs = records.filter((r) => r.date === d);
      const present = recs.filter((r) => r.status === "PRESENT").length;
      const absent = recs.filter((r) => r.status === "ABSENT").length;
      days.push({ date: d, label: new Date(d).toLocaleDateString("en-US", { weekday: "short" }), present, absent, pct: recs.length ? Math.round((present / recs.length) * 100) : 0 });
    }
    return days;
  }, [records]);

  return (
    <div className="space-y-4 print-area">
      <SectionHeader title="Reports" description="Daily / weekly / monthly / student / class reports" icon={GraduationCap} action={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</Button>
          <Button size="sm" variant="outline" onClick={printReport}><Printer className="h-4 w-4" /> Print Report</Button>
        </div>
      } />

      <Card className="rounded-2xl p-3 sm:p-4 card-shadow">
        <div className="flex flex-wrap gap-2">
          <Select value={className} onValueChange={setClassName}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Class" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Classes</SelectItem>
              {CLASSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full flex flex-wrap justify-start h-auto">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="student">Student-wise</TabsTrigger>
          <TabsTrigger value="class">Class-wise</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card className="rounded-2xl p-4 card-shadow">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="font-semibold">Daily Report</h3>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
            </div>
            {loading ? <LoadingSpinner label="Loading…" className="py-10" /> :
              daily.length === 0 ? <EmptyState icon={FileText} title="No records on this date" /> :
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={dailyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                        {dailyData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="lg:col-span-2">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-xs text-muted-foreground border-b border-border"><th className="py-2">Student</th><th>Class</th><th>Status</th><th>Confidence</th></tr></thead>
                    <tbody>
                      {daily.slice(0, 10).map((r) => (
                        <tr key={r.id} className="border-b border-border/60">
                          <td className="py-2">{r.studentName}</td>
                          <td>{r.className}</td>
                          <td>{r.status}</td>
                          <td>{r.confidence ? `${r.confidence}%` : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            }
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card className="rounded-2xl p-4 card-shadow">
            <h3 className="font-semibold mb-3">Weekly Report — Last 7 days</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" name="Present" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Total records: {weekly.length}</p>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card className="rounded-2xl p-4 card-shadow">
            <h3 className="font-semibold mb-3">Monthly Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="pct" name="Attendance %" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="student" className="space-y-4">
          <Card className="rounded-2xl p-4 card-shadow">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="font-semibold">Student-wise Report</h3>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger className="w-full sm:w-64"><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} · {s.className}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {student ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2">
                  <p className="text-xs text-emerald-700">Attendance %</p>
                  <p className="text-lg font-bold text-emerald-700">{Math.round(student.attendancePercentage)}%</p>
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2">
                  <p className="text-xs text-amber-700">Sessions attended</p>
                  <p className="text-lg font-bold text-amber-700">{student.totalAttended}/{student.totalSessions}</p>
                </div>
                <div className="rounded-xl bg-violet-50 border border-violet-200 px-3 py-2">
                  <p className="text-xs text-violet-700">Records (30d)</p>
                  <p className="text-lg font-bold text-violet-700">{studentRecords.length}</p>
                </div>
              </div>
            ) : null}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentRecords.slice(0, 15).reverse().map((r) => ({ date: r.date, status: r.status === "PRESENT" ? 1 : 0 }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={10} />
                  <YAxis domain={[0, 1]} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="status" name="Present (1) / Absent (0)" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="class" className="space-y-4">
          <Card className="rounded-2xl p-4 card-shadow">
            <h3 className="font-semibold mb-3">Class-wise Report</h3>
            {byClass.length === 0 ? <EmptyState icon={FileText} title="No data" /> :
              <div className="space-y-3">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byClass}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="className" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="present" name="Present" fill="#10b981" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-xs text-muted-foreground border-b border-border"><th className="py-2">Class</th><th>Total</th><th>Present</th><th>Absent</th><th>%</th></tr></thead>
                  <tbody>
                    {byClass.map((c) => (
                      <tr key={c.className} className="border-b border-border/60">
                        <td className="py-2">{c.className}</td>
                        <td>{c.total}</td>
                        <td>{c.present}</td>
                        <td>{c.absent}</td>
                        <td>{c.pct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
