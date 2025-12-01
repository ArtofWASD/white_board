'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Calendar from '../../features/events/Calendar';
import Header from '../../components/layout/Header';
import LeftMenu from '../../components/layout/LeftMenu';
import { useAuth } from '../../contexts/AuthContext';
import { useTeam } from '../../contexts/TeamContext';
import Footer from '../../components/layout/Footer';

// Define types for our events and results
interface EventResult {
  id: string;
  time: string;
  dateAdded: string;
  username: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  results?: EventResult[];
}

// Define type for API response
interface ApiEvent {
  id: string;
  title: string;
  eventDate: string;
  results?: EventResult[];
  teamId?: string;
}

export default function CalendarPage() {
  const [leftMenuOpen, setLeftMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]); // Store events for displaying results
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null); // For showing event details
  const [showEventModal, setShowEventModal] = useState(false); // Control event modal visibility
  
  const { isAuthenticated, user } = useAuth();
  const { selectedTeam } = useTeam();

  // Function to update events in the calendar page
  const updateEvents = useCallback((newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
  }, []);

  // Fetch events from the backend
  // Fetch events from the backend - REMOVED to avoid double fetching and infinite loops
  // The Calendar component will fetch events and update this page via onUpdateEvents
  /*
  useEffect(() => {
    const fetchEvents = async () => {
      if (isAuthenticated && user) {
        try {
          const queryParams = new URLSearchParams({ userId: user.id });
          if (selectedTeamId) {
            queryParams.append('teamId', selectedTeamId);
          }
          const response = await fetch(`/api/events?${queryParams.toString()}`);
          const data: ApiEvent[] = await response.json();
          
          if (response.ok) {
            // Transform the data to match our CalendarEvent interface
            const transformedEvents = data.map((event) => ({
              id: event.id,
              title: event.title,
              date: event.eventDate.split('T')[0], // Format date as YYYY-MM-DD
              results: event.results ? event.results.map(result => ({
                ...result,
                dateAdded: new Date(result.dateAdded).toLocaleDateString('ru-RU')
              })) : []
            }));
            setEvents(transformedEvents);
          }
        } catch (error) {
          console.error('Failed to fetch events:', error);
        }
      }
    };

    fetchEvents();
  }, [isAuthenticated, user, selectedTeamId]);
  */

  const handleLeftMenuClick = () => {
    setLeftMenuOpen(!leftMenuOpen);
  };

  // This function is no longer needed as dashboard is a separate page
  // const handleRightMenuClick = () => {};

  const toggleAuth = () => {
    setShowAuth(!showAuth);
  };

  // Function to show event details when clicking on event name
  const handleShowEventDetails = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // Function to close event modal
  const handleCloseEventModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onLeftMenuClick={handleLeftMenuClick} 
        onRightMenuClick={() => {}} 
      />
      
      <LeftMenu 
        isOpen={leftMenuOpen}
        onClose={handleLeftMenuClick}
        showAuth={showAuth}
        toggleAuth={toggleAuth}
        events={events}
        onShowEventDetails={handleShowEventDetails}
      />
      
      <main className={`flex-grow transition-all duration-300 ease-in-out ${leftMenuOpen ? 'ml-80' : 'ml-0'} p-2 sm:p-4`}>
        <Calendar 
          isMenuOpen={leftMenuOpen} 
          onUpdateEvents={updateEvents} 
          teamId={selectedTeam?.id}
        />
      </main>
      
      <Footer />
      
      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleCloseEventModal}></div>
          <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedEvent.title}</h2>
                <button 
                  onClick={handleCloseEventModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-600">Дата: {selectedEvent.date}</p>
              </div>
              
              {selectedEvent.results && selectedEvent.results.length > 0 ? (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Результаты</h3>
                  <ul className="space-y-3">
                    {selectedEvent.results.map((result) => (
                      <li key={result.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{result.time}</span>
                          <span className="text-gray-500 text-sm">{result.dateAdded}</span>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">Добавил: {result.username}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-500">Нет результатов для этого события</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}