/**
 * ItemsEditor — Generic add / remove / reorder row editor for array fields
 * (practice area items, testimonial items, FAQ items, bar admissions).
 *
 * It owns no state: the parent passes the current array and receives a new
 * array via onChange on every edit, keeping the section draft the single
 * source of truth. Reordering uses up/down buttons (no drag-and-drop) so it is
 * keyboard- and touch-friendly at 375px.
 */
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { moveItem } from "./siteRules";

interface ItemsEditorProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  /** Factory for a blank row when the firm clicks "Add". */
  createItem: () => T;
  /** Renders the inputs for one row. Call `update` with the edited row. */
  renderItem: (item: T, update: (next: T) => void, index: number) => React.ReactNode;
  /** Singular noun used in button labels, e.g. "question". */
  itemNoun: string;
}

export function ItemsEditor<T>({ items, onChange, createItem, renderItem, itemNoun }: ItemsEditorProps<T>) {
  const updateAt = (index: number, next: T) => onChange(items.map((it, i) => (i === index ? next : it)));
  const removeAt = (index: number) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">No {itemNoun}s yet.</p>
      )}

      {items.map((item, index) => (
        <div key={index} className="rounded-md border border-border bg-muted/30 p-3 space-y-3">
          {/* Row toolbar: position label + move/remove controls */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {itemNoun} {index + 1}
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button" variant="ghost" size="icon" className="h-8 w-8"
                onClick={() => onChange(moveItem(items, index, -1))}
                disabled={index === 0}
                aria-label={`Move ${itemNoun} ${index + 1} up`}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button" variant="ghost" size="icon" className="h-8 w-8"
                onClick={() => onChange(moveItem(items, index, 1))}
                disabled={index === items.length - 1}
                aria-label={`Move ${itemNoun} ${index + 1} down`}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => removeAt(index)}
                aria-label={`Remove ${itemNoun} ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {renderItem(item, (next) => updateAt(index, next), index)}
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, createItem()])}>
        <Plus className="mr-2 h-4 w-4" />
        Add {itemNoun}
      </Button>
    </div>
  );
}
