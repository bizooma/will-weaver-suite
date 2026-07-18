import { useEffect, useMemo, useRef, useState } from "react";
import SEOHead from "@/components/SEOHead";
import { LegalDisclaimer } from "@/components/CookieConsentBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { supabase } from "@/integrations/supabase/client";
import SuggestionReviewDialog from "@/components/SuggestionReviewDialog";
import CopilotPanel from "@/components/CopilotPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createDraft, getDraftBySlug } from "@/hooks/useWillDrafts";
import { exportWillDocx } from "@/utils/docxExport";
import { generateWillText } from "@/utils/willTemplate";
import { useNavigate } from "react-router-dom";
import VoiceButton from "@/components/VoiceButton";
import { useFormAutoFill } from "@/hooks/useFormAutoFill";
import { ExtractedData } from "@/hooks/useVoiceAutoFill";
import { useEffect as useD_IDEffect } from "react";

// Types
 type Beneficiary = { name: string; dob: string; relationship: string };
 type Gift = { description: string; beneficiary: string };
 type ResidueSplit = { beneficiary: string; percentage: string };
 type Person = { name: string; dob?: string; address?: string; relationship?: string };

  type WizardData = {
    // 1 Personal
    fullName: string;
    dob: string;
    address: string;
    zipCode: string;
    state: string;
    maritalStatus: "single" | "married" | "divorced" | "widowed" | "";
   // 2 Spouse (optional)
   spouse?: Person;
   // 3 Beneficiaries
   beneficiaries: Beneficiary[];
   // 4 Executor
   executor: Person;
   altExecutor?: Person;
   // 5 Guardians (optional)
   addGuardians: boolean;
   guardian?: Person;
   altGuardian?: Person;
   // Guardian clauses (optional)
   guardianInstructions?: string;
   altGuardianInstructions?: string;
   // 6 Gifts
   gifts: Gift[];
   // 7 Residue
   residue: ResidueSplit[];
   // 8 Pets (optional)
   petName?: string;
   petType?: string;
   petCaregiver?: string;
   // Pet clause (optional)
   petInstructions?: string;
   // 9 Funeral
   funeralPreference: "burial" | "cremation" | "no_preference" | "";
   funeralInstructions: string;
   // 10 Witnesses
   witnesses: string[];
 };

 const emptyPerson = (): Person => ({ name: "", dob: "", address: "", relationship: "" });

 // Default data
  const defaultData: WizardData = {
    fullName: "",
    dob: "",
    address: "",
    zipCode: "",
    state: "",
    maritalStatus: "",
   spouse: undefined,
   beneficiaries: [{ name: "", dob: "", relationship: "" }],
   executor: { ...emptyPerson(), relationship: "" },
   altExecutor: { ...emptyPerson(), relationship: "" },
   addGuardians: false,
   guardian: { ...emptyPerson(), relationship: "" },
   altGuardian: { ...emptyPerson(), relationship: "" },
   guardianInstructions: "",
   altGuardianInstructions: "",
   gifts: [],
   residue: [{ beneficiary: "", percentage: "100" }],
   petName: "",
   petType: "",
   petCaregiver: "",
   petInstructions: "",
   funeralPreference: "",
   funeralInstructions: "",
   witnesses: ["", ""],
 };

 // Helpers
 function hexToHsl(hex: string): string | null {
   const m = hex.replace('#','').match(new RegExp('(.{2})(.{2})(.{2})'));
   if (!m) return null;
   const [,r,g,b] = m.map(x=>parseInt(x,16)/255);
   const max = Math.max(r,g,b), min = Math.min(r,g,b);
   let h=0, s=0, l=(max+min)/2;
   if (max !== min) {
     const d = max - min;
     s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
     switch (max) {
       case r: h = (g - b) / d + (g < b ? 6 : 0); break;
       case g: h = (b - r) / d + 2; break;
       case b: h = (r - g) / d + 4; break;
     }
     h /= 6;
   }
   return `${Math.round(h*360)} ${Math.round(s*100)}% ${Math.round(l*100)}%`;
 }

 const canonical = typeof window !== 'undefined' ? window.location.origin + "/will-creator" : "/will-creator";

 // Total steps in the wizard. Step 11 is the Review & Export screen — it must
 // be reachable via the Next button, so TOTAL_STEPS includes it.
 const TOTAL_STEPS = 11;

 const usStates = [
     "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"
   ];

   function guessStepForText(text: string): number {
     const t = text.toLowerCase();
     if (t.includes('execut')) return 4;
     if (t.includes('guardian') || t.includes('minor')) return 5;
     if (t.includes('beneficiar')) return 3;
     if (t.includes('gift') || t.includes('bequest') || t.includes('specific')) return 6;
     if (t.includes('residu') || t.includes('remainder')) return 7;
     if (t.includes('pet')) return 8;
     if (t.includes('funeral') || t.includes('burial') || t.includes('cremat') || t.includes('preference')) return 9;
     if (t.includes('witness')) return 10;
     if (t.includes('address') || t.includes('state') || t.includes('dob') || t.includes('marital') || t.includes('name')) return 1;
     if (t.includes('spouse')) return 2;
     return 11;
   }

  const WillCreator = () => {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<WizardData>(defaultData);
    const [brand, setBrand] = useState<string | null>(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [openCopilot, setOpenCopilot] = useState(false);
    const [seedPrompt, setSeedPrompt] = useState<string>("");

    const [aiReview, setAiReview] = useState<{ issues: string[]; risks: string[]; missing: string[]; summary: string; checklist: string[] } | null>(null);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [funeralLoading, setFuneralLoading] = useState(false);
    const [giftLoadingIdx, setGiftLoadingIdx] = useState<number | null>(null);
    const [guardianLoadingPrimary, setGuardianLoadingPrimary] = useState(false);
    const [guardianLoadingAlt, setGuardianLoadingAlt] = useState(false);
    const [petLoading, setPetLoading] = useState(false);
    const [tone, setTone] = useState<'plain' | 'formal' | 'compassionate' | 'concise'>('plain');
    type PendingSuggestion = { target: 'funeral' | 'gift' | 'guardian' | 'altGuardian' | 'pet'; index?: number; suggestion: string };
    const [pendingSuggestion, setPendingSuggestion] = useState<PendingSuggestion | null>(null);
    const [fixingKey, setFixingKey] = useState<string | null>(null);
    const [undoAction, setUndoAction] = useState<(() => void) | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const { generateAutoFillPreview, applyAutoFill } = useFormAutoFill();
  const [didAvatarLoaded, setDidAvatarLoaded] = useState(false);
    const isDemo = useMemo(() => {
      try { return new URLSearchParams(window.location.search).get('demo') === '1'; } catch { return false; }
    }, []);

    const isEmbed = useMemo(() => {
      try { return new URLSearchParams(window.location.search).get('embed') === '1'; } catch { return false; }
    }, []);

    // Validation rules enforced before allowing Complete/Export. Keep these
    // in sync with the inline error list shown on the Review step.
    const validationIssues = useMemo(() => {
      const issues: string[] = [];
      if (!data.fullName?.trim()) issues.push('Missing full legal name');
      if (!data.dob?.trim()) issues.push('Missing date of birth');
      if (!data.address?.trim()) issues.push('Missing address');
      if (!data.state) issues.push('Missing state of residence');
      if (!data.executor?.name?.trim()) issues.push('Missing executor name');
      if (data.addGuardians && !data.guardian?.name?.trim()) issues.push('Guardian name required when guardians are enabled');
      const namedBeneficiaries = (data.beneficiaries || []).filter(b => b?.name?.trim());
      if (namedBeneficiaries.length === 0) issues.push('Add at least one beneficiary with a name');
      const sum = data.residue.reduce((s, r) => s + (parseFloat(r.percentage || '0') || 0), 0);
      if (Math.round(sum) !== 100) issues.push(`Residue total must equal 100% (currently ${Math.round(sum)}%)`);
      return issues;
    }, [data]);

    const canComplete = validationIssues.length === 0;
  
   const next = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1));
   const prev = () => setStep((s) => Math.max(1, s - 1));
 
   // White-label + default brand colors from legallyinnovative.com (navy + gold)
   useEffect(() => {
     const params = new URLSearchParams(window.location.search);
     const brandName = params.get('brand');
     const primary = params.get('primary');
     const accent = params.get('accent');
     const logo = params.get('logo');
     const draftSlug = params.get('draft');
     
     if (brandName) setBrand(brandName);
     if (logo) setLogoUrl(logo);

     // Load existing draft if specified
     if (draftSlug) {
       loadDraft(draftSlug);
     }

     // Load user settings for white-label if authenticated
     loadUserWhiteLabelSettings();

     // Defaults to Bizooma / Amicus Edge palette if not provided
     const primaryHex = primary || '#0a3a64';
     const accentHex = accent || '#e0b04b';
     const hslPrimary = hexToHsl(primaryHex);
     const hslAccent = hexToHsl(accentHex);
     if (hslPrimary) document.documentElement.style.setProperty('--primary', hslPrimary);
     if (hslAccent) document.documentElement.style.setProperty('--accent', hslAccent);

     // Attempt to infer logo from site if not provided (best-effort)
     if (!logo && !logoUrl) {
       // Fallback to text brand if no logo
       setLogoUrl(null);
     }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const loadDraft = async (slug: string) => {
     try {
       const draft = await getDraftBySlug(slug);
       if (draft && draft.data) {
         setData({ ...defaultData, ...draft.data as any });
         if (draft.step) setStep(draft.step);
         if (draft.tone) setTone(draft.tone as any);
         toast.success('Draft loaded successfully');
       } else {
         toast.error('Draft not found');
       }
     } catch (error) {
       console.error('Error loading draft:', error);
       toast.error('Failed to load draft');
     }
   };

   const loadUserWhiteLabelSettings = async () => {
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) return;

       const { data: settings } = await supabase
         .from('user_settings')
         .select('*')
         .eq('user_id', user.id)
         .maybeSingle();

       if (settings && settings.white_label_enabled) {
         if (settings.company_name && !brand) setBrand(settings.company_name);
         if (settings.logo_url && !logoUrl) setLogoUrl(settings.logo_url);
         if (settings.brand_color) {
           const hsl = hexToHsl(settings.brand_color);
           if (hsl) document.documentElement.style.setProperty('--primary', hsl);
         }
       }
     } catch (error) {
       console.error('Error loading white-label settings:', error);
     }
   };

    // Load persisted state (if any)
    useEffect(() => {
      if (isDemo) return; // skip persistence in demo mode
      try {
        const saved = localStorage.getItem('willCreator.data');
        if (saved) setData(JSON.parse(saved));
        const savedStep = localStorage.getItem('willCreator.step');
        if (savedStep) setStep(parseInt(savedStep, 10) || 1);
        const savedTone = localStorage.getItem('willCreator.tone');
        if (savedTone) setTone(savedTone as any);
      } catch (_) { /* ignore */ }
    }, [isDemo]);

    // Persist state
    useEffect(() => {
      if (isDemo) return;
      try { localStorage.setItem('willCreator.data', JSON.stringify(data)); } catch (_) {}
    }, [data, isDemo]);
    useEffect(() => {
      if (isDemo) return;
      try { localStorage.setItem('willCreator.step', String(step)); } catch (_) {}
    }, [step, isDemo]);
    useEffect(() => {
      if (isDemo) return;
      try { localStorage.setItem('willCreator.tone', tone); } catch (_) {}
    }, [tone, isDemo]);

    // Load from shared draft via ?slug=
    useEffect(() => {
      if (isDemo) return; // skip network in demo
      const params = new URLSearchParams(window.location.search);
      const sharedSlug = params.get('slug');
      if (!sharedSlug) return;
      (async () => {
        try {
          const d = await getDraftBySlug(sharedSlug);
          if (d?.data) {
            setData({ ...defaultData, ...(d.data as any) });
            if (d.step) setStep(d.step);
            if (d.tone) setTone(d.tone as any);
            toast.success('Loaded shared draft');
          } else {
            toast.error('Shared draft not found');
          }
        } catch (_) {
          toast.error('Failed to load shared draft');
        }
      })();
    }, [isDemo]);

    // Auto-populate demo data for the user
    useEffect(() => {
      if (!isDemo) return;
      // Example demo data
      if (!data.fullName) {
        setData({
          ...defaultData,
          fullName: "Alex Morgan",
          dob: "1985-04-12",
          address: "123 Main St, Springfield",
          state: "CA",
          maritalStatus: "married",
          spouse: { name: "Jamie Morgan", dob: "1986-09-07", address: "", relationship: "Spouse" },
          beneficiaries: [{ name: "Sam Morgan", dob: "2014-06-02", relationship: "Child" }],
          executor: { name: "Taylor Reed", address: "456 Oak Ave", relationship: "Friend" },
          gifts: [{ description: "Rolex Submariner", beneficiary: "Taylor Reed" }],
          residue: [{ beneficiary: "Jamie Morgan", percentage: "100" }],
          funeralPreference: "no_preference",
          funeralInstructions: "Celebrate life with a small memorial.",
          witnesses: ["Jordan A.", "Riley B."]
        });
        setStep(11); // Go to final review step
      }
    }, [isDemo, data.fullName]);

    // Progress bar calculation
    const progressValue = useMemo(() => (step / TOTAL_STEPS) * 100, [step]);

    const title = brand ? `${brand} Will & Trust Creator` : "Will & Trust Creator";

    // Generate draft text via shared template so DraftView renders/exports the same doc.
    const draft = useMemo(() => generateWillText(data), [data]);

   const generateFuneralInstructionsWithAI = async () => {
     setFuneralLoading(true);
     try {
       const { data: result, error } = await supabase.functions.invoke("ai-generate-clause", {
         body: { 
           type: "funeral", 
           context: data, 
           tone,
           existing: data.funeralInstructions || ""
         }
       });
       if (error) throw error;
       setSeedPrompt(`Based on your preferences, here's a suggestion for funeral instructions:\n\n"${result.suggestion}"\n\nWould you like me to modify or expand on this?`);
       setPendingSuggestion({ target: 'funeral', suggestion: result.suggestion });
     } catch (e) {
       console.error(e);
       toast.error('Failed to generate suggestion');
     } finally {
       setFuneralLoading(false);
     }
   };

   const generateGiftClause = async (giftIndex: number) => {
     setGiftLoadingIdx(giftIndex);
     try {
       const gift = data.gifts[giftIndex];
       const { data: result, error } = await supabase.functions.invoke("ai-generate-clause", {
         body: { 
           type: "gift", 
           context: { ...data, currentGift: gift, giftIndex }, 
           tone,
           existing: gift?.description || ""
         }
       });
       if (error) throw error;
       setSeedPrompt(`Here's a suggestion for describing this gift:\n\n"${result.suggestion}"\n\nWould you like me to modify this description?`);
       setPendingSuggestion({ target: 'gift', index: giftIndex, suggestion: result.suggestion });
     } catch (e) {
       console.error(e);
       toast.error('Failed to generate suggestion');
     } finally {
       setGiftLoadingIdx(null);
     }
   };

   const generateGuardianClause = async (isPrimary: boolean) => {
     if (isPrimary) setGuardianLoadingPrimary(true);
     else setGuardianLoadingAlt(true);
     
     try {
       const guardianData = isPrimary ? data.guardian : data.altGuardian;
       const existingInstructions = isPrimary ? data.guardianInstructions : data.altGuardianInstructions;
       
       const { data: result, error } = await supabase.functions.invoke("ai-generate-clause", {
         body: { 
           type: isPrimary ? "guardian" : "altGuardian", 
           context: { ...data, currentGuardian: guardianData }, 
           tone,
           existing: existingInstructions || ""
         }
       });
       if (error) throw error;
       setSeedPrompt(`Here's a suggestion for guardian instructions:\n\n"${result.suggestion}"\n\nWould you like me to modify or expand on this?`);
       setPendingSuggestion({ target: isPrimary ? 'guardian' : 'altGuardian', suggestion: result.suggestion });
     } catch (e) {
       console.error(e);
       toast.error('Failed to generate suggestion');
     } finally {
       if (isPrimary) setGuardianLoadingPrimary(false);
       else setGuardianLoadingAlt(false);
     }
   };

   const generatePetClause = async () => {
     setPetLoading(true);
     try {
       const { data: result, error } = await supabase.functions.invoke("ai-generate-clause", {
         body: { 
           type: "pet", 
           context: data, 
           tone,
           existing: data.petInstructions || ""
         }
       });
       if (error) throw error;
       setSeedPrompt(`Based on your pet information, here's a suggestion for care instructions:\n\n"${result.suggestion}"\n\nWould you like me to modify this?`);
       setPendingSuggestion({ target: 'pet', suggestion: result.suggestion });
     } catch (e) {
       console.error(e);
       toast.error('Failed to generate suggestion');
     } finally {
       setPetLoading(false);
     }
   };

   const runAIReview = async () => {
     setReviewLoading(true);
     try {
       const { data: result, error } = await supabase.functions.invoke("ai-review-will", {
         body: { draft, data, tone }
       });
       if (error) throw error;
       setAiReview(result);
       toast.success('AI review completed');
     } catch (e) {
       console.error(e);
       toast.error('Failed to run AI review');
     } finally {
       setReviewLoading(false);
     }
   };

   const handleFixIssue = (item: string) => {
     setFixingKey(item);
     const targetStep = guessStepForText(item);
     if (targetStep <= TOTAL_STEPS) {
       setStep(targetStep);
       setSeedPrompt(`Explain and propose exact wording to fix this in my will: "${item}"`);
       setOpenCopilot(true);
     } else {
       // General issue
       setSeedPrompt(`Explain this issue and how to address it in my will: "${item}"`);
       setOpenCopilot(true);
     }
     setTimeout(() => setFixingKey(null), 3000);
   };

   const handleExplainIssue = (item: string) => {
     const targetStep = guessStepForText(item);
     if (targetStep <= TOTAL_STEPS) {
       setStep(targetStep);
     }
     setSeedPrompt(`Explain this review point and how to fix it in my will. Provide clear steps and example wording:\n\n"${item}"`);
     setOpenCopilot(true);
   };

    const handleVoiceAutoFill = async (extractedData: ExtractedData) => {
      try {
        const confidence = {}; // Default confidence values
        const preview = generateAutoFillPreview(data, extractedData, confidence);
        if (preview && preview.length > 0) {
          const confirmed = confirm(`Voice data detected:\n\n${preview.map(change => `${change.field}: ${change.newValue}`).join('\n')}\n\nApply these changes?`);
          if (confirmed) {
            const updatedData = applyAutoFill(data, extractedData, preview);
            setData(updatedData);
           toast.success("Form updated with voice data");
         }
       } else {
         toast.info("No new information found to fill the form");
       }
     } catch (error) {
       console.error("Voice auto-fill error:", error);
       toast.error("Failed to process voice data");
     }
   };

   // Export functions
   async function handleExportPDF() {
     if (isDemo) { toast.info('Demo mode: Export is disabled.'); return; }
     if (!canComplete) {
       toast.error('Please resolve validation issues before exporting');
       setStep(TOTAL_STEPS);
       return;
     }
     try {
       const pdfDoc = await PDFDocument.create();
       const times = await pdfDoc.embedFont(StandardFonts.TimesRoman);
       const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
       
       const margin = 50;
       const width = 612; // Letter size width
       let page = pdfDoc.addPage([width, 792]);
       let yPos = 742;
       
       const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
         const words = text.split(' ');
         const lines: string[] = [];
         let currentLine = words[0];
         
         for (let i = 1; i < words.length; i++) {
           const word = words[i];
           const testLine = `${currentLine} ${word}`;
           const testWidth = times.widthOfTextAtSize(testLine, fontSize);
           
           if (testWidth < maxWidth && currentLine.length < 80) {
             currentLine = testLine;
           } else {
             lines.push(currentLine);
             currentLine = word;
           }
         }
         lines.push(currentLine);
         return lines;
       };
       
       // Title
       const titleText = `LAST WILL AND TESTAMENT OF ${data.fullName?.toUpperCase() || 'YOUR NAME'}`;
       page.drawText(titleText, {
         x: margin,
         y: yPos,
         size: 16,
         font: timesBold,
       });
       yPos -= 40;
       
       // Content
       const lines = draft.split('\n');
       const maxWidth = width - margin * 2;
       
       for (const line of lines) {
         if (yPos < margin + 40) {
           page = pdfDoc.addPage([width, 792]);
           yPos = 742;
         }
         
         if (line.trim() === '') {
           yPos -= 12;
           continue;
         }
         
         const isHeader = line.startsWith('ARTICLE') || line.includes('LAST WILL AND TESTAMENT');
         const fontSize = isHeader ? 14 : 12;
         const font = isHeader ? timesBold : times;
         
         const wrappedLines = wrapText(line, maxWidth, fontSize);
         for (const wrappedLine of wrappedLines) {
           if (yPos < margin + 20) {
             page = pdfDoc.addPage([width, 792]);
             yPos = 742;
           }
           
           page.drawText(wrappedLine, {
             x: margin,
             y: yPos,
             size: fontSize,
             font: font,
           });
           yPos -= fontSize + 4;
         }
         yPos -= 6;
       }
       
       // Add AI Review if available
       if (aiReview) {
         let p = pdfDoc.addPage([612, 792]);
         let y = 742;
         const maxWidth = width - margin * 2;
         p.drawText('AI Review Summary', { x: margin, y, size: 16, font: times });
         y -= 24;
         for (const line of wrapText(aiReview.summary || '', maxWidth, 12)) {
           if (y < margin + 40) { p = pdfDoc.addPage([612, 792]); y = 742; }
           p.drawText(line, { x: margin, y, size: 12, font: times });
           y -= 16;
         }
         y -= 10;
         if (aiReview.checklist?.length) {
           if (y < margin + 40) { p = pdfDoc.addPage([612, 792]); y = 742; }
           p.drawText('Checklist', { x: margin, y, size: 14, font: times });
           y -= 20;
           for (const item of aiReview.checklist) {
             for (const line of wrapText(`• ${item}`, maxWidth, 12)) {
               if (y < margin + 40) { p = pdfDoc.addPage([612, 792]); y = 742; }
               p.drawText(line, { x: margin, y, size: 12, font: times });
               y -= 16;
             }
           }
         }
       }
       
        const bytes = await pdfDoc.save();
        const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = 'will-draft.pdf';
       a.click();
       URL.revokeObjectURL(url);
       
       toast.success('PDF downloaded');
     } catch (e) {
       console.error(e);
       toast.error('Failed to export PDF');
     }
   }

    async function handleExportDocx() {
       if (isDemo) { toast.info('Demo mode: Export is disabled.'); return; }
       if (!canComplete) {
         toast.error('Please resolve validation issues before exporting');
         setStep(TOTAL_STEPS);
         return;
       }
       try {
         await exportWillDocx({
           title: 'Last Will and Testament (Draft)',
           content: draft,
           filename: `will-draft-${Date.now()}.docx`
         });
         toast.success('DOCX downloaded');
       } catch (e) {
         console.error(e);
         toast.error('Failed to export DOCX');
       }
     }

    async function handleSaveShare() {
      if (isDemo) { toast.info('Demo mode: Saving is disabled.'); return; }
      if (!canComplete) {
        toast.error('Please resolve validation issues before sharing');
        setStep(TOTAL_STEPS);
        return;
      }
      try {
        setSaving(true);
        const slug = await createDraft({ data, tone, step });
        // Route is /drafts/:slug (plural) — matches src/App.tsx
        const url = `${window.location.origin}/drafts/${slug}`;
        try { await navigator.clipboard.writeText(url); } catch (_) {}
        toast.success('Draft saved & link copied');
        navigate(`/drafts/${slug}`);
      } catch (e) {
        console.error(e);
        toast.error('Failed to save draft');
      } finally {
        setSaving(false);
      }
    }

   // Load D-ID script for avatar
   useD_IDEffect(() => {
     if (didAvatarLoaded) return;
     const existingScript = document.querySelector('script[src="https://agent.d-id.com/v2/index.js"]');
     if (existingScript) return;
     
     const script = document.createElement('script');
     script.src = 'https://agent.d-id.com/v2/index.js';
     script.async = true;
     script.onload = () => setDidAvatarLoaded(true);
     document.head.appendChild(script);
   }, [didAvatarLoaded]);

   // UI bits. Step TOTAL_STEPS (11) = Review & Export screen.
   // On step TOTAL_STEPS - 1 (10), the Next button becomes "Review & Export"
   // and takes the user to the review screen — this is what makes the
   // review/validation/AI-review pane actually reachable.
   const StepActions = (
     <div className="mt-6 flex items-center justify-between">
       <Button variant="outline" onClick={prev} disabled={step===1}>Back</Button>
       {step < TOTAL_STEPS ? (
         <Button variant="hero" onClick={next}>
           {step === TOTAL_STEPS - 1 ? 'Review & Export' : 'Next'}
         </Button>
       ) : (
         <div className="flex gap-2">
           <Button
             variant="hero"
             onClick={handleExportPDF}
             disabled={!canComplete}
             title={!canComplete ? 'Resolve validation issues first' : undefined}
           >
             Download PDF
           </Button>
           <Button
             variant="outline"
             onClick={handleExportDocx}
             disabled={!canComplete}
             title={!canComplete ? 'Resolve validation issues first' : undefined}
           >
             Export DOCX
           </Button>
           <Button
             variant="secondary"
             onClick={handleSaveShare}
             disabled={saving || !canComplete}
             title={!canComplete ? 'Resolve validation issues first' : undefined}
           >
             Save & Share
           </Button>
         </div>
       )}
     </div>
   );

   const residueSum = useMemo(() => data.residue.reduce((sum, r)=> sum + (parseFloat(r.percentage||'0') || 0), 0), [data.residue]);

   return (
     <main>
       {/* SEO meta tags for Will Creator page */}
       <SEOHead
         title={`${title} | Amicus Edge`}
         description="Step-by-step guided will generator for law firms. Create, review, and export legal documents as PDF."
         path="/will-creator"
         structuredData={{
           '@context': 'https://schema.org',
           '@type': 'SoftwareApplication',
           name: 'Will & Trust Creator',
           applicationCategory: 'BusinessApplication',
           offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
           provider: { '@type': 'Organization', name: brand || 'Amicus Edge' }
         }}
       />

        <section className="container py-10">
          <LegalDisclaimer variant="banner" />
          <header className="mb-6">
            <h1 className="text-4xl md:text-5xl mb-2 font-serifBrand">{title}</h1>
            <p className="text-muted-foreground max-w-3xl">Follow the steps below. Your information stays in your browser. At the end, review everything and download a polished PDF draft.</p>
         </header>

          {/* Main layout with form */}
          <div>
            {/* Form Section */}
            <div>
              <div className="rounded-lg border p-6 bg-card relative">
           <div className="mb-4">
               <Progress value={progressValue} />
               <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                 <div className="text-sm text-muted-foreground">Step {step} of {TOTAL_STEPS}</div>
                 <div className="flex items-center gap-2 flex-wrap">
                   <Label className="text-sm">AI tone</Label>
                   <Select value={tone} onValueChange={(v)=>setTone(v as any)}>
                     <SelectTrigger className="w-40"><SelectValue placeholder="Select tone"/></SelectTrigger>
                     <SelectContent>
                       <SelectItem value="plain">Plain</SelectItem>
                       <SelectItem value="formal">Formal</SelectItem>
                       <SelectItem value="compassionate">Compassionate</SelectItem>
                       <SelectItem value="concise">Concise</SelectItem>
                     </SelectContent>
                   </Select>
                   <Button size="sm" variant="secondary" onClick={()=> setOpenCopilot(true)}>Co‑pilot</Button>
                  {undoAction && (
                    <Button size="sm" variant="outline" onClick={()=>{ undoAction(); setUndoAction(null); toast.success('Undone'); }}>Undo last AI insert</Button>
                  )}
                  <Button size="sm" variant="outline" onClick={()=>{
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = 'will-draft.json'; a.click(); URL.revokeObjectURL(url);
                  }}>Export JSON</Button>
                  <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={(e)=>{
                    const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader();
                    reader.onload = () => { try { const obj = JSON.parse(String(reader.result||'{}')); setData({ ...defaultData, ...obj }); toast.success('Imported'); } catch { toast.error('Invalid JSON'); } };
                    reader.readAsText(file);
                    e.currentTarget.value = '';
                  }} />
                  <Button size="sm" variant="outline" onClick={()=> fileInputRef.current?.click()}>Import JSON</Button>
                  <Button size="sm" variant="destructive" onClick={()=>{ if (confirm('Reset all data?')) { setData(defaultData); setStep(1); setAiReview(null); localStorage.removeItem('willCreator.data'); localStorage.removeItem('willCreator.step'); } }}>Reset</Button>
                </div>
              </div>
             </div>

           {/* Steps */}
           {step === 1 && (
             <div>
               <h2 className="text-2xl mb-4">Personal Information</h2>
               <div className="grid gap-4 md:grid-cols-2">
                 <div>
                   <Label htmlFor="fullName">Full Legal Name *</Label>
                   <Input id="fullName" value={data.fullName} onChange={(e)=> setData({...data, fullName: e.target.value})} placeholder="John Doe" />
                 </div>
                 <div>
                   <Label htmlFor="dob">Date of Birth</Label>
                   <Input id="dob" type="date" value={data.dob} onChange={(e)=> setData({...data, dob: e.target.value})} />
                 </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={data.address} onChange={(e)=> setData({...data, address: e.target.value})} placeholder="123 Main St, City" />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input id="zipCode" value={data.zipCode} onChange={(e)=> setData({...data, zipCode: e.target.value})} placeholder="12345" />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                   <Select value={data.state} onValueChange={(v)=> setData({...data, state: v})}>
                     <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                     <SelectContent>
                       {usStates.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                     </SelectContent>
                   </Select>
                 </div>
                 <div>
                   <Label htmlFor="maritalStatus">Marital Status</Label>
                   <Select value={data.maritalStatus} onValueChange={(v)=> setData({...data, maritalStatus: v as any})}>
                     <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                     <SelectContent>
                       <SelectItem value="single">Single</SelectItem>
                       <SelectItem value="married">Married</SelectItem>
                       <SelectItem value="divorced">Divorced</SelectItem>
                       <SelectItem value="widowed">Widowed</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
               </div>
                <div className="mt-4">
                  <VoiceButton onResult={(text) => {
                    // Use basic text input for now - can be enhanced later with structured data extraction
                    setData(prev => ({ ...prev, fullName: text.trim() }));
                  }} />
                </div>
               {StepActions}
             </div>
           )}

           {step === 2 && (
             <div>
               <h2 className="text-2xl mb-4">Spouse Information</h2>
               {data.maritalStatus === 'married' ? (
                 <div className="grid gap-4 md:grid-cols-2">
                   <div>
                     <Label htmlFor="spouseName">Spouse's Name</Label>
                     <Input id="spouseName" value={data.spouse?.name || ''} onChange={(e)=> setData({...data, spouse: {...(data.spouse||emptyPerson()), name: e.target.value}})} placeholder="Jane Doe" />
                   </div>
                   <div>
                     <Label htmlFor="spouseDob">Spouse's Date of Birth</Label>
                     <Input id="spouseDob" type="date" value={data.spouse?.dob || ''} onChange={(e)=> setData({...data, spouse: {...(data.spouse||emptyPerson()), dob: e.target.value}})} />
                   </div>
                   <div className="md:col-span-2">
                     <Label htmlFor="spouseAddress">Spouse's Address (if different)</Label>
                     <Input id="spouseAddress" value={data.spouse?.address || ''} onChange={(e)=> setData({...data, spouse: {...(data.spouse||emptyPerson()), address: e.target.value}})} placeholder="Optional if same as yours" />
                   </div>
                 </div>
               ) : (
                 <p className="text-muted-foreground">You indicated you are not married. Skip to the next step.</p>
               )}
                <div className="mt-4">
                  <VoiceButton onResult={(text) => {
                    setData(prev => ({ ...prev, address: text.trim() }));
                  }} />
                </div>
               {StepActions}
             </div>
           )}

           {step === 3 && (
             <div>
               <h2 className="text-2xl mb-4">Beneficiaries</h2>
               <p className="text-sm text-muted-foreground mb-4">List the people who will inherit from your estate.</p>
               {data.beneficiaries.map((b, i) => (
                 <Card key={i} className="mb-4">
                   <CardHeader>
                     <CardTitle className="text-lg">Beneficiary {i + 1}</CardTitle>
                   </CardHeader>
                   <CardContent>
                     <div className="grid gap-4 md:grid-cols-3">
                       <div>
                         <Label htmlFor={`ben-name-${i}`}>Name</Label>
                         <Input id={`ben-name-${i}`} value={b.name} onChange={(e)=> {
                           const list = [...data.beneficiaries];
                           list[i] = {...b, name: e.target.value};
                           setData({...data, beneficiaries: list});
                         }} placeholder="Full name" />
                       </div>
                       <div>
                         <Label htmlFor={`ben-dob-${i}`}>Date of Birth</Label>
                         <Input id={`ben-dob-${i}`} type="date" value={b.dob} onChange={(e)=> {
                           const list = [...data.beneficiaries];
                           list[i] = {...b, dob: e.target.value};
                           setData({...data, beneficiaries: list});
                         }} />
                       </div>
                       <div>
                         <Label htmlFor={`ben-rel-${i}`}>Relationship</Label>
                         <Input id={`ben-rel-${i}`} value={b.relationship} onChange={(e)=> {
                           const list = [...data.beneficiaries];
                           list[i] = {...b, relationship: e.target.value};
                           setData({...data, beneficiaries: list});
                         }} placeholder="Son, Daughter, Friend" />
                       </div>
                     </div>
                     {data.beneficiaries.length > 1 && (
                       <Button variant="destructive" size="sm" className="mt-2" onClick={()=> {
                         const list = data.beneficiaries.filter((_, idx) => idx !== i);
                         setData({...data, beneficiaries: list});
                       }}>Remove</Button>
                     )}
                   </CardContent>
                 </Card>
               ))}
               <Button variant="outline" onClick={()=> setData({...data, beneficiaries: [...data.beneficiaries, {name: '', dob: '', relationship: ''}]})}>Add Beneficiary</Button>
                <div className="mt-4">
                  <VoiceButton onResult={(text) => {
                    // Add voice input for beneficiaries section
                    toast.info("Voice input recorded: " + text.trim());
                  }} />
                </div>
               {StepActions}
             </div>
           )}

           {step === 4 && (
             <div>
               <h2 className="text-2xl mb-4">Executor</h2>
               <p className="text-sm text-muted-foreground mb-4">Choose someone you trust to carry out your wishes.</p>
               
               <Card className="mb-4">
                 <CardHeader>
                   <CardTitle className="text-lg">Primary Executor</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="grid gap-4 md:grid-cols-2">
                     <div>
                       <Label htmlFor="exec-name">Name *</Label>
                       <Input id="exec-name" value={data.executor.name || ''} onChange={(e)=> setData({...data, executor: {...data.executor, name: e.target.value}})} placeholder="Full name" />
                     </div>
                     <div>
                       <Label htmlFor="exec-rel">Relationship</Label>
                       <Input id="exec-rel" value={data.executor.relationship || ''} onChange={(e)=> setData({...data, executor: {...data.executor, relationship: e.target.value}})} placeholder="Friend, Family, Attorney" />
                     </div>
                     <div className="md:col-span-2">
                       <Label htmlFor="exec-address">Address</Label>
                       <Input id="exec-address" value={data.executor.address || ''} onChange={(e)=> setData({...data, executor: {...data.executor, address: e.target.value}})} placeholder="123 Main St, City, ST 12345" />
                     </div>
                   </div>
                 </CardContent>
               </Card>

               <Card>
                 <CardHeader>
                   <CardTitle className="text-lg">Alternate Executor (Optional)</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="grid gap-4 md:grid-cols-2">
                     <div>
                       <Label htmlFor="alt-exec-name">Name</Label>
                       <Input id="alt-exec-name" value={data.altExecutor?.name || ''} onChange={(e)=> setData({...data, altExecutor: {...(data.altExecutor||emptyPerson()), name: e.target.value}})} placeholder="Full name" />
                     </div>
                     <div>
                       <Label htmlFor="alt-exec-rel">Relationship</Label>
                       <Input id="alt-exec-rel" value={data.altExecutor?.relationship || ''} onChange={(e)=> setData({...data, altExecutor: {...(data.altExecutor||emptyPerson()), relationship: e.target.value}})} placeholder="Friend, Family, Attorney" />
                     </div>
                     <div className="md:col-span-2">
                       <Label htmlFor="alt-exec-address">Address</Label>
                       <Input id="alt-exec-address" value={data.altExecutor?.address || ''} onChange={(e)=> setData({...data, altExecutor: {...(data.altExecutor||emptyPerson()), address: e.target.value}})} placeholder="123 Main St, City, ST 12345" />
                     </div>
                   </div>
                 </CardContent>
               </Card>
               
                <div className="mt-4">
                  <VoiceButton onResult={(text) => {
                    setData(prev => ({ ...prev, executor: { ...prev.executor, name: text.trim() } }));
                  }} />
                </div>
               {StepActions}
             </div>
           )}

           {step === 5 && (
             <div>
               <h2 className="text-2xl mb-4">Guardians for Minor Children</h2>
               <p className="text-sm text-muted-foreground mb-4">If you have minor children, specify who should care for them.</p>
               
               <div className="mb-6">
                 <div className="flex items-center space-x-2">
                   <input
                     type="checkbox"
                     id="addGuardians"
                     checked={data.addGuardians}
                     onChange={(e) => setData({ ...data, addGuardians: e.target.checked })}
                     className="rounded border-input"
                   />
                   <Label htmlFor="addGuardians">I have minor children and need to designate guardians</Label>
                 </div>
               </div>

               {data.addGuardians && (
                 <>
                   <Card className="mb-4">
                     <CardHeader>
                       <CardTitle className="text-lg">Primary Guardian</CardTitle>
                     </CardHeader>
                     <CardContent>
                       <div className="grid gap-4 md:grid-cols-2">
                         <div>
                           <Label htmlFor="guard-name">Name *</Label>
                           <Input id="guard-name" value={data.guardian?.name || ''} onChange={(e)=> setData({...data, guardian: {...(data.guardian||emptyPerson()), name: e.target.value}})} placeholder="Full name" />
                         </div>
                         <div>
                           <Label htmlFor="guard-rel">Relationship</Label>
                           <Input id="guard-rel" value={data.guardian?.relationship || ''} onChange={(e)=> setData({...data, guardian: {...(data.guardian||emptyPerson()), relationship: e.target.value}})} placeholder="Sister, Brother, Friend" />
                         </div>
                         <div className="md:col-span-2">
                           <Label htmlFor="guard-address">Address</Label>
                           <Input id="guard-address" value={data.guardian?.address || ''} onChange={(e)=> setData({...data, guardian: {...(data.guardian||emptyPerson()), address: e.target.value}})} placeholder="123 Main St, City, ST 12345" />
                         </div>
                       </div>
                       <div className="mt-4">
                         <Label htmlFor="guard-instructions">Special Instructions for Guardian</Label>
                         <div className="flex gap-2 mt-1">
                           <Textarea 
                             id="guard-instructions" 
                             value={data.guardianInstructions || ''} 
                             onChange={(e)=> setData({...data, guardianInstructions: e.target.value})} 
                             placeholder="Any specific wishes about how your children should be raised..." 
                             className="flex-1"
                           />
                           <Button 
                             size="sm" 
                             variant="outline" 
                             onClick={() => generateGuardianClause(true)}
                             disabled={guardianLoadingPrimary}
                           >
                             {guardianLoadingPrimary ? 'AI...' : 'AI Suggest'}
                           </Button>
                         </div>
                       </div>
                     </CardContent>
                   </Card>

                   <Card>
                     <CardHeader>
                       <CardTitle className="text-lg">Alternate Guardian (Optional)</CardTitle>
                     </CardHeader>
                     <CardContent>
                       <div className="grid gap-4 md:grid-cols-2">
                         <div>
                           <Label htmlFor="alt-guard-name">Name</Label>
                           <Input id="alt-guard-name" value={data.altGuardian?.name || ''} onChange={(e)=> setData({...data, altGuardian: {...(data.altGuardian||emptyPerson()), name: e.target.value}})} placeholder="Full name" />
                         </div>
                         <div>
                           <Label htmlFor="alt-guard-rel">Relationship</Label>
                           <Input id="alt-guard-rel" value={data.altGuardian?.relationship || ''} onChange={(e)=> setData({...data, altGuardian: {...(data.altGuardian||emptyPerson()), relationship: e.target.value}})} placeholder="Sister, Brother, Friend" />
                         </div>
                         <div className="md:col-span-2">
                           <Label htmlFor="alt-guard-address">Address</Label>
                           <Input id="alt-guard-address" value={data.altGuardian?.address || ''} onChange={(e)=> setData({...data, altGuardian: {...(data.altGuardian||emptyPerson()), address: e.target.value}})} placeholder="123 Main St, City, ST 12345" />
                         </div>
                       </div>
                       <div className="mt-4">
                         <Label htmlFor="alt-guard-instructions">Special Instructions for Alternate Guardian</Label>
                         <div className="flex gap-2 mt-1">
                           <Textarea 
                             id="alt-guard-instructions" 
                             value={data.altGuardianInstructions || ''} 
                             onChange={(e)=> setData({...data, altGuardianInstructions: e.target.value})} 
                             placeholder="Any specific wishes for the alternate guardian..." 
                             className="flex-1"
                           />
                           <Button 
                             size="sm" 
                             variant="outline" 
                             onClick={() => generateGuardianClause(false)}
                             disabled={guardianLoadingAlt}
                           >
                             {guardianLoadingAlt ? 'AI...' : 'AI Suggest'}
                           </Button>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 </>
               )}
               
                <div className="mt-4">
                  <VoiceButton onResult={(text) => {
                    setData(prev => ({ ...prev, guardian: { ...prev.guardian, name: text.trim() } }));
                  }} />
                </div>
               {StepActions}
             </div>
           )}

           {step === 6 && (
             <div>
               <h2 className="text-2xl mb-4">Specific Gifts</h2>
               <p className="text-sm text-muted-foreground mb-4">Leave specific items to specific people (optional).</p>
               
               {data.gifts.map((gift, i) => (
                 <Card key={i} className="mb-4">
                   <CardHeader>
                     <CardTitle className="text-lg">Gift {i + 1}</CardTitle>
                   </CardHeader>
                   <CardContent>
                     <div className="grid gap-4 md:grid-cols-2">
                       <div>
                         <Label htmlFor={`gift-desc-${i}`}>Item Description</Label>
                         <div className="flex gap-2">
                           <Input 
                             id={`gift-desc-${i}`} 
                             value={gift.description} 
                             onChange={(e)=> {
                               const list = [...data.gifts];
                               list[i] = {...gift, description: e.target.value};
                               setData({...data, gifts: list});
                             }} 
                             placeholder="e.g., Grandmother's ring, Car, $5000" 
                             className="flex-1"
                           />
                           <Button 
                             size="sm" 
                             variant="outline" 
                             onClick={() => generateGiftClause(i)}
                             disabled={giftLoadingIdx === i}
                           >
                             {giftLoadingIdx === i ? 'AI...' : 'AI'}
                           </Button>
                         </div>
                       </div>
                       <div>
                         <Label htmlFor={`gift-ben-${i}`}>Give to</Label>
                         <Input 
                           id={`gift-ben-${i}`} 
                           value={gift.beneficiary} 
                           onChange={(e)=> {
                             const list = [...data.gifts];
                             list[i] = {...gift, beneficiary: e.target.value};
                             setData({...data, gifts: list});
                           }} 
                           placeholder="Beneficiary name" 
                         />
                       </div>
                     </div>
                     <Button variant="destructive" size="sm" className="mt-2" onClick={()=> {
                       const list = data.gifts.filter((_, idx) => idx !== i);
                       setData({...data, gifts: list});
                     }}>Remove Gift</Button>
                   </CardContent>
                 </Card>
               ))}
               
               <Button variant="outline" onClick={()=> setData({...data, gifts: [...data.gifts, {description: '', beneficiary: ''}]})}>Add Gift</Button>
               
                <div className="mt-4">
                  <VoiceButton onResult={(text) => {
                    // Add voice input for gifts section
                    toast.info("Voice input recorded: " + text.trim());
                  }} />
                </div>
               {StepActions}
             </div>
           )}

           {step === 7 && (
             <div>
               <h2 className="text-2xl mb-4">Residuary Estate</h2>
               <p className="text-sm text-muted-foreground mb-4">How should the rest of your estate be distributed?</p>
               
               {data.residue.map((r, i) => (
                 <Card key={i} className="mb-4">
                   <CardHeader>
                     <CardTitle className="text-lg">Residue Split {i + 1}</CardTitle>
                   </CardHeader>
                   <CardContent>
                     <div className="grid gap-4 md:grid-cols-2">
                       <div>
                         <Label htmlFor={`res-ben-${i}`}>Beneficiary</Label>
                         <Input 
                           id={`res-ben-${i}`} 
                           value={r.beneficiary} 
                           onChange={(e)=> {
                             const list = [...data.residue];
                             list[i] = {...r, beneficiary: e.target.value};
                             setData({...data, residue: list});
                           }} 
                           placeholder="Full name" 
                         />
                       </div>
                       <div>
                         <Label htmlFor={`res-pct-${i}`}>Percentage</Label>
                         <Input 
                           id={`res-pct-${i}`} 
                           type="number" 
                           min="0" 
                           max="100" 
                           value={r.percentage} 
                           onChange={(e)=> {
                             const list = [...data.residue];
                             list[i] = {...r, percentage: e.target.value};
                             setData({...data, residue: list});
                           }} 
                           placeholder="0-100" 
                         />
                       </div>
                     </div>
                     {data.residue.length > 1 && (
                       <Button variant="destructive" size="sm" className="mt-2" onClick={()=> {
                         const list = data.residue.filter((_, idx) => idx !== i);
                         setData({...data, residue: list});
                       }}>Remove</Button>
                     )}
                   </CardContent>
                 </Card>
               ))}
               
               <div className="mb-4">
                 <p className="text-sm">Total: {residueSum}% {residueSum !== 100 && <span className="text-destructive">(Must equal 100%)</span>}</p>
               </div>
               
               <Button variant="outline" onClick={()=> setData({...data, residue: [...data.residue, {beneficiary: '', percentage: '0'}]})}>Add Split</Button>
               
                <div className="mt-4">
                  <VoiceButton onResult={(text) => {
                    // Add voice input for residue section
                    toast.info("Voice input recorded: " + text.trim());
                  }} />
                </div>
               {StepActions}
             </div>
           )}

           {step === 8 && (
             <div>
               <h2 className="text-2xl mb-4">Pet Care</h2>
               <p className="text-sm text-muted-foreground mb-4">Arrangements for pets (optional).</p>
               
               <div className="grid gap-4 md:grid-cols-2 mb-4">
                 <div>
                   <Label htmlFor="petName">Pet Name</Label>
                   <Input id="petName" value={data.petName || ''} onChange={(e)=> setData({...data, petName: e.target.value})} placeholder="Fluffy" />
                 </div>
                 <div>
                   <Label htmlFor="petType">Pet Type</Label>
                   <Input id="petType" value={data.petType || ''} onChange={(e)=> setData({...data, petType: e.target.value})} placeholder="Dog, Cat, etc." />
                 </div>
                 <div className="md:col-span-2">
                   <Label htmlFor="petCaregiver">Pet Caregiver</Label>
                   <Input id="petCaregiver" value={data.petCaregiver || ''} onChange={(e)=> setData({...data, petCaregiver: e.target.value})} placeholder="Name of person to care for pet" />
                 </div>
               </div>
               
               <div className="mb-4">
                 <Label htmlFor="petInstructions">Pet Care Instructions</Label>
                 <div className="flex gap-2 mt-1">
                   <Textarea 
                     id="petInstructions" 
                     value={data.petInstructions || ''} 
                     onChange={(e)=> setData({...data, petInstructions: e.target.value})} 
                     placeholder="Special care instructions, preferred vet, etc." 
                     className="flex-1"
                   />
                   <Button 
                     size="sm" 
                     variant="outline" 
                     onClick={generatePetClause}
                     disabled={petLoading}
                   >
                     {petLoading ? 'AI...' : 'AI Suggest'}
                   </Button>
                 </div>
               </div>
               
                <div className="mt-4">
                  <VoiceButton onResult={(text) => {
                    setData(prev => ({ ...prev, petName: text.trim() }));
                  }} />
                </div>
               {StepActions}
             </div>
           )}

           {step === 9 && (
             <div>
               <h2 className="text-2xl mb-4">Funeral Arrangements</h2>
               <p className="text-sm text-muted-foreground mb-4">Your preferences for final arrangements.</p>
               
               <div className="mb-4">
                 <Label htmlFor="funeralPreference">Preference</Label>
                 <Select value={data.funeralPreference} onValueChange={(v)=> setData({...data, funeralPreference: v as any})}>
                   <SelectTrigger><SelectValue placeholder="Select preference" /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="burial">Burial</SelectItem>
                     <SelectItem value="cremation">Cremation</SelectItem>
                     <SelectItem value="no_preference">No Preference</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               
               <div className="mb-4">
                 <Label htmlFor="funeralInstructions">Special Instructions</Label>
                 <div className="flex gap-2 mt-1">
                   <Textarea 
                     id="funeralInstructions" 
                     value={data.funeralInstructions} 
                     onChange={(e)=> setData({...data, funeralInstructions: e.target.value})} 
                     placeholder="Memorial service preferences, specific requests, etc." 
                     className="flex-1"
                   />
                   <Button 
                     size="sm" 
                     variant="outline" 
                     onClick={generateFuneralInstructionsWithAI}
                     disabled={funeralLoading}
                   >
                     {funeralLoading ? 'AI...' : 'AI Suggest'}
                   </Button>
                 </div>
               </div>
               
                <div className="mt-4">
                  <VoiceButton onResult={(text) => {
                    setData(prev => ({ ...prev, funeralInstructions: text.trim() }));
                  }} />
                </div>
               {StepActions}
             </div>
           )}

           {step === 10 && (
             <div>
               <h2 className="text-2xl mb-4">Witnesses</h2>
               <p className="text-sm text-muted-foreground mb-4">Names of people who will witness your signature.</p>
               
               <div className="grid gap-4">
                 <div>
                   <Label htmlFor="witness1">Witness 1</Label>
                   <Input 
                     id="witness1" 
                     value={data.witnesses[0] || ''} 
                     onChange={(e)=> {
                       const list = [...data.witnesses];
                       list[0] = e.target.value;
                       setData({...data, witnesses: list});
                     }} 
                     placeholder="Full name" 
                   />
                 </div>
                 <div>
                   <Label htmlFor="witness2">Witness 2</Label>
                   <Input 
                     id="witness2" 
                     value={data.witnesses[1] || ''} 
                     onChange={(e)=> {
                       const list = [...data.witnesses];
                       list[1] = e.target.value;
                       setData({...data, witnesses: list});
                     }} 
                     placeholder="Full name" 
                   />
                 </div>
               </div>
               
                {/* VoiceButton previously wrote to an unused `additionalWishes` key.
                    The witnesses step has two explicit inputs above; no free-form
                    voice capture belongs here, so the button was removed. */}
               {StepActions}
             </div>
           )}

           {step === 11 && (
             <div>
               <h2 className="text-2xl mb-4">Review & Export</h2>
               
               {validationIssues.length > 0 && (
                 <div className="mb-6 p-4 border border-orange-200 bg-orange-50 rounded-lg">
                   <h3 className="font-medium text-orange-800 mb-2">Please address these issues:</h3>
                   <ul className="list-disc list-inside text-sm text-orange-700 space-y-1">
                     {validationIssues.map((issue, i) => (
                       <li key={i}>{issue}</li>
                     ))}
                   </ul>
                 </div>
               )}
               
               <div className="mb-6">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-xl font-medium">AI Review</h3>
                   <Button 
                     variant="outline" 
                     onClick={runAIReview} 
                     disabled={reviewLoading}
                   >
                     {reviewLoading ? 'Reviewing...' : 'Run AI Review'}
                   </Button>
                 </div>
                 
                 {aiReview && (
                   <div className="space-y-4">
                     {aiReview.issues.length > 0 && (
                       <Card className="border-red-200">
                         <CardHeader>
                           <CardTitle className="text-red-800">Issues Found</CardTitle>
                         </CardHeader>
                         <CardContent>
                           <ul className="space-y-2">
                             {aiReview.issues.map((issue, i) => (
                               <li key={i} className="flex items-center justify-between p-2 bg-red-50 rounded">
                                 <span className="text-sm text-red-700">{issue}</span>
                                 <div className="flex gap-1">
                                   <Button 
                                     size="sm" 
                                     variant="outline" 
                                     onClick={() => handleFixIssue(issue)}
                                     disabled={fixingKey === issue}
                                   >
                                     {fixingKey === issue ? 'Fixing...' : 'Fix'}
                                   </Button>
                                   <Button 
                                     size="sm" 
                                     variant="ghost" 
                                     onClick={() => handleExplainIssue(issue)}
                                   >
                                     Explain
                                   </Button>
                                 </div>
                               </li>
                             ))}
                           </ul>
                         </CardContent>
                       </Card>
                     )}
                     
                     {aiReview.risks.length > 0 && (
                       <Card className="border-orange-200">
                         <CardHeader>
                           <CardTitle className="text-orange-800">Potential Risks</CardTitle>
                         </CardHeader>
                         <CardContent>
                           <ul className="space-y-2">
                             {aiReview.risks.map((risk, i) => (
                               <li key={i} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                                 <span className="text-sm text-orange-700">{risk}</span>
                                 <Button 
                                   size="sm" 
                                   variant="ghost" 
                                   onClick={() => handleExplainIssue(risk)}
                                 >
                                   Explain
                                 </Button>
                               </li>
                             ))}
                           </ul>
                         </CardContent>
                       </Card>
                     )}
                     
                     {aiReview.missing.length > 0 && (
                       <Card className="border-blue-200">
                         <CardHeader>
                           <CardTitle className="text-blue-800">Suggestions</CardTitle>
                         </CardHeader>
                         <CardContent>
                           <ul className="space-y-2">
                             {aiReview.missing.map((suggestion, i) => (
                               <li key={i} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                                 <span className="text-sm text-blue-700">{suggestion}</span>
                                 <Button 
                                   size="sm" 
                                   variant="ghost" 
                                   onClick={() => handleExplainIssue(suggestion)}
                                 >
                                   Explain
                                 </Button>
                               </li>
                             ))}
                           </ul>
                         </CardContent>
                       </Card>
                     )}
                     
                     {aiReview.summary && (
                       <Card className="border-green-200">
                         <CardHeader>
                           <CardTitle className="text-green-800">Summary</CardTitle>
                         </CardHeader>
                         <CardContent>
                           <p className="text-sm text-green-700">{aiReview.summary}</p>
                         </CardContent>
                       </Card>
                     )}
                   </div>
                 )}
               </div>
               
               <div>
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-xl font-serifBrand">Draft Preview</h3>
                 </div>
                 <pre className="whitespace-pre-wrap bg-secondary/60 p-4 rounded-md text-sm mb-6">{draft}</pre>
                 
                 <div className="flex items-center justify-between">
                   <Button variant="outline" onClick={()=> setStep(1)}>Edit from Start</Button>
                    <div className="flex gap-2">
                      <Button variant="hero" onClick={handleExportPDF} disabled={!canComplete} title={!canComplete ? 'Resolve validation issues first' : undefined}>Download PDF</Button>
                      <Button variant="outline" onClick={handleExportDocx} disabled={!canComplete} title={!canComplete ? 'Resolve validation issues first' : undefined}>Export DOCX</Button>
                      <Button variant="secondary" onClick={handleSaveShare} disabled={saving || !canComplete} title={!canComplete ? 'Resolve validation issues first' : undefined}>Save & Share</Button>
                    </div>
                 </div>
               </div>
             </div>
           )}
             </div>
           </div>
         </div>

        </section>

        {/* Suggestion Review Dialog */}
        <SuggestionReviewDialog
          open={!!pendingSuggestion}
          suggestion={pendingSuggestion?.suggestion || ''}
          onAppend={() => {
            if (!pendingSuggestion) return;
            const s = pendingSuggestion.suggestion;
            if (pendingSuggestion.target === 'funeral') {
              const prev = data.funeralInstructions || '';
              setData({ ...data, funeralInstructions: prev ? `${prev}\n${s}` : s });
              setUndoAction(()=> () => setData({ ...data, funeralInstructions: prev }));
            } else if (pendingSuggestion.target === 'pet') {
              const prev = data.petInstructions || '';
              setData({ ...data, petInstructions: prev ? `${prev}\n${s}` : s });
              setUndoAction(()=> () => setData({ ...data, petInstructions: prev }));
            } else if (pendingSuggestion.target === 'guardian') {
              const prev = data.guardianInstructions || '';
              setData({ ...data, guardianInstructions: prev ? `${prev}\n${s}` : s });
              setUndoAction(()=> () => setData({ ...data, guardianInstructions: prev }));
            } else if (pendingSuggestion.target === 'altGuardian') {
              const prev = data.altGuardianInstructions || '';
              setData({ ...data, altGuardianInstructions: prev ? `${prev}\n${s}` : s });
              setUndoAction(()=> () => setData({ ...data, altGuardianInstructions: prev }));
            } else if (pendingSuggestion.target === 'gift') {
              const idx = pendingSuggestion.index ?? 0;
              const list = [...data.gifts];
              const current = list[idx] || { description: '', beneficiary: '' };
              const prev = current.description || '';
              list[idx] = { ...current, description: prev ? `${prev} ${s}` : s };
              setData({ ...data, gifts: list });
              setUndoAction(()=> () => {
                const l2 = [...list];
                const cur2 = l2[idx] || { description: '', beneficiary: '' };
                l2[idx] = { ...cur2, description: prev };
                setData({ ...data, gifts: l2 });
              });
            }
            setPendingSuggestion(null);
            toast.success('Inserted');
          }}
          onReplace={() => {
            if (!pendingSuggestion) return;
            const s = pendingSuggestion.suggestion;
            if (pendingSuggestion.target === 'funeral') {
              const prev = data.funeralInstructions || '';
              setData({ ...data, funeralInstructions: s });
              setUndoAction(()=> () => setData({ ...data, funeralInstructions: prev }));
            } else if (pendingSuggestion.target === 'pet') {
              const prev = data.petInstructions || '';
              setData({ ...data, petInstructions: s });
              setUndoAction(()=> () => setData({ ...data, petInstructions: prev }));
            } else if (pendingSuggestion.target === 'guardian') {
              const prev = data.guardianInstructions || '';
              setData({ ...data, guardianInstructions: s });
              setUndoAction(()=> () => setData({ ...data, guardianInstructions: prev }));
            } else if (pendingSuggestion.target === 'altGuardian') {
              const prev = data.altGuardianInstructions || '';
              setData({ ...data, altGuardianInstructions: s });
              setUndoAction(()=> () => setData({ ...data, altGuardianInstructions: prev }));
            } else if (pendingSuggestion.target === 'gift') {
              const idx = pendingSuggestion.index ?? 0;
              const list = [...data.gifts];
              const current = list[idx] || { description: '', beneficiary: '' };
              const prev = current.description || '';
              list[idx] = { ...current, description: s };
              setData({ ...data, gifts: list });
              setUndoAction(()=> () => {
                const l2 = [...list];
                const cur2 = l2[idx] || { description: '', beneficiary: '' };
                l2[idx] = { ...cur2, description: prev };
                setData({ ...data, gifts: l2 });
              });
            }
            setPendingSuggestion(null);
            toast.success('Inserted');
          }}
          onClose={() => setPendingSuggestion(null)}
        />

        <CopilotPanel
          open={openCopilot}
          onOpenChange={setOpenCopilot}
          data={data}
          draft={draft}
          tone={tone}
          onToneChange={(t)=> setTone(t)}
          currentStep={step}
          onPropose={(text, target, index)=> setPendingSuggestion({ target, index, suggestion: text })}
          onVoiceAutoFill={handleVoiceAutoFill}
          seedPrompt={seedPrompt}
        />
      </main>
    );
  };

export default WillCreator;