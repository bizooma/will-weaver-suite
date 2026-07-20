import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, Sparkles } from "lucide-react";
import SEOHead from "@/components/SEOHead";

// AI Visibility (AEO Audit) — runs buyer-intent prompts through multiple AI
// assistants via Lovable AI Gateway and measures whether the given domain
// appears in the answer vs. which competitor domains show up instead.

interface ResultRow {
  platform: string;
  prompt: string;
  hasMention: boolean;
  isCitation: boolean;
  confidence: number;
  mentionText: string;
  competitors: string[];
}

interface RunResponse {
  success: boolean;
  run_id: string | null;
  domain: string;
  overall_score: number;
  total_checks: number;
  mention_count: number;
  citation_count: number;
  results: ResultRow[];
}

interface HistoryRun {
  id: string;
  domain: string;
  overall_score: number;
  total_checks: number;
  mention_count: number;
  citation_count: number;
  created_at: string;
  prompts: string[];
}

export default function AIVisibility() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [domain, setDomain] = useState("");
  const [promptsText, setPromptsText] = useState(
    "best personal injury lawyer in Amarillo\nhow much does an immigration consultation cost\ntop estate planning attorneys near me"
  );
  const [running, setRunning] = useState(false);
  const [current, setCurrent] = useState<RunResponse | null>(null);
  const [history, setHistory] = useState<HistoryRun[]>([]);

  // Load past runs
  const loadHistory = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("ai_visibility_runs")
      .select("id, domain, overall_score, total_checks, mention_count, citation_count, created_at, prompts")
      .order("created_at", { ascending: false })
      .limit(25);
    setHistory((data ?? []) as any);
  };

  useEffect(() => { loadHistory(); }, [user]);

  const runCheck = async () => {
    const prompts = promptsText.split("\n").map((p) => p.trim()).filter(Boolean).slice(0, 20);
    if (!domain.trim() || prompts.length === 0) {
      toast({ title: "Missing input", description: "Enter a domain and at least one prompt.", variant: "destructive" });
      return;
    }
    setRunning(true);
    setCurrent(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-visibility-check", {
        body: { domain: domain.trim(), prompts },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setCurrent(data as RunResponse);
      await loadHistory();
      toast({ title: "Check complete", description: `Overall visibility: ${(data as RunResponse).overall_score}/100` });
    } catch (e: any) {
      toast({ title: "Check failed", description: e.message ?? String(e), variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  // Load a saved run's scorecard
  const openRun = async (runId: string) => {
    const { data: run } = await supabase.from("ai_visibility_runs").select("*").eq("id", runId).maybeSingle();
    const { data: rows } = await supabase.from("ai_visibility_results").select("*").eq("run_id", runId);
    if (!run) return;
    setCurrent({
      success: true,
      run_id: run.id,
      domain: run.domain,
      overall_score: run.overall_score,
      total_checks: run.total_checks,
      mention_count: run.mention_count,
      citation_count: run.citation_count,
      results: (rows ?? []).map((r: any) => ({
        platform: r.platform,
        prompt: r.prompt,
        hasMention: r.has_mention,
        isCitation: r.is_citation,
        confidence: Number(r.confidence),
        mentionText: r.mention_text ?? "",
        competitors: r.competitors ?? [],
      })),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Group results by prompt for the scorecard table
  const byPrompt = current
    ? Array.from(new Set(current.results.map((r) => r.prompt))).map((prompt) => {
        const rows = current.results.filter((r) => r.prompt === prompt);
        const openai = rows.find((r) => r.platform === "openai");
        const gemini = rows.find((r) => r.platform === "gemini");
        const competitors = Array.from(
          new Set(rows.filter((r) => !r.hasMention).flatMap((r) => r.competitors))
        ).slice(0, 8);
        return { prompt, openai, gemini, competitors };
      })
    : [];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 space-y-6">
      <SEOHead
        title="AI Visibility Checker | Amicus Edge AEO Audit"
        description="Audit whether your law firm shows up in ChatGPT and Gemini answers to buyer-intent questions. See which competitors AI recommends instead."
      />
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-7 w-7" /> AI Visibility Checker
        </h1>
        <p className="text-muted-foreground">
          Measure whether your firm appears when AI assistants answer real client questions — and who wins the recommendation when you don't.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Run a new check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Your domain</label>
            <Input
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              disabled={running}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Buyer-intent prompts (one per line, max 20)</label>
            <Textarea
              rows={6}
              value={promptsText}
              onChange={(e) => setPromptsText(e.target.value)}
              disabled={running}
            />
          </div>
          <Button onClick={runCheck} disabled={running}>
            {running ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Running check (~1 min)…</>) : "Run Check"}
          </Button>
        </CardContent>
      </Card>

      {current && (
        <Card>
          <CardHeader>
            <CardTitle>Scorecard — {current.domain}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Overall Visibility</div>
                <div className="text-5xl font-bold">{current.overall_score}<span className="text-2xl text-muted-foreground">/100</span></div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Mentions</div>
                <div className="text-3xl font-semibold">{current.mention_count} / {current.total_checks}</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Citations (linked)</div>
                <div className="text-3xl font-semibold">{current.citation_count} / {current.total_checks}</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prompt</TableHead>
                    <TableHead className="text-center">ChatGPT</TableHead>
                    <TableHead className="text-center">Gemini</TableHead>
                    <TableHead>Competitors shown instead</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byPrompt.map((row) => (
                    <TableRow key={row.prompt}>
                      <TableCell className="max-w-xs">{row.prompt}</TableCell>
                      <TableCell className="text-center">
                        {row.openai ? (row.openai.hasMention ? <Check className="inline h-5 w-5 text-green-600" /> : <X className="inline h-5 w-5 text-red-600" />) : "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.gemini ? (row.gemini.hasMention ? <Check className="inline h-5 w-5 text-green-600" /> : <X className="inline h-5 w-5 text-red-600" />) : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {row.competitors.length === 0
                            ? <span className="text-xs text-muted-foreground">—</span>
                            : row.competitors.map((c) => <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Past runs</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No past runs yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Mentions</TableHead>
                  <TableHead>Prompts</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="text-sm">{new Date(h.created_at).toLocaleString()}</TableCell>
                    <TableCell>{h.domain}</TableCell>
                    <TableCell><Badge>{h.overall_score}/100</Badge></TableCell>
                    <TableCell>{h.mention_count}/{h.total_checks}</TableCell>
                    <TableCell>{Array.isArray(h.prompts) ? h.prompts.length : 0}</TableCell>
                    <TableCell><Button size="sm" variant="outline" onClick={() => openRun(h.id)}>Open</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
