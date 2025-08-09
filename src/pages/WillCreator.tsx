import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { supabase } from "@/integrations/supabase/client";

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
   // 6 Gifts
   gifts: Gift[];
   // 7 Residue
   residue: ResidueSplit[];
   // 8 Pets (optional)
   petName?: string;
   petType?: string;
   petCaregiver?: string;
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
   gifts: [],
   residue: [{ beneficiary: "", percentage: "100" }],
   petName: "",
   petType: "",
   petCaregiver: "",
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

 const WillCreator = () => {
   const [step, setStep] = useState(1);
   const [data, setData] = useState<WizardData>(defaultData);
   const [brand, setBrand] = useState<string | null>(null);
   const [logoUrl, setLogoUrl] = useState<string | null>(null);

   const [aiReview, setAiReview] = useState<{ issues: string[]; risks: string[]; missing: string[]; summary: string; checklist: string[] } | null>(null);
   const [reviewLoading, setReviewLoading] = useState(false);
   const [funeralLoading, setFuneralLoading] = useState(false);
 
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
`${data.addGuardians ? `I appoint ${data.guardian?.name || '[Guardian]'}${data.guardian?.relationship?`, my ${data.guardian?.relationship}`:''} of ${data.guardian?.address || '[Address]'} as Guardian of my minor children.${data.altGuardian?.name ? ` If unable or unwilling, I appoint ${data.altGuardian?.name} as alternate.`:''}` : '[If applicable, designate guardians]'}\n\n` +
`Article V – Specific Gifts\n` +
`${gList || '[Itemize specific bequests]'}\n\n` +
`Article VI – Residue of Estate\n` +
`I give the remainder of my estate as follows: ${rList || '[e.g., 100% to Spouse]'}\n\n` +
`Article VII – Pet Care Provisions\n` +
`${data.petName ? `${data.petName} (${data.petType || 'pet'}) to be cared for by ${data.petCaregiver || '[Caregiver]'}.` : '[Optional – designate caregiver for pets]'}\n\n` +
`Article VIII – Funeral & Burial Wishes\n` +
`Preference: ${data.funeralPreference || '[No preference]'}${data.funeralInstructions ? `; Instructions: ${data.funeralInstructions}` : ''}.\n\n` +
`Article IX – Execution\n` +
`Signed on ____________ at ______________________. Witnesses: ${witnessLine || '[Witnesses]'}\n`;
   }, [data]);

   const progressValue = (step / TOTAL_STEPS) * 100;

   async function generateFuneralInstructionsWithAI() {
     try {
       setFuneralLoading(true);
       const { data: res, error } = await supabase.functions.invoke('ai-generate-clause', {
         body: {
           field: 'funeral_instructions',
           data: {
             fullName: data.fullName,
             spouse: data.spouse?.name,
             state: data.state,
             preference: data.funeralPreference,
             notes: data.funeralInstructions,
           }
         }
       });
       if (error) throw error;
       if (res?.result) {
         setData({ ...data, funeralInstructions: res.result });
         toast.success('AI draft added');
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

   async function runAIReview() {
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
 
   async function handleExportPDF() {
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

   // UI bits
   const StepActions = (
     <div className="mt-6 flex items-center justify-between">
       <Button variant="outline" onClick={prev} disabled={step===1}>Back</Button>
       {step < TOTAL_STEPS ? (
         <Button variant="hero" onClick={next}>Next</Button>
       ) : (
         <Button variant="hero" onClick={handleExportPDF}>Download PDF</Button>
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
         <header className="mb-6">
           <h1 className="text-4xl md:text-5xl mb-2 font-serifBrand">{title}</h1>
           <p className="text-muted-foreground max-w-3xl">Follow the steps below. Your information stays in your browser. At the end, review everything and download a polished PDF draft.</p>
         </header>

         <div className="rounded-lg border p-6 bg-card">
           <div className="mb-4">
            <Progress value={progressValue} />
            <div className="mt-2 text-sm text-muted-foreground">Step {step} of {TOTAL_STEPS}</div>
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
                       <Label>Item or amount</Label>
                       <Input value={g.description} onChange={(e)=>{ const list=[...data.gifts]; list[idx]={...g, description:e.target.value}; setData({...data, gifts:list}); }} />
                     </div>
                     <div>
                       <Label>Beneficiary name</Label>
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
                   <Label>Pet name</Label>
                   <Input value={data.petName || ''} onChange={(e)=>setData({...data, petName:e.target.value})} />
                 </div>
                 <div>
                   <Label>Type</Label>
                   <Input value={data.petType || ''} onChange={(e)=>setData({...data, petType:e.target.value})} />
                 </div>
                 <div>
                   <Label>Caregiver</Label>
                   <Input value={data.petCaregiver || ''} onChange={(e)=>setData({...data, petCaregiver:e.target.value})} />
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
                      <Button variant="outline" size="sm" onClick={generateFuneralInstructionsWithAI} disabled={funeralLoading}>
                        {funeralLoading ? 'Drafting…' : 'Ask AI to draft'}
                      </Button>
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
                        {reviewLoading ? 'Reviewing…' : 'Run AI Review'}
                      </Button>
                      {aiReview && <span className="text-sm text-muted-foreground">Review ready</span>}
                    </div>
                    {aiReview && (
                      <div className="text-sm leading-7 bg-secondary/60 p-4 rounded-md">
                        <div className="mb-2"><strong>Summary:</strong> {aiReview.summary}</div>
                        {aiReview.checklist?.length ? (
                          <div>
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
                   <Button variant="hero" onClick={handleExportPDF}>Download PDF</Button>
                 </div>
               </div>
             </div>
           )}
         </div>

         {/* White-label embed note */}
         <section className="pt-8">
           <h2 className="text-2xl mb-2">White‑label Embed</h2>
           <p className="text-muted-foreground mb-4 max-w-3xl">Use query parameters to brand this tool: brand, primary, accent, logo (URL). Example iframe code:</p>
           <pre className="bg-secondary/60 p-4 rounded-md text-sm overflow-auto">{`<iframe src="${window.location.origin}/will-creator?brand=Legally%20Innovative&primary=%230a3a64&accent=%23e0b04b" width="100%" height="900" style="border:0;" loading="lazy"></iframe>`}</pre>
         </section>
       </section>
     </main>
   );
 };

 export default WillCreator;
