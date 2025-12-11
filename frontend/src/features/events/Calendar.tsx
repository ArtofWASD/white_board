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

import { useCalendarEvents, CalendarEvent } from './hooks/useCalendarEvents';

interface CalendarProps {
  isMenuOpen: boolean;
  teamId?: string;
  onUpdateEvents?: (events: CalendarEvent[]) => void;
}

import { EventTooltip } from './EventTooltip';

const Calendar: React.FC<CalendarProps> = ({ isMenuOpen, teamId, onUpdateEvents }) => {
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
        teamId: teamId || eventToEdit?.teamId,
      };
      
      const updateSuccess = await updateEvent(eventToEdit.id, body);
      if (updateSuccess) handleCloseEditModal();
      
    } else {
      // Create
      const createSuccess = await createEvent(eventData, selectedDate);
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