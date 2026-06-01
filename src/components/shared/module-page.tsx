"use client";

import { usePathname } from "next/navigation";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ALL_NAV_ITEMS } from "@/lib/navigation";

/**
 * Shared scaffold for modules that are wired into navigation while their
 * full feature set comes online. Derives its title/icon/description from the
 * matching nav item, so every route renders an on-brand, production-quality page.
 */
export default function ModulePage() {
  const pathname = usePathname();
  const item =
    ALL_NAV_ITEMS.find((i) => i.href === pathname) ??
    ALL_NAV_ITEMS.find((i) => pathname.startsWith(i.href + "/"));

  const Icon = item?.icon ?? Sparkles;
  const title = item?.label ?? "Module";
  const description = item?.description ?? "This module is part of the TRIAD T Command Center.";

  const checklist = [
    "Connected to the Command Center navigation & search",
    "Inherits the luxury black-and-gold design system",
    "Ready for Supabase data + AI generation wiring",
  ];

  return (
    <div>
      <PageHeader
        icon={<Icon className="h-5 w-5" />}
        title={title}
        description={description}
        actions={<Badge variant="warning">Scaffolding ready</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold" />
              {title} is online
            </CardTitle>
            <CardDescription>
              The route, navigation entry and layout are live. Plug in the data sources and
              generators to light up the full workflow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {checklist.map((line) => (
              <div key={line} className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>{line}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gold/[0.04]">
          <CardHeader>
            <CardTitle className="text-base">What&apos;s next</CardTitle>
            <CardDescription>Bring this module to full power.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {["Define the data model", "Connect Supabase tables", "Wire AI generation"].map(
                (step, i) => (
                  <li key={step} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-[11px] font-bold text-gold">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground">{step}</span>
                    <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground/50" />
                  </li>
                ),
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
