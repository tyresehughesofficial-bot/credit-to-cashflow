"use client";

import { useMemo, useState } from "react";
import { Anchor, Plus, Search, Star } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { CopyButton } from "@/components/shared/copy-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HOOKS } from "@/lib/data/mock";
import type { Hook, PsychologyType } from "@/types/database";

const PSYCH_TYPES: PsychologyType[] = [
  "curiosity",
  "fear",
  "desire",
  "authority",
  "social_proof",
  "controversy",
  "transformation",
  "urgency",
];

const psychColor: Record<PsychologyType, string> = {
  curiosity: "bg-blue-500/15 text-blue-300",
  fear: "bg-red-500/15 text-red-300",
  desire: "bg-pink-500/15 text-pink-300",
  authority: "bg-gold/15 text-gold",
  social_proof: "bg-green-500/15 text-green-300",
  controversy: "bg-orange-500/15 text-orange-300",
  transformation: "bg-purple-500/15 text-purple-300",
  urgency: "bg-yellow-500/15 text-yellow-300",
};

export default function HooksPage() {
  const [hooks, setHooks] = useState<Hook[]>(HOOKS);
  const [query, setQuery] = useState("");
  const [psych, setPsych] = useState<string>("all");
  const [funnel, setFunnel] = useState<string>("all");
  const [open, setOpen] = useState(false);

  // New hook form
  const [text, setText] = useState("");
  const [category, setCategory] = useState("");
  const [newPsych, setNewPsych] = useState<PsychologyType>("curiosity");
  const [newFunnel, setNewFunnel] = useState("TOF");
  const [tags, setTags] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return hooks.filter((h) => {
      const matchesQ =
        !q ||
        h.text.toLowerCase().includes(q) ||
        h.category.toLowerCase().includes(q) ||
        h.tags.some((t) => t.toLowerCase().includes(q));
      const matchesPsych = psych === "all" || h.psychology === psych;
      const matchesFunnel = funnel === "all" || h.funnel === funnel;
      return matchesQ && matchesPsych && matchesFunnel;
    });
  }, [hooks, query, psych, funnel]);

  function saveHook() {
    if (!text.trim()) return;
    const hook: Hook = {
      id: `h_${Date.now()}`,
      text: text.trim(),
      category: category.trim() || "General",
      psychology: newPsych,
      funnel: newFunnel as Hook["funnel"],
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      performance_score: 0,
      created_at: new Date().toISOString(),
    };
    setHooks((prev) => [hook, ...prev]);
    setText("");
    setCategory("");
    setTags("");
    setOpen(false);
  }

  return (
    <div>
      <PageHeader
        icon={<Anchor className="h-5 w-5" />}
        title="Viral Hook Library"
        description="Save, categorize, search, and tag your highest-converting hooks by psychology type."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> Add Hook
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save a hook</DialogTitle>
                <DialogDescription>Add to your swipe file and tag it.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="hook-text">Hook</Label>
                  <Input
                    id="hook-text"
                    placeholder="Your scroll-stopping hook…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Input
                      placeholder="e.g. Funding"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Funnel</Label>
                    <Select value={newFunnel} onValueChange={setNewFunnel}>
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
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Psychology</Label>
                    <Select value={newPsych} onValueChange={(v) => setNewPsych(v as PsychologyType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PSYCH_TYPES.map((p) => (
                          <SelectItem key={p} value={p} className="capitalize">
                            {p.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tags (comma-separated)</Label>
                    <Input
                      placeholder="proof, playbook"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={saveHook}>Save Hook</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search hooks, tags, categories…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={psych} onValueChange={setPsych}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Psychology" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All psychology</SelectItem>
            {PSYCH_TYPES.map((p) => (
              <SelectItem key={p} value={p} className="capitalize">
                {p.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={funnel} onValueChange={setFunnel}>
          <SelectTrigger className="sm:w-36">
            <SelectValue placeholder="Funnel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All funnels</SelectItem>
            {["TOF", "MOF", "BOF"].map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((hook) => (
          <Card key={hook.id} className="flex flex-col transition-colors hover:border-gold/40">
            <CardContent className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${psychColor[hook.psychology]}`}
                >
                  {hook.psychology.replace("_", " ")}
                </span>
                {hook.performance_score > 0 && (
                  <span className="flex items-center gap-1 text-xs text-gold">
                    <Star className="h-3 w-3 fill-gold" /> {hook.performance_score}
                  </span>
                )}
              </div>
              <p className="flex-1 text-sm font-medium leading-snug">{hook.text}</p>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline">{hook.funnel}</Badge>
                <Badge variant="muted">{hook.category}</Badge>
                {hook.tags.map((t) => (
                  <Badge key={t} variant="secondary">
                    #{t}
                  </Badge>
                ))}
              </div>
              <CopyButton value={hook.text} className="w-full" />
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
            No hooks match your filters.
          </p>
        )}
      </div>
    </div>
  );
}
