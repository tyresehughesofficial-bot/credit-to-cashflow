"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { NAV_GROUPS, NAV_ITEMS } from "@/lib/navigation";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto scroll-thin px-3 py-4">
      {NAV_GROUPS.map((group) => {
        const items = NAV_ITEMS.filter((i) => i.group === group);
        return (
          <div key={group} className="space-y-1">
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
              {group}
            </p>
            {items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  title={item.description}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-gold/10 text-gold shadow-[inset_0_0_0_1px_rgba(212,175,55,0.25)]"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-gold")} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

export function BrandMark() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 px-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-gradient font-black text-primary-foreground shadow-gold">
        T
      </div>
      <div className="leading-tight">
        <p className="text-sm font-bold tracking-tight gold-text">TRIAD T</p>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Command Center
        </p>
      </div>
    </Link>
  );
}
