import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMemo } from "react";

interface SuggestionReviewDialogProps {
  open: boolean;
  suggestion: string;
  onAppend: () => void;
  onReplace: () => void;
  onClose: () => void;
}

const SuggestionReviewDialog = ({ open, suggestion, onAppend, onReplace, onClose }: SuggestionReviewDialogProps) => {
  const preview = useMemo(() => suggestion?.trim() || "", [suggestion]);

  return (
    <Dialog open={open} onOpenChange={(v)=>{ if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Review AI suggestion</DialogTitle>
          <DialogDescription>Choose how to insert the suggested text.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Textarea readOnly value={preview} className="min-h-[180px]" />
          <p className="text-xs text-muted-foreground">Tip: You can tweak the wording after inserting.</p>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onReplace}>Replace</Button>
          <Button variant="secondary" onClick={onAppend}>Append</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuggestionReviewDialog;
