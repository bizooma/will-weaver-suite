/**
 * SiteSetupForm — First-run setup shown when the signed-in user has no firm_sites row.
 *
 * Flow:
 *  1. validate firm name + subdomain client-side (same rule as the DB CHECK),
 *  2. INSERT firm_sites with user_id = current user, and read the row back
 *     with .select().single() — if no row comes back we stop and say so
 *     rather than carrying on with a phantom site,
 *  3. seed a home page (slug "home", is_home true, title = firm name),
 *  4. seed a hero section on that page with the firm name as headline.
 *
 * A taken subdomain arrives as Postgres unique_violation (23505) and is shown
 * as a plain "already taken" message next to the field.
 */
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { defaultContent } from "./sectionContent";
import { isCheckViolation, isUniqueViolation, liveSiteUrl, suggestSubdomain, validateSubdomain } from "./siteRules";
import type { FirmSite, FirmSitePage } from "./types";

interface SiteSetupFormProps {
  userId: string;
  onCreated: (site: FirmSite, pages: FirmSitePage[]) => void;
}

export function SiteSetupForm({ userId, onCreated }: SiteSetupFormProps) {
  const [firmName, setFirmName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [subdomainTouched, setSubdomainTouched] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [subdomainError, setSubdomainError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = firmName.trim();
    const sub = subdomain.trim();
    const nErr = name ? null : "Enter your firm's name.";
    const sErr = validateSubdomain(sub);
    setNameError(nErr);
    setSubdomainError(sErr);
    setFormError(null);
    if (nErr || sErr) return;

    setSubmitting(true);

    // 1. Create the site. user_id is set explicitly — RLS requires auth.uid() = user_id.
    const { data: site, error: siteError } = await supabase
      .from("firm_sites")
      .insert({ user_id: userId, firm_name: name, subdomain: sub })
      .select()
      .single();

    if (siteError || !site) {
      setSubmitting(false);
      if (isUniqueViolation(siteError)) setSubdomainError("That subdomain is already taken. Try another.");
      else if (isCheckViolation(siteError)) setSubdomainError("That subdomain isn't allowed. Use lowercase letters, numbers and hyphens.");
      else setFormError(`We couldn't create your site: ${siteError?.message ?? "the new site wasn't returned"}`);
      return;
    }

    // 2. Seed the home page.
    const { data: home, error: homeError } = await supabase
      .from("firm_site_pages")
      .insert({ site_id: site.id, slug: "home", title: name, is_home: true, display_order: 0 })
      .select()
      .single();

    if (homeError || !home) {
      // The site exists; hand it over so the firm can add a home page manually.
      setSubmitting(false);
      toast.error(`Site created, but the home page couldn't be added: ${homeError?.message ?? "no row returned"}`);
      onCreated(site, []);
      return;
    }

    // 3. Seed a hero section on the home page.
    const { error: heroError } = await supabase.from("firm_site_sections").insert({
      page_id: home.id,
      section_type: "hero",
      content: { ...defaultContent("hero"), headline: name } as unknown as Json,
      display_order: 0,
    });
    if (heroError) toast.error(`Home page created, but the hero section couldn't be added: ${heroError.message}`);

    setSubmitting(false);
    toast.success("Your website is set up");
    onCreated(site, [home]);
  };

  return (
    <Card className="mx-auto w-full max-w-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Globe className="h-5 w-5" /> Set up your law firm website
        </CardTitle>
        <CardDescription>
          Two quick details and you'll have a home page ready to edit. You can publish whenever you're ready.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="setup-firm-name">Firm name</Label>
            <Input
              id="setup-firm-name"
              value={firmName}
              placeholder="Smith & Jones Injury Law"
              aria-invalid={!!nameError}
              onChange={(e) => {
                setFirmName(e.target.value);
                if (!subdomainTouched) setSubdomain(suggestSubdomain(e.target.value));
              }}
            />
            {nameError && <p className="text-sm text-destructive" role="alert">{nameError}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="setup-subdomain">Subdomain</Label>
            <div className="flex items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
              <Input
                id="setup-subdomain"
                value={subdomain}
                placeholder="smith-jones"
                aria-invalid={!!subdomainError}
                className="min-w-0 border-0 font-mono focus-visible:ring-0 focus-visible:ring-offset-0"
                onChange={(e) => {
                  setSubdomainTouched(true);
                  setSubdomain(e.target.value.toLowerCase());
                  setSubdomainError(null);
                }}
              />
              <span className="shrink-0 pr-3 font-mono text-xs text-muted-foreground sm:text-sm">.sites.amicusedge.com</span>
            </div>
            <p className="text-xs text-muted-foreground">
              3–50 characters: lowercase letters, numbers and hyphens, not starting or ending with a hyphen.
            </p>
            {subdomain && !validateSubdomain(subdomain) && (
              <p className="break-all text-xs text-muted-foreground">Your site will be at {liveSiteUrl(subdomain)}</p>
            )}
            {subdomainError && <p className="text-sm text-destructive" role="alert">{subdomainError}</p>}
          </div>

          {formError && <p className="text-sm text-destructive" role="alert">{formError}</p>}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create my website
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
