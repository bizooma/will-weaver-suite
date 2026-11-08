/**
 * LeadsPanel — The firm's inbox for enquiries captured by the contact form on
 * its published site.
 *
 * Where leads come from: the public site renderer (a separate Worker) inserts
 * rows into firm_site_leads using the service role. There is deliberately NO
 * client-side insert path and NO INSERT policy for firms — adding one would let
 * anyone forge leads into any firm's inbox. This panel only reads, marks read,
 * and deletes.
 *
 * Access: RLS on firm_site_leads scopes SELECT / UPDATE / DELETE to rows whose
 * site belongs to auth.uid(), so queries here filter only by site_id.
 *
 * Silent-failure rule: an UPDATE or DELETE that RLS blocks changes zero rows
 * and still returns no error (PostgREST answers 204 either way). Every write
 * therefore chains .select() and checks the returned row count; local state is
 * only changed for rows the database actually returned.
 *
 * Not in scope (needs server-side work): email/push notifications and realtime
 * updates. The firm uses the Refresh button to pick up new leads.
 */
import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCheck, ChevronDown, ChevronRight, Loader2, Mail, Phone, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { FirmSite, FirmSiteLead } from "./types";

interface LeadsPanelProps {
  site: FirmSite;
  /** Called with the number of unread leads whenever it changes (drives the tab badge). */
  onUnreadCountChange?: (n: number) => void;
}

/** Most recent leads shown; older ones are not loaded. */
const LEAD_LIMIT = 200;

/** True when a nullable text column actually has something worth showing. */
const hasText = (v: string | null | undefined): v is string => !!v && v.trim().length > 0;

/** created_at → readable date/time in the viewer's own locale and time zone. */
const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export function LeadsPanel({ site, onUnreadCountChange }: LeadsPanelProps) {
  const [leads, setLeads] = useState<FirmSiteLead[]>([]);
  /** First load (shows the full-panel spinner). */
  const [loading, setLoading] = useState(true);
  /** Re-load via the Refresh button (spinner on the button only). */
  const [refreshing, setRefreshing] = useState(false);
  /** Load failure message — shown in the panel, never swallowed (a silent failure looks like "no leads"). */
  const [loadError, setLoadError] = useState<string | null>(null);
  /** Lead ids with a write in flight, to disable their buttons. */
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [markingAll, setMarkingAll] = useState(false);
  /** Lead ids whose IP / user-agent "Details" are expanded. */
  const [openDetails, setOpenDetails] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<FirmSiteLead | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ------------------------------ load ---------------------------------- */

  const load = useCallback(async (mode: "initial" | "refresh") => {
    if (mode === "initial") setLoading(true);
    else setRefreshing(true);
    setLoadError(null);

    const { data, error } = await supabase
      .from("firm_site_leads")
      .select("*")
      .eq("site_id", site.id)
      .order("created_at", { ascending: false })
      .limit(LEAD_LIMIT);

    if (error) setLoadError(error.message);
    else setLeads(data ?? []);

    setLoading(false);
    setRefreshing(false);
  }, [site.id]);

  useEffect(() => { load("initial"); }, [load]);

  /* ------------------------------ unread count -------------------------- */

  const unreadCount = leads.filter((l) => !l.is_read).length;
  useEffect(() => { onUnreadCountChange?.(unreadCount); }, [unreadCount, onUnreadCountChange]);

  /* ------------------------------ helpers ------------------------------- */

  const setBusy = (id: string, on: boolean) =>
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id); else next.delete(id);
      return next;
    });

  const toggleDetails = (id: string) =>
    setOpenDetails((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  /* ------------------------------ mark read ----------------------------- */

  const markRead = async (lead: FirmSiteLead) => {
    setBusy(lead.id, true);
    // .select() is required — see the silent-failure rule in the header.
    const { data, error } = await supabase
      .from("firm_site_leads")
      .update({ is_read: true })
      .eq("id", lead.id)
      .select();
    setBusy(lead.id, false);

    if (error || !data || data.length === 0) {
      toast.error(`This lead could not be updated${error ? `: ${error.message}` : "."}`);
      return;
    }
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, is_read: true } : l)));
  };

  const markAllRead = async () => {
    const unreadIds = leads.filter((l) => !l.is_read).map((l) => l.id);
    if (unreadIds.length === 0) return;
    setMarkingAll(true);
    // Scope to the loaded unread ids so we never flip rows the firm hasn't seen.
    const { data, error } = await supabase
      .from("firm_site_leads")
      .update({ is_read: true })
      .eq("site_id", site.id)
      .in("id", unreadIds)
      .select();
    setMarkingAll(false);

    if (error || !data || data.length === 0) {
      toast.error(`Leads could not be updated${error ? `: ${error.message}` : "."}`);
      return;
    }
    // Only flip the rows the database confirmed.
    const updated = new Set(data.map((r) => r.id));
    setLeads((prev) => prev.map((l) => (updated.has(l.id) ? { ...l, is_read: true } : l)));
    if (updated.size < unreadIds.length) {
      toast.error(`${unreadIds.length - updated.size} lead(s) could not be updated.`);
    }
  };

  /* ------------------------------ delete -------------------------------- */

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const lead = pendingDelete;
    setDeleting(true);
    const { data, error } = await supabase
      .from("firm_site_leads")
      .delete()
      .eq("id", lead.id)
      .select();
    setDeleting(false);

    if (error || !data || data.length === 0) {
      toast.error(`This lead could not be deleted${error ? `: ${error.message}` : "."}`);
      return; // leave the lead in the list and the dialog open so the firm can retry or cancel
    }
    setLeads((prev) => prev.filter((l) => l.id !== lead.id));
    setPendingDelete(null);
    toast.success("Lead deleted.");
  };

  /* ------------------------------ render -------------------------------- */

  const headerActions = (
    <div className="flex flex-wrap gap-2">
      {unreadCount > 0 && (
        <Button size="sm" variant="outline" onClick={markAllRead} disabled={markingAll || loading}>
          {markingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCheck className="mr-2 h-4 w-4" />}
          Mark all as read
        </Button>
      )}
      <Button size="sm" variant="outline" onClick={() => load("refresh")} disabled={refreshing || loading}>
        {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
        Refresh
      </Button>
    </div>
  );

  let body: React.ReactNode;
  if (loading) {
    body = (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading leads…
      </div>
    );
  } else if (loadError) {
    // Same shape as WebsiteManager's loadError branch.
    body = (
      <div className="flex flex-col items-start gap-3">
        <p className="text-destructive">We couldn't load your leads: {loadError}</p>
        <Button variant="outline" onClick={() => load("initial")}>Try again</Button>
      </div>
    );
  } else if (leads.length === 0) {
    body = (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p>No leads yet. When someone fills in the contact form on your published site, their message appears here.</p>
        {!site.is_published && <p>Your site is not published yet, so the contact form is not live.</p>}
      </div>
    );
  } else {
    body = (
      <ul className="space-y-3">
        {leads.map((lead) => {
          const unread = !lead.is_read;
          const busy = busyIds.has(lead.id);
          const detailsOpen = openDetails.has(lead.id);
          return (
            <li
              key={lead.id}
              // Unread leads get a thicker left border + "New" badge + bold name,
              // so the state never depends on colour alone.
              className={`rounded-md border p-4 ${unread ? "border-l-4 border-l-primary" : ""}`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {unread && <Badge>New</Badge>}
                    {hasText(lead.name) ? (
                      <span className={`break-words ${unread ? "font-bold" : "font-medium"}`}>{lead.name}</span>
                    ) : (
                      <span className={`italic text-muted-foreground ${unread ? "font-bold" : ""}`}>No name given</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <time dateTime={lead.created_at}>{formatWhen(lead.created_at)}</time>
                  </p>
                  {/* Contact links — rendered only when the nullable column has a value. */}
                  {(hasText(lead.email) || hasText(lead.phone)) && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      {hasText(lead.email) && (
                        <a href={`mailto:${lead.email.trim()}`} className="inline-flex min-w-0 items-center gap-1 break-all text-primary underline-offset-4 hover:underline">
                          <Mail className="h-3.5 w-3.5 shrink-0" /> {lead.email.trim()}
                        </a>
                      )}
                      {hasText(lead.phone) && (
                        <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline">
                          <Phone className="h-3.5 w-3.5 shrink-0" /> {lead.phone.trim()}
                        </a>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {unread && (
                    <Button size="sm" variant="outline" onClick={() => markRead(lead)} disabled={busy || markingAll}>
                      {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Mark as read
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPendingDelete(lead)}
                    disabled={busy}
                    aria-label={`Delete lead from ${hasText(lead.name) ? lead.name : "unnamed sender"}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Message body — line breaks preserved. */}
              {hasText(lead.message) ? (
                <p className="mt-3 whitespace-pre-wrap break-words text-sm">{lead.message}</p>
              ) : (
                <p className="mt-3 text-sm italic text-muted-foreground">No message</p>
              )}

              {/* Spam-triage details, collapsed by default so they don't compete with the message. */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => toggleDetails(lead.id)}
                  aria-expanded={detailsOpen}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  {detailsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  Details
                </button>
                {detailsOpen && (
                  <dl className="mt-2 space-y-1 break-all font-mono text-xs text-muted-foreground">
                    <div><dt className="inline">IP: </dt><dd className="inline">{hasText(lead.source_ip) ? lead.source_ip : "not recorded"}</dd></div>
                    <div><dt className="inline">User agent: </dt><dd className="inline">{hasText(lead.user_agent) ? lead.user_agent : "not recorded"}</dd></div>
                  </dl>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <CardTitle>Leads</CardTitle>
          <CardDescription>
            Enquiries from the contact form on your published site, newest first
            {leads.length >= LEAD_LIMIT ? ` (latest ${LEAD_LIMIT} shown)` : ""}.
          </CardDescription>
        </div>
        {headerActions}
      </CardHeader>
      <CardContent>{body}</CardContent>

      {/* Delete confirmation — same AlertDialog pattern as the unsaved-changes guard. */}
      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && !deleting && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
            <AlertDialogDescription>
              The enquiry from {pendingDelete && hasText(pendingDelete.name) ? pendingDelete.name : "this sender"} will be
              permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                // Keep the dialog open until the delete is confirmed by the database.
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
