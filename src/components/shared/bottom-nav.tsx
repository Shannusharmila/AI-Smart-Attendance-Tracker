"use client";
import { cn } from "@/lib/utils";
import type { NavItem } from "./nav-config";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function BottomNav({ items, active, onSelect, open, onOpenChange, onMore, moreItems }: { items: NavItem[]; active: string; onSelect: (id: NavItem["id"]) => void; open: boolean; onOpenChange: (o: boolean) => void; onMore: () => void; moreItems: NavItem[] }) {
  return (
    <>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-background/95 backdrop-blur border-t border-border" aria-label="Primary mobile">
        <ul className="grid grid-cols-5">
          {items.map((it) => {
            const isActive = active === it.id;
            return (
              <li key={it.id}>
                <button
                  onClick={() => onSelect(it.id)}
                  className={cn(
                    "w-full flex flex-col items-center gap-1 py-2 px-1 text-[11px] font-medium min-h-[56px] justify-center",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={it.label}
                >
                  <it.icon className="h-5 w-5" aria-hidden="true" />
                  <span className="truncate max-w-full">{it.label.split(" ")[0]}</span>
                </button>
              </li>
            );
          })}
          <li>
            <button
              onClick={onMore}
              className="w-full flex flex-col items-center gap-1 py-2 px-1 text-[11px] font-medium min-h-[56px] justify-center text-muted-foreground"
              aria-label="More"
            >
              <span className="text-lg leading-none">⋮</span>
              <span className="truncate max-w-full">More</span>
            </button>
          </li>
        </ul>
      </nav>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-72 p-0">
          <div className="px-4 py-4 flex items-center gap-2 border-b border-border/60">
            <p className="font-semibold">More sections</p>
          </div>
          <div className="p-2 overflow-y-auto">
            <ul className="space-y-1">
              {moreItems.map((it) => {
                const isActive = active === it.id;
                return (
                  <li key={it.id}>
                    <button
                      onClick={() => { onSelect(it.id); onOpenChange(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors min-h-[44px] text-left",
                        isActive ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-muted",
                      )}
                    >
                      <it.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{it.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
