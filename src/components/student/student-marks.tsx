'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/badges';
import { getGrade, getPercentageColor } from '@/lib/constants';
import { format, parseISO } from 'date-fns';
import { BookOpen, Award } from 'lucide-react';

export function StudentMarks({ data }: { data: any }) {
  const { marks, student } = data;

  // Group by subject
  const bySubject: Record<string, any[]> = {};
  (marks || []).forEach((m: any) => {
    if (!bySubject[m.subjectName]) bySubject[m.subjectName] = [];
    bySubject[m.subjectName].push(m);
  });
  const subjects = Object.keys(bySubject);

  const avg = marks && marks.length > 0
    ? Math.round((marks.reduce((s: number, m: any) => s + m.percentage, 0) / marks.length) * 10) / 10
    : 0;

  // Highest mark
  const highest = marks && marks.length > 0
    ? marks.reduce((max: any, m: any) => m.percentage > max.percentage ? m : max)
    : null;
  // Lowest mark
  const lowest = marks && marks.length > 0
    ? marks.reduce((min: any, m: any) => m.percentage < min.percentage ? m : min)
    : null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Marks</h1>
        <p className="text-sm text-slate-500">{marks?.length || 0} exam entries · Average: <span className={`font-semibold ${getPercentageColor(avg)}`}>{avg}% · {getGrade(avg)}</span></p>
      </div>

      {/* Overall average card */}
      <Card className="card-shadow border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
        <CardContent className="py-5 text-center">
          <Award className="h-8 w-8 text-amber-500 mx-auto mb-1" />
          <p className="text-xs text-slate-500 uppercase">Overall Average</p>
          <p className={`text-3xl font-bold ${getPercentageColor(avg)}`}>{avg}%</p>
          <p className="text-xs text-slate-500 mt-1">Grade: {getGrade(avg)}</p>
        </CardContent>
      </Card>

      {/* Stats */}
      {highest && lowest && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="card-shadow border-emerald-200/80">
            <CardContent className="py-3 text-center">
              <p className="text-[10px] text-emerald-600 uppercase font-medium">Best Score</p>
              <p className="text-xl font-bold text-emerald-700">{highest.percentage}%</p>
              <p className="text-[10px] text-slate-500 truncate">{highest.subjectName} · {highest.examName}</p>
            </CardContent>
          </Card>
          <Card className="card-shadow border-amber-200/80">
            <CardContent className="py-3 text-center">
              <p className="text-[10px] text-amber-600 uppercase font-medium">Needs Improvement</p>
              <p className="text-xl font-bold text-amber-700">{lowest.percentage}%</p>
              <p className="text-[10px] text-slate-500 truncate">{lowest.subjectName} · {lowest.examName}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {!marks || marks.length === 0 ? (
        <Card><CardContent><EmptyState icon={BookOpen} title="No marks published" description="Your exam marks will appear here once teachers publish them." /></CardContent></Card>
      ) : (
        subjects.map((subj) => {
          const subjectMarks = bySubject[subj];
          const latest = subjectMarks[0];
          return (
            <Card key={subj} className="card-shadow border-slate-200/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{subj}</span>
                  <span className={`text-sm ${getPercentageColor(latest.percentage)}`}>{latest.percentage}% · {getGrade(latest.percentage)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {subjectMarks.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 text-sm">
                    <div>
                      <p className="font-medium text-slate-900">{m.examName}</p>
                      <p className="text-xs text-slate-500">{format(parseISO(m.examDate), 'dd MMM yyyy')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{m.obtainedMarks}/{m.maxMarks}</p>
                      <p className={`text-xs ${getPercentageColor(m.percentage)}`}>{m.percentage}% · {getGrade(m.percentage)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
