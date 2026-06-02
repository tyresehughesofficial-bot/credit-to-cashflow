"use client";

import { useState } from "react";
import { Check, X, Bookmark, Archive, Sparkles, ChevronDown, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CategoryChip, FunnelChip, PlatformChip, SourceChip } from "@/components/intelligence/bits";
import { ScoreBars, ScoreRing, TierBadge } from "@/components/intelligence/score";
import { generateOutputs, generatePackage } from "@/lib/intelligence/generators";
import { setOppStatus, statusOf, useOppStatuses } from "@/lib/intelligence/store";
import { collectionRemoveBy, collectionUpsert } from "@/lib/db/use-collection";
import type { Opportunity, OppStatus } from "@/lib/intelligence/types";

/** Persist the generated content package to the approved_ideas collection. */
function recordApproval(opp: Opportunity) {
  const pkg = generatePackage(opp);
  collectionUpsert("approved_ideas", {
    id: opp.id,
    opportunityId: opp.id,
    title: opp.title,
    category: opp.category,
    totalScore: opp.total,
    ...pkg,
  });
}
const clearApproval = (id: string) => collectionRemoveBy("approved_ideas", "opportunityId", id);

const STATUS_RING: Record<OppStatus, string> = {
  new: "border-border",
  approved: "border-success/40 shadow-[0_0_0_1px_rgba(62,207,110,0.15)]",
  rejected: "border-border opacity-55",
  archived: "border-border opacity-70",
  saved: "border-gold/40 shadow-[0_0_0_1px_rgba(212,175,55,0.15)]",
};

const STATUS_LABEL: Partial<Record<OppStatus, string>> = {
  approved: "Approved → Pipeline",
  rejected: "Rejected",
  archived: "Archived",
  saved: "Saved",
};

export function OpportunityCard({ opp, defaultOpen = false }: { opp: Opportunity; defaultOpen?: boolean }) {
  const statuses = useOppStatuses();
  const status = statusOf(statuses, opp.id);
  const [open, setOpen] = useState(defaultOpen);
  const [showOutputs, setShowOutputs] = useState(false);

  const outputs = generateOutputs(opp);

  return (
    <div className={cn("rounded-xl border bg-card transition-all", STATUS_RING[status])}>
      <div className="flex items-start gap-4 p-4">
        <ScoreRing total={opp.total} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <SourceChip source={opp.source} />
            <FunnelChip funnel={opp.funnel} />
            <CategoryChip category={opp.category} />
            <PlatformChip platform={opp.platform} />
            <span className="text-[10px] text-muted-foreground">· {opp.format}</span>
            {STATUS_LABEL[status] && (
              <span
                className={cn(
                  "ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  status === "approved" && "bg-success/15 text-success",
                  status === "saved" && "bg-gold/15 text-gold",
                  (status === "rejected" || status === "archived") && "bg-muted text-muted-foreground",
                )}
              >
                {STATUS_LABEL[status]}
              </span>
            )}
          </div>

          <h3 className="mt-2 text-[15px] font-semibold leading-snug">{opp.title}</h3>

          <button
            onClick={() => setOpen((o) => !o)}
            className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {open ? "Hide" : "Show"} intelligence
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
          </button>
        </div>

        <div className="hidden sm:block">
          <TierBadge total={opp.total} />
        </div>
      </div>

      {open && (
        <div className="space-y-4 border-t border-border px-4 py-4">
          <ScoreBars scores={opp.scores} />

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Suggested Hook" value={opp.hook} />
            <Field label="Suggested CTA" value={opp.cta} />
          </div>

          <div className="rounded-lg border border-border bg-secondary/30 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Why this is an opportunity
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{opp.rationale}</p>
            <p className="mt-2 text-[11px] text-gold/80">📎 {opp.evidence}</p>
          </div>

          <button
            onClick={() => setShowOutputs((s) => !s)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gold hover:opacity-80"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {showOutputs ? "Hide generated content" : "Generate TOF / MOF / BOF"}
          </button>

          {showOutputs && (
            <div className="grid gap-3 lg:grid-cols-3">
              {outputs.map((o) => (
                <div
                  key={o.stage}
                  className={cn(
                    "rounded-lg border bg-background/40 p-3",
                    o.stage === opp.funnel ? "border-gold/30" : "border-border",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <FunnelChip funnel={o.stage} />
                    <span className="text-[10px] text-muted-foreground">
                      {o.format} · {o.platform}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] font-semibold text-foreground">{o.angle}</p>
                  <p className="mt-2 text-[12px] leading-relaxed">
                    <span className="text-muted-foreground">Hook: </span>
                    {o.hook}
                  </p>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">{o.body}</p>
                  <p className="mt-2 flex items-start gap-1 text-[12px] text-gold/90">
                    <ArrowRight className="mt-0.5 h-3 w-3 shrink-0" />
                    {o.cta}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Approval workflow actions */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
        <Button
          size="sm"
          variant={status === "approved" ? "default" : "outline"}
          className={cn("h-8", status === "approved" && "bg-success text-background hover:bg-success/90")}
          onClick={() => {
            const willApprove = status !== "approved";
            setOppStatus(opp.id, "approved");
            if (willApprove) recordApproval(opp);
            else clearApproval(opp.id);
          }}
        >
          <Check className="mr-1 h-3.5 w-3.5" /> Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={() => {
            setOppStatus(opp.id, "saved");
            clearApproval(opp.id);
          }}
        >
          <Bookmark className={cn("mr-1 h-3.5 w-3.5", status === "saved" && "fill-gold text-gold")} /> Save
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={() => {
            setOppStatus(opp.id, "archived");
            clearApproval(opp.id);
          }}
        >
          <Archive className="mr-1 h-3.5 w-3.5" /> Archive
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto h-8 text-muted-foreground hover:text-destructive"
          onClick={() => {
            setOppStatus(opp.id, "rejected");
            clearApproval(opp.id);
          }}
        >
          <X className="mr-1 h-3.5 w-3.5" /> Reject
        </Button>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-[13px] leading-relaxed">{value}</p>
    </div>
  );
}
