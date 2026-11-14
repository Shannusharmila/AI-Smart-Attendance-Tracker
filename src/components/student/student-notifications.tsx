'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/badges';
import { Bell, BellOff, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function StudentNotifications({ data, refetch }: { data: any; refetch: () => void }) {
  const [markingAll, setMarkingAll] = useState(false);
  const notifications = data?.notifications || [];
  const unread = notifications.filter((n: any) => !n.read);

  async function markAllRead() {
    setMarkingAll(true);
    try {
      for (const n of unread) {
        await fetch(`/api/notifications/${n.id}/read`, { method: 'POST' });
      }
      toast.success('All marked as read');
      refetch();
    } catch {
      toast.error('Failed to update');
    } finally {
      setMarkingAll(false);
    }
  }

  async function markOne(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    refetch();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500">{unread.length} unread · {notifications.length} total</p>
        </div>
        {unread.length > 0 && (
          <Button onClick={markAllRead} disabled={markingAll} variant="outline" size="sm" className="border-emerald-200 text-emerald-700">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card><CardContent><EmptyState icon={BellOff} title="No notifications" description="You'll see attendance, marks, exam and holiday notifications here." /></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => (
            <button
              key={n.id}
              onClick={() => !n.read && markOne(n.id)}
              className={`w-full text-left p-3.5 rounded-xl border transition hover:shadow-sm ${
                n.read ? 'bg-white border-slate-200' : 'bg-emerald-50 border-emerald-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                  n.type === 'ATTENDANCE' ? 'bg-emerald-100 text-emerald-700' :
                  n.type === 'HOLIDAY' ? 'bg-amber-100 text-amber-700' :
                  n.type === 'ALERT' ? 'bg-rose-100 text-rose-700' :
                  n.type === 'MARKS' ? 'bg-sky-100 text-sky-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />}
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{format(new Date(n.createdAt), 'dd MMM yyyy, HH:mm')}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
