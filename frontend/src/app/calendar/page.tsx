'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Calendar from '../../features/events/Calendar';
import Header from '../../components/layout/Header';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { useTeamStore } from '../../lib/store/useTeamStore';
import Footer from '../../components/layout/Footer';
import { NavItem, CalendarEvent, EventResult } from '../../types';

// Define type for API response
interface ApiEvent {
  id: string;
  title: string;
  eventDate: string;
  results?: EventResult[];
  teamId?: string;
}

import TeamSelector from '../../features/events/TeamSelector';

import LeftMenu from '../../components/layout/LeftMenu';

export default function CalendarPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]); // Store events for displaying results
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null); // For showing event details
  const [showEventModal, setShowEventModal] = useState(false); // Control event modal visibility
  
  const { isAuthenticated, user, logout } = useAuthStore();
  const { selectedTeam, fetchTeams, teams } = useTeamStore();
  
  const navItems = React.useMemo(() => {
    if (!user) return [];

    const items: NavItem[] = [
      { 
        label: 'Главная', 
        href: '/dashboard',
        icon: <Image src="/home_icon.png" alt="Home" width={32} height={32} />,
        tooltip: 'Главная'
      },
      { 
        label: 'Команды', 
        href: '/dashboard/teams',
        icon: <Image src="/teams_icon.png" alt="Teams" width={32} height={32} />,
        tooltip: 'Команды'
      },
    ];

    if (user.role === 'TRAINER' || user.role === 'ORGANIZATION_ADMIN') {
      items.push({
        label: 'Управление', 
        href: '/dashboard/organization',
        icon: <Image src="/menegment.png" alt="Management" width={32} height={32} />,
        tooltip: 'Управление'
      });

      items.push({ 
        label: 'Атлеты', 
        href: '/dashboard/athletes',
        icon: <Image src="/athlet_icon.png" alt="Athletes" width={32} height={32} />,
        tooltip: 'Атлеты'
      });

      if (user.role === 'TRAINER') {
        items.push({ 
          label: 'Занятия', 
          href: '/dashboard/activities',
          icon: <Image src="/workout_icon.png" alt="Activities" width={32} height={32} />,
          tooltip: 'Занятия'
        });
      }
    }

    items.push(
      { 
        label: 'Календарь', 
        href: '/calendar',
        icon: <Image src="/calendar_icon.png" alt="Calendar" width={32} height={32} />,
        tooltip: 'Календарь'
      },
      { 
        label: 'Выйти', 
        href: '#', 
        onClick: () => {
          logout();
        },
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
        ),
        tooltip: 'Выйти'
      }
    );

    return items;
  }, [user, logout]);

  // Ensure teams are loaded if accessed directly
  useEffect(() => {
    if (isAuthenticated && teams.length === 0) {
        fetchTeams(); 
    }
  }, [isAuthenticated, teams.length, fetchTeams]);
  
  // Local state for calendar viewing preference. 
  // Initialize with global selected team if available, or 'my' for "My Events"
  const [calendarTeamId, setCalendarTeamId] = useState<string | null>(selectedTeam?.id || 'my');

  // Sync with global store initially or if store changes? 
  // User might want to browse other teams without changing global context.
  // let's keep it independent after init, but maybe update if selectedTeam changes from outside?
  // simpler to just init with it.
  
  useEffect(() => {
      if (selectedTeam) {
          setCalendarTeamId(selectedTeam.id);
      }
  }, [selectedTeam]);

  // Function to update events in the calendar page
  const updateEvents = useCallback((newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
  }, []);



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
        onRightMenuClick={() => {}} 
        onLeftMenuClick={() => setIsLeftMenuOpen(true)}
        navItems={navItems}
      />
      
      <LeftMenu
        isOpen={isLeftMenuOpen}
        onClose={() => setIsLeftMenuOpen(false)}
        showAuth={showAuth}
        toggleAuth={toggleAuth}
        events={events}
        onShowEventDetails={handleShowEventDetails}
        navItems={navItems}
      />

      <main className={`flex-grow transition-all duration-300 ease-in-out ml-0 p-2 sm:p-4`}>
        <div className="mb-4 flex justify-end">
            <TeamSelector 
                selectedTeamId={calendarTeamId} 
                onSelectTeam={setCalendarTeamId}
                className="w-full sm:w-64"
            />
        </div>
        <Calendar 
          isMenuOpen={false} 
          onUpdateEvents={updateEvents} 
          teamId={calendarTeamId || undefined} 
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