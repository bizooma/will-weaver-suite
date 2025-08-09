
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createDraft } from "@/hooks/useWillDrafts";
import { Link } from "react-router-dom";

const DraftSave = () => {
  const { toast } = useToast();
  const [jsonText, setJsonText] = useState<string>("{\n  \"test\": \"example\"\n}");
  const [tone, setTone] = useState<string>("");
  const [step, setStep] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>("");

  const onSave = async () => {
    let parsed: unknown;
    try {
      parsed = jsonText ? JSON.parse(jsonText) : {};
    } catch (e) {
      toast({
        title: "Invalid JSON",
        description: "Please provide valid JSON content.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const slug = await createDraft({
        data: parsed,
        tone: tone || null,
        step: step ? Number(step) : null,
      });

      const url = `${window.location.origin}/drafts/${slug}`;
      setShareUrl(url);
      toast({
        title: "Draft saved",
        description: "Your draft has been saved. Share the link below.",
      });
      console.log("Draft saved with slug:", slug);
    } finally {
      setSaving(false);
    }
  };

  const onCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link copied", description: "Shareable link has been copied to your clipboard." });
  };

  return (
    <div className="container mx-auto max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Save & Share Will Draft</CardTitle>
          <CardDescription>Paste your will JSON, then save to get a shareable link.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="json">Will JSON</Label>
            <Textarea
              id="json"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="{ ... }"
              className="min-h-[220px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tone">Tone (optional)</Label>
              <Input id="tone" value={tone} onChange={(e) => setTone(e.target.value)} placeholder="formal, friendly, ..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="step">Step (optional)</Label>
              <Input id="step" type="number" inputMode="numeric" value={step} onChange={(e) => setStep(e.target.value)} placeholder="e.g. 3" />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={onSave} disabled={saving}>
              {saving ? "Saving..." : "Save Draft"}
            </Button>
            <Button variant="secondary" asChild>
              <Link to="/drafts/example">View example</Link>
            </Button>
          </div>

          {shareUrl && (
            <div className="space-y-2">
              <Label>Share link</Label>
              <div className="flex gap-2">
                <Input readOnly value={shareUrl} />
                <Button variant="outline" onClick={onCopy}>Copy</Button>
                <Button asChild>
                  <a href={shareUrl}>Open</a>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DraftSave;
