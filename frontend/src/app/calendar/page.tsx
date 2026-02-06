'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Calendar from '../../features/events/Calendar';
import Header from '../../components/layout/Header';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { useTeamStore } from '../../lib/store/useTeamStore';
import Footer from '../../components/layout/Footer';
import { NavItem, CalendarEvent, EventResult } from '../../types';

// Определение типа для ответа API
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
  const [events, setEvents] = useState<CalendarEvent[]>([]); // Хранение событий для отображения результатов
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null); // Для отображения деталей события
  const [showEventModal, setShowEventModal] = useState(false); // Управление видимостью модального окна события
  
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
        label: 'Лидерборд',
        href: '/dashboard/leaderboard',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0V9.499a2.25 2.25 0 00-2.25-2.25H11.525a2.25 2.25 0 00-2.25 2.25v2.875M12 2.25v4.5" />
          </svg>
        ),
        tooltip: 'Лидерборд'
      },
      { 
        label: 'Команды', 
        href: '/dashboard/teams',
        icon: <Image src="/teams_icon.png" alt="Teams" width={32} height={32} />,
        tooltip: 'Команды'
      },
    ];

    if (user.role === 'TRAINER' || user.role === 'ORGANIZATION_ADMIN' || user.role === 'SUPER_ADMIN') {
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

      if (user.role === 'TRAINER' || user.role === 'SUPER_ADMIN') {
        items.push({ 
          label: 'Занятия', 
          href: '/dashboard/activities',
          icon: <Image src="/workout_icon.png" alt="Activities" width={32} height={32} />,
          tooltip: 'Занятия'
        });
      }
    }



    if (user.role === 'SUPER_ADMIN') {
        items.push({
            label: 'Админ',
            href: '/admin',
            // Пока без иконки или используйте общую
            icon: (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                 </svg>
            ),
            tooltip: 'Админ'
        });
    }

    items.push({
      label: 'Таймер',
      href: '/timer',
      icon: <Image src="/stopwatch.png" alt="Timer" width={32} height={32} />,
      tooltip: 'Таймер'
    });

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

  // Убеждаемся, что команды загружены, если доступ прямой
  useEffect(() => {
    if (isAuthenticated && teams.length === 0) {
        fetchTeams(); 
    }
  }, [isAuthenticated, teams.length, fetchTeams]);
  
  // Локальное состояние для предпочтений просмотра календаря. 
  // Инициализируем глобальной выбранной командой, если доступна, или 'my' для "Мои события"
  const [calendarTeamId, setCalendarTeamId] = useState<string | null>(selectedTeam?.id || 'my');

  // Синхронизировать с глобальным хранилищем изначально или при изменении хранилища? 
  // Пользователь может захотеть просматривать другие команды, не меняя глобальный контекст.
  // давайте оставим его независимым после инициализации, но, может быть, обновим, если selectedTeam изменится извне?
  // проще просто инициализировать с ним.
  
  useEffect(() => {
      if (selectedTeam) {
          setCalendarTeamId(selectedTeam.id);
      }
  }, [selectedTeam]);

  // Функция для обновления событий на странице календаря
  const updateEvents = useCallback((newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
  }, []);



  // Эта функция больше не нужна, так как панель управления является отдельной страницей

  const toggleAuth = () => {
    setShowAuth(!showAuth);
  };

  // Функция для отображения деталей события при клике на название события
  const handleShowEventDetails = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // Функция для закрытия модального окна события
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
      
      {/* Модальное окно деталей события */}
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