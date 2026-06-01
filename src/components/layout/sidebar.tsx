"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { NAV_SECTIONS, type NavSection } from "@/lib/navigation";

const COLLAPSE_KEY = "tt.sidebar.collapsed";
const GROUPS_KEY = "tt.sidebar.groups";

/** Exact-or-child match so parent "Center" routes stay highlighted on sub-pages. */
function useIsActive() {
  const pathname = usePathname();
  return useCallback(
    (href: string) => pathname === href || pathname.startsWith(href + "/"),
    [pathname],
  );
}

/* ─────────────────────────  Open / collapsed state  ───────────────────────── */

function useSectionState() {
  const pathname = usePathname();

  const buildDefaults = useCallback(() => {
    const map: Record<string, boolean> = {};
    for (const s of NAV_SECTIONS) {
      const hasActive = s.items.some(
        (i) => pathname === i.href || pathname.startsWith(i.href + "/"),
      );
      map[s.label] = s.defaultOpen || hasActive;
    }
    return map;
  }, [pathname]);

  const [open, setOpen] = useState<Record<string, boolean>>(buildDefaults);

  // Hydrate persisted state after mount, then always keep the active group open.
  useEffect(() => {
    let stored: Record<string, boolean> = {};
    try {
      stored = JSON.parse(localStorage.getItem(GROUPS_KEY) ?? "{}");
    } catch {
      stored = {};
    }
    setOpen((prev) => {
      const next = { ...prev, ...stored };
      for (const s of NAV_SECTIONS) {
        if (s.items.some((i) => pathname === i.href || pathname.startsWith(i.href + "/"))) {
          next[s.label] = true;
        }
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggle = useCallback((label: string) => {
    setOpen((prev) => {
      const next = { ...prev, [label]: !prev[label] };
      try {
        localStorage.setItem(GROUPS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return { open, toggle };
}

/* ───────────────────────────────  Nav item  ──────────────────────────────── */

function NavLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavSection["items"][number];
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const isActive = useIsActive();
  const active = isActive(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : item.description}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center rounded-lg text-sm transition-colors",
        collapsed ? "h-10 w-10 justify-center" : "gap-3 px-3 py-2",
        active
          ? "bg-gold/10 text-gold"
          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
      )}
    >
      {/* gold active accent bar */}
      <span
        className={cn(
          "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-gold-gradient transition-opacity",
          collapsed && "left-1",
          active ? "opacity-100" : "opacity-0",
        )}
      />
      <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-gold")} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

/* ─────────────────────────────  Section group  ───────────────────────────── */

function SectionGroup({
  section,
  open,
  collapsed,
  onToggle,
  onNavigate,
}: {
  section: NavSection;
  open: boolean;
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  // Collapsed rail: just the icons, no group headers.
  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1 border-b border-border/60 pb-2 last:border-0">
        {section.items.map((item) => (
          <NavLink key={item.href} item={item} collapsed onNavigate={onNavigate} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="group flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 transition-colors hover:text-muted-foreground"
      >
        <span className="flex-1 text-left">{section.label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-300",
            open ? "rotate-0" : "-rotate-90",
          )}
        />
      </button>

      {/* Smoothly animated height via grid-rows trick */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-0.5 pb-1">
            {section.items.map((item) => (
              <NavLink key={item.href} item={item} collapsed={false} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────  Nav list  ──────────────────────────────── */

export function SidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const { open, toggle } = useSectionState();

  return (
    <nav
      className={cn(
        "scroll-thin flex h-full flex-col overflow-y-auto overflow-x-hidden py-3",
        collapsed ? "items-center gap-1 px-2" : "gap-2 px-3",
      )}
    >
      {NAV_SECTIONS.map((section) => (
        <SectionGroup
          key={section.label}
          section={section}
          open={!!open[section.label]}
          collapsed={collapsed}
          onToggle={() => toggle(section.label)}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}

/* ───────────────────────────────  Brand mark  ─────────────────────────────── */

export function BrandMark({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      href="/dashboard"
      className={cn("flex items-center gap-3", collapsed ? "justify-center" : "px-2")}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gold/25 bg-gold/10 p-1 shadow-gold">
        <Image
          src="/brand/tte-mark.png"
          alt="TRIAD T Enterprise"
          width={28}
          height={28}
          priority
          className="h-7 w-7 object-contain"
        />
      </div>
      {!collapsed && (
        <div className="leading-tight">
          <p className="gold-text text-sm font-bold tracking-tight">TRIAD T</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Command Center
          </p>
        </div>
      )}
    </Link>
  );
}

/* ───────────────────────────  Desktop sidebar  ───────────────────────────── */

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r border-border bg-card/40 lg:flex",
        // width: 280px expanded / 72px collapsed, smoothly animated
        mounted && "transition-[width] duration-300 ease-out",
        collapsed ? "w-[72px]" : "w-[280px]",
      )}
    >
      {/* Brand + edge toggle */}
      <div
        className={cn(
          "relative flex h-16 items-center border-b border-border",
          collapsed ? "justify-center px-2" : "px-4",
        )}
      >
        <BrandMark collapsed={collapsed} />
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-1/2 z-40 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:border-gold/40 hover:text-gold"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <SidebarNav collapsed={collapsed} />

      {/* Footer */}
      <div className="border-t border-border p-4 text-[10px] leading-relaxed text-muted-foreground">
        {collapsed ? (
          <p className="text-center font-bold text-gold/80">T</p>
        ) : (
          <>
            TRIAD T ENTERPRISE™
            <br />
            AI Command Center · v1.0
          </>
        )}
      </div>
    </aside>
  );
}
