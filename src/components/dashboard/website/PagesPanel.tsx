/**
 * PagesPanel — The firm's page list: create, rename/edit, delete, reorder,
 * publish toggle, choose the home page, and select a page to edit its sections.
 *
 * Page rows live in the parent (WebsiteManager) so the publish panel and the
 * section editor see the same list; this component receives them plus an
 * `onPagesChange` setter and performs the database writes.
 *
 * Home page rule: exactly one page per site may have is_home = true. The DB
 * enforces it with a partial unique index (firm_site_pages_one_home), so a
 * change of home page clears the old home FIRST, then sets the new one — in
 * the same click — and restores the old home if the second write fails.
 */
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowDown, ArrowUp, Home, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { isCheckViolation, isUniqueViolation, moveItem, orderUpdates, suggestSlug, validateSlug } from "./siteRules";
import type { FirmSite, FirmSitePage } from "./types";

interface PagesPanelProps {
  site: FirmSite;
  pages: FirmSitePage[];
  onPagesChange: (pages: FirmSitePage[]) => void;
  selectedPageId: string | null;
  onSelectPage: (id: string) => void;
}

/** Form state for the create / edit dialog. `id` null = creating. */
interface PageForm {
  id: string | null;
  title: string;
  slug: string;
  meta_description: string;
  /** Once the firm edits the slug by hand we stop auto-deriving it from the title. */
  slugTouched: boolean;
}

const EMPTY_FORM: PageForm = { id: null, title: "", slug: "", meta_description: "", slugTouched: false };

export function PagesPanel({ site, pages, onPagesChange, selectedPageId, onSelectPage }: PagesPanelProps) {
  const [form, setForm] = useState<PageForm | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<FirmSitePage | null>(null);

  /* ------------------------------ create / edit ------------------------- */

  const openCreate = () => { setForm({ ...EMPTY_FORM }); setFormError(null); };
  const openEdit = (p: FirmSitePage) => {
    setForm({ id: p.id, title: p.title, slug: p.slug, meta_description: p.meta_description ?? "", slugTouched: true });
    setFormError(null);
  };

  const submitForm = async () => {
    if (!form) return;
    const title = form.title.trim();
    const slug = form.slug.trim();
    if (!title) { setFormError("Enter a page title."); return; }
    const slugError = validateSlug(slug);
    if (slugError) { setFormError(slugError); return; }

    setSaving(true);
    setFormError(null);
    const fields = { title, slug, meta_description: form.meta_description.trim() || null };

    if (form.id) {
      // Edit / rename existing page
      const { data, error } = await supabase.from("firm_site_pages").update(fields).eq("id", form.id).select().single();
      setSaving(false);
      if (error || !data) { setFormError(friendlyPageError(error)); return; }
      onPagesChange(pages.map((p) => (p.id === data.id ? data : p)));
      toast.success("Page updated");
    } else {
      // Create: the very first page becomes the home page automatically.
      const { data, error } = await supabase
        .from("firm_site_pages")
        .insert({ ...fields, site_id: site.id, display_order: pages.length, is_home: pages.length === 0 })
        .select()
        .single();
      setSaving(false);
      if (error || !data) { setFormError(friendlyPageError(error)); return; }
      onPagesChange([...pages, data]);
      onSelectPage(data.id);
      toast.success("Page created");
    }
    setForm(null);
  };

  /* ------------------------------ reorder ------------------------------- */

  const move = async (index: number, direction: -1 | 1) => {
    const next = moveItem(pages, index, direction);
    if (next === pages) return;
    const previous = pages;
    const updates = orderUpdates(next);
    onPagesChange(next.map((p, i) => ({ ...p, display_order: i })));
    setBusy(true);
    const results = await Promise.all(
      updates.map((u) => supabase.from("firm_site_pages").update({ display_order: u.display_order }).eq("id", u.id)),
    );
    setBusy(false);
    const failed = results.find((r) => r.error);
    if (failed?.error) {
      toast.error(`Couldn't reorder pages: ${failed.error.message}`);
      onPagesChange(previous);
    }
  };

  /* ------------------------------ publish toggle ------------------------ */

  const togglePublished = async (page: FirmSitePage, is_published: boolean) => {
    onPagesChange(pages.map((p) => (p.id === page.id ? { ...p, is_published } : p)));
    const { error } = await supabase.from("firm_site_pages").update({ is_published }).eq("id", page.id);
    if (error) {
      toast.error(`Couldn't update page: ${error.message}`);
      onPagesChange(pages.map((p) => (p.id === page.id ? { ...p, is_published: !is_published } : p)));
    }
  };

  /* ------------------------------ home page ----------------------------- */

  const makeHome = async (page: FirmSitePage) => {
    if (page.is_home) return;
    const currentHome = pages.find((p) => p.is_home);
    setBusy(true);

    // Step 1: clear the existing home page (the unique index allows only one).
    if (currentHome) {
      const { error } = await supabase.from("firm_site_pages").update({ is_home: false }).eq("id", currentHome.id);
      if (error) {
        setBusy(false);
        toast.error(`Couldn't change home page: ${error.message}`);
        return;
      }
    }

    // Step 2: set the new home page; roll step 1 back if this fails.
    const { error } = await supabase.from("firm_site_pages").update({ is_home: true }).eq("id", page.id);
    if (error) {
      if (currentHome) await supabase.from("firm_site_pages").update({ is_home: true }).eq("id", currentHome.id);
      setBusy(false);
      toast.error(`Couldn't change home page: ${error.message}`);
      return;
    }

    setBusy(false);
    onPagesChange(pages.map((p) => ({ ...p, is_home: p.id === page.id })));
    toast.success(`“${page.title}” is now your home page`);
  };

  /* ------------------------------ delete -------------------------------- */

  const confirmDelete = async () => {
    const page = pendingDelete;
    if (!page) return;
    setPendingDelete(null);
    setBusy(true);
    // Sections are removed by ON DELETE CASCADE on firm_site_sections.page_id.
    const { error } = await supabase.from("firm_site_pages").delete().eq("id", page.id);
    if (error) {
      setBusy(false);
      toast.error(`Couldn't delete page: ${error.message}`);
      return;
    }
    const remaining = pages.filter((p) => p.id !== page.id);
    await Promise.all(
      orderUpdates(remaining).map((u) => supabase.from("firm_site_pages").update({ display_order: u.display_order }).eq("id", u.id)),
    );
    setBusy(false);
    onPagesChange(remaining.map((p, i) => ({ ...p, display_order: i })));
    if (selectedPageId === page.id && remaining[0]) onSelectPage(remaining[0].id);
    toast.success("Page deleted");
  };

  /* ------------------------------ render -------------------------------- */

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg">Pages</CardTitle>
          <CardDescription>Select a page to edit its sections.</CardDescription>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1 h-4 w-4" /> New page
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {pages.length === 0 && (
          <p className="text-sm text-muted-foreground">No pages yet. Create your home page to get started.</p>
        )}

        {pages.map((page, index) => {
          const selected = page.id === selectedPageId;
          return (
            <div
              key={page.id}
              className={`rounded-lg border p-3 transition-colors ${selected ? "border-primary bg-primary/5" : "border-border"}`}
            >
              {/* Title row — the whole title is the select target */}
              <button type="button" className="w-full text-left" onClick={() => onSelectPage(page.id)} aria-current={selected}>
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{page.title}</span>
                  {page.is_home && (
                    <Badge variant="secondary" className="gap-1"><Home className="h-3 w-3" /> Home</Badge>
                  )}
                  <Badge variant={page.is_published ? "default" : "outline"}>
                    {page.is_published ? "Published" : "Draft"}
                  </Badge>
                </span>
                <span className="mt-0.5 block truncate font-mono text-xs text-muted-foreground">/{page.slug}</span>
              </button>

              {/* Controls row */}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch
                    checked={page.is_published}
                    onCheckedChange={(v) => togglePublished(page, v)}
                    aria-label={`Publish ${page.title}`}
                  />
                  Published
                </label>
                <div className="flex items-center gap-1">
                  {!page.is_home && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={busy} onClick={() => makeHome(page)} aria-label={`Make ${page.title} the home page`} title="Make home page">
                      <Home className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={busy || index === 0} onClick={() => move(index, -1)} aria-label={`Move ${page.title} up`}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={busy || index === pages.length - 1} onClick={() => move(index, 1)} aria-label={`Move ${page.title} down`}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(page)} aria-label={`Rename ${page.title}`} title="Rename / edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                    disabled={busy || page.is_home}
                    onClick={() => setPendingDelete(page)}
                    aria-label={`Delete ${page.title}`}
                    title={page.is_home ? "Choose another home page before deleting this one" : "Delete page"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>

      {/* Create / edit dialog */}
      <Dialog open={!!form} onOpenChange={(open) => !open && setForm(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form?.id ? "Edit page" : "New page"}</DialogTitle>
            <DialogDescription>
              A clear title and description help search engines and AI assistants understand the page.
            </DialogDescription>
          </DialogHeader>
          {form && (
            <form
              className="space-y-4"
              onSubmit={(e) => { e.preventDefault(); submitForm(); }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="page-title">Page title</Label>
                <Input
                  id="page-title"
                  value={form.title}
                  placeholder="Car Accident Lawyer"
                  onChange={(e) => {
                    const title = e.target.value;
                    setForm({ ...form, title, slug: form.slugTouched ? form.slug : suggestSlug(title) });
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="page-slug">Page address</Label>
                <div className="flex items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
                  <span className="pl-3 font-mono text-sm text-muted-foreground">/</span>
                  <Input
                    id="page-slug"
                    value={form.slug}
                    placeholder="car-accident-lawyer"
                    className="border-0 font-mono focus-visible:ring-0 focus-visible:ring-offset-0"
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase(), slugTouched: true })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Lowercase letters, numbers, hyphens and forward slashes.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="page-meta">Search description (optional)</Label>
                <Textarea
                  id="page-meta"
                  rows={3}
                  value={form.meta_description}
                  placeholder="One or two sentences on what this page covers and where your firm practices."
                  onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">{form.meta_description.length}/160 characters recommended</p>
              </div>
              {formError && <p className="text-sm text-destructive" role="alert">{formError}</p>}
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setForm(null)}>Cancel</Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {form.id ? "Save page" : "Create page"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{pendingDelete?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              The page and all of its sections are permanently removed. To keep it but take it off your site, switch it to Draft instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

/** Turns a Postgres/PostgREST error from a page write into a message a firm can act on. */
function friendlyPageError(error: { code?: string; message?: string } | null): string {
  if (isUniqueViolation(error)) return "Another page already uses that address. Choose a different one.";
  if (isCheckViolation(error)) return "That page address isn't valid. Use lowercase letters, numbers, hyphens and forward slashes.";
  return `Couldn't save the page: ${error?.message ?? "no row returned"}`;
}
