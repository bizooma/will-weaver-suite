import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
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
   const r = parseInt(m[1],16)/255, g=parseInt(m[2],16)/255, b=parseInt(m[3],16)/255;
   const max=Math.max(r,g,b), min=Math.min(r,g,b);
   let h=0,s=0,l=(max+min)/2;
   if(max!==min){
     const d=max-min;
     s=l>0.5? d/(2-max-min): d/(max+min);
     switch(max){
       case r: h=(g-b)/d+(g<b?6:0); break;
       case g: h=(b-r)/d+2; break;
       case b: h=(r-g)/d+4; break;
     }
     h/=6;
   }
   return `${Math.round(h*360)} ${Math.round(s*100)}% ${Math.round(l*100)}%`;
 }

 const canonical = typeof window !== 'undefined' ? window.location.origin + "/will-creator" : "/will-creator";

 const TOTAL_STEPS = 11; // 10 data steps + Review/Generate

  const usStates = [
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"
  ];

  function guessStepForText(text: string): number {
    const t = text.toLowerCase();
    if (t.includes('beneficiar') || t.includes('child')) return 3;
    if (t.includes('executor')) return 4;
    if (t.includes('guardian')) return 5;
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

    const validationIssues = useMemo(() => {
      const issues: string[] = [];
      if (!data.fullName) issues.push('Missing full legal name');
      if (!data.state) issues.push('Missing state of residence');
      if (!data.executor.name) issues.push('Missing executor name');
      if (data.addGuardians && !data.guardian?.name) issues.push('Guardian name required when guardians are enabled');
      const sum = data.residue.reduce((sum, r)=> sum + (parseFloat(r.percentage||'0') || 0), 0);
      if (Math.round(sum) !== 100) issues.push('Residue total must equal 100%');
      return issues;
    }, [data]);
  
   const next = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1));
   const prev = () => setStep((s) => Math.max(1, s - 1));
 
   // White-label + default brand colors from legallyinnovative.com (navy + gold)
   useEffect(() => {
     const params = new URLSearchParams(window.location.search);
     const brandName = params.get('brand');
     const primary = params.get('primary');
     const accent = params.get('accent');
     const logo = params.get('logo');
     if (brandName) setBrand(brandName);
     if (logo) setLogoUrl(logo);

     // Defaults to Legally Innovative palette if not provided
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
            toast.error('Draft not found');
          }
        } catch (e) {
          console.error(e);
          toast.error('Failed to load draft');
        }
      })();
    }, [isDemo]);

    useEffect(() => {
      if (!isDemo) return;
      // Seed sample data and auto-advance a few steps
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
      setStep(1);
      const id = setInterval(() => {
        setStep((s) => {
          if (s >= 6) { clearInterval(id); return s; }
          return s + 1;
        });
      }, 1200);
      return () => clearInterval(id);
    }, [isDemo]);

    const title = brand ? `${brand} Will & Trust Creator` : "Will & Trust Creator";
 
    // Draft text
   const draft = useMemo(() => {
     const bList = data.beneficiaries.filter(b=>b.name).map((b,i)=>`${i+1}) ${b.name}${b.dob?` (b. ${b.dob})`:''} – ${b.relationship}`).join("\n");
     const gList = data.gifts.map((g,i)=>`${i+1}) ${g.description} → ${g.beneficiary}`).join("\n");
     const rList = data.residue.map(r=>`${r.beneficiary}: ${r.percentage}%`).join(', ');
     const witnessLine = data.witnesses.filter(Boolean).join(', ');

     return `This is an automatically generated draft for demonstration purposes only and is not legal advice. Please consult a licensed attorney before signing any legal document.\n\n` +
`Last Will and Testament\n\n` +
`I, ${data.fullName || '[Full legal name]'}, born ${data.dob || '[DOB]'}, presently residing at ${data.address || '[Address]'}, in the State of ${data.state || '[State]'}, being of sound mind, declare this to be my Last Will and Testament.\n\n` +
`Article I – Family\n` +
`Marital status: ${data.maritalStatus || '[Status]'}${data.spouse?.name ? `; Spouse: ${data.spouse.name}${data.spouse.dob?` (b. ${data.spouse.dob})`:''}`:''}.\n\n` +
`Article II – Beneficiaries\n` +
`${bList || '[List primary beneficiaries with relationships]'}\n\n` +
`Article III – Appointment of Executor\n` +
`I appoint ${data.executor.name || '[Executor Name]'}${data.executor.relationship?`, my ${data.executor.relationship}`:''}, of ${data.executor.address || '[Executor Address]'}, to serve as Executor of this Will.${data.altExecutor?.name ? ` If ${data.executor.name || 'the Executor'} is unable or unwilling to serve, I appoint ${data.altExecutor.name}${data.altExecutor.relationship?`, my ${data.altExecutor.relationship}`:''} as alternate.`:''}\n\n` +
`Article IV – Guardians for Minor Children\n` +
`${data.addGuardians ? `I appoint ${data.guardian?.name || '[Guardian]'}${data.guardian?.relationship?`, my ${data.guardian?.relationship}`:''} of ${data.guardian?.address || '[Address]'} as Guardian of my minor children.${data.altGuardian?.name ? ` If unable or unwilling, I appoint ${data.altGuardian?.name} as alternate.`:''}` : '[If applicable, designate guardians]'}${data.guardianInstructions ? ` ${data.guardianInstructions}` : ''}${data.altGuardianInstructions ? ` ${data.altGuardianInstructions}` : ''}\n\n` +
`Article V – Specific Gifts\n` +
`${gList || '[Itemize specific bequests]'}\n\n` +
`Article VI – Residue of Estate\n` +
`I give the remainder of my estate as follows: ${rList || '[e.g., 100% to Spouse]'}\n\n` +
`Article VII – Pet Care Provisions\n` +
`${data.petName ? `${data.petName} (${data.petType || 'pet'}) to be cared for by ${data.petCaregiver || '[Caregiver]'}.` : '[Optional – designate caregiver for pets]'}${data.petInstructions ? ` ${data.petInstructions}` : ''}\n\n` +
`Article VIII – Funeral & Burial Wishes\n` +
`Preference: ${data.funeralPreference || '[No preference]'}${data.funeralInstructions ? `; Instructions: ${data.funeralInstructions}` : ''}.\n\n` +
`Article IX – Execution\n` +
`Signed on ____________ at ______________________. Witnesses: ${witnessLine || '[Witnesses]'}\n`;
   }, [data]);

   const progressValue = (step / TOTAL_STEPS) * 100;

   async function generateFuneralInstructionsWithAI() {
     if (isDemo) { toast.info('Demo mode: AI actions are disabled here.'); return; }
     try {
        const { data: res, error } = await supabase.functions.invoke('ai-generate-clause', {
          body: {
            field: 'funeral_instructions',
            data: {
              fullName: data.fullName,
              spouse: data.spouse?.name,
              state: data.state,
              preference: data.funeralPreference,
              notes: data.funeralInstructions,
            },
            tone,
          }
        });
       if (error) throw error;
        if (res?.result) {
          setPendingSuggestion({ target: 'funeral', suggestion: res.result });
        } else {
          toast.error('AI did not return content');
        }
     } catch (e) {
       console.error(e);
       toast.error('AI drafting failed');
     } finally {
       setFuneralLoading(false);
     }
   }
 
   async function generateGiftClause(idx: number) {
     if (isDemo) { toast.info('Demo mode: AI actions are disabled here.'); return; }
     try {
       setGiftLoadingIdx(idx);
       const g = data.gifts[idx];
        const { data: res, error } = await supabase.functions.invoke('ai-generate-clause', {
          body: {
            field: 'specific_gift',
            data: {
              fullName: data.fullName,
              state: data.state,
              description: g?.description,
              beneficiary: g?.beneficiary,
            },
            tone,
          }
        });
       if (error) throw error;
        if (res?.result) {
          setPendingSuggestion({ target: 'gift', index: idx, suggestion: res.result });
        } else {
          toast.error('AI did not return content');
        }
     } catch (e) {
       console.error(e);
       toast.error('AI drafting failed');
     } finally {
       setGiftLoadingIdx(null);
     }
   }
 
   async function generateGuardianClause(which: 'primary' | 'alternate') {
     if (isDemo) { toast.info('Demo mode: AI actions are disabled here.'); return; }
     try {
       if (which === 'primary') setGuardianLoadingPrimary(true); else setGuardianLoadingAlt(true);
        const { data: res, error } = await supabase.functions.invoke('ai-generate-clause', {
          body: {
            field: 'guardian_clause',
            data: {
              fullName: data.fullName,
              state: data.state,
              guardian: data.guardian,
              altGuardian: data.altGuardian,
              addGuardians: data.addGuardians,
            },
            tone,
          }
        });
       if (error) throw error;
        if (res?.result) {
          setPendingSuggestion({ target: which === 'primary' ? 'guardian' : 'altGuardian', suggestion: res.result });
        } else {
          toast.error('AI did not return content');
        }
     } catch (e) {
       console.error(e);
       toast.error('AI drafting failed');
     } finally {
       if (which === 'primary') setGuardianLoadingPrimary(false); else setGuardianLoadingAlt(false);
     }
   }
 
   async function generatePetClause() {
     if (isDemo) { toast.info('Demo mode: AI actions are disabled here.'); return; }
     try {
       setPetLoading(true);
        const { data: res, error } = await supabase.functions.invoke('ai-generate-clause', {
          body: {
            field: 'pet_care',
            data: {
              fullName: data.fullName,
              state: data.state,
              petName: data.petName,
              petType: data.petType,
              caregiver: data.petCaregiver,
            },
            tone,
          }
        });
       if (error) throw error;
        if (res?.result) {
          setPendingSuggestion({ target: 'pet', suggestion: res.result });
        } else {
          toast.error('AI did not return content');
        }
     } catch (e) {
       console.error(e);
       toast.error('AI drafting failed');
     } finally {
       setPetLoading(false);
     }
   }
 
   async function runAIReview() {
     if (isDemo) { toast.info('Demo mode: AI review is disabled.'); return; }
     try {
       setReviewLoading(true);
       const { data: res, error } = await supabase.functions.invoke('ai-review-will', {
         body: { draft, state: data.state }
       });
       if (error) throw error;
       if (res) {
         const normalized = {
           issues: (res as any).issues || [],
           risks: (res as any).risks || [],
           missing: (res as any).missing || (res as any).missingInfo || [],
           summary: (res as any).summary || '',
           checklist: (res as any).checklist || [],
         };
         setAiReview(normalized);
         toast.success('AI review ready');
       }
     } catch (e) {
       console.error(e);
       toast.error('AI review failed');
      } finally {
        setReviewLoading(false);
      }
    }

    const stepToTarget = (s: number): 'funeral' | 'pet' | 'guardian' | 'altGuardian' | 'gift' | null => {
      switch (s) {
        case 5: return 'guardian';
        case 6: return 'gift';
        case 8: return 'pet';
        case 9: return 'funeral';
        default: return null;
      }
    };

    async function handleFixIssue(item: string) {
      setFixingKey(item);
      try {
        const stepGuess = guessStepForText(item);
        const target = stepToTarget(stepGuess);
        if (!target) {
          setSeedPrompt(`Explain and propose exact wording to fix this in my will: "${item}"`);
          setOpenCopilot(true);
          return;
        }
        const { data: res, error } = await supabase.functions.invoke('ai-copilot', {
          body: {
            messages: [
              { role: 'user', content: `Draft or revise the ${target} clause to address: ${item}. Return only the clause text.` }
            ],
            data,
            draft,
            tone
          }
        });
        if (error) throw error;
        const suggestion = (res as any)?.reply || '';
        if (suggestion) {
          setPendingSuggestion({ target, index: target==='gift' ? 0 : undefined, suggestion });
          toast.success('AI suggestion ready');
        } else {
          toast.error('AI did not return content');
        }
      } catch (e) {
        console.error(e);
        toast.error('AI drafting failed');
      } finally {
        setFixingKey(null);
      }
    }

    function handleExplainIssue(item: string) {
      setSeedPrompt(`Explain this review point and how to fix it in my will. Provide clear steps and example wording:\n\n"${item}"`);
      setOpenCopilot(true);
    }

    const handleVoiceAutoFill = (extractedData: ExtractedData, confidence: Record<string, number>) => {
      try {
        const changes = generateAutoFillPreview(data, extractedData, confidence);
        if (changes.length === 0) {
          toast.info("No new information found to fill the form");
          return;
        }
        const highConfidenceChanges = changes.filter(change => change.confidence >= 0.8);
        if (highConfidenceChanges.length > 0) {
          const newData = applyAutoFill(data, extractedData, highConfidenceChanges);
          const prevData = data;
          setData(newData);
          setUndoAction(() => () => setData(prevData));
          toast.success(`Auto-filled ${highConfidenceChanges.length} field(s) with high confidence`);
        }
      } catch (error) {
        console.error("Voice auto-fill error:", error);
        toast.error("Failed to process voice data");
      }
    };

    // Auto-run review on Review step
    useEffect(() => {
      if (isDemo) return; // do not auto-run in demo
      if (step === 11 && !aiReview && !reviewLoading) {
        runAIReview();
      }
    }, [step, aiReview, reviewLoading, isDemo]);

    // Load D-ID script and initialize avatar
    useEffect(() => {
      if (didAvatarLoaded) return;
      
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://agent.d-id.com/v2/index.js';
      script.setAttribute('data-mode', 'full');
      script.setAttribute('data-client-key', 'Z29vZ2xlLW9hdXRoMnwxMDc0NjQ2Njc4OTg3MTA5ODM4ODA6b0ZNWUp4Xy1oV01PYzJtVFFQYkhP');
      script.setAttribute('data-agent-id', 'v2_agt_gURW8-bU');
      script.setAttribute('data-name', 'did-agent');
      script.setAttribute('data-monitor', 'true');
      script.setAttribute('data-target-id', 'did-avatar-container');
      
      script.onload = () => {
        console.log('D-ID script loaded successfully');
        setDidAvatarLoaded(true);
      };
      
      script.onerror = () => {
        console.error('Failed to load D-ID script');
      };
      
      document.head.appendChild(script);
    }, [didAvatarLoaded]);
  
   async function handleExportPDF() {
      if (isDemo) { toast.info('Demo mode: Export is disabled.'); return; }
      if (validationIssues.length) {
        const proceed = window.confirm(`There are ${validationIssues.length} validation issue(s). Proceed to download anyway?`);
        if (!proceed) return;
      }
     try {
       const pdfDoc = await PDFDocument.create();
       const times = await pdfDoc.embedFont(StandardFonts.TimesRoman);

       // Page + margins
       const page = pdfDoc.addPage([612, 792]); // Letter
       const { width } = page.getSize();
       const margin = 50;
       let cursorY = 742;

        // Header (brand)
        const header = brand || 'Legally Innovative';
        // Try to embed logo if provided
        try {
          if (logoUrl) {
            const imgBytes = await fetch(logoUrl).then(r => r.arrayBuffer());
            let logoEmbed: any = null;
            try { logoEmbed = await pdfDoc.embedPng(imgBytes); } catch (_) { logoEmbed = await pdfDoc.embedJpg(imgBytes); }
            if (logoEmbed) {
              const targetW = 80;
              const scale = targetW / (logoEmbed.width || targetW);
              const drawnW = (logoEmbed.width || targetW) * scale;
              const drawnH = (logoEmbed.height || targetW) * scale;
              page.drawImage(logoEmbed, { x: width - margin - drawnW, y: cursorY - drawnH + 4, width: drawnW, height: drawnH });
            }
          }
        } catch (_) { /* ignore logo errors */ }
        page.drawText(header, { x: margin, y: cursorY, size: 16, font: times, color: rgb(0.06, 0.23, 0.39) });
        cursorY -= 10;
        // Divider
        page.drawLine({ start: { x: margin, y: cursorY }, end: { x: width - margin, y: cursorY }, thickness: 1, color: rgb(0.88, 0.69, 0.29) });
        cursorY -= 24;

       // Title
       const title = 'Last Will and Testament (Draft)';
       page.drawText(title, { x: margin, y: cursorY, size: 18, font: times });
       cursorY -= 28;

       // Disclaimer
       const disclaimer = 'This is an automatically generated draft for demonstration purposes only and is not legal advice. Please consult a licensed attorney before signing any legal document.';
       const wrapText = (text: string, maxWidth: number, size = 11) => {
         const words = text.split(' ');
         const lines: string[] = [];
         let line = '';
         for (const w of words) {
           const test = line ? line + ' ' + w : w;
           const width = times.widthOfTextAtSize(test, size);
           if (width > maxWidth) { lines.push(line); line = w; } else { line = test; }
         }
         if (line) lines.push(line);
         return lines;
       };
       const maxWidth = width - margin * 2;
       for (const line of wrapText(disclaimer, maxWidth)) {
         page.drawText(line, { x: margin, y: cursorY, size: 10, font: times, color: rgb(0.2,0.2,0.2) });
         cursorY -= 14;
       }
       cursorY -= 6;

       // Body (draft)
       const lines = wrapText(draft, maxWidth, 12);
       for (const ln of lines) {
         if (cursorY < margin + 40) {
           // new page
           const p = pdfDoc.addPage([612,792]);
           cursorY = 742;
           p.drawText(header, { x: margin, y: cursorY, size: 12, font: times, color: rgb(0.06, 0.23, 0.39) });
           cursorY -= 18;
         }
         pdfDoc.getPage(pdfDoc.getPageCount()-1).drawText(ln, { x: margin, y: cursorY, size: 12, font: times });
         cursorY -= 16;
       }

        // Append AI review summary & checklist if available
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

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Will_Draft_${data.fullName?.split(' ').slice(-1)[0] || 'Preview'}.pdf`;
        a.click();
        URL.revokeObjectURL(url);

        toast.success('PDF downloaded');
     } catch (e) {
       console.error(e);
       toast.error('Failed to generate PDF');
     }
   }

    async function handleExportDocx() {
      if (isDemo) { toast.info('Demo mode: Export is disabled.'); return; }
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
      try {
        setSaving(true);
        const slug = await createDraft({ data, tone, step });
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

    // UI bits
   const StepActions = (
     <div className="mt-6 flex items-center justify-between">
       <Button variant="outline" onClick={prev} disabled={step===1}>Back</Button>
        {step < TOTAL_STEPS ? (
          <Button variant="hero" onClick={next}>Next</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="hero" onClick={handleExportPDF}>Download PDF</Button>
            <Button variant="outline" onClick={handleExportDocx}>Export DOCX</Button>
            <Button variant="secondary" onClick={handleSaveShare} disabled={saving}>Save & Share</Button>
          </div>
        )}
     </div>
   );

   const residueSum = useMemo(() => data.residue.reduce((sum, r)=> sum + (parseFloat(r.percentage||'0') || 0), 0), [data.residue]);

   return (
     <main>
       <Helmet>
         <title>{title} | Legal Tech SaaS Demo</title>
         <meta name="description" content="Step-by-step guided will generator demo with white‑label options for law firms. Review and export PDF." />
         <link rel="canonical" href={canonical} />
         <script type="application/ld+json">
           {JSON.stringify({
             '@context': 'https://schema.org',
             '@type': 'SoftwareApplication',
             name: 'Will & Trust Creator',
             applicationCategory: 'BusinessApplication',
             offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
             provider: { '@type': 'Organization', name: brand || 'Legally Innovative' }
           })}
         </script>
       </Helmet>

        <section className="container py-10">
          <LegalDisclaimer variant="banner" />
          <header className="mb-6">
            <h1 className="text-4xl md:text-5xl mb-2 font-serifBrand">{title}</h1>
            <p className="text-muted-foreground max-w-3xl">Follow the steps below. Your information stays in your browser. At the end, review everything and download a polished PDF draft.</p>
         </header>

          {/* Main layout with form and avatar side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Section - Left side */}
            <div className="lg:col-span-2">
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
             <div className="grid gap-4">
               <h2 className="text-2xl font-serifBrand">1. Personal Information</h2>
               <div className="grid gap-4 md:grid-cols-2">
                 <div>
                   <Label>Full legal name</Label>
                   <Input value={data.fullName} onChange={(e)=>setData({...data, fullName:e.target.value})} />
                 </div>
                 <div>
                   <Label>Date of birth</Label>
                   <Input type="date" value={data.dob} onChange={(e)=>setData({...data, dob:e.target.value})} />
                 </div>
                 <div className="md:col-span-2">
                   <Label>Current address</Label>
                   <Textarea value={data.address} onChange={(e)=>setData({...data, address:e.target.value})} />
                 </div>
                 <div>
                   <Label>State of residence</Label>
                   <Select value={data.state} onValueChange={(v)=>setData({...data, state:v})}>
                     <SelectTrigger><SelectValue placeholder="Select state"/></SelectTrigger>
                     <SelectContent>
                       {usStates.map(s=> <SelectItem key={s} value={s}>{s}</SelectItem>)}
                     </SelectContent>
                   </Select>
                 </div>
                 <div>
                   <Label>Marital status</Label>
                   <Select value={data.maritalStatus} onValueChange={(v)=>setData({...data, maritalStatus: v as WizardData['maritalStatus']})}>
                     <SelectTrigger><SelectValue placeholder="Select status"/></SelectTrigger>
                     <SelectContent>
                       <SelectItem value="single">Single</SelectItem>
                       <SelectItem value="married">Married</SelectItem>
                       <SelectItem value="divorced">Divorced</SelectItem>
                       <SelectItem value="widowed">Widowed</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
               </div>
               {StepActions}
             </div>
           )}

           {step === 2 && (
             <div className="grid gap-4">
               <h2 className="text-2xl font-serifBrand">2. Spouse Information (if applicable)</h2>
               <div className="grid gap-4 md:grid-cols-2">
                 <div>
                   <Label>Full name</Label>
                   <Input value={data.spouse?.name || ''} onChange={(e)=>setData({...data, spouse: { ...(data.spouse||{}), name:e.target.value } })} />
                 </div>
                 <div>
                   <Label>Date of birth</Label>
                   <Input type="date" value={data.spouse?.dob || ''} onChange={(e)=>setData({...data, spouse: { ...(data.spouse || { name:'', dob:'', address:'', relationship:'' }), dob:e.target.value } })} />
                 </div>
               </div>
               {StepActions}
             </div>
           )}

           {step === 3 && (
             <div className="grid gap-4">
               <h2 className="text-2xl font-serifBrand">3. Children / Beneficiaries</h2>
               <div className="space-y-4">
                 {data.beneficiaries.map((b, idx) => (
                   <div key={idx} className="grid gap-3 md:grid-cols-3">
                     <div>
                       <Label>Full name</Label>
                       <Input value={b.name} onChange={(e)=>{
                         const list=[...data.beneficiaries]; list[idx] = { ...b, name:e.target.value }; setData({...data, beneficiaries:list});
                       }} />
                     </div>
                     <div>
                       <Label>Date of birth</Label>
                       <Input type="date" value={b.dob} onChange={(e)=>{
                         const list=[...data.beneficiaries]; list[idx] = { ...b, dob:e.target.value }; setData({...data, beneficiaries:list});
                       }} />
                     </div>
                     <div>
                       <Label>Relationship</Label>
                       <Input value={b.relationship} onChange={(e)=>{
                         const list=[...data.beneficiaries]; list[idx] = { ...b, relationship:e.target.value }; setData({...data, beneficiaries:list});
                       }} />
                     </div>
                     <div className="md:col-span-3 flex justify-end">
                       <Button variant="outline" onClick={() => {
                         const list = data.beneficiaries.filter((_,i)=>i!==idx); setData({...data, beneficiaries:list.length?list:[{name:'',dob:'',relationship:''}]});
                       }}>Remove</Button>
                     </div>
                   </div>
                 ))}
                 <div className="flex justify-end">
                   <Button variant="secondary" onClick={()=> setData({...data, beneficiaries:[...data.beneficiaries, {name:'', dob:'', relationship:''}]})}>Add Beneficiary</Button>
                 </div>
               </div>
               {StepActions}
             </div>
           )}

           {step === 4 && (
             <div className="grid gap-4">
               <h2 className="text-2xl font-serifBrand">4. Executor Information</h2>
               <div className="grid gap-4 md:grid-cols-2">
                 <div>
                   <Label>Full name</Label>
                   <Input value={data.executor.name} onChange={(e)=>setData({...data, executor:{...data.executor, name:e.target.value}})} />
                 </div>
                 <div>
                   <Label>Relationship</Label>
                   <Input value={data.executor.relationship || ''} onChange={(e)=>setData({...data, executor:{...data.executor, relationship:e.target.value}})} />
                 </div>
                 <div className="md:col-span-2">
                   <Label>Address</Label>
                   <Textarea value={data.executor.address || ''} onChange={(e)=>setData({...data, executor:{...data.executor, address:e.target.value}})} />
                 </div>
               </div>
               <h3 className="text-xl font-serifBrand">Alternate Executor (optional)</h3>
               <div className="grid gap-4 md:grid-cols-2">
                 <div>
                   <Label>Full name</Label>
                   <Input value={data.altExecutor?.name || ''} onChange={(e)=>setData({...data, altExecutor:{...(data.altExecutor||{}), name:e.target.value}})} />
                 </div>
                 <div>
                   <Label>Relationship</Label>
                   <Input value={data.altExecutor?.relationship || ''} onChange={(e)=>setData({...data, altExecutor:{...(data.altExecutor || { name:'', dob:'', address:'', relationship:'' }), relationship:e.target.value}})} />
                 </div>
                 <div className="md:col-span-2">
                   <Label>Address</Label>
                   <Textarea value={data.altExecutor?.address || ''} onChange={(e)=>setData({...data, altExecutor:{...(data.altExecutor || { name:'', dob:'', address:'', relationship:'' }), address:e.target.value}})} />
                 </div>
               </div>
               {StepActions}
             </div>
           )}

           {step === 5 && (
             <div className="grid gap-4">
               <h2 className="text-2xl font-serifBrand">5. Guardians for Minor Children (optional)</h2>
               <div>
                 <Label className="mr-3">Add guardians?</Label>
                 <Select value={data.addGuardians ? 'yes':'no'} onValueChange={(v)=>setData({...data, addGuardians: v==='yes'})}>
                   <SelectTrigger className="w-44"><SelectValue placeholder="Select"/></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="yes">Yes</SelectItem>
                     <SelectItem value="no">No</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               {data.addGuardians && (
                 <div className="space-y-6">
                   <div className="grid gap-4 md:grid-cols-2">
                     <div>
                       <Label>Guardian full name</Label>
                       <Input value={data.guardian?.name || ''} onChange={(e)=>setData({...data, guardian:{...(data.guardian||{}), name:e.target.value}})} />
                     </div>
                     <div>
                       <Label>Relationship</Label>
                       <Input value={data.guardian?.relationship || ''} onChange={(e)=>setData({...data, guardian:{...(data.guardian || { name:'', dob:'', address:'', relationship:'' }), relationship:e.target.value}})} />
                     </div>
                      <div className="md:col-span-2">
                         <Label>Address</Label>
                         <Textarea value={data.guardian?.address || ''} onChange={(e)=>setData({...data, guardian:{...(data.guardian || { name:'', dob:'', address:'', relationship:'' }), address:e.target.value}})} />
                       </div>
                        <div className="md:col-span-2">
                          <div className="flex items-center justify-between">
                            <Label>Guardian clause (optional)</Label>
                            <div className="flex items-center gap-2">
                              <VoiceButton onResult={(t)=> setData({ ...data, guardianInstructions: (data.guardianInstructions ? data.guardianInstructions + ' ' : '') + t })} />
                              <Button variant="outline" size="sm" onClick={()=>generateGuardianClause('primary')} disabled={guardianLoadingPrimary}>
                                {guardianLoadingPrimary ? 'Drafting…' : 'Ask AI'}
                              </Button>
                            </div>
                          </div>
                          <Textarea value={data.guardianInstructions || ''} onChange={(e)=>setData({...data, guardianInstructions:e.target.value})} />
                        </div>
                   </div>
                   <h3 className="text-xl font-serifBrand">Alternate Guardian (optional)</h3>
                   <div className="grid gap-4 md:grid-cols-2">
                     <div>
                       <Label>Full name</Label>
                       <Input value={data.altGuardian?.name || ''} onChange={(e)=>setData({...data, altGuardian:{...(data.altGuardian||{}), name:e.target.value}})} />
                     </div>
                     <div>
                       <Label>Relationship</Label>
                       <Input value={data.altGuardian?.relationship || ''} onChange={(e)=>setData({...data, altGuardian:{...(data.altGuardian || { name:'', dob:'', address:'', relationship:'' }), relationship:e.target.value}})} />
                     </div>
                      <div className="md:col-span-2">
                         <Label>Address</Label>
                         <Textarea value={data.altGuardian?.address || ''} onChange={(e)=>setData({...data, altGuardian:{...(data.altGuardian || { name:'', dob:'', address:'', relationship:'' }), address:e.target.value}})} />
                       </div>
                        <div className="md:col-span-2">
                          <div className="flex items-center justify-between">
                            <Label>Alternate guardian clause (optional)</Label>
                            <div className="flex items-center gap-2">
                              <VoiceButton onResult={(t)=> setData({ ...data, altGuardianInstructions: (data.altGuardianInstructions ? data.altGuardianInstructions + ' ' : '') + t })} />
                              <Button variant="outline" size="sm" onClick={()=>generateGuardianClause('alternate')} disabled={guardianLoadingAlt}>
                                {guardianLoadingAlt ? 'Drafting…' : 'Ask AI'}
                              </Button>
                            </div>
                          </div>
                          <Textarea value={data.altGuardianInstructions || ''} onChange={(e)=>setData({...data, altGuardianInstructions:e.target.value})} />
                        </div>
                   </div>
                 </div>
               )}
               {StepActions}
             </div>
           )}

           {step === 6 && (
             <div className="grid gap-4">
               <h2 className="text-2xl font-serifBrand">6. Specific Gifts</h2>
               <div className="space-y-4">
                 {data.gifts.map((g, idx) => (
                   <div key={idx} className="grid gap-3 md:grid-cols-2">
                    <div>
                        <div className="flex items-center justify-between">
                          <Label>Item or amount</Label>
                          <div className="flex items-center gap-2">
                            <VoiceButton onResult={(t)=>{ const list=[...data.gifts]; list[idx] = { ...g, description: t }; setData({ ...data, gifts: list }); }} />
                            <Button variant="outline" size="sm" onClick={()=>generateGiftClause(idx)} disabled={giftLoadingIdx===idx}>
                              {giftLoadingIdx===idx ? 'Drafting…' : 'Ask AI'}
                            </Button>
                          </div>
                        </div>
                       <Input value={g.description} onChange={(e)=>{ const list=[...data.gifts]; list[idx]={...g, description:e.target.value}; setData({...data, gifts:list}); }} />
                     </div>
                     <div>
                        <div className="flex items-center justify-between">
                          <Label>Beneficiary name</Label>
                          <VoiceButton onResult={(t)=>{ const list=[...data.gifts]; list[idx] = { ...g, beneficiary: t }; setData({ ...data, gifts: list }); }} />
                        </div>
                        <Input value={g.beneficiary} onChange={(e)=>{ const list=[...data.gifts]; list[idx]={...g, beneficiary:e.target.value}; setData({...data, gifts:list}); }} />
                     </div>
                     <div className="md:col-span-2 flex justify-end">
                       <Button variant="outline" onClick={()=>{ const list=data.gifts.filter((_,i)=>i!==idx); setData({...data, gifts:list}); }}>Remove</Button>
                     </div>
                   </div>
                 ))}
                 <div className="flex justify-end">
                   <Button variant="secondary" onClick={()=> setData({...data, gifts:[...data.gifts, { description:'', beneficiary:'' }]})}>Add Gift</Button>
                 </div>
               </div>
               {StepActions}
             </div>
           )}

           {step === 7 && (
             <div className="grid gap-4">
               <h2 className="text-2xl font-serifBrand">7. Residue of Estate</h2>
               <p className="text-sm text-muted-foreground">Specify who receives the remainder of your estate. Total should be 100%.</p>
               <div className="space-y-4">
                 {data.residue.map((r, idx) => (
                   <div key={idx} className="grid gap-3 md:grid-cols-3">
                     <div className="md:col-span-2">
                       <Label>Beneficiary</Label>
                       <Input value={r.beneficiary} onChange={(e)=>{ const list=[...data.residue]; list[idx] = { ...r, beneficiary:e.target.value }; setData({...data, residue:list}); }} />
                     </div>
                     <div>
                       <Label>Percentage</Label>
                       <Input type="number" min="0" max="100" value={r.percentage} onChange={(e)=>{ const list=[...data.residue]; list[idx] = { ...r, percentage:e.target.value }; setData({...data, residue:list}); }} />
                     </div>
                     <div className="md:col-span-3 flex justify-end">
                       <Button variant="outline" onClick={()=>{ const list=data.residue.filter((_,i)=>i!==idx); setData({...data, residue:list.length?list:[{beneficiary:'',percentage:'100'}]}); }}>Remove</Button>
                     </div>
                   </div>
                 ))}
                 <div className="flex items-center justify-between">
                   <div className={`text-sm ${Math.round(residueSum)===100 ? 'text-foreground' : 'text-destructive'}`}>Total: {residueSum}%</div>
                   <Button variant="secondary" onClick={()=> setData({...data, residue:[...data.residue, { beneficiary:'', percentage:'0' }]})}>Add Split</Button>
                 </div>
               </div>
               {StepActions}
             </div>
           )}

           {step === 8 && (
             <div className="grid gap-4">
               <h2 className="text-2xl font-serifBrand">8. Pet Care Provisions (optional)</h2>
               <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <Label>Pet name</Label>
                      <VoiceButton onResult={(t)=> setData({ ...data, petName: t })} />
                    </div>
                    <Input value={data.petName || ''} onChange={(e)=>setData({...data, petName:e.target.value})} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <Label>Type</Label>
                      <VoiceButton onResult={(t)=> setData({ ...data, petType: t })} />
                    </div>
                    <Input value={data.petType || ''} onChange={(e)=>setData({...data, petType:e.target.value})} />
                  </div>
                   <div>
                      <div className="flex items-center justify-between">
                        <Label>Caregiver</Label>
                        <VoiceButton onResult={(t)=> setData({ ...data, petCaregiver: t })} />
                      </div>
                      <Input value={data.petCaregiver || ''} onChange={(e)=>setData({...data, petCaregiver:e.target.value})} />
                    </div>
                   <div className="md:col-span-3">
                      <div className="flex items-center justify-between">
                        <Label>Pet care clause (optional)</Label>
                        <div className="flex items-center gap-2">
                          <VoiceButton onResult={(t)=> setData({ ...data, petInstructions: (data.petInstructions ? data.petInstructions + ' ' : '') + t })} />
                          <Button variant="outline" size="sm" onClick={generatePetClause} disabled={petLoading}>
                            {petLoading ? 'Drafting…' : 'Ask AI'}
                          </Button>
                        </div>
                      </div>
                     <Textarea value={data.petInstructions || ''} onChange={(e)=>setData({...data, petInstructions:e.target.value})} />
                   </div>
               </div>
               {StepActions}
             </div>
           )}

           {step === 9 && (
             <div className="grid gap-4">
               <h2 className="text-2xl font-serifBrand">9. Funeral & Burial Wishes (optional)</h2>
               <div className="grid gap-4 md:grid-cols-2">
                 <div>
                   <Label>Preference</Label>
                   <Select value={data.funeralPreference} onValueChange={(v)=>setData({...data, funeralPreference: v as WizardData['funeralPreference']})}>
                     <SelectTrigger><SelectValue placeholder="Select preference"/></SelectTrigger>
                     <SelectContent>
                       <SelectItem value="burial">Burial</SelectItem>
                       <SelectItem value="cremation">Cremation</SelectItem>
                       <SelectItem value="no_preference">No preference</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label>Special instructions</Label>
                      <div className="flex items-center gap-2">
                        <VoiceButton onResult={(t)=> setData({ ...data, funeralInstructions: (data.funeralInstructions ? data.funeralInstructions + ' ' : '') + t })} />
                        <Button variant="outline" size="sm" onClick={generateFuneralInstructionsWithAI} disabled={funeralLoading}>
                          {funeralLoading ? 'Drafting…' : 'Ask AI to draft'}
                        </Button>
                      </div>
                    </div>
                    <Textarea value={data.funeralInstructions} onChange={(e)=>setData({...data, funeralInstructions:e.target.value})} />
                    <p className="text-xs text-muted-foreground mt-1">AI can suggest a concise, respectful clause based on your info.</p>
                  </div>
               </div>
               {StepActions}
             </div>
           )}

           {step === 10 && (
             <div className="grid gap-4">
               <h2 className="text-2xl font-serifBrand">10. Witnesses (optional)</h2>
               <div className="space-y-3">
                 {data.witnesses.map((w, idx)=> (
                   <div key={idx} className="grid gap-3 md:grid-cols-2">
                     <div>
                       <Label>Witness name</Label>
                       <Input value={w} onChange={(e)=>{ const list=[...data.witnesses]; list[idx]=e.target.value; setData({...data, witnesses:list}); }} />
                     </div>
                     <div className="flex items-end">
                       <Button variant="outline" onClick={()=>{ const list=data.witnesses.filter((_,i)=>i!==idx); setData({...data, witnesses:list}); }}>Remove</Button>
                     </div>
                   </div>
                 ))}
                 <div className="flex justify-end">
                   <Button variant="secondary" onClick={()=> setData({...data, witnesses:[...data.witnesses, ""]})}>Add Witness</Button>
                 </div>
               </div>
               {StepActions}
             </div>
           )}

           {step === 11 && (
              <div className="grid gap-4">
                <h2 className="text-2xl font-serifBrand">Review & Generate</h2>
                <p className="text-muted-foreground">Review your entries below before downloading your PDF.</p>
                {validationIssues.length > 0 && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-md p-4 text-sm">
                    <div className="font-medium mb-2">Blocking issues</div>
                    <ul className="list-disc pl-5 space-y-1">
                      {validationIssues.map((it, i)=> (
                        <li key={i} className="flex items-start justify-between gap-3">
                          <span className="flex-1">{it}</span>
                          <Button size="sm" variant="outline" onClick={()=> setStep(guessStepForText(it))}>Go fix</Button>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground mt-2">You can still download, but we recommend fixing these first.</p>
                  </div>
                )}

               <div className="grid gap-6">
                 <div>
                   <h3 className="text-xl font-serifBrand">Personal</h3>
                   <div className="text-sm leading-7">
                     <div><strong>Name:</strong> {data.fullName || '—'}</div>
                     <div><strong>DOB:</strong> {data.dob || '—'}</div>
                     <div><strong>Address:</strong> {data.address || '—'}</div>
                     <div><strong>State:</strong> {data.state || '—'}</div>
                     <div><strong>Marital status:</strong> {data.maritalStatus || '—'}</div>
                   </div>
                 </div>
                 <div>
                   <h3 className="text-xl font-serifBrand">Spouse</h3>
                   <div className="text-sm leading-7">
                     <div><strong>Name:</strong> {data.spouse?.name || '—'}</div>
                     <div><strong>DOB:</strong> {data.spouse?.dob || '—'}</div>
                   </div>
                 </div>
                 <div>
                   <h3 className="text-xl font-serifBrand">Beneficiaries</h3>
                   <div className="text-sm leading-7">
                     {data.beneficiaries.filter(b=>b.name).length ? data.beneficiaries.map((b,i)=>(
                       <div key={i}>• {b.name} {b.dob?`(b. ${b.dob})`:''} – {b.relationship}</div>
                     )): '—'}
                   </div>
                 </div>
                 <div>
                   <h3 className="text-xl font-serifBrand">Executor</h3>
                   <div className="text-sm leading-7">
                     <div><strong>Primary:</strong> {data.executor.name || '—'}{data.executor.relationship?` (${data.executor.relationship})`:''}</div>
                     <div><strong>Alt:</strong> {data.altExecutor?.name || '—'}{data.altExecutor?.relationship?` (${data.altExecutor?.relationship})`:''}</div>
                   </div>
                 </div>
                 <div>
                   <h3 className="text-xl font-serifBrand">Guardians</h3>
                   <div className="text-sm leading-7">
                     <div><strong>Guardian:</strong> {data.addGuardians ? (data.guardian?.name || '—') : 'Not added'}</div>
                     <div><strong>Alternate:</strong> {data.addGuardians ? (data.altGuardian?.name || '—') : '—'}</div>
                   </div>
                 </div>
                 <div>
                   <h3 className="text-xl font-serifBrand">Specific Gifts</h3>
                   <div className="text-sm leading-7">
                     {data.gifts.length ? data.gifts.map((g,i)=>(<div key={i}>• {g.description} → {g.beneficiary}</div>)) : '—'}
                   </div>
                 </div>
                 <div>
                   <h3 className="text-xl font-serifBrand">Residue</h3>
                   <div className="text-sm leading-7">
                     {data.residue.map((r,i)=>(<div key={i}>• {r.beneficiary || '—'} – {r.percentage}%</div>))}
                     <div className={`mt-1 ${Math.round(residueSum)===100?'text-muted-foreground':'text-destructive'}`}>Total: {residueSum}%</div>
                   </div>
                 </div>
                 <div>
                   <h3 className="text-xl font-serifBrand">Pets</h3>
                   <div className="text-sm leading-7">
                     <div><strong>Pet:</strong> {data.petName ? `${data.petName} (${data.petType||'—'})` : '—'}</div>
                     <div><strong>Caregiver:</strong> {data.petCaregiver || '—'}</div>
                   </div>
                 </div>
                 <div>
                   <h3 className="text-xl font-serifBrand">Funeral & Burial</h3>
                   <div className="text-sm leading-7">
                     <div><strong>Preference:</strong> {data.funeralPreference || '—'}</div>
                     <div><strong>Instructions:</strong> {data.funeralInstructions || '—'}</div>
                   </div>
                 </div>
                 <div>
                   <h3 className="text-xl font-serifBrand">Witnesses</h3>
                   <div className="text-sm leading-7">{data.witnesses.filter(Boolean).length ? data.witnesses.filter(Boolean).join(', ') : '—'}</div>
                 </div>

                  <div>
                    <h3 className="text-xl font-serifBrand">AI Review</h3>
                    <div className="flex items-center gap-3 mb-2">
                      <Button variant="secondary" onClick={runAIReview} disabled={reviewLoading}>
                        {reviewLoading ? 'Reviewing…' : (aiReview ? 'Re‑run review' : 'Run AI Review')}
                      </Button>
                      {aiReview && <span className="text-sm text-muted-foreground">Review ready</span>}
                    </div>
                    {aiReview && (
                      <div className="space-y-3">
                        <div className="text-sm leading-7 bg-secondary/60 p-4 rounded-md">
                          <strong>Summary:</strong> {aiReview.summary}
                        </div>
                        <div className="grid gap-3 md:grid-cols-3">
                          {aiReview.issues?.length ? (
                            <Card>
                              <CardHeader><CardTitle>Issues</CardTitle></CardHeader>
                              <CardContent>
                                <ul className="space-y-2">
                                  {aiReview.issues.map((item, i)=> (
                                    <li key={i} className="flex items-start justify-between gap-3">
                                      <span className="flex-1">{item}</span>
                                      <div className="flex items-center gap-2">
                                        <Button size="sm" variant="secondary" onClick={()=> handleFixIssue(item)} disabled={fixingKey===item}>{fixingKey===item ? 'Working…' : 'Fix with AI'}</Button>
                                        <Button size="sm" variant="outline" onClick={()=> handleExplainIssue(item)}>Explain</Button>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          ) : null}
                          {aiReview.risks?.length ? (
                            <Card>
                              <CardHeader><CardTitle>Risks</CardTitle></CardHeader>
                              <CardContent>
                                <ul className="space-y-2">
                                  {aiReview.risks.map((item, i)=> (
                                    <li key={i} className="flex items-start justify-between gap-3">
                                      <span className="flex-1">{item}</span>
                                      <div className="flex items-center gap-2">
                                        <Button size="sm" variant="secondary" onClick={()=> handleFixIssue(item)} disabled={fixingKey===item}>{fixingKey===item ? 'Working…' : 'Fix with AI'}</Button>
                                        <Button size="sm" variant="outline" onClick={()=> handleExplainIssue(item)}>Explain</Button>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          ) : null}
                          {aiReview.missing?.length ? (
                            <Card>
                              <CardHeader><CardTitle>Missing Info</CardTitle></CardHeader>
                              <CardContent>
                                <ul className="space-y-2">
                                  {aiReview.missing.map((item, i)=> (
                                    <li key={i} className="flex items-start justify-between gap-3">
                                      <span className="flex-1">{item}</span>
                                      <div className="flex items-center gap-2">
                                        <Button size="sm" variant="secondary" onClick={()=> handleFixIssue(item)} disabled={fixingKey===item}>{fixingKey===item ? 'Working…' : 'Fix with AI'}</Button>
                                        <Button size="sm" variant="outline" onClick={()=> handleExplainIssue(item)}>Explain</Button>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          ) : null}
                        </div>
                        {aiReview.checklist?.length ? (
                          <div className="text-sm leading-7 bg-secondary/60 p-4 rounded-md">
                            <strong>Checklist:</strong>
                            <ul className="list-disc pl-5">
                              {aiReview.checklist.map((item, i)=> (<li key={i}>{item}</li>))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-serifBrand">Draft Preview</h3>
                    <pre className="whitespace-pre-wrap bg-secondary/60 p-4 rounded-md text-sm">{draft}</pre>
                  </div>

                 <div className="flex items-center justify-between">
                   <Button variant="outline" onClick={()=> setStep(1)}>Edit from Start</Button>
                   <div className="flex gap-2">
                     <Button variant="hero" onClick={handleExportPDF}>Download PDF</Button>
                     <Button variant="outline" onClick={handleExportDocx}>Export DOCX</Button>
                     <Button variant="secondary" onClick={handleSaveShare} disabled={saving}>Save & Share</Button>
                   </div>
                 </div>
                </div>
              </div>
           )}
            </div>
          </div>
            
          {/* D-ID Avatar Section - Right side */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border p-4 bg-card sticky top-4">
              <h3 className="text-lg font-medium mb-3">Legal Assistant</h3>
              <div 
                id="did-avatar-container" 
                className="w-full h-80 bg-muted/30 rounded-lg flex items-center justify-center"
              >
                {!didAvatarLoaded && (
                  <div className="text-center text-muted-foreground">
                    <div className="animate-pulse">Loading avatar...</div>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Your AI legal assistant is ready to help
              </p>
            </div>
          </div>
        </div>

         {/* White-label embed note */}
         <section className="pt-8">
           <h2 className="text-2xl mb-2">White‑label Embed</h2>
           <p className="text-muted-foreground mb-4 max-w-3xl">Use query parameters to brand this tool: brand, primary, accent, logo (URL). Example iframe code:</p>
           <pre className="bg-secondary/60 p-4 rounded-md text-sm overflow-auto">{`<iframe src="${window.location.origin}/will-creator?brand=Legally%20Innovative&primary=%230a3a64&accent=%23e0b04b" width="100%" height="900" style="border:0;" loading="lazy"></iframe>`}</pre>
         </section>
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
