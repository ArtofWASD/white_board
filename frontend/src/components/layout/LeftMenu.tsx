'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { useTeamStore } from '../../lib/store/useTeamStore';

// Define types locally if not available, or import them. 
// Based on usage:
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

interface LeftMenuProps {
  isOpen: boolean;
  onClose: () => void;
  showAuth: boolean;
  toggleAuth: () => void;
  events: CalendarEvent[];
  onShowEventDetails: (event: CalendarEvent) => void;
  navItems?: { label: string; href: string; onClick?: () => void }[];
}

const LeftMenu: React.FC<LeftMenuProps> = ({ isOpen, onClose, showAuth, toggleAuth, events, onShowEventDetails, navItems }) => {
  const { user, isAuthenticated, token } = useAuthStore();
  const { selectedTeam } = useTeamStore();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (selectedTeam) {
        try {
          // const token = localStorage.getItem('token'); // Removed direct access
          const response = await fetch(`/api/teams/${selectedTeam.id}/members`, {
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` }),
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
              setTeamMembers(data);
            } else {
              setTeamMembers([]);
            }
          }
        } catch (error) {
          console.error('Failed to fetch team members:', error);
        }
      } else {
        setTeamMembers([]);
      }
    };

    fetchTeamMembers();
  }, [selectedTeam]);

  // Extract recent results from all events
  const getRecentResults = () => {
    const allResults: (EventResult & { eventName: string; eventId: string })[] = [];
    
    events.forEach(event => {
      if (event.results && event.results.length > 0) {
        event.results.forEach((result) => {
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
      .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
      .slice(0, 5);
  };

  // Get upcoming events (events with dates today or in the future)
  const getUpcomingEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5); // Limit to 5 upcoming events
  };

  const recentResults = getRecentResults();
  const upcomingEventsList = getUpcomingEvents();

  return (
    <>
      {/* Sliding Left Menu */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 sm:w-80 bg-white transform transition-transform duration-300 ease-in-out overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-2 sm:p-4">
          <div className="flex justify-between items-center mb-2 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold">Меню</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          {/* Navigation Items (Mobile) */}
          {navItems && (
            <div className="mb-6">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.label}>
                    {item.onClick ? (
                      <button
                        onClick={() => {
                          item.onClick?.();
                          onClose();
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-lg font-medium bg-transparent border-none cursor-pointer"
                      >
                        {item.label}
                      </button>
                    ) : (
                      <Link 
                        href={item.href}
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-lg font-medium"
                        onClick={onClose}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
              <hr className="my-4 border-gray-200" />
            </div>
          )}

          <div className="mt-4">
            {isAuthenticated && user ? (
              <div className="mb-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Физические параметры</h3>
                  <p className="text-gray-700"><span className="font-medium">Рост:</span> {user.height ? `${user.height} см` : 'Не указан'}</p>
                  <p className="text-gray-700"><span className="font-medium">Вес:</span> {user.weight ? `${user.weight} кг` : 'Не указан'}</p>
                </div>

                {/* Team Members Section */}
                {selectedTeam && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-2">Состав команды</h3>
                    {teamMembers.length > 0 ? (
                      <ul className="space-y-2">
                        {teamMembers.map((member) => (
                          <li key={member.id} className="border-b border-gray-200 pb-2 last:border-b-0">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-800">
                                {member.user.name} {member.user.lastName}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                member.user.role === 'TRAINER' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {member.user.role === 'TRAINER' ? 'Тренер' : 'Спортсмен'}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm">В команде пока нет участников</p>
                    )}
                  </div>
                )}
                
                {/* Upcoming Events Section */}
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Будущие события</h3>
                  {upcomingEventsList.length > 0 ? (
                    <ul className="space-y-2">
                      {upcomingEventsList.map((event) => (
                        <li key={event.id} className="border-b border-gray-200 pb-2 last:border-b-0">
                          <div 
                            className="cursor-pointer hover:bg-gray-100 p-2 rounded"
                            onClick={() => onShowEventDetails(event)}
                          >
                            <p className="font-medium text-blue-600">{event.title}</p>
                            <div className="flex justify-between text-sm mt-1">
                              <span className="text-gray-600">Дата: {event.date}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">Нет предстоящих событий</p>
                  )}
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
                              const event = events.find((e) => e.id === result.eventId);
                              if (event) onShowEventDetails(event);
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
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-transparent backdrop-blur-sm"
          onClick={onClose}
        ></div>
      )}
    </>
  );
};

export default LeftMenu;