'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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

// Define types for news
interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  content: string;
}

// Define types for workouts
interface WorkoutItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  difficulty: string;
  content: string;
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

  // Sample news data
  const newsItems: NewsItem[] = [
    {
      id: '1',
      title: 'Новые возможности тренировочного календаря',
      excerpt: 'Мы добавили новые функции в наш тренировочный календарь, которые помогут вам лучше планировать свои занятия.',
      date: '15 ноября 2025',
      readTime: '5 мин чтения',
      content: 'В новом обновлении мы добавили возможность планирования групповых тренировок, интеграцию с популярными фитнес-приложениями и улучшенную систему напоминаний о предстоящих занятиях. Теперь вы можете легко делиться своими тренировками с друзьями и отслеживать прогресс всей команды.'
    },
    {
      id: '2',
      title: 'Советы по питанию для спортсменов',
      excerpt: 'Правильное питание играет ключевую роль в достижении спортивных результатов. Узнайте больше о важных аспектах спортивного питания.',
      date: '10 ноября 2025',
      readTime: '7 мин чтения',
      content: 'Спортивное питание должно быть сбалансированным и содержать все необходимые макро- и микроэлементы. Мы подготовили подробное руководство по питанию до, во время и после тренировок, которое поможет вам оптимизировать ваши спортивные результаты и ускорить восстановление.'
    },
    {
      id: '3',
      title: 'Как избежать перетренированности',
      excerpt: 'Перетренированность - частая проблема среди активных спортсменов. Узнайте, как распознать признаки и предотвратить это состояние.',
      date: '5 ноября 2025',
      readTime: '6 мин чтения',
      content: 'Перетренированность может серьезно повлиять на ваш спортивный прогресс и общее состояние здоровья. В этой статье мы рассмотрим основные симптомы перетренированности, методы диагностики и рекомендации по восстановлению. Также вы узнаете, как правильно планировать тренировочный процесс с учетом периодов отдыха и восстановления.'
    }
  ];

  // Sample workout data
  const workoutItems: WorkoutItem[] = [
    {
      id: '1',
      title: 'HIIT тренировка для начинающих',
      excerpt: 'Интенсивная интервальная тренировка для тех, кто только начинает свой путь в фитнесе.',
      date: '15 ноября 2025',
      difficulty: 'Начинающий',
      content: 'Эта HIIT тренировка состоит из 8 упражнений, выполняемых по 30 секунд с 15-секундным отдыхом между ними. Цикл повторяется 3 раза с минутным перерывом между циклами. Тренировка включает приседания, отжимания, берпи, скакалку, планку, выпады, бег на месте и прыжки. Подходит для новичков и не требует специального оборудования.'
    },
    {
      id: '2',
      title: 'Силовая тренировка для спины',
      excerpt: 'Комплекс упражнений для укрепления мышц спины и улучшения осанки.',
      date: '10 ноября 2025',
      difficulty: 'Средний',
      content: 'Тренировка направлена на развитие всех групп мышц спины: трапеций, широчайших, ромбовидных и поясничных мышц. В комплекс входят становая тяга, подтягивания, гиперэкстензия, тяга штанги в наклоне, обратные разведения в тренажере и планка. Рекомендуется выполнять 3-4 подхода по 8-12 повторений с рабочим весом 60-80% от одноповторного максимума.'
    },
    {
      id: '3',
      title: 'Кардио тренировка на улице',
      excerpt: 'Эффективная кардио тренировка, которую можно провести на свежем воздухе без специального оборудования.',
      date: '5 ноября 2025',
      difficulty: 'Начинающий',
      content: 'Прогулка на свежем воздухе может быть отличной кардио тренировкой. Мы предлагаем маршрут длиной 5 км с элементами интервальной нагрузки: чередование быстрой ходьбы и легкого бега трусцой. Также включены упражнения на каждой остановке: приседания, отжимания от стены, прыжки и растяжка. Общая продолжительность тренировки 45 минут.'
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
          {/* Two large links for News and Workouts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Link 
              href="/blog/news" 
              className="relative group block bg-white p-8 rounded-lg transition-all duration-300 ease-in-out"
            >
              <div className="flex flex-col h-full justify-center items-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Новости</h2>
                <div className="w-26 h-0.5 bg-black mt-2"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 group-hover:translate-y-[10%] transition-all duration-300 ease-in-out pointer-events-none">
                  <span className="text-sm text-gray-600 whitespace-nowrap">
                    Читайте последние новости и обновления
                  </span>
                </div>
              </div>
            </Link>
            
            <Link 
              href="/blog/workouts" 
              className="relative group block bg-white p-8 rounded-lg transition-all duration-300 ease-in-out"
            >
              <div className="flex flex-col h-full justify-center items-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Воркауты</h2>
                <div className="w-28 h-0.5 bg-black mt-2"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 group-hover:translate-y-[10%] transition-all duration-300 ease-in-out pointer-events-none">
                  <span className="text-sm text-gray-600 whitespace-nowrap">
                    Откройте для себя новые тренировки
                  </span>
                </div>
              </div>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {newsItems.slice(0, 2).map((item) => (
              <article 
                key={item.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-3 text-gray-800">{item.title}</h2>
                  <p className="text-gray-600 mb-4">{item.excerpt}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{item.date}</span>
                    <span>{item.readTime}</span>
                  </div>
                  <Link 
                    href={`/blog/news/${item.id}`}
                    className="mt-4 text-indigo-600 font-medium hover:text-indigo-800 transition-colors inline-block"
                  >
                    Читать далее →
                  </Link>
                </div>
              </article>
            ))}
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