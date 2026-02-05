'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventContentArg } from '@fullcalendar/core';
import { useAuthStore } from '../../lib/store/useAuthStore';
import EventModal from './EventModal';
import EventActionMenu from './EventActionMenu';
import AddResultModal from './AddResultModal';
import AddEventButton from './AddEventButton';
import { Event as BackendEvent, EventResult, CalendarEvent } from '../../types';

import { useCalendarEvents } from './hooks/useCalendarEvents';

interface CalendarProps {
  isMenuOpen: boolean;
  teamId?: string;
  onUpdateEvents?: (events: CalendarEvent[]) => void;
}

import { EventTooltip } from './EventTooltip';

const Calendar: React.FC<CalendarProps> = ({ isMenuOpen, teamId, onUpdateEvents }) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    events, 
    refreshEvents, 
    deleteEvent, 
    createEvent, 
    updateEvent, 
    addResult 
  } = useCalendarEvents({ teamId, onUpdateEvents });

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
        top: rect.top,
        left: rect.left + (rect.width / 2)
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
    const success = await deleteEvent(eventId);
    if (success) {
      handleCloseEventActionMenu();
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

    if (eventToEdit) {
      // Update
      const success = await updateEvent(eventToEdit.id, {
          ...eventData,
          date: new Date(eventToEdit.date).toISOString() // Or keep date as is? The modal probably returns correct date
          // wait, the logic was:
          // const validDate = eventToEdit ? eventToEdit.date : selectedDate;
          // But here eventData usually comes from the form.
          // Let's assume eventData has the fields from the form.
          // The previous logic used `validDate` to set `eventDate`.
      });
      // Correcting to match original logic simplifed:
      const validDate = eventToEdit ? eventToEdit.date : selectedDate;
      const body = {
        ...eventData,
        date: validDate, 
        // Allow moving event to another team if changed in modal
        teamId: eventData.teamId || teamId || eventToEdit?.teamId,
      };
      
      const updateSuccess = await updateEvent(eventToEdit.id, body);
      if (updateSuccess) handleCloseEditModal();
      
    } else {
      // Create
      const { assignedUserIds, ...restData } = eventData;
      
      // Map assignedUserIds to participantIds for the backend
      // We keep the teamId as is (selectedTeamId from modal), allowing "Assigned Team Event"
      // or "Personal Event" if no team selected (though modal restricts assignment to teams)
      const createSuccess = await createEvent({
          ...restData,
          participantIds: assignedUserIds
      }, selectedDate);

      if (createSuccess) handleCloseEditModal();
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
    if (!eventToAddResult) return;
    const success = await addResult(eventToAddResult.id, resultData);
    if (success) handleCloseAddResultModal();
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

  const handleStartTimer = () => {
    if (!selectedEvent) return;
    
    // Parse time cap or duration
    let timeCapSeconds = 0;
    if (selectedEvent.timeCap) {
       // Normalize: replace comma with dot, remove non-numeric except dot and colon
       const raw = selectedEvent.timeCap.replace(',', '.').replace(/[^0-9:.]/g, '');
       
       if (raw.includes(':')) {
           const parts = raw.split(':').map(Number);
           if (parts.length === 2) {
             timeCapSeconds = parts[0] * 60 + parts[1];
           }
       } else {
           // Assume format like "15" means 15 minutes if no colon is present? 
           // Or should we assume seconds? 
           // The placeholder says "15:00". "1" usually means 1 minute in this context.
           // Let's assume minutes if parsed value < 100, wait, ambiguity.
           // Standard WOD notation: "20 min" or "20:00".
           // If user typed "1", it likely means 1 minute.
           const val = parseFloat(raw);
           if (!isNaN(val)) {
               timeCapSeconds = val * 60;
           }
       }
    }

    // Determine mode
    let mode = '';
    switch (selectedEvent.exerciseType) {
      case 'For Time': mode = 'FOR_TIME'; break;
      case 'AMRAP': mode = 'AMRAP'; break;
      case 'EMOM': mode = 'EMOM'; break;
      case 'Not for Time': mode = 'INTERVALS'; break; // Or regular timer?
    }
    
    if (!mode) return; // Should we show error or just default to something? Defaulting to not navigating is safer.
    
    const params = new URLSearchParams();
    params.set('mode', mode);
    params.set('eventId', selectedEvent.id);
    if (selectedEvent.rounds) params.set('rounds', selectedEvent.rounds);
    
    if (mode === 'FOR_TIME' && timeCapSeconds > 0) {
       params.set('timeCap', timeCapSeconds.toString());
    } else if (mode === 'AMRAP' && timeCapSeconds > 0) {
       // Assuming timeCap field is used for AMRAP duration too in the UI per EventModal logic
       // EventModal uses timeCap field for AMRAP duration as well ("Time Cap (Лимит времени)")
       params.set('duration', timeCapSeconds.toString());
    }

    if (mode === 'EMOM') {
        // EMOM usually needs interval and rounds.
        // If we only have rounds, we might default interval to 60s.
        params.set('intervalWork', '60');
    }
    
    router.push(`/timer?${params.toString()}`);
    handleCloseEventActionMenu();
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
          onStartTimer={handleStartTimer}
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
            rounds: eventToEdit.rounds,
            participants: eventToEdit.participants
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
          scheme={eventToAddResult.scheme || 'FOR_TIME'}
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