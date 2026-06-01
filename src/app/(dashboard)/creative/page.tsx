"use client";

import { useState } from "react";
import { ImageIcon, Palette, Sparkles, Wand2 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { CopyButton } from "@/components/shared/copy-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateCreativePrompt, type CreativeEngine } from "@/lib/generators";

const ENGINES: { value: CreativeEngine; label: string; desc: string }[] = [
  { value: "thumbnail", label: "Thumbnail", desc: "Scroll-stopping reel/YouTube thumbnails" },
  { value: "chatgpt", label: "ChatGPT Image", desc: "Photorealistic DALL·E / GPT image prompts" },
  { value: "firefly", label: "Adobe Firefly", desc: "Editorial brand-safe Firefly prompts" },
  { value: "rich_cinema_x", label: "Rich Cinema X", desc: "Luxury cinematic 'money & power' style" },
];

export default function CreativePage() {
  const [subject, setSubject] = useState("");
  const [engine, setEngine] = useState<CreativeEngine>("thumbnail");
  const [prompt, setPrompt] = useState("");

  function handleGenerate(e: CreativeEngine) {
    setEngine(e);
    setPrompt(generateCreativePrompt(e, subject));
  }

  return (
    <div>
      <PageHeader
        icon={<Palette className="h-5 w-5" />}
        title="Creative Center"
        description="Generate prompts for thumbnails, ChatGPT images, Adobe Firefly, and the signature Rich Cinema X style."
      />

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="subject">Subject / scene</Label>
            <Input
              id="subject"
              placeholder="e.g. a confident entrepreneur holding a phone showing a 750 credit score"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <Button onClick={() => handleGenerate(engine)}>
            <Wand2 className="h-4 w-4" /> Generate
          </Button>
        </CardContent>
      </Card>

      <Tabs value={engine} onValueChange={(v) => handleGenerate(v as CreativeEngine)}>
        <TabsList className="flex-wrap">
          {ENGINES.map((e) => (
            <TabsTrigger key={e.value} value={e.value}>
              {e.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {ENGINES.map((e) => (
          <TabsContent key={e.value} value={e.value}>
            <Card className="border-gold/30">
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-gold" /> {e.label} Prompt
                  </CardTitle>
                  <CardDescription>{e.desc}</CardDescription>
                </div>
                {prompt && engine === e.value && <CopyButton value={prompt} label="Copy prompt" />}
              </CardHeader>
              <CardContent>
                {prompt && engine === e.value ? (
                  <p className="rounded-lg border border-border/60 bg-background/40 p-4 text-sm leading-relaxed text-foreground/90">
                    {prompt}
                  </p>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enter a subject above and click <span className="text-gold">Generate</span>.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
