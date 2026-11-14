'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/use-fetch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/badges';
import { EmptyState } from '@/components/shared/badges';
import { ConfidenceBar } from '@/components/shared/confidence-bar';
import { Download, Filter, CalendarDays, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { toast } from 'sonner';

export function TeacherAttendanceHistory({ teacherId }: { teacherId: string }) {
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

  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  function exportCSV() {
    if (records.length === 0) {
      toast.error('No records to export');
      return;
    }
    const headers = ['Date', 'Student', 'Roll No', 'Class', 'Status', 'Method', 'Confidence', 'Anomaly'];
    const rows = records.map((r: any) => [
      r.date, r.studentName, r.rollNumber, r.className, r.status, r.method, r.confidence || '-', r.anomalyFlag ? 'YES' : 'NO',
    ]);
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
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Attendance History</h1>
        <Button onClick={exportCSV} variant="outline" size="sm" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="card-shadow border-slate-200/80">
        <CardContent className="pt-5 pb-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Filter className="h-4 w-4" /> Filters
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} placeholder="Date" />
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
                <SelectItem value="Data Structures">Data Structures</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Search student…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Records table */}
      <Card className="card-shadow border-slate-200/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{records.length} record{records.length !== 1 ? 's' : ''}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-6 w-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
          ) : records.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No records found" description="Try adjusting your filters." />
          ) : (
            <div className="space-y-1.5">
              <div className="hidden sm:grid grid-cols-7 gap-2 px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase">
                <div>Date</div>
                <div className="col-span-2">Student</div>
                <div>Roll</div>
                <div>Class</div>
                <div>Status</div>
                <div>Method / Confidence</div>
              </div>
              <div className="sm:hidden text-xs text-slate-500 px-3 pb-1">Tap any row to view details</div>
              <div className="max-h-[60vh] overflow-y-auto scrollbar-thin">
                {records.map((r: any) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRecord(r)}
                    className="w-full text-left grid grid-cols-2 sm:grid-cols-7 gap-2 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition items-center"
                  >
                    <div className="text-xs text-slate-600 sm:order-1">{format(parseISO(r.date), 'dd/MM/yyyy')}</div>
                    <div className="text-sm font-medium text-slate-900 sm:order-2 sm:col-span-2 truncate">{r.studentName}</div>
                    <div className="text-xs text-slate-500 sm:order-3">{r.rollNumber}</div>
                    <div className="text-xs text-slate-500 sm:order-4 hidden sm:block">{r.className}</div>
                    <div className="sm:order-5"><StatusBadge status={r.status} /></div>
                    <div className="flex items-center gap-2 sm:order-6">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{r.method}</span>
                      {r.confidence != null && r.confidence > 0 && (
                        <span className="text-xs text-slate-600 tabular-nums hidden sm:inline">{r.confidence.toFixed(1)}%</span>
                      )}
                      {r.anomalyFlag && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail sheet */}
      <Sheet open={!!selectedRecord} onOpenChange={(v) => !v && setSelectedRecord(null)}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          {selectedRecord && (
            <>
              <SheetHeader>
                <SheetTitle>Attendance Record</SheetTitle>
                <SheetDescription>{format(parseISO(selectedRecord.date), 'EEEE, dd MMMM yyyy')}</SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-4 space-y-3 text-sm">
                <div className="space-y-1.5">
                  <Row label="Student" value={selectedRecord.studentName} />
                  <Row label="Roll No" value={selectedRecord.rollNumber} />
                  <Row label="Class" value={selectedRecord.className} />
                  <Row label="Status" value={selectedRecord.status} />
                  <Row label="Method" value={selectedRecord.method} />
                  {selectedRecord.confidence != null && selectedRecord.confidence > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Confidence</p>
                      <ConfidenceBar value={selectedRecord.confidence} />
                    </div>
                  )}
                  <Row label="Manually modified" value={selectedRecord.manuallyModified ? 'Yes' : 'No'} />
                  {selectedRecord.anomalyFlag && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Anomaly Detected</p>
                        <p>{selectedRecord.anomalyReason}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}
