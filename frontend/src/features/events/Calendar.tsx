'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventContentArg } from '@fullcalendar/core';
import { useAuthStore } from '../../lib/store/useAuthStore';
import EventModal from './EventModal';
import EventActionMenu from './EventActionMenu';
import AddResultModal from './AddResultModal';
import AddEventButton from './AddEventButton';
import { Event as BackendEvent, EventResult } from '../../types';

interface CalendarEvent {
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
}

interface CalendarProps {
  isMenuOpen: boolean;
  teamId?: string;
  onUpdateEvents?: (events: CalendarEvent[]) => void;
}

interface EventTooltipProps {
  event: CalendarEvent;
  position: { top: number; left: number };
  onClose: () => void;
}

const EventTooltip: React.FC<EventTooltipProps> = ({ event, position, onClose }) => {
  return (
    <div 
      className="fixed z-50 bg-white rounded-lg shadow-xl p-4 border border-gray-200 w-64 pointer-events-none"
      style={{ 
        top: position.top, 
        left: position.left,
        transform: 'translate(-50%, -100%)',
        marginTop: '-10px'
      }}
    >
      <h3 className="font-bold text-lg mb-2">{event.title}</h3>
      {event.exerciseType && (
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-semibold">Тип:</span> {event.exerciseType}
        </p>
      )}
      {event.timeCap && (
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-semibold">Time Cap:</span> {event.timeCap}
        </p>
      )}
      {event.rounds && (
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-semibold">Rounds:</span> {event.rounds}
        </p>
      )}
      {event.exercises && event.exercises.length > 0 && (
        <div className="mt-2">
          <p className="font-semibold text-sm mb-1">Упражнения:</p>
          <ul className="text-sm list-disc pl-4">
            {event.exercises.slice(0, 3).map((ex, idx) => (
              <li key={idx}>{ex.name}</li>
            ))}
            {event.exercises.length > 3 && <li>...</li>}
          </ul>
        </div>
      )}
      {event.results && event.results.length > 0 && (
        <div className="mt-2 text-sm border-t pt-2 border-gray-100">
          <p className="font-semibold text-sm mb-1">Результаты:</p>
          <ul className="list-disc pl-4 text-gray-700">
            {event.results.slice(0, 3).map((result, idx) => (
              <li key={idx} className="flex flex-col">
                 <span className="font-medium">{result.time}</span>
                 <span className="text-xs text-gray-500">{result.username}</span>
              </li>
            ))}
            {event.results.length > 3 && <li>...</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

const Calendar: React.FC<CalendarProps> = ({ isMenuOpen, teamId, onUpdateEvents }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showAddEventButton, setShowAddEventButton] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [showEventActionMenu, setShowEventActionMenu] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  const [showAddResultModal, setShowAddResultModal] = useState(false);
  const [eventToAddResult, setEventToAddResult] = useState<CalendarEvent | null>(null);
  const [tooltipEvent, setTooltipEvent] = useState<CalendarEvent | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const calendarRef = useRef<FullCalendar>(null);

  const fetchEvents = useCallback(async () => {
    if (isAuthenticated && user) {
      try {
        const queryParams = new URLSearchParams({ userId: user.id });
        if (teamId) {
          queryParams.append('teamId', teamId);
        }
        const response = await fetch(`/api/events?${queryParams.toString()}`);
        const data: BackendEvent[] = await response.json();
        
        if (response.ok) {
          const calendarEvents: CalendarEvent[] = await Promise.all(data.map(async event => {
            const resultsResponse = await fetch(`/api/events/${event.id}/results`);
            let results: EventResult[] = [];
            
            if (resultsResponse.ok) {
              const resultsData = await resultsResponse.json();
              results = resultsData.map((result: { id: string; time: string; dateAdded: string; username: string }) => ({
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
              rounds: event.rounds
            };
          }));

          // Filter events based on the current view (teamId)
          // 1. If we are on a Team Board (teamId is present):
          //    - Show events that belong to THIS team (event.teamId === teamId)
          //    - Show personal events (event.teamId is undefined/null)
          // 2. If we are on Personal Board (teamId is undefined):
          //    - Show ONLY personal events (event.teamId is undefined/null)
          
          const filteredEvents = calendarEvents.filter(event => {
            if (teamId) {
              // Team Board
              return event.teamId === teamId || !event.teamId;
            } else {
              // Personal Board
              return !event.teamId;
            }
          });

          setEvents(filteredEvents);
          if (onUpdateEvents) {
            onUpdateEvents(filteredEvents);
          }
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    }
  }, [isAuthenticated, user, teamId, onUpdateEvents]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (calendarRef.current) {
        calendarRef.current.getApi().updateSize();
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (calendarRef.current) {
        calendarRef.current.getApi().updateSize();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [isMenuOpen, windowWidth]);

  const handleDateClick = (arg: { dateStr: string, jsEvent: MouseEvent }) => {
    arg.jsEvent.stopPropagation();
    setShowEventActionMenu(false);
    setTooltipEvent(null);
    const rect = (arg.jsEvent.target as HTMLElement).getBoundingClientRect();
    setButtonPosition({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX
    });
    setSelectedDate(arg.dateStr);
    setShowAddEventButton(true);
  };

  const handleEventClick = (arg: { event: { id: string }, jsEvent: MouseEvent }) => {
    arg.jsEvent.stopPropagation();
    setShowAddEventButton(false);
    setTooltipEvent(null);
    const event = events.find(e => e.id === arg.event.id);
    if (event) {
      setSelectedEvent(event);
      const rect = (arg.jsEvent.target as HTMLElement).getBoundingClientRect();
      setButtonPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX
      });
      setShowEventActionMenu(true);
    }
  };

  const handleEventMouseEnter = (arg: { event: { id: string }, jsEvent: MouseEvent }) => {
    if (showEventActionMenu) return;
    
    const event = events.find(e => e.id === arg.event.id);
    if (event) {
      const rect = (arg.jsEvent.target as HTMLElement).getBoundingClientRect();
      setTooltipPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX + (rect.width / 2)
      });
      setTooltipEvent(event);
    }
  };

  const handleEventMouseLeave = () => {
    setTooltipEvent(null);
  };

  const handleAddEvent = () => {
    setShowAddEventButton(false);
    setEventToEdit(null); // Ensure we are not in edit mode
    setShowEditModal(true);
  };

  const handleCloseAddEvent = () => {
    setShowAddEventButton(false);
  };

  const handleCloseEventActionMenu = () => {
    setShowEventActionMenu(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      });

      if (response.ok) {
        fetchEvents();
        handleCloseEventActionMenu();
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEventToEdit(event);
    setShowEditModal(true);
    handleCloseEventActionMenu();
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEventToEdit(null);
  };

  const handleUpdateEvent = async (eventData: any) => {
    if (!user) return;

    try {
      const method = eventToEdit ? 'PUT' : 'POST';
      const url = eventToEdit ? `/api/events/${eventToEdit.id}` : '/api/events';
      
      const validDate = eventToEdit ? eventToEdit.date : selectedDate;
      const body = {
        ...eventData,
        userId: user.id,
        eventDate: new Date(validDate).toISOString(),
        teamId: teamId || eventToEdit?.teamId // Use passed teamId if creating new event
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        fetchEvents();
        handleCloseEditModal();
      }
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleAddResult = (event: CalendarEvent) => {
    setEventToAddResult(event);
    setShowAddResultModal(true);
    handleCloseEventActionMenu();
  };

  const handleCloseAddResultModal = () => {
    setShowAddResultModal(false);
    setEventToAddResult(null);
  };

  const handleSaveResult = async (resultData: any) => {
    if (!eventToAddResult || !user) return;

    try {
      const response = await fetch(`/api/events/${eventToAddResult.id}/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...resultData,
          userId: user.id,
          username: user.name // Assuming we want to display the user's name
        }),
      });

      if (response.ok) {
        fetchEvents();
        handleCloseAddResultModal();
      }
    } catch (error) {
      console.error('Failed to save result:', error);
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Don't close if clicking inside the menu or button
      if (target.closest('.event-action-menu') || target.closest('.add-event-button')) {
        return;
      }

      if (showAddEventButton) {
        setShowAddEventButton(false);
      }
      if (showEventActionMenu) {
        setShowEventActionMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showAddEventButton, showEventActionMenu, selectedEvent]);

  const renderEventContent = (eventInfo: EventContentArg) => {
    const event = events.find(e => e.id === eventInfo.event.id);
    const eventColor = event?.color || 'bg-blue-100';
    
    return (
      <div 
        className={`fc-event-main ${eventColor} h-[30px] sm:h-[35px] md:h-[40px] lg:h-[45px] xl:h-[50px] flex items-center px-1 py-0.5 sm:px-2 sm:py-1 overflow-hidden mb-0.5 last:mb-0`}
        style={{ color: 'black' }}
        data-id={eventInfo.event.id}
        onMouseEnter={(e) => handleEventMouseEnter({ 
          event: { id: eventInfo.event.id }, 
          jsEvent: e.nativeEvent 
        })}
        onMouseLeave={handleEventMouseLeave}
      >
        <b className="text-xs sm:text-sm md:text-sm lg:text-base mr-1 sm:mr-2 flex-shrink-0">{eventInfo.timeText}</b>
        <i className="text-xs sm:text-sm md:text-sm lg:text-base truncate">{eventInfo.event.title}</i>
      </div>
    );
  };

  return (
    <div className={`p-2 sm:p-4 lg:p-6 relative transition-all duration-300 ease-in-out w-full ${isMenuOpen ? 'md:pl-4' : ''}`}>

      <div className="transition-all duration-300 ease-in-out min-h-[400px] sm:min-h-[500px] md:min-h-[700px] lg:min-h-[800px] xl:min-h-[900px]">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events.map(event => ({
            id: event.id,
            title: event.title,
            date: event.date,
            classNames: ['calendar-event']
          }))}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek,dayGridDay'
          }}
          height="auto"
          contentHeight="auto"
          aspectRatio={windowWidth <= 425 ? 0.8 : windowWidth <= 768 ? 1.1 : 1.35}
        />
      </div>
      
      {showAddEventButton && (
        <AddEventButton
          onAddEvent={handleAddEvent}
          onCancel={handleCloseAddEvent}
          date={selectedDate}
          position={buttonPosition}
          teamId={teamId}
        />
      )}
      
      {showEventActionMenu && selectedEvent && (
        <EventActionMenu
          onDelete={() => handleDeleteEvent(selectedEvent.id)}
          onEdit={() => handleEditEvent(selectedEvent)}
          onAddResult={() => handleAddResult(selectedEvent)}
          position={buttonPosition}
          onClose={handleCloseEventActionMenu}
        />
      )}
      
      {showEditModal && (
        <EventModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onSave={handleUpdateEvent}
          date={eventToEdit?.date || selectedDate}
          eventData={eventToEdit ? {
            title: eventToEdit.title,
            exerciseType: eventToEdit.exerciseType || '',
            exercises: eventToEdit.exercises || [],
            results: eventToEdit.results || [],
            teamId: eventToEdit.teamId,
            timeCap: eventToEdit.timeCap,
            rounds: eventToEdit.rounds
          } : undefined}
          initialTeamId={teamId}
        />
      )}
              
      {showAddResultModal && eventToAddResult && (
        <AddResultModal
          isOpen={showAddResultModal}
          onClose={handleCloseAddResultModal}
          onSave={handleSaveResult}
          eventName={eventToAddResult.title}
        />
      )}
      
      {tooltipEvent && (
        <EventTooltip 
          event={tooltipEvent} 
          position={tooltipPosition}
          onClose={() => setTooltipEvent(null)}
        />
      )}
    </div>
  );
};

export default Calendar;