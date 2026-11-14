"use client";
import { cn } from "@/lib/utils";
import type { NavItem } from "./nav-config";
import { Logo } from "./logo";

export function SidebarNav({ items, active, onSelect, footer }: { items: NavItem[]; active: string; onSelect: (id: NavItem["id"]) => void; footer?: React.ReactNode }) {
  return (
    <nav className="h-full flex flex-col" aria-label="Primary">
      <div className="px-4 py-4 flex items-center gap-2 border-b border-border/60">
        <Logo className="h-8 w-8" />
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight text-foreground truncate">Smart Attendance</p>
          <p className="text-[11px] text-muted-foreground truncate">AI-Powered</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3">
        <ul className="space-y-1">
          {items.map((it) => {
            const isActive = active === it.id;
            return (
              <li key={it.id}>
                <button
                  onClick={() => onSelect(it.id)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors min-h-[44px] text-left",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <it.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{it.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {footer ? <div className="px-3 py-3 border-t border-border/60">{footer}</div> : null}
    </nav>
  );
}
