"use client";

import { useState } from "react";
import { Captions } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { AIPanel } from "@/components/ai/ai-panel";
import { Input } from "@/components/ui/input";

export default function CaptionBuilderPage() {
  const [topic, setTopic] = useState("");
  return (
    <div>
      <PageHeader icon={<Captions className="h-5 w-5" />} title="Caption Builder" description="High-converting captions tuned to platform and funnel stage." />
      <Input className="mb-3 max-w-xl" placeholder="Topic / hook (e.g. why your credit score is lying to you)" value={topic} onChange={(e) => setTopic(e.target.value)} />
      <AIPanel
        title="Caption Generator"
        cta="Generate captions"
        system="You are a short-form social copywriter for a credit & funding brand. Write scroll-stopping, high-converting captions."
        prompt={`Write 3 Instagram captions about: "${topic || "building business credit"}". Each: a hook, a value line, and a soft CTA. Add 5 relevant hashtags.`}
        fallback="Set ANTHROPIC_API_KEY in Supabase to generate captions with AI."
      />
    </div>
  );
}
