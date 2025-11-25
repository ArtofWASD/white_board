'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import LeftMenu from '../../components/LeftMenu';
import { useAuth } from '../../contexts/AuthContext';
import AuthForms from '../../components/AuthForms';
import Footer from '../../components/Footer';

// Define types for blog posts
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
}

// Define types for events and results
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
}

export default function BlogPage() {
  const [leftMenuOpen, setLeftMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]); // For left menu events
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  
  const { isAuthenticated, user } = useAuth();

  // Fetch events from the backend
  useEffect(() => {
    const fetchEvents = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await fetch(`/api/events?userId=${user.id}`);
          const data: ApiEvent[] = await response.json();
          
          if (response.ok) {
            // Transform the data to match our CalendarEvent interface
            const transformedEvents = data.map((event) => ({
              id: event.id,
              title: event.title,
              date: event.eventDate.split('T')[0], // Format date as YYYY-MM-DD
              results: event.results || []
            }));
            setEvents(transformedEvents);
          }
        } catch (error) {
          console.error('Failed to fetch events:', error);
        }
      }
    };

    fetchEvents();
  }, [isAuthenticated, user]);

  const handleLeftMenuClick = () => {
    setLeftMenuOpen(!leftMenuOpen);
  };

  const toggleAuth = () => {
    setShowAuth(!showAuth);
  };

  const handleShowEventDetails = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleCloseEventModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  // Sample blog posts data
  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Как эффективно планировать тренировки',
      excerpt: 'Узнайте основные принципы составления эффективного плана тренировок, которые помогут вам достигать лучших результатов.',
      date: '15 ноября 2025',
      readTime: '5 мин чтения'
    },
    {
      id: '2',
      title: 'Питание спортсмена: что есть перед тренировкой',
      excerpt: 'Правильное питание перед тренировкой может значительно повлиять на вашу производительность и результаты.',
      date: '10 ноября 2025',
      readTime: '7 мин чтения'
    },
    {
      id: '3',
      title: 'Восстановление после интенсивных тренировок',
      excerpt: 'Восстановление так же важно, как и сама тренировка. Рассказываем, как правильно восстанавливаться.',
      date: '5 ноября 2025',
      readTime: '6 мин чтения'
    },
    {
      id: '4',
      title: 'Новые функции нашего календаря',
      excerpt: 'Мы добавили новые возможности в календарь, которые помогут вам лучше планировать свои тренировки.',
      date: '1 ноября 2025',
      readTime: '3 мин чтения'
    }
  ];

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
      
      <main className={`flex-grow transition-all duration-300 ease-in-out ${leftMenuOpen ? 'ml-80' : 'ml-0'} p-4`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Блог</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogPosts.map((post) => (
              <article 
                key={post.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-3 text-gray-800">{post.title}</h2>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                  <button className="mt-4 text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                    Читать далее →
                  </button>
                </div>
              </article>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Загрузить еще
            </button>
          </div>
        </div>
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