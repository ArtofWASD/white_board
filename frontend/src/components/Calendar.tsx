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
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook
import { Exercise, EventResult, CalendarEvent, CalendarProps } from '../types';

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
      className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm z-20 w-64"
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
      
      {event.exercises && event.exercises.length > 0 && (
        <div className="mt-2">
          <div className="text-xs font-medium text-gray-700 mb-1">Упражнения:</div>
          <ul className="space-y-1">
            {event.exercises.slice(0, 3).map((exercise, index) => (
              <li key={index} className="text-xs flex justify-between">
                <span className="text-gray-600">{exercise.name}</span>
                <span className="text-gray-500">
                  {exercise.weight || '0'} kg × {exercise.repetitions || '0'}
                </span>
              </li>
            ))}
            {event.exercises.length > 3 && (
              <li className="text-xs text-gray-500">+ {event.exercises.length - 3} больше...</li>
            )}
          </ul>
        </div>
      )}
      
      {event.results && event.results.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="text-xs font-medium text-gray-700 mb-1">Результаты:</div>
          <ul className="space-y-1 max-h-20 overflow-y-auto">
            {event.results.map((result) => (
              <li key={result.id} className="text-xs flex justify-between">
                <span className="text-gray-600">{result.time}</span>
                <div className="text-gray-500 text-xs">
                  <div>{result.dateAdded}</div>
                  <div>{result.username}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const Calendar: React.FC<CalendarProps> = ({ isMenuOpen = false }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
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
  const { isAuthenticated, user } = useAuth(); // Get authentication status and user info

  // Handle calendar resize when menu opens/closes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (calendarRef.current) {
        calendarRef.current.getApi().updateSize();
      }
    }, 300); // Match the transition duration

    return () => clearTimeout(timer);
  }, [isMenuOpen]);

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
    // Define an array of colors to cycle through
    const colors = [
      'bg-blue-100',
      'bg-green-100',
      'bg-purple-100',
      'bg-yellow-100',
      'bg-pink-100',
      'bg-red-100',
      'bg-indigo-100',
      'bg-teal-100'
    ];
    
    // Get the next color based on the number of existing events
    const nextColor = colors[events.length % colors.length];
    
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title,
      date: selectedDate,
      exerciseType,
      exercises: exercises.map(exercise => ({
        ...exercise,
        weight: exercise.weight || '',
        repetitions: exercise.repetitions || ''
      })),
      results: [], // Initialize with empty results array
      color: nextColor // Assign the color to the new event
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
    // Check if user is authenticated before allowing event deletion
    if (!isAuthenticated) {
      alert('Вы должны быть авторизованы для удаления события');
      setShowEventActionMenu(false);
      return;
    }
    
    if (selectedEvent) {
      setEvents(events.filter(event => event.id !== selectedEvent.id));
      setShowEventActionMenu(false);
    }
  };

  const handleEditEvent = () => {
    // Check if user is authenticated before allowing event editing
    if (!isAuthenticated) {
      alert('Вы должны быть авторизованы для редактирования события');
      setShowEventActionMenu(false);
      return;
    }
    
    if (selectedEvent) {
      setEventToEdit(selectedEvent);
      setShowEditModal(true);
      setShowEventActionMenu(false);
    }
  };

  const handleAddResult = () => {
    // Check if user is authenticated before allowing adding results
    if (!isAuthenticated) {
      alert('Вы должны быть авторизованы для добавления результата');
      setShowEventActionMenu(false);
      return;
    }
    
    if (selectedEvent) {
      setEventToAddResult(selectedEvent);
      setShowAddResultModal(true);
      setShowEventActionMenu(false);
    }
  };

  const handleSaveResult = (time: string) => {
    if (eventToAddResult) {
      // Get the current user's name from the component level context
      const username = user?.name || 'Anonymous';
      
      // Create a new result object
      const newResult: EventResult = {
        id: Date.now().toString(),
        time,
        dateAdded: new Date().toLocaleDateString('ru-RU'),
        username
      };
      
      // Update the event with the new result
      setEvents(events.map(event => 
        event.id === eventToAddResult.id 
          ? { 
              ...event, 
              results: [...(event.results || []), newResult] 
            } 
          : event
      ));
      
      console.log(`Saving result for event ${eventToAddResult?.title}: ${time}`);
      alert(`Результат сохранен для события "${eventToAddResult?.title}": ${time}`);
    }
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
          ? { ...event, title, exerciseType, exercises } // Results are preserved since we're not overwriting them
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

  // Custom event rendering to add data-id attribute and styling
  const renderEventContent = (eventInfo: EventContentArg) => {
    const event = events.find(e => e.id === eventInfo.event.id);
    const eventColor = event?.color || 'bg-blue-100'; // Default color if not set
    
    return (
      <div 
        className={`fc-event-main ${eventColor} h-[30px] flex items-center`}
        style={{ color: 'black' }} // Added inline style to ensure black text
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
    <div className={`p-4 relative transition-all duration-300 ease-in-out w-full ${isMenuOpen ? 'md:pl-4' : ''}`}>
      <div className="transition-all duration-300 ease-in-out">
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
      </div>
      
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
            exercises: eventToEdit.exercises || [],
            results: eventToEdit.results || []
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