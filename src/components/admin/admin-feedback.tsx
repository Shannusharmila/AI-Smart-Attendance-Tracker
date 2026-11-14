'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/use-fetch';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/shared/badges';
import { StatusBadge } from '@/components/shared/badges';
import { AvatarWithInitials } from '@/components/shared/avatar-with-initials';
import { MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export function AdminFeedback() {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { data, loading } = useFetch<any[]>(`/api/feedback${statusFilter && statusFilter !== 'ALL' ? `?status=${statusFilter}` : ''}`);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Feedback Monitoring</h1>
          <p className="text-sm text-slate-500">{data?.length || 0} total feedback</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="REPLIED">Replied</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10"><div className="h-6 w-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" /></div>
      ) : !data || data.length === 0 ? (
        <Card><CardContent><EmptyState icon={MessageSquare} title="No feedback" /></CardContent></Card>
      ) : (
        <div className="space-y-2.5">
          {data.map((f: any) => (
            <Card key={f.id} className="card-shadow border-slate-200/80">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <AvatarWithInitials name={f.parentName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-900">{f.parentName}</p>
                      <span className="text-[11px] text-slate-500">· {f.studentName}</span>
                      <StatusBadge status={f.status} />
                      <StatusBadge status={f.priority} />
                    </div>
                    <p className="text-xs text-slate-500">{format(new Date(f.createdAt), 'dd MMM yyyy')}</p>
                    <p className="text-sm font-medium text-slate-900 mt-1.5">{f.subject}</p>
                    <p className="text-sm text-slate-700">{f.message}</p>
                    {f.teacherReply && (
                      <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                        <p className="text-[10px] font-semibold text-emerald-700 mb-0.5">Teacher Reply</p>
                        <p className="text-xs text-slate-800">{f.teacherReply}</p>
                      </div>
                    )}
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
