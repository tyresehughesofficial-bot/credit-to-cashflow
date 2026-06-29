"use client";

import { useState } from "react";
import { MousePointerClick } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { AIPanel } from "@/components/ai/ai-panel";
import { Input } from "@/components/ui/input";

export default function CTAGeneratorPage() {
  const [offer, setOffer] = useState("");
  return (
    <div>
      <PageHeader icon={<MousePointerClick className="h-5 w-5" />} title="CTA Generator" description="Psychology-driven calls to action for every offer." />
      <Input className="mb-3 max-w-xl" placeholder="Offer (e.g. Business-in-a-Box)" value={offer} onChange={(e) => setOffer(e.target.value)} />
      <AIPanel
        title="CTA Generator"
        cta="Generate CTAs"
        system="You are a direct-response copywriter. Write punchy, psychology-driven CTAs."
        prompt={`Write 6 high-converting CTAs for this offer: "${offer || "Credit Repair"}". Vary the psychology (urgency, curiosity, value, social proof). One line each.`}
        fallback="Set ANTHROPIC_API_KEY in Supabase to generate CTAs with AI."
      />
    </div>
  );
}
