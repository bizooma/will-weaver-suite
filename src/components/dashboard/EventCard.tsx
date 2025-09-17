import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Calendar, User, Globe } from "lucide-react";
import { format } from "date-fns";

interface MarketingEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_type: 'system' | 'user';
  created_by?: string;
  tags: string[];
  content_suggestions: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EventCardProps {
  event: MarketingEvent;
  onEdit: (event: MarketingEvent) => void;
  canEdit: boolean;
}

export function EventCard({ event, onEdit, canEdit }: EventCardProps) {
  const contentSuggestions = event.content_suggestions?.suggestions;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              {event.event_type === 'system' ? (
                <Globe className="h-4 w-4 text-blue-500" />
              ) : (
                <User className="h-4 w-4 text-green-500" />
              )}
              {event.title}
            </CardTitle>
            <CardDescription className="text-sm">
              {event.description}
            </CardDescription>
          </div>
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(event)}
              className="ml-2"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      {contentSuggestions && (
        <CardContent className="pt-0">
          <div className="bg-muted/50 rounded-md p-3">
            <div className="text-sm font-medium mb-1">Content Ideas:</div>
            <div className="text-sm text-muted-foreground">
              {contentSuggestions}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}