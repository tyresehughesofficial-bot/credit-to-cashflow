import { cn } from "@/lib/utils";
import { SCORE_META, tier, TIER_CLASS } from "@/lib/intelligence/scoring";
import type { OpportunityScores } from "@/lib/intelligence/types";

export function TierBadge({ total, className }: { total: number; className?: string }) {
  const t = tier(total);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        TIER_CLASS[t],
        className,
      )}
    >
      {t}
    </span>
  );
}

/** Compact circular total-score gauge. */
export function ScoreRing({ total, size = 64 }: { total: number; size?: number }) {
  const r = 15.9155;
  const t = tier(total);
  const stroke =
    t === "Priority" ? "#D4AF37" : t === "Strong" ? "#3ecf6e" : t === "Watch" ? "#A07D1F" : "#54410E";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" width={size} height={size}>
        <circle cx="18" cy="18" r={r} fill="none" stroke="hsl(var(--secondary))" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${total} ${100 - total}`}
          strokeDashoffset="25"
          transform="rotate(-90 18 18)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-extrabold leading-none">{total}</span>
      </div>
    </div>
  );
}

/** Five sub-score bars (competition shown inverted: more filled = better). */
export function ScoreBars({ scores, className }: { scores: OpportunityScores; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-2 sm:grid-cols-2", className)}>
      {SCORE_META.map((m) => {
        const raw = scores[m.key];
        const shown = m.invert ? 100 - raw : raw;
        return (
          <div key={m.key} className="flex items-center gap-2.5" title={m.hint}>
            <span className="w-24 shrink-0 text-[11px] uppercase tracking-wide text-muted-foreground">
              {m.label}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold"
                style={{ width: `${shown}%` }}
              />
            </div>
            <span className="w-7 shrink-0 text-right text-[11px] font-semibold tabular-nums text-muted-foreground">
              {m.invert ? raw : raw}
            </span>
          </div>
        );
      })}
    </div>
  );
}
