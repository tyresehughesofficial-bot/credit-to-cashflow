import { Mic, Check, Ban } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { SectionLabel } from "@/components/intelligence/bits";
import { VOICE_PROFILE } from "@/lib/intelligence/data";

const DIMENSIONS: { key: keyof typeof VOICE_PROFILE; label: string }[] = [
  { key: "sentence", label: "Sentence Structure" },
  { key: "storytelling", label: "Storytelling Style" },
  { key: "educational", label: "Educational Style" },
  { key: "sales", label: "Sales Style" },
  { key: "cta", label: "CTA Style" },
];

export default function VoiceIntelligence() {
  return (
    <div>
      <PageHeader
        icon={<Mic className="h-5 w-5" />}
        title="Voice Intelligence"
        description="The engine's model of the founder's communication style. Every generated idea is shaped to match this voice — so output reads like Triad T, never generic AI."
      />

      <SectionLabel>Voice Dimensions</SectionLabel>
      <div className="grid gap-3 lg:grid-cols-2">
        {DIMENSIONS.map((d) => (
          <div key={d.key} className="rounded-xl border border-border bg-card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gold">{d.label}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              {VOICE_PROFILE[d.key] as string}
            </p>
          </div>
        ))}
      </div>

      <SectionLabel>Signature Vocabulary</SectionLabel>
      <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-4">
        {VOICE_PROFILE.vocabulary.map((w) => (
          <span key={w} className="rounded-full border border-gold/20 bg-gold/[0.06] px-3 py-1 text-[12px] font-medium text-gold/90">
            {w}
          </span>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <SectionLabel>Signature Phrases</SectionLabel>
          <div className="space-y-2 rounded-xl border border-success/20 bg-success/[0.03] p-4">
            {VOICE_PROFILE.signatures.map((s) => (
              <div key={s} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <p className="text-[13px]">{s}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel>Avoid (Anti-Voice)</SectionLabel>
          <div className="space-y-2 rounded-xl border border-destructive/20 bg-destructive/[0.03] p-4">
            {VOICE_PROFILE.avoid.map((s) => (
              <div key={s} className="flex items-start gap-2.5">
                <Ban className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p className="text-[13px] capitalize">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
