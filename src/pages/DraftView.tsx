
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getDraftBySlug, WillDraft } from "@/hooks/useWillDrafts";
import { Input } from "@/components/ui/input";
import { exportWillDocx } from "@/utils/docxExport";

const DraftView = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<WillDraft | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getDraftBySlug(slug)
      .then((d) => {
        setDraft(d);
        if (!d) {
          toast({
            title: "Draft not found",
            description: "This link may be invalid or the draft was removed.",
            variant: "destructive",
          });
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const shareUrl = useMemo(() => (slug ? `${window.location.origin}/drafts/${slug}` : ""), [slug]);

  const onCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link copied", description: "Shareable link has been copied to your clipboard." });
  };

  const onExportDocx = async () => {
    if (!draft) return;
    const pretty = JSON.stringify(draft.data, null, 2);
    await exportWillDocx({
      title: "Will Draft",
      content: pretty,
      filename: `will-draft-${draft.slug}.docx`,
    });
    toast({ title: "DOCX generated", description: "Your document was downloaded." });
  };

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Will Draft</CardTitle>
          <CardDescription>Unlisted share link. Anyone with the link can view.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Input readOnly value={shareUrl} />
            <Button variant="outline" onClick={onCopy}>Copy</Button>
          </div>

          <div className="flex gap-3">
            <Button onClick={onExportDocx} disabled={!draft || loading}>
              Export DOCX
            </Button>
          </div>

          <div className="rounded border p-4 overflow-auto max-h-[60vh]">
            {loading ? (
              <div>Loading...</div>
            ) : draft ? (
              <pre className="text-sm">{JSON.stringify(draft.data, null, 2)}</pre>
            ) : (
              <div>No draft found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DraftView;
