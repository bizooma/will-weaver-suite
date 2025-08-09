import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type FormData = {
  firstName: string;
  lastName: string;
  state: string;
  hasSpouse: string;
  children: string;
  executor: string;
};

const defaultData: FormData = {
  firstName: "",
  lastName: "",
  state: "",
  hasSpouse: "no",
  children: "0",
  executor: "",
};

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

const WillCreator = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(defaultData);
  const [brand, setBrand] = useState<string | null>(null);

  const next = () => setStep((s) => Math.min(4, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const brandName = params.get('brand');
    const primary = params.get('primary');
    const accent = params.get('accent');
    if (brandName) setBrand(brandName);
    if (primary && primary.startsWith('#')) {
      const hsl = hexToHsl(primary);
      if (hsl) document.documentElement.style.setProperty('--primary', hsl);
    }
    if (accent && accent.startsWith('#')) {
      const hsl = hexToHsl(accent);
      if (hsl) document.documentElement.style.setProperty('--accent', hsl);
    }
  }, []);

  const title = brand ? `${brand} Will & Trust Creator` : "Will & Trust Creator";

  const draft = useMemo(() => {
    return `Last Will and Testament\n\nI, ${data.firstName || '[First]'} ${data.lastName || '[Last]'}, of the State of ${data.state || '[State]'}, declare this to be my Last Will and Testament.\n\n1. Family: ${data.hasSpouse==='yes' ? 'I am married.' : 'I am not married.'} Children: ${data.children}.\n2. Executor: I appoint ${data.executor || '[Executor Name]'} as Executor.\n\nThis is a non-binding draft for review only.`;
  }, [data]);

  return (
    <main>
      <Helmet>
        <title>{title} | Legal Tech SaaS Demo</title>
        <meta name="description" content="Step-by-step guided will generator demo with white‑label options for law firms." />
        <link rel="canonical" href={canonical} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Will & Trust Creator',
            applicationCategory: 'BusinessApplication',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: brand || 'LexiTech Demo' }
          })}
        </script>
      </Helmet>

      <section className="container py-12">
        <h1 className="text-4xl md:text-5xl mb-3">{title}</h1>
        <p className="text-muted-foreground max-w-3xl">
          Walk through a simple 4‑step process to assemble a review‑ready draft. This is a demo; no legal advice.
        </p>
      </section>

      <section className="container pb-4">
        <div className="rounded-lg border p-6 bg-card">
          {step === 1 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="first">First name</Label>
                <Input id="first" value={data.firstName} onChange={(e)=>setData({...data, firstName:e.target.value})} />
              </div>
              <div>
                <Label htmlFor="last">Last name</Label>
                <Input id="last" value={data.lastName} onChange={(e)=>setData({...data, lastName:e.target.value})} />
              </div>
              <div>
                <Label>State</Label>
                <Select value={data.state} onValueChange={(v)=>setData({...data, state:v})}>
                  <SelectTrigger><SelectValue placeholder="Select your state"/></SelectTrigger>
                  <SelectContent>
                    {['CA','NY','TX','FL','IL','Other'].map(s=> (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Marital status</Label>
                <Select value={data.hasSpouse} onValueChange={(v)=>setData({...data, hasSpouse:v})}>
                  <SelectTrigger><SelectValue placeholder="Select status"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Married</SelectItem>
                    <SelectItem value="no">Not married</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Children</Label>
                <Select value={data.children} onValueChange={(v)=>setData({...data, children:v})}>
                  <SelectTrigger><SelectValue placeholder="Number of children"/></SelectTrigger>
                  <SelectContent>
                    {['0','1','2','3','4+'].map(n => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="exec">Executor full name</Label>
                <Input id="exec" value={data.executor} onChange={(e)=>setData({...data, executor:e.target.value})} />
              </div>
              <p className="text-sm text-muted-foreground md:col-span-2">Add guardians, specific bequests, and trust terms in a full version.</p>
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-4">
              <h3 className="text-xl font-serifBrand">Draft Preview</h3>
              <pre className="whitespace-pre-wrap bg-secondary/60 p-4 rounded-md text-sm">{draft}</pre>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Button variant="outline" onClick={prev} disabled={step===1}>Back</Button>
            {step < 4 ? (
              <Button variant="hero" onClick={next}>Next</Button>
            ) : (
              <Button variant="hero" onClick={()=>toast.success('Draft generated (demo)')}>Generate Draft (Demo)</Button>
            )}
          </div>
        </div>
      </section>

      <section className="container py-12">
        <h2 className="text-2xl mb-2">White‑label Embed</h2>
        <p className="text-muted-foreground mb-4 max-w-3xl">
          Use query parameters to brand this tool for your firm: brand, primary, accent (hex). Example iframe code:
        </p>
        <pre className="bg-secondary/60 p-4 rounded-md text-sm overflow-auto">{`<iframe src="${window.location.origin}/will-creator?brand=Your%20Firm&primary=%230a3a64&accent=%238c1d2f" width="100%" height="800" style="border:0;" loading="lazy"></iframe>`}</pre>
      </section>
    </main>
  );
};

export default WillCreator;
