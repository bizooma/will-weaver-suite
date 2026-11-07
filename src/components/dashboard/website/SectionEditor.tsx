/**
 * SectionEditor — Lists and edits the sections of ONE page.
 *
 * Responsibilities:
 *  - load firm_site_sections for the selected page, in display_order
 *  - add (any of the eight types), delete, reorder (up/down), toggle is_visible
 *  - hold an unsaved "draft" of each section's content and save it on demand
 *
 * Structural changes (add / delete / reorder / visibility) write immediately.
 * Content edits are kept as local drafts until the firm clicks "Save section",
 * so typing doesn't fire a database write per keystroke. The parent is told how
 * many sections have unsaved drafts (onDirtyCountChange) so it can warn before
 * switching pages or publishing.
 *
 * Queries scope by page_id only — RLS already restricts rows to the site owner.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SectionFields } from "./SectionFields";
import { defaultContent, normalizeContent } from "./sectionContent";
import { moveItem, orderUpdates } from "./siteRules";
import { SECTION_TYPES, isSectionType, sectionLabel, type FirmSitePage, type FirmSiteSection, type SectionType } from "./types";

interface SectionEditorProps {
  page: FirmSitePage;
  onDirtyCountChange: (count: number) => void;
}

/** Short one-line summary shown on a collapsed section header. */
function sectionSummary(section: FirmSiteSection): string {
  const c = (section.content ?? {}) as Record<string, unknown>;
  const first = [c.headline, c.heading, c.name].find((v) => typeof v === "string" && v.trim());
  return (first as string) || "No heading yet";
}

export function SectionEditor({ page, onDirtyCountChange }: SectionEditorProps) {
  const [sections, setSections] = useState<FirmSiteSection[]>([]);
  const [loading, setLoading] = useState(true);
  /** Unsaved content drafts keyed by section id. Present = dirty. */
  const [drafts, setDrafts] = useState<Record<string, unknown>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [newType, setNewType] = useState<SectionType>("about");
  const [busy, setBusy] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<FirmSiteSection | null>(null);

  /* ------------------------------ loading ------------------------------- */

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("firm_site_sections")
      .select("*")
      .eq("page_id", page.id)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) toast.error(`Couldn't load sections: ${error.message}`);
    setSections(data ?? []);
    setDrafts({});
    setLoading(false);
  }, [page.id]);

  useEffect(() => { load(); }, [load]);

  // Report unsaved draft count to the parent whenever it changes.
  const dirtyCount = Object.keys(drafts).length;
  useEffect(() => { onDirtyCountChange(dirtyCount); }, [dirtyCount, onDirtyCountChange]);
  // Clear the parent's count when this editor unmounts (e.g. page deleted).
  useEffect(() => () => onDirtyCountChange(0), [onDirtyCountChange]);

  /* ------------------------------ add ----------------------------------- */

  const addSection = async () => {
    setBusy(true);
    const { data, error } = await supabase
      .from("firm_site_sections")
      .insert({
        page_id: page.id,
        section_type: newType,
        content: defaultContent(newType) as unknown as Json,
        display_order: sections.length,
      })
      .select()
      .single();
    setBusy(false);
    if (error || !data) {
      toast.error(`Couldn't add section: ${error?.message ?? "no row returned"}`);
      return;
    }
    setSections((prev) => [...prev, data]);
    setExpanded((prev) => ({ ...prev, [data.id]: true })); // open the new section for editing
    toast.success(`${sectionLabel(newType)} section added`);
  };

  /* ------------------------------ reorder ------------------------------- */

  const move = async (index: number, direction: -1 | 1) => {
    const next = moveItem(sections, index, direction);
    if (next === sections) return;
    const updates = orderUpdates(next);
    const previous = sections;
    // Optimistic: show the new order immediately, roll back on failure.
    setSections(next.map((s, i) => ({ ...s, display_order: i })));
    setBusy(true);
    const results = await Promise.all(
      updates.map((u) => supabase.from("firm_site_sections").update({ display_order: u.display_order }).eq("id", u.id)),
    );
    setBusy(false);
    const failed = results.find((r) => r.error);
    if (failed?.error) {
      toast.error(`Couldn't reorder sections: ${failed.error.message}`);
      setSections(previous);
      load();
    }
  };

  /* ------------------------------ visibility ---------------------------- */

  const toggleVisible = async (section: FirmSiteSection, is_visible: boolean) => {
    setSections((prev) => prev.map((s) => (s.id === section.id ? { ...s, is_visible } : s)));
    const { error } = await supabase.from("firm_site_sections").update({ is_visible }).eq("id", section.id);
    if (error) {
      toast.error(`Couldn't update visibility: ${error.message}`);
      setSections((prev) => prev.map((s) => (s.id === section.id ? { ...s, is_visible: !is_visible } : s)));
    }
  };

  /* ------------------------------ delete -------------------------------- */

  const confirmDelete = async () => {
    const section = pendingDelete;
    if (!section) return;
    setPendingDelete(null);
    setBusy(true);
    const { error } = await supabase.from("firm_site_sections").delete().eq("id", section.id);
    setBusy(false);
    if (error) {
      toast.error(`Couldn't delete section: ${error.message}`);
      return;
    }
    const remaining = sections.filter((s) => s.id !== section.id);
    setSections(remaining);
    setDrafts(({ [section.id]: _removed, ...rest }) => rest);
    // Close the gap left in display_order so later reorders stay clean.
    const updates = orderUpdates(remaining);
    await Promise.all(updates.map((u) => supabase.from("firm_site_sections").update({ display_order: u.display_order }).eq("id", u.id)));
    setSections(remaining.map((s, i) => ({ ...s, display_order: i })));
    toast.success("Section deleted");
  };

  /* ------------------------------ content save -------------------------- */

  const saveContent = async (section: FirmSiteSection) => {
    if (!isSectionType(section.section_type) || !(section.id in drafts)) return;
    // Normalise once more on the way out so only contract keys are ever written.
    const content = normalizeContent(section.section_type, drafts[section.id]);
    setSavingId(section.id);
    const { data, error } = await supabase
      .from("firm_site_sections")
      .update({ content: content as unknown as Json })
      .eq("id", section.id)
      .select()
      .single();
    setSavingId(null);
    if (error || !data) {
      toast.error(`Couldn't save section: ${error?.message ?? "no row returned"}`);
      return;
    }
    setSections((prev) => prev.map((s) => (s.id === section.id ? data : s)));
    setDrafts(({ [section.id]: _saved, ...rest }) => rest);
    toast.success(`${sectionLabel(section.section_type)} section saved`);
  };

  const discardDraft = (id: string) => setDrafts(({ [id]: _discarded, ...rest }) => rest);

  /* ------------------------------ render -------------------------------- */

  const typeOptions = useMemo(() => SECTION_TYPES, []);

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg">Sections on “{page.title}”</CardTitle>
        <CardDescription>
          Sections appear on the page top to bottom in this order. Hidden sections stay saved but don't show on your site.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading sections…
          </div>
        ) : sections.length === 0 ? (
          <p className="text-sm text-muted-foreground">This page has no sections yet. Add one below.</p>
        ) : (
          <div className="space-y-3">
            {sections.map((section, index) => {
              const type = section.section_type;
              const known = isSectionType(type);
              const isOpen = !!expanded[section.id];
              const isDirty = section.id in drafts;
              const content = known
                ? normalizeContent(type, isDirty ? drafts[section.id] : section.content)
                : null;

              return (
                <div key={section.id} className="rounded-lg border border-border bg-card">
                  {/* Header row: expand toggle, label, controls */}
                  <div className="flex flex-wrap items-center gap-2 p-3">
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      onClick={() => setExpanded((p) => ({ ...p, [section.id]: !isOpen }))}
                      aria-expanded={isOpen}
                    >
                      {isOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{sectionLabel(type)}</span>
                          {!section.is_visible && <Badge variant="outline">Hidden</Badge>}
                          {isDirty && <Badge variant="secondary">Unsaved</Badge>}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">{sectionSummary(section)}</span>
                      </span>
                    </button>

                    <div className="flex items-center gap-1">
                      <div className="mr-1 flex items-center gap-1.5">
                        <Switch
                          checked={section.is_visible}
                          onCheckedChange={(v) => toggleVisible(section, v)}
                          aria-label={section.is_visible ? "Hide section" : "Show section"}
                        />
                        <span className="hidden text-xs text-muted-foreground sm:inline">Visible</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={busy || index === 0} onClick={() => move(index, -1)} aria-label="Move section up">
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={busy || index === sections.length - 1} onClick={() => move(index, 1)} aria-label="Move section down">
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" disabled={busy} onClick={() => setPendingDelete(section)} aria-label="Delete section">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Body: the type-specific form + save controls */}
                  {isOpen && (
                    <div className="space-y-4 border-t border-border p-3 sm:p-4">
                      {known && content ? (
                        <SectionFields
                          type={type}
                          content={content}
                          onChange={(next) => setDrafts((p) => ({ ...p, [section.id]: next }))}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">Unknown section type “{type}” can't be edited here.</p>
                      )}
                      {known && (
                        <div className="flex flex-wrap justify-end gap-2">
                          {isDirty && (
                            <Button variant="ghost" size="sm" onClick={() => discardDraft(section.id)}>Discard changes</Button>
                          )}
                          <Button size="sm" disabled={!isDirty || savingId === section.id} onClick={() => saveContent(section)}>
                            {savingId === section.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save section
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add-section picker */}
        <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-3 sm:flex-row sm:items-center">
          <Select value={newType} onValueChange={(v) => setNewType(v as SectionType)}>
            <SelectTrigger className="sm:w-64" aria-label="Section type to add">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((t) => (
                <SelectItem key={t.type} value={t.type}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={addSection} disabled={busy || loading}>
            <Plus className="mr-2 h-4 w-4" /> Add section
          </Button>
          <p className="text-xs text-muted-foreground sm:ml-2">
            {SECTION_TYPES.find((t) => t.type === newType)?.description}
          </p>
        </div>
      </CardContent>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {pendingDelete ? sectionLabel(pendingDelete.section_type) : ""} section?</AlertDialogTitle>
            <AlertDialogDescription>
              Its content is permanently removed from this page. To keep it but take it off your site, turn off “Visible” instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete section
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
