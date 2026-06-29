"use client";

import { useState } from "react";
import { AlignLeft } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { AIPanel } from "@/components/ai/ai-panel";
import { Input } from "@/components/ui/input";

export default function DescriptionBuilderPage() {
  const [topic, setTopic] = useState("");
  return (
    <div>
      <PageHeader icon={<AlignLeft className="h-5 w-5" />} title="Description Builder" description="SEO-aware descriptions for YouTube, posts, and landing pages." />
      <Input className="mb-3 max-w-xl" placeholder="Video / page topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
      <AIPanel
        title="Description Generator"
        cta="Generate description"
        system="You are an SEO copywriter for a credit-repair and funding company. Write clear, keyword-aware descriptions with a CTA."
        prompt={`Write an SEO-optimized YouTube description for a video about: "${topic || "how to get business funding"}". Include a 2-sentence summary, 3 timestamps, a CTA to book a consult, and 8 keywords.`}
        fallback="Set ANTHROPIC_API_KEY in Supabase to generate descriptions with AI."
      />
    </div>
  );
}
