/**
 * SectionFields — The inline form for each of the eight section types.
 *
 * Each form edits a fully-normalised content object (see sectionContent.ts)
 * and reports the whole new object via onChange. Field names map 1:1 to the
 * renderer contract keys — do not add, rename or drop any.
 *
 * Multi-line fields (body, bio, address) use <Textarea>; booleans
 * (show_form, is_sample) use <Switch>; image fields take a plain URL for now.
 * Placeholders show example wording but are never saved, so nothing invented
 * ends up on a firm's live site by default.
 */
import React, { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle } from "lucide-react";
import { ItemsEditor } from "./ItemsEditor";
import { newFaqItem, newPracticeArea, newTestimonial } from "./sectionContent";
import type { SectionContentMap, SectionType } from "./types";

/* ---------------------------- field primitives --------------------------- */

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  type?: "text" | "url" | "email" | "tel";
  hint?: string;
}

/** Labelled text input / textarea with a stable, unique id for accessibility. */
function TextField({ label, value, onChange, placeholder, multiline, type = "text", hint }: TextFieldProps) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {multiline ? (
        <Textarea id={id} value={value} placeholder={placeholder} rows={4} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input id={id} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Image URL input with a small inline preview once a URL is entered. */
function ImageUrlField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <TextField
        label={label}
        type="url"
        value={value}
        onChange={onChange}
        placeholder="https://…/photo.jpg"
        hint="Paste a link to an image that's already online. Image upload is coming soon."
      />
      {value && /^https?:\/\//i.test(value) && (
        <img src={value} alt={`${label} preview`} className="h-20 w-auto max-w-full rounded border border-border object-cover" />
      )}
    </div>
  );
}

/** Labelled on/off switch for boolean content keys. */
function BoolField({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-border p-3">
      <div className="space-y-0.5">
        <Label htmlFor={id}>{label}</Label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

/* ---------------------------- per-type forms ----------------------------- */

type FieldsProps<T extends SectionType> = {
  content: SectionContentMap[T];
  onChange: (next: SectionContentMap[T]) => void;
};

function HeroFields({ content: c, onChange }: FieldsProps<"hero">) {
  const set = (patch: Partial<typeof c>) => onChange({ ...c, ...patch });
  return (
    <div className="space-y-4">
      <TextField label="Headline" value={c.headline} onChange={(v) => set({ headline: v })} placeholder="Personal Injury Lawyers in Jacksonville, Florida" />
      <TextField label="Subheadline" value={c.subheadline} onChange={(v) => set({ subheadline: v })} placeholder="Free consultations. You pay nothing unless we win your case." />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Button label" value={c.cta_label} onChange={(v) => set({ cta_label: v })} placeholder="Schedule a free consultation" />
        <TextField label="Button link" value={c.cta_href} onChange={(v) => set({ cta_href: v })} placeholder="/contact or tel:+19045550100" />
      </div>
      <ImageUrlField label="Background image URL" value={c.image_url} onChange={(v) => set({ image_url: v })} />
    </div>
  );
}

function AboutFields({ content: c, onChange }: FieldsProps<"about">) {
  const set = (patch: Partial<typeof c>) => onChange({ ...c, ...patch });
  return (
    <div className="space-y-4">
      <TextField label="Heading" value={c.heading} onChange={(v) => set({ heading: v })} placeholder="About our firm" />
      <TextField label="Body" multiline value={c.body} onChange={(v) => set({ body: v })} placeholder="Who you are, who you help, and where you practice." />
      <ImageUrlField label="Image URL" value={c.image_url} onChange={(v) => set({ image_url: v })} />
    </div>
  );
}

function PracticeAreasFields({ content: c, onChange }: FieldsProps<"practice_areas">) {
  return (
    <div className="space-y-4">
      <TextField label="Heading" value={c.heading} onChange={(v) => onChange({ ...c, heading: v })} placeholder="Practice areas" />
      <ItemsEditor
        items={c.items}
        onChange={(items) => onChange({ ...c, items })}
        createItem={newPracticeArea}
        itemNoun="practice area"
        renderItem={(item, update) => (
          <div className="space-y-3">
            <TextField label="Title" value={item.title} onChange={(v) => update({ ...item, title: v })} placeholder="Car accidents" />
            <TextField label="Description" multiline value={item.description} onChange={(v) => update({ ...item, description: v })} placeholder="What this practice area covers and who it helps." />
          </div>
        )}
      />
    </div>
  );
}

function AttorneyBioFields({ content: c, onChange }: FieldsProps<"attorney_bio">) {
  const set = (patch: Partial<typeof c>) => onChange({ ...c, ...patch });
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Name" value={c.name} onChange={(v) => set({ name: v })} placeholder="Jane Smith" />
        <TextField label="Title" value={c.title} onChange={(v) => set({ title: v })} placeholder="Founding Partner" />
      </div>
      <TextField label="Bio" multiline value={c.bio} onChange={(v) => set({ bio: v })} placeholder="Education, experience and the clients this attorney serves." />
      <ImageUrlField label="Photo URL" value={c.photo_url} onChange={(v) => set({ photo_url: v })} />
      <div className="space-y-2">
        <Label>Bar admissions</Label>
        <p className="text-xs text-muted-foreground">List only admissions the attorney actually holds.</p>
        <ItemsEditor
          items={c.bar_admissions}
          onChange={(bar_admissions) => set({ bar_admissions })}
          createItem={() => ""}
          itemNoun="admission"
          renderItem={(item, update) => (
            <Input value={item} onChange={(e) => update(e.target.value)} placeholder="The Florida Bar" aria-label="Bar admission" />
          )}
        />
      </div>
    </div>
  );
}

function TestimonialsFields({ content: c, onChange }: FieldsProps<"testimonials">) {
  return (
    <div className="space-y-4">
      <TextField label="Heading" value={c.heading} onChange={(v) => onChange({ ...c, heading: v })} placeholder="What our clients say" />
      <ItemsEditor
        items={c.items}
        onChange={(items) => onChange({ ...c, items })}
        createItem={newTestimonial}
        itemNoun="testimonial"
        renderItem={(item, update) => (
          <div className="space-y-3">
            {/* Sample flag: on by default; the firm must deliberately clear it. */}
            {item.is_sample && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Sample text — replace before publishing</span>
              </div>
            )}
            <TextField label="Quote" multiline value={item.quote} onChange={(v) => update({ ...item, quote: v })} />
            <TextField label="Author" value={item.author} onChange={(v) => update({ ...item, author: v })} />
            <BoolField
              label="Sample text — replace before publishing"
              checked={item.is_sample}
              onChange={(v) => update({ ...item, is_sample: v })}
              hint="Turn this off only when the quote is a real client's words and you have permission to publish it. Your live site visibly marks sample quotes."
            />
          </div>
        )}
      />
    </div>
  );
}

function FaqFields({ content: c, onChange }: FieldsProps<"faq">) {
  return (
    <div className="space-y-4">
      <TextField label="Heading" value={c.heading} onChange={(v) => onChange({ ...c, heading: v })} placeholder="Frequently asked questions" />
      <ItemsEditor
        items={c.items}
        onChange={(items) => onChange({ ...c, items })}
        createItem={newFaqItem}
        itemNoun="question"
        renderItem={(item, update) => (
          <div className="space-y-3">
            <TextField label="Question" value={item.question} onChange={(v) => update({ ...item, question: v })} placeholder="How much does a consultation cost?" />
            <TextField label="Answer" multiline value={item.answer} onChange={(v) => update({ ...item, answer: v })} />
          </div>
        )}
      />
    </div>
  );
}

function ContactFields({ content: c, onChange }: FieldsProps<"contact">) {
  const set = (patch: Partial<typeof c>) => onChange({ ...c, ...patch });
  return (
    <div className="space-y-4">
      <TextField label="Heading" value={c.heading} onChange={(v) => set({ heading: v })} placeholder="Contact our office" />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Phone" type="tel" value={c.phone} onChange={(v) => set({ phone: v })} placeholder="(904) 555-0100" />
        <TextField label="Email" type="email" value={c.email} onChange={(v) => set({ email: v })} placeholder="intake@yourfirm.com" />
      </div>
      <TextField label="Address" multiline value={c.address} onChange={(v) => set({ address: v })} placeholder={"123 Main Street, Suite 400\nJacksonville, FL 32202"} />
      <BoolField label="Show contact form" checked={c.show_form} onChange={(v) => set({ show_form: v })} hint="Lets visitors send an inquiry from this section." />
    </div>
  );
}

function CtaFields({ content: c, onChange }: FieldsProps<"cta">) {
  const set = (patch: Partial<typeof c>) => onChange({ ...c, ...patch });
  return (
    <div className="space-y-4">
      <TextField label="Headline" value={c.headline} onChange={(v) => set({ headline: v })} placeholder="Talk to a lawyer today" />
      <TextField label="Body" multiline value={c.body} onChange={(v) => set({ body: v })} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Button label" value={c.cta_label} onChange={(v) => set({ cta_label: v })} placeholder="Book a consultation" />
        <TextField label="Button link" value={c.cta_href} onChange={(v) => set({ cta_href: v })} placeholder="/contact" />
      </div>
    </div>
  );
}

/* ---------------------------- dispatcher --------------------------------- */

/** Renders the right form for `type`. Content must already be normalised. */
export function SectionFields({ type, content, onChange }: { type: SectionType; content: unknown; onChange: (next: unknown) => void }) {
  switch (type) {
    case "hero": return <HeroFields content={content as SectionContentMap["hero"]} onChange={onChange} />;
    case "about": return <AboutFields content={content as SectionContentMap["about"]} onChange={onChange} />;
    case "practice_areas": return <PracticeAreasFields content={content as SectionContentMap["practice_areas"]} onChange={onChange} />;
    case "attorney_bio": return <AttorneyBioFields content={content as SectionContentMap["attorney_bio"]} onChange={onChange} />;
    case "testimonials": return <TestimonialsFields content={content as SectionContentMap["testimonials"]} onChange={onChange} />;
    case "faq": return <FaqFields content={content as SectionContentMap["faq"]} onChange={onChange} />;
    case "contact": return <ContactFields content={content as SectionContentMap["contact"]} onChange={onChange} />;
    case "cta": return <CtaFields content={content as SectionContentMap["cta"]} onChange={onChange} />;
    default: return null;
  }
}
