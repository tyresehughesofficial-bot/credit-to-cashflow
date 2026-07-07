"use client";

import { useState } from "react";
import { FileWarning, Gavel, Phone, ScrollText, ShieldCheck, Wand2 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { CopyButton } from "@/components/shared/copy-button";
import { SpecialtyLetterGenerator } from "@/components/credit/specialty-letters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CLIENTS } from "@/lib/data/mock";
import { generateDisputeStrategy, type DisputeStrategy } from "@/lib/generators";
import type { Bureau } from "@/types/database";

const REASONS = [
  "Not mine / unverifiable",
  "Inaccurate balance",
  "Incorrect date of first delinquency",
  "Account status inaccurate",
  "Duplicate reporting",
  "Re-aged debt",
  "No signed agreement on file",
];

export default function DisputesPage() {
  const [client, setClient] = useState("");
  const [bureau, setBureau] = useState<Bureau>("Equifax");
  const [creditor, setCreditor] = useState("");
  const [reason, setReason] = useState(REASONS[0]);
  const [round, setRound] = useState("1");
  const [strategy, setStrategy] = useState<DisputeStrategy | null>(null);

  function handleGenerate() {
    setStrategy(generateDisputeStrategy(bureau, creditor, reason, Number(round)));
  }

  return (
    <div>
      <PageHeader
        icon={<ShieldCheck className="h-5 w-5" />}
        title="Dispute Strategy Builder"
        description="Generate bureau-specific strategies, dispute letters, phone scripts, and CFPB escalation plans."
      />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Build a strategy</CardTitle>
            <CardDescription>Configure the dispute parameters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Client (optional)</Label>
              <Select value={client} onValueChange={setClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {CLIENTS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Bureau</Label>
                <Select value={bureau} onValueChange={(v) => setBureau(v as Bureau)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["Equifax", "Experian", "TransUnion"] as Bureau[]).map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Round</Label>
                <Select value={round} onValueChange={setRound}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((r) => (
                      <SelectItem key={r} value={String(r)}>
                        Round {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="creditor">Creditor / furnisher</Label>
              <Input
                id="creditor"
                placeholder="e.g. Portfolio Recovery"
                value={creditor}
                onChange={(e) => setCreditor(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Dispute reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleGenerate}>
              <Wand2 className="h-4 w-4" /> Build Strategy
            </Button>
          </CardContent>
        </Card>

        {strategy ? (
          <div className="space-y-4">
            <Card className="border-gold/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-4 w-4 text-gold" /> {strategy.bureau} Strategy — Round {round}
                </CardTitle>
                <CardDescription>{strategy.approach}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Legal basis
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {strategy.legalBasis.map((l) => (
                    <Badge key={l} variant="outline">
                      {l}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="letter">
              <TabsList>
                <TabsTrigger value="letter">
                  <ScrollText className="h-4 w-4" /> Letter
                </TabsTrigger>
                <TabsTrigger value="call">
                  <Phone className="h-4 w-4" /> Call Script
                </TabsTrigger>
                <TabsTrigger value="cfpb">
                  <FileWarning className="h-4 w-4" /> CFPB Plan
                </TabsTrigger>
              </TabsList>

              <TabsContent value="letter">
                <Card>
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Dispute Letter</CardTitle>
                    <CopyButton value={strategy.letter} label="Copy letter" />
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap rounded-lg border border-border/60 bg-background/40 p-4 font-sans text-sm leading-relaxed text-foreground/90">
                      {strategy.letter}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="call">
                <Card>
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Phone Call Script</CardTitle>
                    <CopyButton value={strategy.callScript} label="Copy script" />
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap rounded-lg border border-border/60 bg-background/40 p-4 font-sans text-sm leading-relaxed text-foreground/90">
                      {strategy.callScript}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cfpb">
                <Card>
                  <CardHeader>
                    <CardTitle>CFPB Escalation Plan</CardTitle>
                    <CardDescription>Step-by-step regulatory escalation.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2">
                      {strategy.cfpbPlan.map((step, i) => (
                        <li key={i} className="flex gap-3 text-sm">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xs font-semibold text-gold">
                            {i + 1}
                          </span>
                          <span className="text-foreground/90">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <p className="max-w-sm text-sm text-muted-foreground">
                Configure the bureau, creditor, and round, then click{" "}
                <span className="text-gold">Build Strategy</span> for a complete dispute package.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-6">
        <SpecialtyLetterGenerator />
      </div>
    </div>
  );
}
