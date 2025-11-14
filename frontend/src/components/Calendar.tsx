'use client';

import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventContentArg } from '@fullcalendar/core';
import AddEventButton from './AddEventButton';
import EventActionMenu from './EventActionMenu';
import EventModal from './EventModal';
import AddResultModal from './AddResultModal';

interface Exercise {
  id: number;
  name: string;
  weight: string;
  repetitions: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  exerciseType?: string;
  exercises?: Exercise[];
}

interface CalendarProps {
  isMenuOpen?: boolean;
}

// New component for event tooltip
const EventTooltip: React.FC<{ 
  event: CalendarEvent; 
  position: { x: number; y: number };
  onClose: () => void;
}> = ({ event, position, onClose }) => {
  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      onClose();
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div 
      className="absolute z-30 bg-white p-3 rounded-lg shadow-lg border border-gray-200 w-64"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        transform: 'translateY(10px)'
      }}
    >
      <div className="font-semibold text-gray-800">{event.title}</div>
      <div className="text-sm text-gray-600 mt-1">
        Дата: {event.date}
      </div>
      {event.exerciseType && (
        <div className="text-sm text-gray-600 mt-1">
          Тип упражнения: {event.exerciseType}
        </div>
      )}
      {event.exercises && event.exercises.length > 0 && (
        <div className="mt-2">
          <div className="text-xs font-medium text-gray-500 uppercase">Упражнения:</div>
          <ul className="text-sm mt-1 space-y-1">
            {event.exercises.slice(0, 3).map((exercise, index) => (
              <li key={index} className="flex justify-between">
                <span>{exercise.name}</span>
                <span>{exercise.weight || '0'} kg × {exercise.repetitions || '0'}</span>
              </li>
            ))}
            {event.exercises.length > 3 && (
              <li className="text-xs text-gray-500">+ {event.exercises.length - 3} больше...</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

const Calendar: React.FC<CalendarProps> = ({ isMenuOpen = false }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: '1', title: 'Sample Event', date: new Date().toISOString().split('T')[0], exercises: [] }
  ]);
  const [showAddEventButton, setShowAddEventButton] = useState(false);
  const [showEventActionMenu, setShowEventActionMenu] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [showEditModal, setShowEditModal] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  const [showAddResultModal, setShowAddResultModal] = useState(false);
  const [eventToAddResult, setEventToAddResult] = useState<CalendarEvent | null>(null);
  // State for tooltip
  const [tooltipEvent, setTooltipEvent] = useState<CalendarEvent | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const calendarRef = useRef<FullCalendar>(null);

  const handleDateClick = (arg: { dateStr: string, jsEvent: MouseEvent }) => {
    // Close event action menu if open
    setShowEventActionMenu(false);
    // Close tooltip if open
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
    // Close add event button if open
    setShowAddEventButton(false);
    // Close tooltip if open
    setTooltipEvent(null);
    
    const eventId = arg.event.id;
    const event = events.find(e => e.id === eventId) || null;
    
    if (event) {
      const rect = (arg.jsEvent.target as HTMLElement).getBoundingClientRect();
      
      setButtonPosition({
        top: rect.top + window.scrollY + rect.height / 2,
        left: rect.left + window.scrollX + rect.width / 2
      });
      setSelectedEvent(event);
      setShowEventActionMenu(true);
    }
  };

  // Handle mouse enter event for tooltip
  const handleEventMouseEnter = (arg: { event: { id: string }, jsEvent: MouseEvent }) => {
    // Close action menu if open
    setShowEventActionMenu(false);
    
    const eventId = arg.event.id;
    const event = events.find(e => e.id === eventId) || null;
    
    if (event) {
      const rect = (arg.jsEvent.target as HTMLElement).getBoundingClientRect();
      
      setTooltipPosition({
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY
      });
      setTooltipEvent(event);
    }
  };

  // Handle mouse leave event for tooltip
  const handleEventMouseLeave = () => {
    // Add a small delay to prevent flickering
    setTimeout(() => {
      setTooltipEvent(null);
    }, 100);
  };

  const handleAddEvent = (title: string, exerciseType: string, exercises: Exercise[]) => {
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title,
      date: selectedDate,
      exerciseType,
      exercises: exercises.map(exercise => ({
        ...exercise,
        weight: exercise.weight || '',
        repetitions: exercise.repetitions || ''
      }))
    };
    setEvents([...events, newEvent]);
    setShowAddEventButton(false);
  };

  const handleCloseAddEvent = () => {
    setShowAddEventButton(false);
  };

  const handleCloseEventActionMenu = () => {
    setShowEventActionMenu(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter(event => event.id !== selectedEvent.id));
      setShowEventActionMenu(false);
    }
  };

  const handleEditEvent = () => {
    if (selectedEvent) {
      setEventToEdit(selectedEvent);
      setShowEditModal(true);
      setShowEventActionMenu(false);
    }
  };

  const handleAddResult = () => {
    if (selectedEvent) {
      setEventToAddResult(selectedEvent);
      setShowAddResultModal(true);
      setShowEventActionMenu(false);
    }
  };

  const handleSaveResult = (time: string) => {
    // Here you would typically save the result to your backend
    console.log(`Saving result for event ${eventToAddResult?.title}: ${time}`);
    // For now, we'll just show an alert
    alert(`Результат сохранен для события &quot;${eventToAddResult?.title}&quot;: ${time}`);
    setShowAddResultModal(false);
    setEventToAddResult(null);
  };

  const handleCloseAddResultModal = () => {
    setShowAddResultModal(false);
    setEventToAddResult(null);
  };

  const handleUpdateEvent = (title: string, exerciseType: string, exercises: Exercise[]) => {
    if (eventToEdit) {
      setEvents(events.map(event => 
        event.id === eventToEdit.id 
          ? { ...event, title, exerciseType, exercises } 
          : event
      ));
      setShowEditModal(false);
      setEventToEdit(null);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEventToEdit(null);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAddEventButton && 
          !(event.target as HTMLElement).closest('.add-event-button') &&
          !(event.target as HTMLElement).closest('.fixed.inset-0')) {
        setShowAddEventButton(false);
      }
      
      if (showEventActionMenu && 
          !(event.target as HTMLElement).closest('.calendar-event') &&
          selectedEvent) {
        setShowEventActionMenu(false);
        setSelectedEvent(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showAddEventButton, showEventActionMenu, selectedEvent]);

  // Custom event rendering to add data-id attribute
  const renderEventContent = (eventInfo: EventContentArg) => {
    return (
      <div 
        className="fc-event-main" 
        data-id={eventInfo.event.id}
        onMouseEnter={(e) => handleEventMouseEnter({ 
          event: { id: eventInfo.event.id }, 
          jsEvent: e.nativeEvent 
        })}
        onMouseLeave={handleEventMouseLeave}
      >
        <b>{eventInfo.timeText}</b>
        <i>{eventInfo.event.title}</i>
      </div>
    );
  };

  return (
    <div className={`p-4 relative ${isMenuOpen ? 'md:pl-4' : ''}`}>
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
      />
      
      {showAddEventButton && (
        <AddEventButton
          onAddEvent={handleAddEvent}
          onCancel={handleCloseAddEvent}
          date={selectedDate}
          position={buttonPosition}
        />
      )}
      
      {showEventActionMenu && selectedEvent && (
        <EventActionMenu
          onDelete={handleDeleteEvent}
          onEdit={handleEditEvent}
          onAddResult={handleAddResult}
          position={buttonPosition}
          onClose={handleCloseEventActionMenu}
        />
      )}
      
      {showEditModal && eventToEdit && (
        <EventModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onSave={handleUpdateEvent}
          date={eventToEdit.date}
          eventData={{
            title: eventToEdit.title,
            exerciseType: eventToEdit.exerciseType || '',
            exercises: eventToEdit.exercises || []
          }}
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