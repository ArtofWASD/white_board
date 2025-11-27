'use client';

import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuth } from '../../contexts/AuthContext';
import { CalendarEvent, BackendEvent, EventResult } from '../../types/Calendar.types';
import { Exercise } from '../../types';
import AddEventButton from './AddEventButton';
import EventActionMenu from './EventActionMenu';
import EventModal from './EventModal';
import AddResultModal from './AddResultModal';
import { EventContentArg } from '@fullcalendar/core';

interface CalendarProps {
  isMenuOpen: boolean;
  onUpdateEvents?: (events: CalendarEvent[]) => void;
}

interface EventTooltipProps {
  event: CalendarEvent;
  position: { x: number; y: number };
  onClose: () => void;
}

const EventTooltip: React.FC<EventTooltipProps> = ({ event, position, onClose }) => {
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
        <div className="mt-2">
          <div className="text-xs font-medium text-gray-700 mb-1">Результаты:</div>
          <ul className="space-y-1">
            {event.results.slice(0, 2).map((result) => (
              <li key={result.id} className="text-xs flex justify-between">
                <span className="text-gray-600">{result.time}</span>
                <span className="text-gray-500">{result.dateAdded}</span>
              </li>
            ))}
            {event.results.length > 2 && (
              <li className="text-xs text-gray-500">+ {event.results.length - 2} больше...</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

const Calendar: React.FC<CalendarProps> = ({ isMenuOpen, onUpdateEvents }) => {
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
  const [windowWidth, setWindowWidth] = useState(0);
  const calendarRef = useRef<FullCalendar>(null);
  const { isAuthenticated, user } = useAuth(); // Get authentication status and user info

  // Fetch events from backend when component mounts or user changes
  useEffect(() => {
    const fetchEvents = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await fetch(`/api/events?userId=${user.id}`);
          const data: BackendEvent[] = await response.json();
          
          if (response.ok) {
            // Transform backend events to calendar events
            const calendarEvents: CalendarEvent[] = await Promise.all(data.map(async event => {
              // Fetch results for each event
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
                date: event.eventDate.split('T')[0], // Format date as YYYY-MM-DD
                exerciseType: event.exerciseType,
                exercises: event.exercises || [], // Use exercises from backend
                results: results,
                color: 'bg-blue-100' // Default color
              };
            }));
            setEvents(calendarEvents);
          }
        } catch (error) {
          console.error('Failed to fetch events:', error);
        }
      }
    };

    fetchEvents();
  }, [isAuthenticated, user]);

  // Handle window resize to update calendar
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (calendarRef.current) {
        calendarRef.current.getApi().updateSize();
      }
    };
    
    // Set initial width
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Handle calendar resize when menu opens/closes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (calendarRef.current) {
        calendarRef.current.getApi().updateSize();
      }
    }, 300); // Match the transition duration

    return () => clearTimeout(timer);
  }, [isMenuOpen, windowWidth]);

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

  const handleAddEvent = async (title: string, exerciseType: string, exercises: Exercise[]) => {
    if (user) {
      try {
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            title,
            description: '',
            eventDate: selectedDate,
            exerciseType,
            exercises: exercises.length > 0 ? exercises : undefined,
          }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Add the new event to the local state
          const newEvent: CalendarEvent = {
            id: data.id,
            title: data.title,
            date: data.eventDate.split('T')[0],
            exerciseType: data.exerciseType,
            exercises: data.exercises || [],
            results: [], // New event has no results initially
            color: 'bg-blue-100'
          };
          
          const updatedEvents = [...events, newEvent];
          setEvents(updatedEvents);
          
          // Call the callback to update events in the parent component
          if (onUpdateEvents) {
            onUpdateEvents(updatedEvents);
          }
          
          setShowAddEventButton(false);
          alert('Событие успешно создано');
        } else {
          alert(data.message || 'Ошибка при создании события');
        }
      } catch (error) {
        console.error('Error creating event:', error);
        alert('Произошла ошибка при создании события');
      }
    }
  };

  // Function to refresh events from backend
  const refreshEvents = async () => {
    if (isAuthenticated && user) {
      try {
        const response = await fetch(`/api/events?userId=${user.id}`);
        const data: BackendEvent[] = await response.json();
        
        if (response.ok) {
          // Transform backend events to calendar events
          const calendarEvents: CalendarEvent[] = await Promise.all(data.map(async event => {
            // Fetch results for each event
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
              date: event.eventDate.split('T')[0], // Format date as YYYY-MM-DD
              exerciseType: event.exerciseType,
              exercises: event.exercises || [], // Use exercises from backend
              results: results,
              color: 'bg-blue-100' // Default color
            };
          }));
          setEvents(calendarEvents);
          
          // Call the callback to update events in the parent component
          if (onUpdateEvents) {
            onUpdateEvents(calendarEvents);
          }
        }
      } catch (error) {
        console.error('Failed to refresh events:', error);
      }
    }
  };

  const handleCloseAddEvent = () => {
    setShowAddEventButton(false);
  };

  const handleCloseEventActionMenu = () => {
    setShowEventActionMenu(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = async () => {
    // Check if user is authenticated before allowing event deletion
    if (!isAuthenticated || !user) {
      alert('Вы должны быть авторизованы для удаления события');
      return;
    }
    
    if (selectedEvent) {
      try {
        const response = await fetch(`/api/events/${selectedEvent.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        });
        
        if (response.ok) {
          // Remove the event from the local state
          const updatedEvents = events.filter(event => event.id !== selectedEvent.id);
          setEvents(updatedEvents);
          
          // Call the callback to update events in the parent component
          if (onUpdateEvents) {
            onUpdateEvents(updatedEvents);
          }
          
          setShowEventActionMenu(false);
          setSelectedEvent(null);
          alert('Событие успешно удалено');
        } else {
          const data = await response.json();
          alert(data.message || 'Ошибка при удалении события');
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Произошла ошибка при удалении события');
      }
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

  const handleSaveResult = async (time: string) => {
    if (eventToAddResult && user) {
      try {
        const response = await fetch(`/api/events/${eventToAddResult.id}/results`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            time,
            username: user.name,
          }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Create a new result object for local state
          const newResult: EventResult = {
            id: data.id,
            time: data.time,
            dateAdded: new Date(data.dateAdded).toLocaleDateString('ru-RU'),
            username: data.username,
          };
          
          // Update the event with the new result
          const updatedEvents = events.map(event => 
            event.id === eventToAddResult.id 
              ? { 
                  ...event, 
                  results: [...(event.results || []), newResult] 
                } 
              : event
          );
          
          setEvents(updatedEvents);
          
          // Call the callback to update events in the parent component
          if (onUpdateEvents) {
            onUpdateEvents(updatedEvents);
          }
          
          console.log(`Saving result for event ${eventToAddResult?.title}: ${time}`);
          alert(`Результат сохранен для события "${eventToAddResult?.title}": ${time}`);
        } else {
          alert(data.message || 'Ошибка при сохранении результата');
        }
      } catch (error) {
        console.error('Error saving result:', error);
        alert('Произошла ошибка при сохранении результата');
      }
    }
    setShowAddResultModal(false);
    setEventToAddResult(null);
  };

  const handleCloseAddResultModal = () => {
    setShowAddResultModal(false);
    setEventToAddResult(null);
  };

  const handleUpdateEvent = async (title: string, exerciseType: string, exercises: Exercise[]) => {
    if (eventToEdit && user) {
      try {
        // Update event in backend
        const response = await fetch(`/api/events/${eventToEdit.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            title,
            description: '', // No description in this version
            eventDate: new Date(eventToEdit.date).toISOString(),
            exerciseType,
            exercises: exercises.length > 0 ? exercises : undefined, // Send exercises to backend
          }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Update the event in the local state
          const updatedEvents = events.map(event => 
            event.id === eventToEdit.id 
              ? { 
                  ...event, 
                  title, 
                  exerciseType, 
                  exercises,
                  // Preserve results since we're not overwriting them
                } 
              : event
          );
          
          setEvents(updatedEvents);
          
          // Call the callback to update events in the parent component
          if (onUpdateEvents) {
            onUpdateEvents(updatedEvents);
          }
          
          setShowEditModal(false);
          setEventToEdit(null);
          
          // Refresh events from backend to ensure consistency
          refreshEvents();
        } else {
          alert(data.message || 'Ошибка при обновлении события');
        }
      } catch (error) {
        console.error('Error updating event:', error);
        alert('Произошла ошибка при обновлении события');
      }
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
          !(event.target as HTMLElement).closest('.event-modal') &&
          !(event.target as HTMLElement).closest('[data-event-modal="true"]')) {
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
        className={`fc-event-main ${eventColor} h-[30px] sm:h-[35px] md:h-[40px] lg:h-[45px] xl:h-[50px] flex items-center px-1 py-0.5 sm:px-2 sm:py-1 overflow-hidden mb-0.5 last:mb-0`}
        style={{ color: 'black' }} // Added inline style to ensure black text
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