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
  userId?: string;
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
      // Only append teamId if it is a specific UUID, not our special filter keywords
      const isSpecialFilter = ['all', 'my', 'all_teams'].includes(teamId || '');
      
      if (teamId && !isSpecialFilter) {
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
          description: event.description,
          userId: event.userId
        };
      }));

      // Filter logic logic derived from original component
      const filteredEvents = calendarEvents.filter(event => {
        // Fallback or explicit 'my'
        if (!teamId || teamId === 'my') {
            // Strictly personal events: Created by me AND not assigned to a team
            return event.id && (!event.teamId && (event as any).userId === user?.id); 
            // Note: event object might not have userId on frontend type?
            // Let's check the type definition used in this file. 
            // BackendEvent has userId. CalendarEvent might not mapped it.
            // I need to ensure userId is available in CalendarEvent.
            // I will update the map function above first? 
            // Wait, I can't check userId if it's not mapped.
            // Let's assume for a moment I can access it or I need to add it.
        }
        
        if (teamId === 'all_teams') {
            // "All Teams" view should aggregate what you see on individual team boards.
            // Individual team boards show: Team Events + Personal Events.
            // Therefore, "All Teams" should show: All Team Events + Personal Events.
            // Since backend "Normal View" fetches exactly this set (User's Personal + User's Teams),
            // we should simply return everything fetched.
             return true;
        }

        if (teamId === 'all') {
            return true;
        }

        // Specific Team: events this team or personal
        return event.teamId === teamId || !event.teamId;
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
