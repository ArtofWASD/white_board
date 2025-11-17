'use client';

import React, { useState } from 'react';
import Header from '../components/Header';
import Calendar from '../components/Calendar';
import Footer from '../components/Footer';
import AuthForms from '../components/AuthForms';
import { useAuth } from '../contexts/AuthContext';

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

// Mock events data
const mockEvents: CalendarEvent[] = [
  { 
    id: '1', 
    title: 'Утренняя тренировка', 
    date: '2023-06-15',
    results: [
      { id: 'r1', time: '25:30', dateAdded: '15.06.2023', username: 'Иван И.' },
      { id: 'r2', time: '24:15', dateAdded: '14.06.2023', username: 'Петр П.' }
    ]
  },
  { 
    id: '2', 
    title: 'Силовая тренировка', 
    date: '2023-06-16',
    results: [
      { id: 'r3', time: '45:20', dateAdded: '16.06.2023', username: 'Анна А.' }
    ]
  },
  { 
    id: '3', 
    title: 'Кардио', 
    date: '2023-06-17',
    results: [
      { id: 'r4', time: '30:00', dateAdded: '17.06.2023', username: 'Мария М.' },
      { id: 'r5', time: '32:10', dateAdded: '16.06.2023', username: 'Сергей С.' }
    ]
  }
];

export default function Home() {
  const [leftMenuOpen, setLeftMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [events] = useState<CalendarEvent[]>(mockEvents); // Store events for displaying results
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null); // For showing event details
  const [showEventModal, setShowEventModal] = useState(false); // Control event modal visibility
  
  const { isAuthenticated, user } = useAuth();

  const handleLeftMenuClick = () => {
    setLeftMenuOpen(!leftMenuOpen);
  };

  const handleRightMenuClick = () => {
    // This function is no longer needed as dashboard is a separate page
  };

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

  // Extract recent results from all events
  const getRecentResults = () => {
    const allResults: (EventResult & { eventName: string; eventId: string })[] = [];
    
    events.forEach(event => {
      if (event.results && event.results.length > 0) {
        event.results.forEach(result => {
          allResults.push({
            ...result,
            eventName: event.title,
            eventId: event.id
          });
        });
      }
    });
    
    // Sort by dateAdded (newest first) and take top 5
    return allResults
      .sort((a, b) => new Date(b.dateAdded.split('.').reverse().join('-')).getTime() - new Date(a.dateAdded.split('.').reverse().join('-')).getTime())
      .slice(0, 5);
  };

  const recentResults = getRecentResults();

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onLeftMenuClick={handleLeftMenuClick} 
        onRightMenuClick={handleRightMenuClick} 
      />
      
      {/* Sliding Left Menu */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out overflow-y-auto ${leftMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Меню</h2>
            <button 
              onClick={handleLeftMenuClick}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div className="mt-4">
            {isAuthenticated && user ? (
              <div className="mb-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Информация о пользователе</h3>
                  <p className="text-gray-700"><span className="font-medium">Имя:</span> {user.name}</p>
                  <p className="text-gray-700"><span className="font-medium">Email:</span> {user.email}</p>
                </div>
                
                {/* Recent Results Section */}
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Последние результаты</h3>
                  {recentResults.length > 0 ? (
                    <ul className="space-y-2">
                      {recentResults.map((result) => (
                        <li key={result.id} className="border-b border-gray-200 pb-2 last:border-b-0">
                          <div 
                            className="cursor-pointer hover:bg-gray-100 p-2 rounded"
                            onClick={() => {
                              const event = events.find(e => e.id === result.eventId);
                              if (event) handleShowEventDetails(event);
                            }}
                          >
                            <p className="font-medium text-blue-600">{result.eventName}</p>
                            <div className="flex justify-between text-sm mt-1">
                              <span className="text-gray-600">Результат: {result.time}</span>
                              <span className="text-gray-500">{result.dateAdded}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">Нет доступных результатов</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="mb-4">Содержимое левого меню</p>
            )}
            {!isAuthenticated && (
              <button 
                onClick={toggleAuth}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {showAuth ? 'Скрыть форму' : 'Показать форму входа/регистрации'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Overlay for closing left menu */}
      {leftMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-transparent backdrop-blur-sm"
          onClick={handleLeftMenuClick}
        ></div>
      )}
      
      <main className={`flex-grow transition-all duration-300 ease-in-out ${leftMenuOpen ? 'ml-64' : 'ml-0'}`}>
        {isAuthenticated ? (
          <Calendar isMenuOpen={leftMenuOpen} />
        ) : showAuth ? (
          <AuthForms />
        ) : (
          <Calendar isMenuOpen={leftMenuOpen} />
        )}
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