import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  event_date: z.date({
    required_error: "Event date is required",
  }),
  tags: z.array(z.string()).default([]),
  content_suggestions: z.string().max(1000, "Content suggestions must be less than 1000 characters").optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventAdded: () => void;
  selectedDate?: Date;
}

const commonTags = [
  "Social Media",
  "Legal Holiday",
  "Court Deadline",
  "Marketing",
  "Educational",
  "Networking",
  "Industry News",
  "Client Relations"
];

export function AddEventDialog({ open, onOpenChange, onEventAdded, selectedDate }: AddEventDialogProps) {
  const { user } = useAuth();
  const [tagInput, setTagInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      event_date: selectedDate || new Date(),
      tags: [],
      content_suggestions: "",
    },
  });

  React.useEffect(() => {
    if (selectedDate) {
      form.setValue("event_date", selectedDate);
    }
  }, [selectedDate, form]);

  const addTag = (tag: string) => {
    const currentTags = form.getValues("tags");
    if (tag && !currentTags.includes(tag)) {
      form.setValue("tags", [...currentTags, tag]);
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };

  const checkForDuplicates = async (title: string, eventDate: string) => {
    try {
      const { data: existingEvents } = await supabase
        .from('marketing_events')
        .select('id, title, event_type')
        .eq('event_date', eventDate)
        .eq('is_active', true)
        .ilike('title', `%${title.trim()}%`);

      return existingEvents || [];
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return [];
    }
  };

  const onSubmit = async (data: EventFormData) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const eventDateString = format(data.event_date, 'yyyy-MM-dd');
      
      // Check for potential duplicates
      const duplicates = await checkForDuplicates(data.title, eventDateString);
      
      if (duplicates.length > 0) {
        const confirmed = window.confirm(
          `Similar event(s) already exist on this date:\n${duplicates.map(d => `• ${d.title}`).join('\n')}\n\nDo you want to add this event anyway?`
        );
        
        if (!confirmed) {
          setLoading(false);
          return;
        }
      }
      
      const { error } = await supabase
        .from('marketing_events')
        .insert({
          title: data.title,
          description: data.description || null,
          event_date: eventDateString,
          event_type: 'user',
          created_by: user.id,
          tags: data.tags,
          content_suggestions: data.content_suggestions ? { suggestions: data.content_suggestions } : {},
        });

      if (error) throw error;

      toast.success("Event added successfully!");
      form.reset();
      onEventAdded();
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error("Failed to add event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Marketing Event</DialogTitle>
          <DialogDescription>
            Create a new event for your marketing calendar to help plan your social media content.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Law Day 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of the event..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="event_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Event Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
                        {field.value?.map((tag) => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => removeTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag..."
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag(tagInput);
                            }
                          }}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => addTag(tagInput)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {commonTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                            onClick={() => addTag(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Add tags to categorize your event. Click on suggested tags or type your own.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content_suggestions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content Suggestions (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ideas for social media posts related to this event..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Add ideas for social media posts or content related to this event.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Event"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}