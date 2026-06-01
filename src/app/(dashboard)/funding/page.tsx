"use client";

import { useState } from "react";
import { CheckCircle2, Landmark, Wand2, XCircle } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { analyzeFunding, type FundingResult } from "@/lib/generators";
import { cn } from "@/lib/utils";

type CreditType = "personal" | "business";

const tierVariant: Record<FundingResult["tier"], "success" | "warning" | "secondary" | "destructive"> = {
  "Funding-Ready": "success",
  Approaching: "warning",
  Building: "secondary",
  "Not Ready": "destructive",
};

export default function FundingPage() {
  const [creditType, setCreditType] = useState<CreditType>("personal");
  const [fico, setFico] = useState(680);
  const [utilization, setUtilization] = useState(25);
  const [derogatory, setDerogatory] = useState(1);
  const [inquiries, setInquiries] = useState(2);
  const [bizAge, setBizAge] = useState(12);
  const [revenue, setRevenue] = useState(75000);
  const [result, setResult] = useState<FundingResult | null>(null);

  function handleAnalyze() {
    setResult(
      analyzeFunding({
        creditType,
        fico,
        utilization,
        derogatoryMarks: derogatory,
        inquiries6mo: inquiries,
        businessAgeMonths: bizAge,
        annualRevenue: revenue,
      }),
    );
  }

  return (
    <div>
      <PageHeader
        icon={<Landmark className="h-5 w-5" />}
        title="Funding Engine"
        description="Funding readiness analyzer with personal & business credit analysis and approval-readiness scoring."
      />

      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Readiness Analyzer</CardTitle>
            <CardDescription>Enter the profile to score approval readiness.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={creditType} onValueChange={(v) => setCreditType(v as CreditType)}>
              <TabsList className="mb-4 w-full">
                <TabsTrigger value="personal" className="flex-1">
                  Personal
                </TabsTrigger>
                <TabsTrigger value="business" className="flex-1">
                  Business
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="mt-0 space-y-4">
                <NumberField label="FICO Score" value={fico} onChange={setFico} min={300} max={850} />
                <NumberField label="Utilization (%)" value={utilization} onChange={setUtilization} min={0} max={100} />
                <NumberField label="Derogatory Marks" value={derogatory} onChange={setDerogatory} min={0} max={30} />
                <NumberField label="Inquiries (6mo)" value={inquiries} onChange={setInquiries} min={0} max={30} />
              </TabsContent>

              <TabsContent value="business" className="mt-0 space-y-4">
                <NumberField label="Business Age (months)" value={bizAge} onChange={setBizAge} min={0} max={600} />
                <NumberField label="Annual Revenue ($)" value={revenue} onChange={setRevenue} min={0} max={10000000} step={1000} />
                <NumberField label="Guarantor Derogatory Marks" value={derogatory} onChange={setDerogatory} min={0} max={30} />
                <NumberField label="Inquiries (6mo)" value={inquiries} onChange={setInquiries} min={0} max={30} />
              </TabsContent>
            </Tabs>

            <Button className="mt-4 w-full" onClick={handleAnalyze}>
              <Wand2 className="h-4 w-4" /> Analyze Readiness
            </Button>
          </CardContent>
        </Card>

        {result ? (
          <div className="space-y-6">
            <Card className="border-gold/30">
              <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between">
                <div className="text-center sm:text-left">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Approval Readiness
                  </p>
                  <p className="text-5xl font-bold gold-text">{result.readiness}</p>
                  <Badge variant={tierVariant[result.tier]} className="mt-2">
                    {result.tier}
                  </Badge>
                </div>
                <div className="w-full max-w-xs">
                  <Progress value={result.readiness} className="h-3" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Estimated approval:{" "}
                    <span className="font-medium text-foreground">{result.estimatedApproval}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Factor Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.factors.map((f) => (
                  <div
                    key={f.label}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-4 py-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full",
                          f.status === "good" && "bg-success/15 text-success",
                          f.status === "warn" && "bg-warning/15 text-warning",
                          f.status === "bad" && "bg-destructive/15 text-destructive",
                        )}
                      >
                        {f.status === "bad" ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                      </span>
                      <span className="text-sm font-medium">{f.label}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{f.note}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Next Steps</CardTitle>
                <CardDescription>Action plan to improve approval odds.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className="flex gap-2.5 text-sm">
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      <span className="text-foreground/90">{r}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">
                <Landmark className="h-6 w-6" />
              </div>
              <p className="max-w-sm text-sm text-muted-foreground">
                Enter a credit profile and click{" "}
                <span className="text-gold">Analyze Readiness</span> for a full approval-readiness report.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
