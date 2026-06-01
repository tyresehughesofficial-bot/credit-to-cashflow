"use client";

import { useState } from "react";
import { FileText, PenLine, Wand2 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { CopyButton } from "@/components/shared/copy-button";
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
import { SCRIPTS } from "@/lib/data/mock";
import { generateScript } from "@/lib/generators";
import type { Funnel } from "@/types/database";

type ScriptType = "reel" | "carousel" | "sales" | "caption" | "vsl";

const TYPES: { value: ScriptType; label: string }[] = [
  { value: "reel", label: "Reel Script" },
  { value: "carousel", label: "Carousel Script" },
  { value: "sales", label: "Sales Script" },
  { value: "caption", label: "Caption" },
  { value: "vsl", label: "VSL Script" },
];

export default function ScriptWriterPage() {
  const [topic, setTopic] = useState("");
  const [type, setType] = useState<ScriptType>("reel");
  const [funnel, setFunnel] = useState<Funnel>("TOF");
  const [output, setOutput] = useState("");

  function handleGenerate() {
    setOutput(generateScript(topic, type, funnel));
  }

  return (
    <div>
      <PageHeader
        icon={<PenLine className="h-5 w-5" />}
        title="Script Writer"
        description="Generate reel scripts, carousel scripts, sales scripts, and captions in seconds."
      />

      <Tabs defaultValue="generate">
        <TabsList>
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="library">Saved Scripts</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Script settings</CardTitle>
                <CardDescription>Pick a format and topic.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="s-topic">Topic</Label>
                  <Input
                    id="s-topic"
                    placeholder="e.g. removing collections, business funding"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Script type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as ScriptType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Funnel stage</Label>
                  <Select value={funnel} onValueChange={(v) => setFunnel(v as Funnel)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["TOF", "MOF", "BOF"].map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleGenerate}>
                  <Wand2 className="h-4 w-4" /> Write Script
                </Button>
              </CardContent>
            </Card>

            <Card className={output ? "border-gold/30" : "border-dashed"}>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Output</CardTitle>
                  <CardDescription>Your generated script</CardDescription>
                </div>
                {output && <CopyButton value={output} label="Copy script" />}
              </CardHeader>
              <CardContent>
                {output ? (
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
                    {output}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">
                      <PenLine className="h-6 w-6" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Configure your script and click <span className="text-gold">Write Script</span>.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="library">
          <div className="grid gap-4 md:grid-cols-2">
            {SCRIPTS.map((script) => (
              <Card key={script.id}>
                <CardHeader className="flex-row items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gold" /> {script.title}
                    </CardTitle>
                    <CardDescription>
                      <span className="capitalize">{script.type}</span> · {script.word_count} words
                    </CardDescription>
                  </div>
                  {script.funnel && <Badge variant="secondary">{script.funnel}</Badge>}
                </CardHeader>
                <CardContent className="space-y-3">
                  <pre className="max-h-48 overflow-y-auto scroll-thin whitespace-pre-wrap rounded-lg border border-border/60 bg-background/40 p-3 font-sans text-xs leading-relaxed text-muted-foreground">
                    {script.body}
                  </pre>
                  <CopyButton value={script.body} className="w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
