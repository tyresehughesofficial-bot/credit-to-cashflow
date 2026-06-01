"use client";

import { useState } from "react";
import { Headphones, Mail, MessageSquare, Phone, ShieldQuestion } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { CopyButton } from "@/components/shared/copy-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SALES_SCRIPTS } from "@/lib/data/mock";
import type { SalesAssetType } from "@/types/database";

const TABS: { value: SalesAssetType; label: string; icon: typeof Mail }[] = [
  { value: "objection", label: "Objections", icon: ShieldQuestion },
  { value: "sms", label: "SMS", icon: MessageSquare },
  { value: "email", label: "Email", icon: Mail },
  { value: "consultation", label: "Consultation", icon: Phone },
];

export default function SalesPage() {
  const [query, setQuery] = useState("");

  return (
    <div>
      <PageHeader
        icon={<Headphones className="h-5 w-5" />}
        title="Sales Center"
        description="Objection-handling database, SMS & email templates, and consultation scripts."
      />

      <Tabs defaultValue="objection">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="flex-wrap">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <TabsTrigger key={t.value} value={t.value}>
                  <Icon className="h-4 w-4" /> {t.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
          <Input
            placeholder="Search templates…"
            className="sm:w-64"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {TABS.map((t) => {
          const items = SALES_SCRIPTS.filter(
            (s) =>
              s.type === t.value &&
              (!query ||
                s.title.toLowerCase().includes(query.toLowerCase()) ||
                s.body.toLowerCase().includes(query.toLowerCase())),
          );
          return (
            <TabsContent key={t.value} value={t.value}>
              <div className="grid gap-4 md:grid-cols-2">
                {items.map((s) => (
                  <Card key={s.id}>
                    <CardHeader className="flex-row items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-sm">{s.title}</CardTitle>
                        {s.category && <CardDescription>{s.category}</CardDescription>}
                      </div>
                      {s.category && <Badge variant="secondary">{s.category}</Badge>}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <pre className="max-h-56 overflow-y-auto scroll-thin whitespace-pre-wrap rounded-lg border border-border/60 bg-background/40 p-3 font-sans text-xs leading-relaxed text-muted-foreground">
                        {s.body}
                      </pre>
                      <CopyButton value={s.body} className="w-full" />
                    </CardContent>
                  </Card>
                ))}
                {items.length === 0 && (
                  <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
                    No templates found.
                  </p>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
