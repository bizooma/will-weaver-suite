
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getDraftBySlug, WillDraft } from "@/hooks/useWillDrafts";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { exportWillDocx } from "@/utils/docxExport";
import { generateWillText, WillTemplateData } from "@/utils/willTemplate";
import SEOHead from "@/components/SEOHead";

const DraftView = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<WillDraft | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const canonical = typeof window !== 'undefined' ? `${window.location.origin}/drafts/${slug ?? ''}` : `/drafts/${slug ?? ''}`;

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getDraftBySlug(slug)
      .then((d) => {
        if (!d) {
          toast({
            title: "Draft not found",
            description: "This link may be invalid or the draft was removed.",
            variant: "destructive",
          });
          setDraft(null);
        } else if (user && d.user_id && d.user_id !== user.id) {
          // User is logged in but trying to access someone else's draft
          setAccessDenied(true);
          toast({
            title: "Access denied",
            description: "You don't have permission to view this draft.",
            variant: "destructive",
          });
        } else {
          setDraft(d);
        }
      })
      .catch((error) => {
        toast({
          title: "Error loading draft",
          description: "Please try again later.",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, [slug, user]);

  const shareUrl = useMemo(() => (slug ? `${window.location.origin}/drafts/${slug}` : ""), [slug]);

  const onCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link copied", description: "Shareable link has been copied to your clipboard." });
  };

  // Render the same formatted will the wizard produces (not raw JSON).
  const willText = useMemo(
    () => (draft?.data ? generateWillText(draft.data as WillTemplateData) : ""),
    [draft],
  );

  const onExportDocx = async () => {
    if (!draft) return;
    await exportWillDocx({
      title: "Last Will and Testament (Draft)",
      content: willText,
      filename: `will-draft-${draft.slug}.docx`,
    });
    toast({ title: "DOCX generated", description: "Your document was downloaded." });
  };

  return (
    <div className="container mx-auto max-w-4xl py-10">
      {/* SEO meta tags for Draft View page */}
      <SEOHead
        title="View Will Draft | Amicus Edge"
        description="View and share this will draft. Open in editor or export as DOCX document."
        path={`/drafts/${slug || ''}`}
      />
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
            <Link to={`/will-creator?slug=${slug}`}>
              <Button variant="secondary" disabled={!slug}>Open in Editor</Button>
            </Link>
          </div>

          <div className="rounded border p-4 overflow-auto max-h-[60vh]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div>Loading draft...</div>
              </div>
            ) : accessDenied ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <div>Access denied. You don't have permission to view this draft.</div>
              </div>
            ) : draft ? (
              <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed">{willText}</pre>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <div>No draft found.</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DraftView;
