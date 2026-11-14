'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/use-fetch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EmptyState } from '@/components/shared/badges';
import { Download, FileText, Printer, FileBarChart, CalendarDays, TrendingUp, Award } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import { toast } from 'sonner';

export function TeacherReports({ teacher }: { teacher: any }) {
  const [tab, setTab] = useState('daily');
  const [className, setClassName] = useState('CSE-A');

  // Fetch attendance for last 30 days for the selected class
  const endDate = new Date();
  const startDate = subDays(endDate, 30);
  const { data, loading } = useFetch<any>(
    `/api/attendance?className=${className}`,
    [className]
  );

  const records = data?.records || [];
  const sessions = data?.sessions || [];

  // Daily data
  const dailyData = [];
  for (let d = 0; d < 7; d++) {
    const date = subDays(endDate, d);
    const dateStr = date.toISOString().slice(0, 10);
    const dayRecords = records.filter((r: any) => r.date === dateStr);
    const present = dayRecords.filter((r: any) => r.status === 'PRESENT').length;
    const absent = dayRecords.filter((r: any) => r.status === 'ABSENT').length;
    dailyData.push({ date: format(date, 'EEE'), present, absent, total: present + absent });
  }
  dailyData.reverse();

  // Weekly trend
  const weeklyData = [];
  for (let w = 0; w < 4; w++) {
    const weekStart = subDays(endDate, w * 7 + 6);
    const weekEnd = subDays(endDate, w * 7);
    const weekRecords = records.filter((r: any) => {
      return r.date >= weekStart.toISOString().slice(0, 10) && r.date <= weekEnd.toISOString().slice(0, 10);
    });
    const present = weekRecords.filter((r: any) => r.status === 'PRESENT').length;
    const total = weekRecords.length;
    weeklyData.push({
      week: `Week ${4 - w}`,
      percentage: total > 0 ? Math.round((present / total) * 1000) / 10 : 0,
    });
  }
  weeklyData.reverse();

  // Monthly data
  const monthlyData = [];
  for (let m = 0; m < 6; m++) {
    const monthStart = new Date(endDate.getFullYear(), endDate.getMonth() - m, 1);
    const monthEnd = new Date(endDate.getFullYear(), endDate.getMonth() - m + 1, 0);
    const monthRecords = records.filter((r: any) => {
      const rDate = new Date(r.date);
      return rDate >= monthStart && rDate <= monthEnd;
    });
    const present = monthRecords.filter((r: any) => r.status === 'PRESENT').length;
    const total = monthRecords.length;
    monthlyData.push({
      month: format(monthStart, 'MMM'),
      present,
      absent: total - present,
      percentage: total > 0 ? Math.round((present / total) * 1000) / 10 : 0,
    });
  }
  monthlyData.reverse();

  function exportCSV() {
    if (records.length === 0) {
      toast.error('No records to export');
      return;
    }
    const headers = ['Date', 'Student', 'Roll No', 'Class', 'Status', 'Method', 'Confidence'];
    const rows = records.map((r: any) => [
      r.date, r.studentName, r.rollNumber, r.className, r.status, r.method, r.confidence || '-',
    ]);
    const csv = [headers, ...rows].map((row) => row.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${className}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded');
  }

  function printReport() {
    window.print();
  }

  function downloadPDF() {
    // For prototype — generate an HTML report view and trigger print-to-pdf
    const win = window.open('', '_blank');
    if (!win) {
      toast.error('Pop-up blocked. Please allow pop-ups.');
      return;
    }
    win.document.write(`
      <html>
      <head>
        <title>Attendance Report — ${className}</title>
        <style>
          body { font-family: sans-serif; padding: 32px; color: #1e293b; }
          h1 { color: #059669; font-size: 22px; }
          h2 { color: #475569; font-size: 14px; margin-top: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          th { background: #f1f5f9; font-weight: 600; }
          .present { color: #059669; font-weight: 600; }
          .absent { color: #e11d48; font-weight: 600; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #059669; padding-bottom: 12px; }
          .meta { font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>AI-Based Smart Attendance Tracker</h1>
            <p class="meta">Seshadri Rao Gudlavalleru Engineering College</p>
          </div>
          <p class="meta">Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}</p>
        </div>
        <h2>Attendance Report for ${className} — ${tab.toUpperCase()}</h2>
        <p class="meta">Total records: ${records.length} · Period: ${format(startDate, 'dd MMM')} – ${format(endDate, 'dd MMM yyyy')}</p>
        <table>
          <thead>
            <tr><th>Date</th><th>Student</th><th>Roll No</th><th>Status</th><th>Method</th><th>Confidence</th></tr>
          </thead>
          <tbody>
            ${records.slice(0, 100).map((r: any) => `<tr><td>${r.date}</td><td>${r.studentName}</td><td>${r.rollNumber}</td><td class="${r.status === 'PRESENT' ? 'present' : 'absent'}">${r.status}</td><td>${r.method}</td><td>${r.confidence ? r.confidence.toFixed(1) + '%' : '-'}</td></tr>`).join('')}
          </tbody>
        </table>
        <p class="meta" style="margin-top: 24px;">This is a demo report. Generated by AI-Based Smart Attendance Tracker Prototype.</p>
      </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
    toast.success('PDF opened in new tab — use Ctrl/Cmd+P to save as PDF');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500">View and export attendance reports</p>
        </div>
      </div>

      {/* Class selector + buttons */}
      <Card className="card-shadow border-slate-200/80">
        <CardContent className="pt-5 pb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <Select value={className} onValueChange={setClassName}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              {teacher.classes.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex-1" />
          <div className="flex flex-wrap gap-2">
            <Button onClick={downloadPDF} variant="outline" size="sm" className="border-rose-200 text-rose-700 hover:bg-rose-50">
              <FileText className="h-4 w-4" /> PDF
            </Button>
            <Button onClick={exportCSV} variant="outline" size="sm" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              <Download className="h-4 w-4" /> CSV
            </Button>
            <Button onClick={printReport} variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50">
              <Printer className="h-4 w-4" /> Print
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-3 sm:grid-cols-5 w-full">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="student">Student-wise</TabsTrigger>
          <TabsTrigger value="class">Class-wise</TabsTrigger>
        </TabsList>

        {/* Daily */}
        <TabsContent value="daily" className="space-y-3">
          <Card className="card-shadow border-slate-200/80">
            <CardHeader className="pb-2"><CardTitle className="text-base">Last 7 Days — {className}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={dailyData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="present" stackId="a" fill="#10b981" name="Present" />
                  <Bar dataKey="absent" stackId="a" fill="#f43f5e" name="Absent" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly */}
        <TabsContent value="weekly" className="space-y-3">
          <Card className="card-shadow border-slate-200/80">
            <CardHeader className="pb-2"><CardTitle className="text-base">Weekly Attendance Trend — {className}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={weeklyData}>
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="percentage" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} name="Attendance %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly */}
        <TabsContent value="monthly" className="space-y-3">
          <Card className="card-shadow border-slate-200/80">
            <CardHeader className="pb-2"><CardTitle className="text-base">Monthly Attendance — {className}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="present" stackId="a" fill="#10b981" name="Present" />
                  <Bar dataKey="absent" stackId="a" fill="#f43f5e" name="Absent" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student-wise */}
        <TabsContent value="student" className="space-y-3">
          <Card className="card-shadow border-slate-200/80">
            <CardHeader className="pb-2"><CardTitle className="text-base">Student-wise Attendance — {className}</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8"><div className="h-6 w-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" /></div>
              ) : (
                <div className="space-y-1.5 max-h-96 overflow-y-auto scrollbar-thin">
                  {Object.entries(
                    records.reduce((acc: any, r: any) => {
                      if (!acc[r.studentId]) acc[r.studentId] = { name: r.studentName, roll: r.rollNumber, present: 0, total: 0 };
                      acc[r.studentId].total++;
                      if (r.status === 'PRESENT') acc[r.studentId].present++;
                      return acc;
                    }, {} as any)
                  ).map(([id, s]: any) => (
                    <div key={id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-sm">
                      <div>
                        <p className="font-medium text-slate-900">{s.name}</p>
                        <p className="text-[10px] text-slate-500">Roll #{s.roll}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">{s.present}/{s.total}</p>
                        <p className={`text-[10px] ${s.total > 0 && (s.present / s.total) * 100 >= 75 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {s.total > 0 ? Math.round((s.present / s.total) * 1000) / 10 : 0}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Class-wise */}
        <TabsContent value="class" className="space-y-3">
          <Card className="card-shadow border-slate-200/80">
            <CardHeader className="pb-2"><CardTitle className="text-base">Class Comparison</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">Showing data for {className}. Switch class via the dropdown above to compare.</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Present', value: records.filter((r: any) => r.status === 'PRESENT').length, color: '#10b981' },
                      { name: 'Absent', value: records.filter((r: any) => r.status === 'ABSENT').length, color: '#f43f5e' },
                    ]}
                    dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}
                  >
                    {[{ color: '#10b981' }, { color: '#f43f5e' }].map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
