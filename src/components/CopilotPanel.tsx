import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDemoEdgeFunctions } from "@/hooks/useDemoEdgeFunctions";
import { toast } from "sonner";
import { Mic, Square, MessageSquare, Volume2 } from "lucide-react";
import VoiceAutoFillPanel from "@/components/VoiceAutoFillPanel";
import { ExtractedData } from "@/hooks/useVoiceAutoFill";

export type CopilotTarget = 'funeral' | 'pet' | 'guardian' | 'altGuardian' | 'gift';

interface CopilotPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
  draft: string;
  tone: 'plain' | 'formal' | 'compassionate' | 'concise';
  onToneChange?: (tone: 'plain' | 'formal' | 'compassionate' | 'concise') => void;
  onPropose: (text: string, target: CopilotTarget, index?: number) => void;
  onVoiceAutoFill?: (extractedData: ExtractedData, confidence: Record<string, number>) => void;
  seedPrompt?: string;
  currentStep?: number;
}

const CopilotPanel = ({ open, onOpenChange, data, draft, tone, onToneChange, onPropose, onVoiceAutoFill, seedPrompt, currentStep }: CopilotPanelProps) => {
  const { invoke } = useDemoEdgeFunctions();
  const [messages, setMessages] = useState<{ role: 'user'|'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hi! I\'m your co‑pilot. Ask me anything or say "draft a guardian clause" and I\'ll help.' }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [insertTarget, setInsertTarget] = useState<CopilotTarget>('funeral');
  const [giftIndex, setGiftIndex] = useState<number>(0);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [redact, setRedact] = useState<boolean>(() => {
    try { return localStorage.getItem('copilot.redact') === '1'; } catch { return false; }
  });
  const [speak, setSpeak] = useState<boolean>(() => {
    try { return localStorage.getItem('copilot.speak') === '1'; } catch { return false; }
  });
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const initializedRef = useRef(false);
  const seededRef = useRef(false);
  useEffect(()=>{ endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

useEffect(() => {
  if (open) {
    // Initialize from localStorage once
    if (!initializedRef.current) {
      try {
        const saved = localStorage.getItem('copilot.chat');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length) setMessages(parsed);
        }
      } catch { /* ignore */ }
      initializedRef.current = true;
    }
    // Focus input
    inputRef.current?.focus();
    // Seed prompt (once per open)
    if (seedPrompt && !seededRef.current) {
      setInput(seedPrompt);
      seededRef.current = true;
      setTimeout(() => send(seedPrompt), 0);
    }
  } else {
    // Allow reseeding next time it opens
    seededRef.current = false;
  }
}, [open, seedPrompt]);

useEffect(() => {
  try { localStorage.setItem('copilot.chat', JSON.stringify(messages.slice(-20))); } catch { /* ignore */ }
}, [messages]);

useEffect(() => {
  try { localStorage.setItem('copilot.redact', redact ? '1' : '0'); } catch { /* ignore */ }
}, [redact]);

useEffect(() => {
  try { localStorage.setItem('copilot.speak', speak ? '1' : '0'); } catch { /* ignore */ }
}, [speak]);

function redactText(text: string): string {
  if (!text) return text;
  let t = text;
  // Emails
  t = t.replace(/([A-Z0-9._%+-]+)@([A-Z0-9.-]+)\.[A-Z]{2,}/gi, '[EMAIL]');
  // Phones
  t = t.replace(/\+?\d[\d\s().-]{7,}\d/g, '[PHONE]');
  // Dates
  t = t.replace(/\b\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}\b/g, '[DATE]');
  // SSN-like
  t = t.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');
  // Addresses (rough)
  t = t.replace(/\b\d{1,6}\s+[A-Za-z0-9\s]+(Street|St\.|Avenue|Ave\.|Road|Rd\.|Boulevard|Blvd\.|Lane|Ln\.|Drive|Dr\.)\b/gi, '[ADDRESS]');
  return t;
}

function deepRedact(obj: any): any {
  if (obj == null) return obj;
  if (typeof obj === 'string') return redactText(obj);
  if (Array.isArray(obj)) return obj.map(deepRedact);
  if (typeof obj === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(obj)) {
      if (/name|address|email|phone|dob|ssn|social|city|street|zip|postal/i.test(k)) {
        out[k] = typeof v === 'string' ? `[${k.toUpperCase()}]` : deepRedact(v);
      } else {
        out[k] = deepRedact(v);
      }
    }
    return out;
  }
  return obj;
}

const send = async (overrideText?: string) => {
  const text = (overrideText ?? input).trim();
  if (!text) return;
  const next = [...messages, { role: 'user' as const, content: text }];
  setMessages(next);
  setInput("");
  setSending(true);
  try {
    const payload = {
      messages: redact ? next.map(m => ({ ...m, content: redactText(m.content) })) : next,
      data: redact ? deepRedact(data) : data,
      draft: redact ? redactText(draft) : draft,
      tone,
    };
    const { data: res, error } = await invoke('ai-copilot', { body: payload });
    if (error) throw error;
    const reply = (res as any)?.reply || 'Sorry, I could not generate a response.';
    setMessages([...next, { role: 'assistant', content: reply }]);
    if (speak && reply) {
      try {
        const { data: audioRes, error: ttsErr } = await invoke('text-to-voice', { body: { text: reply } });
        if (ttsErr) throw ttsErr;
        const b64 = (audioRes as any)?.audioContent;
        if (b64) {
          const audio = new Audio(`data:audio/mp3;base64,${b64}`);
          audio.play().catch(()=>{});
        }
      } catch (e) {
        console.error('TTS error', e);
      }
    }
  } catch (e) {
    console.error(e);
    toast.error('Co‑pilot error');
    setMessages([...next, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
  } finally {
    setSending(false);
  }
};

// Helpers for voice recording and STT
const blobToBase64 = (blob: Blob) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => {
    const res = reader.result as string;
    resolve((res.split(',')[1]) || '');
  };
  reader.onerror = reject;
  reader.readAsDataURL(blob);
});

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    chunksRef.current = [];
    mr.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = async () => {
      try {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const base64 = await blobToBase64(blob);
        setIsRecording(false);
        const { data: sttRes, error: sttErr } = await invoke('voice-to-text', { body: { audio: base64 } });
        if (sttErr) throw sttErr;
        const text = (sttRes as any)?.text?.trim?.();
        if (text) {
          setInput(text);
          await send(text);
        } else {
          toast.error('Could not understand audio');
        }
      } catch (err) {
        console.error(err);
        toast.error('Voice transcription failed');
      } finally {
        try { stream.getTracks().forEach(t => t.stop()); } catch {}
      }
    };
    mediaRecorderRef.current = mr;
    mr.start();
    setIsRecording(true);
  } catch (e) {
    console.error(e);
    toast.error('Microphone access denied');
  }
};

const stopRecording = () => {
  const mr = mediaRecorderRef.current;
  if (mr && mr.state !== 'inactive') {
    try { mr.stop(); } catch {}
  }
};

const handleToggleRecording = async () => {
  if (isRecording) stopRecording();
  else await startRecording();
};

function getQuickPrompts(step?: number): string[] {
  switch (step) {
    case 5:
      return ['Draft primary guardian clause', 'Draft alternate guardian clause', 'Explain guardian responsibilities'];
    case 6:
      return ['Draft a specific gift clause', 'Suggest clearer gift wording'];
    case 8:
      return ['Draft a pet care clause'];
    case 9:
      return ['Draft funeral instructions'];
    case 11:
      return ['Summarize my draft', 'List potential ambiguities'];
    default:
      return ['Summarize my draft', 'Improve clarity of executor clause', 'List potential ambiguities'];
  }
}

useEffect(() => {
  const la = [...messages].reverse().find(m => m.role === 'assistant');
  if (!la) return;
  const t = la.content.toLowerCase();
  if (t.includes('funeral') || t.includes('burial') || t.includes('cremat')) {
    setInsertTarget('funeral');
  } else if (t.includes('pet')) {
    setInsertTarget('pet');
  } else if (t.includes('guardian')) {
    if (t.includes('alternate') || t.includes('alt')) setInsertTarget('altGuardian');
    else setInsertTarget('guardian');
  } else if (t.includes('gift') || t.includes('bequest') || t.includes('specific')) {
    setInsertTarget('gift');
    const len = Array.isArray((data as any)?.gifts) ? (data as any).gifts.length : 0;
    setGiftIndex(Math.max(0, len - 1));
  }
}, [messages, data]);

const lastAssistant = [...messages].reverse().find(m=>m.role==='assistant');

  const handleVoiceAutoFillData = (extractedData: ExtractedData, confidence: Record<string, number>) => {
    onVoiceAutoFill?.(extractedData, confidence);
    onOpenChange(false);
    toast.success("Form auto-filled with voice data!");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>AI Co‑pilot</SheetTitle>
        </SheetHeader>
        
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="voice-fill" className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Voice Fill
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="voice-fill" className="mt-4">
            <VoiceAutoFillPanel 
              onDataExtracted={handleVoiceAutoFillData}
              onCancel={() => onOpenChange(false)}
            />
          </TabsContent>
          
          <TabsContent value="chat" className="mt-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Tone</Label>
              <Select value={tone} onValueChange={(v)=> onToneChange?.(v as any)}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Select tone"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="plain">Plain</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="compassionate">Compassionate</SelectItem>
                  <SelectItem value="concise">Concise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Redact personal details</Label>
              <Switch checked={redact} onCheckedChange={(v)=> setRedact(!!v)} />
              <Label className="text-sm">Speak replies</Label>
              <Switch checked={speak} onCheckedChange={(v)=> setSpeak(!!v)} />
              <Button size="sm" variant="outline" onClick={()=>{
                const la = lastAssistant; if (!la) return; navigator.clipboard.writeText(la.content).then(()=> toast.success('Copied')).catch(()=> toast.error('Copy failed'));
              }} disabled={!lastAssistant}>Copy last</Button>
              <Button size="sm" variant="ghost" onClick={()=>{
                setMessages([{ role:'assistant', content: 'Hi! I\'m your co‑pilot. Ask me anything or say "draft a guardian clause" and I\'ll help.' }]);
                toast.success('Chat cleared');
              }}>Clear</Button>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {getQuickPrompts(currentStep).map((p, idx)=> (
              <Button key={idx} size="sm" variant="outline" onClick={()=>{ setInput(p); send(p); }}>{p}</Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 h-[calc(100vh-20rem)]">
          <ScrollArea className="flex-1 rounded-md border p-3 bg-card min-h-0">
            <div className="space-y-3">
              {messages.map((m, i)=> (
                <div key={i} className={m.role==='user' ? 'text-right' : 'text-left'}>
                  <div className={`inline-block rounded-md px-3 py-2 ${m.role==='user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>{m.content}</div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
          </ScrollArea>

          <div className="flex-shrink-0 space-y-3">
            {lastAssistant && (
              <div className="rounded-md border p-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Label className="text-sm">Insert last reply into</Label>
                  <Select value={insertTarget} onValueChange={(v)=> setInsertTarget(v as CopilotTarget)}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Select target"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="funeral">Funeral</SelectItem>
                      <SelectItem value="pet">Pet clause</SelectItem>
                      <SelectItem value="guardian">Guardian</SelectItem>
                      <SelectItem value="altGuardian">Alt Guardian</SelectItem>
                      <SelectItem value="gift">Gift (choose index)</SelectItem>
                    </SelectContent>
                  </Select>
                  {insertTarget==='gift' && (
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Index</Label>
                      <Input type="number" min={0} value={giftIndex} onChange={(e)=> setGiftIndex(parseInt(e.target.value || '0', 10))} className="w-20" />
                    </div>
                  )}
                  <Button size="sm" onClick={()=> onPropose(lastAssistant.content, insertTarget, insertTarget==='gift' ? giftIndex : undefined)}>Insert</Button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Input ref={inputRef} placeholder="Ask a question or request a clause…" value={input} onChange={(e)=> setInput(e.target.value)} onKeyDown={(e)=>{ if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
              <Button variant="outline" onClick={handleToggleRecording} aria-label={isRecording ? 'Stop recording' : 'Start recording'} title={isRecording ? 'Stop recording' : 'Start recording'}>
                {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button onClick={() => send()} disabled={sending}>{sending ? 'Sending…' : 'Send'}</Button>
            </div>
          </div>
        </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default CopilotPanel;
