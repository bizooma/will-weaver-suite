/**
 * BrandPanel — Edits the `brand` jsonb on firm_sites:
 *   primary, secondary, accent (color pickers), heading_font, body_font
 *   (text inputs), radius, logo_url — with a small live swatch preview.
 *
 * Edits are local until "Save brand" so the preview can update instantly
 * without a write per keystroke. The preview uses inline styles on purpose:
 * it renders the FIRM's colors and fonts, not the dashboard's theme tokens.
 */
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorPicker } from "@/components/ui/color-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { normalizeBrand, type BrandSettings, type FirmSite } from "./types";

/** Corner-rounding presets stored as CSS lengths. */
const RADIUS_OPTIONS = [
  { value: "0px", label: "Square (0px)" },
  { value: "4px", label: "Subtle (4px)" },
  { value: "8px", label: "Rounded (8px)" },
  { value: "12px", label: "Soft (12px)" },
  { value: "20px", label: "Pill-like (20px)" },
];

interface BrandPanelProps {
  site: FirmSite;
  onSiteChange: (site: FirmSite) => void;
}

export function BrandPanel({ site, onSiteChange }: BrandPanelProps) {
  const [brand, setBrand] = useState<BrandSettings>(() => normalizeBrand(site.brand));
  const [saving, setSaving] = useState(false);

  // Re-sync if the site row is replaced (e.g. after publish refreshes it).
  useEffect(() => { setBrand(normalizeBrand(site.brand)); }, [site.id, site.brand]);

  const saved = normalizeBrand(site.brand);
  const dirty = JSON.stringify(saved) !== JSON.stringify(brand);
  const set = (patch: Partial<BrandSettings>) => setBrand((b) => ({ ...b, ...patch }));

  const save = async () => {
    setSaving(true);
    const { data, error } = await supabase
      .from("firm_sites")
      .update({ brand: brand as unknown as Json })
      .eq("id", site.id)
      .select()
      .single();
    setSaving(false);
    if (error || !data) {
      toast.error(`Couldn't save brand: ${error?.message ?? "no row returned"}`);
      return;
    }
    onSiteChange(data);
    toast.success("Brand saved");
  };

  // Radix Select needs the current value to be one of its options.
  const radiusOptions = RADIUS_OPTIONS.some((o) => o.value === brand.radius)
    ? RADIUS_OPTIONS
    : [...RADIUS_OPTIONS, { value: brand.radius, label: brand.radius }];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_minmax(0,22rem)]">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg">Brand</CardTitle>
          <CardDescription>Colors, fonts and logo used across every page of your site.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <ColorPicker label="Primary" value={brand.primary} onChange={(v) => set({ primary: v })} />
            <ColorPicker label="Secondary" value={brand.secondary} onChange={(v) => set({ secondary: v })} />
            <ColorPicker label="Accent" value={brand.accent} onChange={(v) => set({ accent: v })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="brand-heading-font">Heading font</Label>
              <Input id="brand-heading-font" value={brand.heading_font} onChange={(e) => set({ heading_font: e.target.value })} placeholder="Georgia" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brand-body-font">Body font</Label>
              <Input id="brand-body-font" value={brand.body_font} onChange={(e) => set({ body_font: e.target.value })} placeholder="Helvetica" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Corner rounding</Label>
              <Select value={brand.radius} onValueChange={(v) => set({ radius: v })}>
                <SelectTrigger aria-label="Corner rounding"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {radiusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brand-logo">Logo URL</Label>
              <Input id="brand-logo" type="url" value={brand.logo_url} onChange={(e) => set({ logo_url: e.target.value })} placeholder="https://…/logo.png" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            {dirty && <Button variant="ghost" onClick={() => setBrand(saved)}>Discard</Button>}
            <Button onClick={save} disabled={!dirty || saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save brand
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live preview — inline styles render the firm's own brand values */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {(["primary", "secondary", "accent"] as const).map((k) => (
              <div key={k} className="flex-1 text-center">
                <div className="h-12 border border-border" style={{ backgroundColor: brand[k], borderRadius: brand.radius }} />
                <span className="mt-1 block text-xs capitalize text-muted-foreground">{k}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3 border border-border p-4" style={{ backgroundColor: brand.secondary, borderRadius: brand.radius }}>
            {brand.logo_url && /^https?:\/\//i.test(brand.logo_url) && (
              <img src={brand.logo_url} alt={`${site.firm_name} logo`} className="h-8 w-auto max-w-full object-contain" />
            )}
            <p className="text-xl font-semibold" style={{ color: brand.primary, fontFamily: brand.heading_font || undefined }}>
              {site.firm_name}
            </p>
            <p className="text-sm" style={{ color: brand.primary, fontFamily: brand.body_font || undefined, opacity: 0.8 }}>
              Body text appears in your body font.
            </p>
            <span
              className="inline-block px-4 py-2 text-sm font-medium"
              style={{ backgroundColor: brand.accent, color: brand.secondary, borderRadius: brand.radius, fontFamily: brand.body_font || undefined }}
            >
              Button
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
