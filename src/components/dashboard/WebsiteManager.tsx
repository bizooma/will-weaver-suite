/**
 * WebsiteManager — Dashboard tool a law firm uses to build and publish its own
 * marketing website (served at https://{subdomain}.sites.amicusedge.com).
 *
 * Route: /dashboard/website (free for every account — NOT wrapped in ProtectedContent).
 *
 * Structure:
 *   no site yet  → <SiteSetupForm>  (first-run: firm name + subdomain)
 *   site exists  → tabs:
 *      Pages & sections → <PagesPanel> + <SectionEditor> for the selected page
 *      Brand            → <BrandPanel>
 *      Publish          → <PublishPanel>
 *
 * Data: tables firm_sites / firm_site_pages / firm_site_sections /
 * firm_site_publishes (schema owned by migration 20261107000000_firm_site_cms.sql;
 * this UI never changes schema). RLS restricts each row to its owner, so child
 * queries scope only by site_id / page_id.
 *
 * One deliberate exception: the initial firm_sites lookup filters on
 * user_id = current user. Admins have an "Admins can manage all sites" policy,
 * so without that filter an admin would load (and edit) whichever client's
 * site happened to come back first instead of their own.
 *
 * Tabs are force-mounted (hidden when inactive) so unsaved section drafts
 * survive switching tabs.
 */
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SiteSetupForm } from "./website/SiteSetupForm";
import { PagesPanel } from "./website/PagesPanel";
import { SectionEditor } from "./website/SectionEditor";
import { BrandPanel } from "./website/BrandPanel";
import { PublishPanel } from "./website/PublishPanel";
import { liveSiteUrl } from "./website/siteRules";
import type { FirmSite, FirmSitePage } from "./website/types";

type TabKey = "pages" | "brand" | "publish";

export function WebsiteManager() {
  const { user, loading: authLoading } = useAuth();
  const [site, setSite] = useState<FirmSite | null>(null);
  const [pages, setPages] = useState<FirmSitePage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("pages");
  const [dirtyCount, setDirtyCount] = useState(0);
  /** Page the firm tried to switch to while sections had unsaved edits. */
  const [pendingPageId, setPendingPageId] = useState<string | null>(null);

  /* ------------------------------ load ---------------------------------- */

  const load = useCallback(async (userId: string) => {
    setLoading(true);
    setLoadError(null);

    // See header comment: filter on user_id so admins load their OWN site.
    const { data: siteRow, error: siteError } = await supabase
      .from("firm_sites")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (siteError) {
      setLoadError(siteError.message);
      setLoading(false);
      return;
    }
    if (!siteRow) {
      setSite(null);
      setPages([]);
      setLoading(false);
      return;
    }

    const { data: pageRows, error: pagesError } = await supabase
      .from("firm_site_pages")
      .select("*")
      .eq("site_id", siteRow.id)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (pagesError) toast.error(`Couldn't load pages: ${pagesError.message}`);

    const list = pageRows ?? [];
    setSite(siteRow);
    setPages(list);
    setSelectedPageId((list.find((p) => p.is_home) ?? list[0])?.id ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user?.id) load(user.id);
    else if (!authLoading) setLoading(false);
  }, [user?.id, authLoading, load]);

  /* ------------------------------ page selection ------------------------ */

  /** Switches page, but asks first if the current page has unsaved section edits. */
  const requestSelectPage = (id: string) => {
    if (id === selectedPageId) return;
    if (dirtyCount > 0) setPendingPageId(id);
    else setSelectedPageId(id);
  };

  // If the selected page disappears (deleted), fall back to the first page.
  useEffect(() => {
    if (selectedPageId && !pages.some((p) => p.id === selectedPageId)) {
      setSelectedPageId(pages[0]?.id ?? null);
    } else if (!selectedPageId && pages[0]) {
      setSelectedPageId(pages[0].id);
    }
  }, [pages, selectedPageId]);

  const selectedPage = pages.find((p) => p.id === selectedPageId) ?? null;

  /* ------------------------------ render -------------------------------- */

  const header = (
    <div className="space-y-1">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Website</h2>
      <p className="text-muted-foreground">
        Build, brand and publish your law firm's website — no developer needed.
      </p>
    </div>
  );

  if (loading || authLoading) {
    return (
      <div className="flex-1 space-y-4 overflow-y-auto p-4 pt-6 sm:p-8">
        {header}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your website…
        </div>
      </div>
    );
  }

  if (!user) {
    // e.g. the public dashboard tour — the builder needs a real account.
    return (
      <div className="flex-1 space-y-4 overflow-y-auto p-4 pt-6 sm:p-8">
        {header}
        <Card>
          <CardContent className="flex flex-col items-start gap-3 p-6">
            <p>Sign in to build and publish your firm's website.</p>
            <Button asChild><Link to="/auth">Sign in</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex-1 space-y-4 overflow-y-auto p-4 pt-6 sm:p-8">
        {header}
        <Card>
          <CardContent className="flex flex-col items-start gap-3 p-6">
            <p className="text-destructive">We couldn't load your website: {loadError}</p>
            <Button variant="outline" onClick={() => load(user.id)}>Try again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex-1 space-y-6 overflow-y-auto p-4 pt-6 sm:p-8">
        {header}
        <SiteSetupForm
          userId={user.id}
          onCreated={(newSite, newPages) => {
            setSite(newSite);
            setPages(newPages);
            setSelectedPageId(newPages[0]?.id ?? null);
          }}
        />
      </div>
    );
  }

  const url = liveSiteUrl(site.subdomain);

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4 pt-6 sm:p-8">
      {/* Header + always-visible live status */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        {header}
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
          <Badge variant={site.is_published ? "default" : "outline"}>{site.is_published ? "Live" : "Not published"}</Badge>
          {site.is_published ? (
            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-w-0 items-center gap-1 break-all text-primary underline-offset-4 hover:underline">
              {url} <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          ) : (
            <span className="break-all text-muted-foreground">{url}</span>
          )}
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList className="grid w-full grid-cols-3 sm:inline-grid sm:w-auto">
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="brand">Brand</TabsTrigger>
          <TabsTrigger value="publish">Publish</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" forceMount className="data-[state=inactive]:hidden">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,20rem)_1fr]">
            <PagesPanel
              site={site}
              pages={pages}
              onPagesChange={setPages}
              selectedPageId={selectedPageId}
              onSelectPage={requestSelectPage}
            />
            {selectedPage ? (
              <SectionEditor key={selectedPage.id} page={selectedPage} onDirtyCountChange={setDirtyCount} />
            ) : (
              <Card><CardContent className="p-6 text-sm text-muted-foreground">Create a page to start adding sections.</CardContent></Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="brand" forceMount className="data-[state=inactive]:hidden">
          <BrandPanel site={site} onSiteChange={setSite} />
        </TabsContent>

        <TabsContent value="publish" forceMount className="data-[state=inactive]:hidden">
          <PublishPanel
            site={site}
            onSiteChange={setSite}
            pages={pages}
            userId={user.id}
            dirtyCount={dirtyCount}
            active={tab === "publish"}
          />
        </TabsContent>
      </Tabs>

      {/* Unsaved-changes guard when switching pages */}
      <AlertDialog open={!!pendingPageId} onOpenChange={(open) => !open && setPendingPageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              {dirtyCount} section{dirtyCount === 1 ? " has" : "s have"} unsaved edits on this page. Switching pages will discard them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setSelectedPageId(pendingPageId);
                setPendingPageId(null);
              }}
            >
              Discard and switch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
