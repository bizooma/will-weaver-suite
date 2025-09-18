import React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PatternOption {
  id: string;
  name: string;
  preview: React.ReactNode;
}

interface PatternSelectorProps {
  value: string;
  onChange: (pattern: string) => void;
  options: PatternOption[];
  label?: string;
  className?: string;
}

export function PatternSelector({ value, onChange, options, label, className }: PatternSelectorProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <div className="grid grid-cols-3 gap-3">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={cn(
              "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:bg-accent",
              value === option.id 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-border/80"
            )}
            onClick={() => onChange(option.id)}
          >
            <div className="w-8 h-8 flex items-center justify-center">
              {option.preview}
            </div>
            <span className="text-xs font-medium">{option.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}