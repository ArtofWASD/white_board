import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Event as BackendEvent, EventResult, CalendarEvent } from '@/types';

interface UseCalendarEventsProps {
  teamId?: string;
  onUpdateEvents?: (events: CalendarEvent[]) => void;
}

export const useCalendarEvents = ({ teamId, onUpdateEvents }: UseCalendarEventsProps = {}) => {
    const { user, isAuthenticated, token } = useAuthStore();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [teams, setTeams] = useState<any[]>([]); // Using any[] to avoid strict type issues if Team is not perfectly matched, or import Team
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user teams to map names and colors
  useEffect(() => {
    const fetchTeams = async () => {
      if (!user || !token) return;
      try {
        const response = await fetch(`/api/teams?userId=${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
            const data = await response.json();
            setTeams(data);
        }
      } catch (e) {
        console.error("Failed to fetch teams for calendar colors", e);
      }
    };
    fetchTeams();
  }, [user, token]);

  const getTeamColor = useCallback((teamId?: string) => {
    if (!teamId) return 'bg-blue-100'; // Personal event default
    
    // Use index for consistent, distinct coloring based on user's team list order
    const teamIndex = teams.findIndex((t: any) => t.id === teamId);
    
    // Palette
    const colors = [
        'bg-red-100', 'bg-orange-100', 'bg-amber-100', 'bg-yellow-100', 
        'bg-lime-100', 'bg-green-100', 'bg-emerald-100', 'bg-teal-100', 
        'bg-cyan-100', 'bg-sky-100', 'bg-indigo-100', 'bg-violet-100', 
        'bg-purple-100', 'bg-fuchsia-100', 'bg-pink-100', 'bg-rose-100'
    ];
    
    if (teamIndex === -1) {
        // Fallback for unknown team (e.g. removed from list but event exists)
        // Hash it
        let hash = 0;
        for (let i = 0; i < teamId.length; i++) {
            hash = teamId.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }
    
    return colors[teamIndex % colors.length];
  }, [teams]);

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
        
        const team = teams.find((t: any) => t.id === event.teamId);
        
        return {
          id: event.id,
          title: event.title,
          date: event.eventDate.split('T')[0],
          exerciseType: event.exerciseType,
          exercises: event.exercises || [],
          results: results,
          color: getTeamColor(event.teamId),
          teamId: event.teamId,
          teamName: team ? team.name : undefined,
          timeCap: event.timeCap,
          rounds: event.rounds,
          description: event.description,
          userId: event.userId,
          participants: event.participants
        };
      }));

      // Filter logic logic derived from original component
      const filteredEvents = calendarEvents.filter(event => {
        // Fallback or explicit 'my'
        if (!teamId || teamId === 'my') {
            // Strictly personal events: Created by me AND not assigned to a team
            return event.id && (!event.teamId && (event as any).userId === user?.id); 
        }
        
        if (teamId === 'all_teams') {
            // "All Teams" view should show events from all teams the user is part of.
            // It should NOT show personal events (which have no teamId).
             return !(!event.teamId && (event as any).userId === user?.id);
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
  }, [isAuthenticated, user, teamId, onUpdateEvents, teams, getTeamColor, token]);

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
      // Filter out special filter values for teamId
      const currentTeamId = ['all', 'my', 'all_teams'].includes(teamId || '') ? undefined : teamId;

      // Determine teamId: prioritize eventData.teamId if it exists (even if null/""), default to currentTeamId
      let finalTeamId = eventData.teamId !== undefined ? eventData.teamId : currentTeamId;
      // Ensure empty string becomes null for backend consistency if needed, or keep as is if backend handles it.
      // Assuming backend expects null or UUID.
      if (finalTeamId === '') finalTeamId = null;

      const body = {
        ...eventData,
        userId: eventData.userId || user.id, // Allow override for assigning events
        eventDate: new Date(eventData.date || selectedDate!).toISOString(),
        teamId: finalTeamId,
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
