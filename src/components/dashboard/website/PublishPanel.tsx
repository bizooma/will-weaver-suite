/**
 * PublishPanel — Live URL, publish status, pre-publish warnings, Publish /
 * Unpublish actions and the recent publish history.
 *
 * Eligibility comes ONLY from canPublish(site). Warnings below (unsaved edits,
 * sample testimonials, draft home page) inform the firm but never block —
 * blocking rules belong in canPublish().
 */
import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, ExternalLink, Globe, Loader2, Rocket, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { canPublish } from "./canPublish";
import { fetchSiteTree, publishSite, unpublishSite } from "./publishSite";
import { countSampleTestimonials } from "./sectionContent";
import { liveSiteUrl } from "./siteRules";
import type { FirmSite, FirmSitePage, FirmSitePublish } from "./types";

interface PublishPanelProps {
  site: FirmSite;
  onSiteChange: (site: FirmSite) => void;
  pages: FirmSitePage[];
  userId: string;
  /** Number of sections with unsaved edits in the editor. */
  dirtyCount: number;
  /** True while this tab is visible — used to refresh warnings and history. */
  active: boolean;
}

export function PublishPanel({ site, onSiteChange, pages, userId, dirtyCount, active }: PublishPanelProps) {
  const [note, setNote] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);
  const [history, setHistory] = useState<FirmSitePublish[]>([]);
  const [sampleCount, setSampleCount] = useState(0);

  const url = liveSiteUrl(site.subdomain);
  const eligible = canPublish(site);
  const home = pages.find((p) => p.is_home);

  /** Reloads publish history and the sample-testimonial count from saved data. */
  const refresh = useCallback(async () => {
    const [{ data: rows }, tree] = await Promise.all([
      supabase
        .from("firm_site_publishes")
        .select("*")
        .eq("site_id", site.id)
        .order("created_at", { ascending: false })
        .limit(5),
      fetchSiteTree(site).catch(() => null),
    ]);
    setHistory(rows ?? []);
    if (tree) {
      const visibleOnPublishedPages = tree.pages.filter((p) => p.is_published).flatMap((p) => p.sections);
      setSampleCount(countSampleTestimonials(visibleOnPublishedPages));
    }
  }, [site]);

  useEffect(() => { if (active) refresh(); }, [active, refresh]);

  const handlePublish = async () => {
    if (!eligible) return;
    setPublishing(true);
    try {
      const result = await publishSite(site, userId, note);
      onSiteChange(result.site);
      setNote("");
      setHistory((prev) => [result.publish, ...prev].slice(0, 5));
      toast.success("Your website is live");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Publishing failed");
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    setConfirmUnpublish(false);
    setUnpublishing(true);
    try {
      onSiteChange(await unpublishSite(site));
      toast.success("Your website is offline");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unpublishing failed");
    } finally {
      setUnpublishing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status + URL */}
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
            <Globe className="h-5 w-5" /> Site status
            <Badge variant={site.is_published ? "default" : "outline"}>{site.is_published ? "Live" : "Not published"}</Badge>
          </CardTitle>
          <CardDescription>
            {site.published_at
              ? `Last published ${format(new Date(site.published_at), "MMM d, yyyy 'at' h:mm a")}`
              : "This site has never been published."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label>Live address</Label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="min-w-0 flex-1 break-all rounded-md border border-border bg-muted px-3 py-2 text-sm">{url}</code>
            {site.is_published && (
              <Button variant="outline" size="sm" asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> Open site
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pre-publish checks + actions */}
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg">Publish</CardTitle>
          <CardDescription>Publishing saves a snapshot of every saved page and section, then puts your site live.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {dirtyCount > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {dirtyCount} section{dirtyCount === 1 ? " has" : "s have"} unsaved changes. Only saved changes are published.
              </AlertDescription>
            </Alert>
          )}
          {!home && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>You don't have a home page yet. Create one on the Pages tab.</AlertDescription>
            </Alert>
          )}
          {home && !home.is_published && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>Your home page “{home.title}” is still a draft. Turn on “Published” for it on the Pages tab.</AlertDescription>
            </Alert>
          )}
          {sampleCount > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {sampleCount} testimonial{sampleCount === 1 ? " is" : "s are"} still marked “Sample text — replace before publishing”. Your live site will visibly label {sampleCount === 1 ? "it" : "them"} as samples.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="publish-note">Note (optional)</Label>
            <Input id="publish-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Added FAQ page" maxLength={200} />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={handlePublish} disabled={!eligible || publishing}>
              {publishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
              {site.is_published ? "Publish changes" : "Publish site"}
            </Button>
            {site.is_published && (
              <Button variant="outline" onClick={() => setConfirmUnpublish(true)} disabled={unpublishing}>
                {unpublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <EyeOff className="mr-2 h-4 w-4" />}
                Unpublish
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent publishes</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No publishes yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {history.map((h) => (
                <li key={h.id} className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm">{format(new Date(h.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                  <span className="text-sm text-muted-foreground">{h.note || "—"}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmUnpublish} onOpenChange={setConfirmUnpublish}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Take your website offline?</AlertDialogTitle>
            <AlertDialogDescription>
              Visitors to {url} will no longer see your site. Your pages, sections and publish history are kept, and you can publish again at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnpublish}>Unpublish</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
