import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type CopilotTarget = 'funeral' | 'pet' | 'guardian' | 'altGuardian' | 'gift';

interface CopilotPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
  draft: string;
  tone: 'plain' | 'formal' | 'compassionate' | 'concise';
  onPropose: (text: string, target: CopilotTarget, index?: number) => void;
  seedPrompt?: string;
}

const CopilotPanel = ({ open, onOpenChange, data, draft, tone, onPropose, seedPrompt }: CopilotPanelProps) => {
  const [messages, setMessages] = useState<{ role: 'user'|'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hi! I\'m your co‑pilot. Ask me anything or say “draft a guardian clause” and I\'ll help.' }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [insertTarget, setInsertTarget] = useState<CopilotTarget>('funeral');
  const [giftIndex, setGiftIndex] = useState<number>(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

  useEffect(() => {
    if (open && seedPrompt) {
      setInput(seedPrompt);
    }
  }, [open, seedPrompt]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const { data: res, error } = await supabase.functions.invoke('ai-copilot', {
        body: { messages: next, data, draft, tone }
      });
      if (error) throw error;
      const reply = res?.reply || 'Sorry, I could not generate a response.';
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch (e) {
      console.error(e);
      toast.error('Co‑pilot error');
      setMessages([...next, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setSending(false);
    }
  };

  const lastAssistant = [...messages].reverse().find(m=>m.role==='assistant');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Conversational Co‑pilot</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full gap-3">
          <ScrollArea className="flex-1 rounded-md border p-3 bg-card">
            <div className="space-y-3">
              {messages.map((m, i)=> (
                <div key={i} className={m.role==='user' ? 'text-right' : 'text-left'}>
                  <div className={`inline-block rounded-md px-3 py-2 ${m.role==='user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>{m.content}</div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
          </ScrollArea>

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
            <Input placeholder="Ask a question or request a clause…" value={input} onChange={(e)=> setInput(e.target.value)} onKeyDown={(e)=>{ if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
            <Button onClick={send} disabled={sending}>{sending ? 'Sending…' : 'Send'}</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CopilotPanel;
