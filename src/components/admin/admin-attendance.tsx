'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/use-fetch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/badges';
import { StatusBadge } from '@/components/shared/badges';
import { Download, Filter, CalendarDays, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

export function AdminAttendance() {
  const [date, setDate] = useState('');
  const [className, setClassName] = useState('ALL');
  const [subject, setSubject] = useState('ALL');
  const [search, setSearch] = useState('');

  const url = `/api/attendance?${new URLSearchParams({
    ...(date && { date }),
    ...(className && className !== 'ALL' && { className }),
    ...(subject && subject !== 'ALL' && { subject }),
  }).toString()}`;

  const { data, loading } = useFetch<any>(url, [date, className, subject]);

  const records = (data?.records || []).filter((r: any) =>
    !search || r.studentName.toLowerCase().includes(search.toLowerCase()) || r.rollNumber.includes(search)
  );

  function exportCSV() {
    if (records.length === 0) { toast.error('No records'); return; }
    const headers = ['Date', 'Student', 'Roll No', 'Class', 'Status', 'Method', 'Confidence', 'Anomaly'];
    const rows = records.map((r: any) => [r.date, r.studentName, r.rollNumber, r.className, r.status, r.method, r.confidence || '-', r.anomalyFlag ? 'YES' : 'NO']);
    const csv = [headers, ...rows].map((row) => row.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Attendance Records</h1>
        <Button onClick={exportCSV} variant="outline" size="sm" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card className="card-shadow border-slate-200/80">
        <CardContent className="pt-5 pb-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-600"><Filter className="h-4 w-4" /> Filters</div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Select value={className} onValueChange={setClassName}>
              <SelectTrigger><SelectValue placeholder="All classes" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All classes</SelectItem>
                <SelectItem value="CSE-A">CSE-A</SelectItem>
                <SelectItem value="CSE-B">CSE-B</SelectItem>
                <SelectItem value="IT-A">IT-A</SelectItem>
              </SelectContent>
            </Select>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger><SelectValue placeholder="All subjects" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All subjects</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Physics">Physics</SelectItem>
                <SelectItem value="English">English</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="card-shadow border-slate-200/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{records.length} record{records.length !== 1 ? 's' : ''}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><div className="h-6 w-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" /></div>
          ) : records.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No records found" description="Adjust filters." />
          ) : (
            <div className="max-h-[60vh] overflow-y-auto scrollbar-thin space-y-1.5">
              {records.map((r: any) => (
                <div key={r.id} className="grid grid-cols-7 gap-2 px-3 py-2.5 rounded-lg hover:bg-slate-50 items-center text-xs">
                  <div className="text-slate-600 col-span-2 sm:col-span-1">{format(parseISO(r.date), 'dd/MM')}</div>
                  <div className="font-medium text-slate-900 col-span-2 truncate">{r.studentName}</div>
                  <div className="text-slate-500">{r.rollNumber}</div>
                  <div className="text-slate-500 hidden sm:block">{r.className}</div>
                  <div><StatusBadge status={r.status} /></div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{r.method}</span>
                    {r.anomalyFlag && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
