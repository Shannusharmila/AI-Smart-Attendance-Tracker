'use client';

import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/badges';
import { CalendarOff } from 'lucide-react';
import { format, parseISO, differenceInCalendarDays } from 'date-fns';

export function StudentHolidays({ data }: { data: any }) {
  const { holidays } = data;
  const today = new Date();
  const upcoming = (holidays || []).filter((h: any) => new Date(h.date) >= today);
  const past = (holidays || []).filter((h: any) => new Date(h.date) < today);

  return (
    <div className="space-y-4">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Holidays</h1>

      {upcoming.length === 0 && past.length === 0 ? (
        <Card><CardContent><EmptyState icon={CalendarOff} title="No holidays scheduled" /></CardContent></Card>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Upcoming</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {upcoming.map((h: any) => {
                  const days = differenceInCalendarDays(parseISO(h.date), today);
                  return (
                    <Card key={h.id} className="card-shadow border-amber-200/80">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-xl flex flex-col items-center justify-center shrink-0 bg-amber-100 text-amber-700">
                            <span className="text-[10px] font-medium">{format(parseISO(h.date), 'MMM').toUpperCase()}</span>
                            <span className="text-base font-bold leading-none">{format(parseISO(h.date), 'dd')}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900">{h.name}</p>
                            <p className="text-xs text-slate-500">{format(parseISO(h.date), 'EEEE, dd MMMM yyyy')}</p>
                            <p className="text-xs text-slate-600 mt-1">{h.description}</p>
                            <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                              In {days} day{days !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2 mt-4">Past Holidays</h3>
              <div className="space-y-2">
                {past.map((h: any) => (
                  <Card key={h.id} className="card-shadow border-slate-200/80 opacity-70">
                    <CardContent className="py-3 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-slate-100 text-slate-500 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[9px] font-medium">{format(parseISO(h.date), 'MMM').toUpperCase()}</span>
                        <span className="text-xs font-bold leading-none">{format(parseISO(h.date), 'dd')}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{h.name}</p>
                        <p className="text-[10px] text-slate-500">{format(parseISO(h.date), 'dd MMMM yyyy')}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
