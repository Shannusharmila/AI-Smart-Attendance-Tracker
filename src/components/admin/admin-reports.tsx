'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/use-fetch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EmptyState } from '@/components/shared/badges';
import { Download, FileText, Printer, FileBarChart } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import { toast } from 'sonner';

export function AdminReports() {
  const [tab, setTab] = useState('daily');
  const [className, setClassName] = useState('ALL');
  const { data, loading } = useFetch<any>(`/api/attendance${className && className !== 'ALL' ? `?className=${className}` : ''}`);

  const records = data?.records || [];

  // Daily data
  const dailyData = [];
  for (let d = 0; d < 7; d++) {
    const date = subDays(new Date(), d);
    const dateStr = date.toISOString().slice(0, 10);
    const dayRecords = records.filter((r: any) => r.date === dateStr);
    const present = dayRecords.filter((r: any) => r.status === 'PRESENT').length;
    const absent = dayRecords.filter((r: any) => r.status === 'ABSENT').length;
    dailyData.push({ date: format(date, 'EEE'), present, absent, total: present + absent });
  }
  dailyData.reverse();

  // Weekly
  const weeklyData = [];
  for (let w = 0; w < 4; w++) {
    const weekStart = subDays(new Date(), w * 7 + 6);
    const weekEnd = subDays(new Date(), w * 7);
    const weekRecords = records.filter((r: any) => r.date >= weekStart.toISOString().slice(0, 10) && r.date <= weekEnd.toISOString().slice(0, 10));
    const present = weekRecords.filter((r: any) => r.status === 'PRESENT').length;
    const total = weekRecords.length;
    weeklyData.push({ week: `Week ${4 - w}`, percentage: total > 0 ? Math.round((present / total) * 1000) / 10 : 0 });
  }
  weeklyData.reverse();

  // Monthly
  const monthlyData = [];
  for (let m = 0; m < 6; m++) {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth() - m, 1);
    const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() - m + 1, 0);
    const monthRecords = records.filter((r: any) => {
      const d = new Date(r.date);
      return d >= monthStart && d <= monthEnd;
    });
    const present = monthRecords.filter((r: any) => r.status === 'PRESENT').length;
    const total = monthRecords.length;
    monthlyData.push({ month: format(monthStart, 'MMM'), present, absent: total - present, percentage: total > 0 ? Math.round((present / total) * 1000) / 10 : 0 });
  }
  monthlyData.reverse();

  function exportCSV() {
    if (records.length === 0) { toast.error('No records'); return; }
    const headers = ['Date', 'Student', 'Roll No', 'Class', 'Status', 'Method', 'Confidence'];
    const rows = records.map((r: any) => [r.date, r.studentName, r.rollNumber, r.className, r.status, r.method, r.confidence || '-']);
    const csv = [headers, ...rows].map((row) => row.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded');
  }

  function printReport() { window.print(); }

  function downloadPDF() {
    const win = window.open('', '_blank');
    if (!win) { toast.error('Pop-up blocked'); return; }
    win.document.write(`
      <html><head><title>School-Wide Attendance Report</title>
      <style>body{font-family:sans-serif;padding:32px;color:#1e293b}h1{color:#059669;font-size:22px}
      h2{color:#475569;font-size:14px;margin-top:16px}table{width:100%;border-collapse:collapse;margin-top:12px;font-size:12px}
      th,td{padding:8px;text-align:left;border-bottom:1px solid #e2e8f0}th{background:#f1f5f9;font-weight:600}</style>
      </head><body>
      <h1>School-Wide Attendance Report</h1>
      <p>Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}${className ? ` · Class: ${className}` : ''}</p>
      <h2>${records.length} records</h2>
      <table><thead><tr><th>Date</th><th>Student</th><th>Roll</th><th>Class</th><th>Status</th><th>Method</th></tr></thead>
      <tbody>${records.slice(0, 100).map((r: any) => `<tr><td>${r.date}</td><td>${r.studentName}</td><td>${r.rollNumber}</td><td>${r.className}</td><td>${r.status}</td><td>${r.method}</td></tr>`).join('')}</tbody></table>
      </body></html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 500);
    toast.success('PDF opened');
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Reports</h1>

      <Card className="card-shadow border-slate-200/80">
        <CardContent className="pt-5 pb-4 flex flex-col sm:flex-row sm:items-center gap-2">
          <Select value={className} onValueChange={setClassName}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="All classes" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All classes</SelectItem>
              <SelectItem value="CSE-A">CSE-A</SelectItem>
              <SelectItem value="CSE-B">CSE-B</SelectItem>
              <SelectItem value="IT-A">IT-A</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex-1" />
          <div className="flex flex-wrap gap-2">
            <Button onClick={downloadPDF} variant="outline" size="sm" className="border-rose-200 text-rose-700"><FileText className="h-4 w-4" /> PDF</Button>
            <Button onClick={exportCSV} variant="outline" size="sm" className="border-emerald-200 text-emerald-700"><Download className="h-4 w-4" /> CSV</Button>
            <Button onClick={printReport} variant="outline" size="sm"><Printer className="h-4 w-4" /> Print</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <Card className="card-shadow border-slate-200/80"><CardHeader className="pb-2"><CardTitle className="text-base">Last 7 Days</CardTitle></CardHeader>
            <CardContent><ResponsiveContainer width="100%" height={240}><BarChart data={dailyData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" /><YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="present" stackId="a" fill="#10b981" name="Present" />
              <Bar dataKey="absent" stackId="a" fill="#f43f5e" name="Absent" radius={[4, 4, 0, 0]} />
            </BarChart></ResponsiveContainer></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="weekly">
          <Card className="card-shadow border-slate-200/80"><CardHeader className="pb-2"><CardTitle className="text-base">Weekly Trend</CardTitle></CardHeader>
            <CardContent><ResponsiveContainer width="100%" height={240}><LineChart data={weeklyData}>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="#94a3b8" /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip /><Line type="monotone" dataKey="percentage" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} name="Attendance %" />
            </LineChart></ResponsiveContainer></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="monthly">
          <Card className="card-shadow border-slate-200/80"><CardHeader className="pb-2"><CardTitle className="text-base">Monthly Attendance</CardTitle></CardHeader>
            <CardContent><ResponsiveContainer width="100%" height={240}><BarChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" /><YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="present" stackId="a" fill="#10b981" name="Present" />
              <Bar dataKey="absent" stackId="a" fill="#f43f5e" name="Absent" radius={[4, 4, 0, 0]} />
            </BarChart></ResponsiveContainer></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
