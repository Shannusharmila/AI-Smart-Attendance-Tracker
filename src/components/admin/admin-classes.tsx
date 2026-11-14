'use client';

import { useFetch } from '@/hooks/use-fetch';
import { Card, CardContent } from '@/components/ui/card';
import { School, Users, GraduationCap, TrendingUp } from 'lucide-react';

export function AdminClasses() {
  const { data, loading } = useFetch<any[]>('/api/classes');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Classes</h1>
        <p className="text-sm text-slate-500">{data?.length || 0} classes</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10"><div className="h-6 w-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(data || []).map((c: any) => (
            <Card key={c.className} className="card-shadow border-slate-200/80">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <School className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900">{c.className}</p>
                    <p className="text-xs text-slate-500">{c.totalTeachers} teacher{c.totalTeachers !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-slate-50 p-2.5 text-center">
                    <p className="text-xs text-slate-500 flex items-center justify-center gap-1"><Users className="h-3 w-3" /> Students</p>
                    <p className="text-lg font-bold text-slate-900">{c.totalStudents}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5 text-center">
                    <p className="text-xs text-slate-500 flex items-center justify-center gap-1"><TrendingUp className="h-3 w-3" /> Avg Att</p>
                    <p className={`text-lg font-bold ${c.avgAttendance >= 75 ? 'text-emerald-700' : 'text-rose-700'}`}>{c.avgAttendance}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
