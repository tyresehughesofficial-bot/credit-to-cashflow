"use client";

import { useState } from "react";
import { Bell, Menu, Search, X } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandMark, SidebarNav } from "@/components/layout/sidebar";
import { CURRENT_USER } from "@/lib/data/mock";
import { initials } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function Topbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="relative hidden max-w-md flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search clients, content, knowledge…"
            className="pl-9"
            aria-label="Global search"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {!isSupabaseConfigured && (
            <Badge variant="warning" className="hidden sm:inline-flex">
              Demo mode
            </Badge>
          )}
          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-gold" />
          </Button>
          <div className="flex items-center gap-2 rounded-full border border-border bg-card/60 py-1 pl-1 pr-3">
            <Avatar className="h-7 w-7">
              <AvatarFallback>{initials(CURRENT_USER.full_name)}</AvatarFallback>
            </Avatar>
            <div className="hidden leading-tight sm:block">
              <p className="text-xs font-medium">{CURRENT_USER.full_name}</p>
              <p className="text-[10px] capitalize text-muted-foreground">{CURRENT_USER.role}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-border bg-card">
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <BrandMark />
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
