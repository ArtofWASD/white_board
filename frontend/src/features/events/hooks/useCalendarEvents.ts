import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Event as BackendEvent, EventResult } from '@/types';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  exerciseType?: string;
  exercises?: any[];
  results?: EventResult[];
  color?: string;
  teamId?: string;
  timeCap?: string;
  rounds?: string;
  description?: string;
}

interface UseCalendarEventsProps {
  teamId?: string;
  onUpdateEvents?: (events: CalendarEvent[]) => void;
}

export const useCalendarEvents = ({ teamId, onUpdateEvents }: UseCalendarEventsProps = {}) => {
  const { user, isAuthenticated } = useAuthStore();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({ userId: user.id });
      if (teamId) {
        queryParams.append('teamId', teamId);
      }
      
      const response = await fetch(`/api/events?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data: BackendEvent[] = await response.json();
      
      const calendarEvents: CalendarEvent[] = await Promise.all(data.map(async event => {
        // Fetch results for each event (optimization potential here: fetch all results in one go or side-load)
        const resultsResponse = await fetch(`/api/events/${event.id}/results`);
        let results: EventResult[] = [];
        
        if (resultsResponse.ok) {
           const resultsData = await resultsResponse.json();
           results = resultsData.map((result: any) => ({
             id: result.id,
             time: result.time,
             dateAdded: new Date(result.dateAdded).toLocaleDateString('ru-RU'),
             username: result.username,
           }));
        }
        
        return {
          id: event.id,
          title: event.title,
          date: event.eventDate.split('T')[0],
          exerciseType: event.exerciseType,
          exercises: event.exercises || [],
          results: results,
          color: 'bg-blue-100',
          teamId: event.teamId,
          timeCap: event.timeCap,
          rounds: event.rounds,
          description: event.description
        };
      }));

      // Filter logic logic derived from original component
      const filteredEvents = calendarEvents.filter(event => {
        if (teamId) {
          // Team Board: events this team or personal
          return event.teamId === teamId || !event.teamId;
        } else {
          // Personal Board: only personal
          return !event.teamId;
        }
      });

      setEvents(filteredEvents);
      if (onUpdateEvents) {
        onUpdateEvents(filteredEvents);
      }
    } catch (err: any) {

      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, teamId, onUpdateEvents]);

  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const deleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });

      if (response.ok) {
        await fetchEvents();
        return true;
      }
      return false;
    } catch (error) {

      return false;
    }
  };

  const createEvent = async (eventData: any, selectedDate?: string) => {
    if (!user) return false;
    try {
      const body = {
        ...eventData,
        userId: user.id,
        eventDate: new Date(eventData.date || selectedDate!).toISOString(),
        teamId: teamId || eventData.teamId,
      };

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchEvents();
        return true;
      }
      return false;
    } catch (error) {

      return false;
    }
  };

  const updateEvent = async (eventId: string, eventData: any) => {
    if (!user) return false;
    try {
        const body = {
            ...eventData,
            userId: user.id,
            eventDate: new Date(eventData.date).toISOString(),
            // Ensure we keep the teamId unless explicitly changed? 
            // The backend might handle partial updates or we verify the structure
        };

        const response = await fetch(`/api/events/${eventId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (response.ok) {
            await fetchEvents();
            return true;
        }
        return false;
    } catch (error) {

        return false;
    }
  };

  const addResult = async (eventId: string, resultData: any) => {
      if (!user) return false;
      try {
        const response = await fetch(`/api/events/${eventId}/results`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...resultData,
                userId: user.id,
                username: user.name 
            }),
        });
        
        if (response.ok) {
            await fetchEvents();
            return true;
        }
        return false;
      } catch (error) {

          return false;
      }
  };

  return {
    events,
    loading,
    error,
    refreshEvents: fetchEvents,
    deleteEvent,
    createEvent,
    updateEvent,
    addResult,
  };
};
