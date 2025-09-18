import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar as CalendarIcon, Filter } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AddEventDialog } from "./AddEventDialog";
import { EditEventDialog } from "./EditEventDialog";
import { EventCard } from "./EventCard";
import { HeritageMonthDisplay } from "./HeritageMonthDisplay";
import { cn } from "@/lib/utils";

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

export function MarketingCalendar() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMonth, setViewMonth] = useState<Date>(new Date());
  const [events, setEvents] = useState<MarketingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<MarketingEvent | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'system' | 'user'>('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('marketing_events')
        .select('*')
        .eq('is_active', true)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents((data || []) as MarketingEvent[]);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Parse dates properly to avoid timezone issues
  const parseEventDate = (dateString: string) => {
    // Parse as local date to avoid timezone conversion issues
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  };

  const selectedDateEvents = events.filter(event => 
    selectedDate && isSameDay(parseEventDate(event.event_date), selectedDate)
  );

  const filteredEvents = selectedDateEvents.filter(event => {
    if (filterType === 'all') return true;
    return event.event_type === filterType;
  });

  const eventDates = events.map(event => parseEventDate(event.event_date));

  const handleEventAdded = () => {
    fetchEvents();
    setShowAddDialog(false);
  };

  const handleEventUpdated = () => {
    fetchEvents();
    setEditingEvent(null);
  };

  const handleEventDeleted = () => {
    fetchEvents();
    setEditingEvent(null);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Marketing Calendar</h2>
          <p className="text-muted-foreground">
            Plan your social media content with legal marketing events and important dates
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              onMonthChange={setViewMonth}
              className={cn("w-full pointer-events-auto")}
              modifiers={{
                hasEvent: eventDates,
              }}
              modifiersStyles={{
                hasEvent: {
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  fontWeight: 'bold',
                },
              }}
            />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="all">All Events</option>
                  <option value="system">System Events</option>
                  <option value="user">My Events</option>
                </select>
              </div>
            </div>
            <CardDescription>
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} on this date
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center py-4">Loading events...</div>
            ) : filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEdit={setEditingEvent}
                  canEdit={event.event_type === 'user' && event.created_by === user?.id}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No events on this date.
                <br />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddDialog(true)}
                  className="mt-2"
                >
                  Add an event
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <HeritageMonthDisplay selectedDate={selectedDate || viewMonth} />

      <AddEventDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onEventAdded={handleEventAdded}
        selectedDate={selectedDate}
      />

      {editingEvent && (
        <EditEventDialog
          event={editingEvent}
          open={!!editingEvent}
          onOpenChange={() => setEditingEvent(null)}
          onEventUpdated={handleEventUpdated}
          onEventDeleted={handleEventDeleted}
        />
      )}
    </div>
  );
}