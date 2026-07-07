"use client";

import { useMemo, useState } from "react";
import { FileText } from "lucide-react";

import { CopyButton } from "@/components/shared/copy-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCollection, type Row } from "@/lib/db/use-collection";
import { cn } from "@/lib/utils";
import {
  CLIENT_SEED,
  NEGATIVE_SEED,
  PERSONAL_INFO_SEED,
} from "@/lib/credit/data";
import { type Client, type NegativeAccount, type PersonalInformation, fullName } from "@/lib/credit/types";
import {
  lexisNexisLetter,
  earlyWarningLetter,
  identityTheftAffidavit,
  SPECIALTY_LETTERS,
  type SpecialtyLetterKey,
} from "@/lib/credit/letter-templates";

/**
 * Reusable specialty-letter generator (LexisNexis / Early Warning / ID Theft).
 * Self-contained: reads the client collections. Pass `defaultClientId` +
 * `lockClient` to bind it to an already-selected client (hides the picker).
 */
export function SpecialtyLetterGenerator({
  defaultClientId,
  lockClient = false,
  className,
}: {
  defaultClientId?: string;
  lockClient?: boolean;
  className?: string;
}) {
  const clients = useCollection<Client & Row>("clients", CLIENT_SEED as (Client & Row)[]);
  const negatives = useCollection<NegativeAccount & Row>("negative_accounts", NEGATIVE_SEED as (NegativeAccount & Row)[]);
  const personalInfo = useCollection<PersonalInformation & Row>("personal_information", PERSONAL_INFO_SEED as (PersonalInformation & Row)[]);

  const [clientId, setClientId] = useState<string>(defaultClientId ?? clients.records[0]?.id ?? "");
  const activeId = lockClient ? (defaultClientId ?? clientId) : clientId;
  const client = clients.records.find((c) => c.id === activeId) ?? null;

  const [active, setActive] = useState<SpecialtyLetterKey | null>(null);
  const [text, setText] = useState("");

  const items = useMemo(
    () =>
      negatives.records
        .filter((n) => n.clientId === activeId && n.status !== "deleted" && n.status !== "paid")
        .map((n) => ({ creditor: n.creditor, detail: `${String(n.accountType).replace("_", " ")}${n.balance ? ` · $${Number(n.balance).toLocaleString()}` : ""}` })),
    [negatives.records, activeId],
  );

  const address = useMemo(() => {
    const pi = personalInfo.records.filter((p) => p.clientId === activeId && p.infoType === "address");
    return (pi.find((p) => p.status === "current") ?? pi[0])?.value;
  }, [personalInfo.records, activeId]);

  function generate(key: SpecialtyLetterKey) {
    if (!client) return;
    const c = { name: fullName(client), address, phone: client.phone, email: client.email };
    const out =
      key === "lexisnexis" ? lexisNexisLetter(c, items)
      : key === "earlywarning" ? earlyWarningLetter(c, items)
      : identityTheftAffidavit(c, items);
    setActive(key);
    setText(out);
  }

  return (
    <div className={cn("rounded-xl border border-gold/30 bg-card p-4", className)}>
      <div className="mb-1 flex items-center gap-2">
        <FileText className="h-4 w-4 text-gold" />
        <p className="text-sm font-semibold">Specialty Dispute Letters</p>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Beyond the 3 bureaus — secondary consumer reporting agencies + identity theft. Pre-filled from the client&apos;s data.
      </p>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {!lockClient && (
          <Select value={clientId} onValueChange={(v) => { setClientId(v); setText(""); setActive(null); }}>
            <SelectTrigger className="h-8 w-52 text-xs">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {clients.records.map((c) => (
                <SelectItem key={c.id} value={c.id}>{fullName(c)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {SPECIALTY_LETTERS.map((l) => (
          <button
            key={l.key}
            onClick={() => generate(l.key)}
            title={l.desc}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-medium",
              active === l.key ? "border-gold/50 bg-gold/15 text-gold" : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {l.label}
          </button>
        ))}
      </div>

      {text && (
        <div className="rounded-lg border border-border bg-background/40">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <p className="text-xs font-semibold">{SPECIALTY_LETTERS.find((l) => l.key === active)?.label}</p>
            <CopyButton value={text} />
          </div>
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap px-3 py-2 text-[11px] leading-relaxed text-foreground/90">{text}</pre>
        </div>
      )}
    </div>
  );
}
