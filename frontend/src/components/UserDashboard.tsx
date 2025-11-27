'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { UserDashboardProps, DashboardEvent as Event } from '../types/UserDashboard.types';
import AthleteEvents from './AthleteEvents';
import CreateTeamModal from './CreateTeamModal';

export default function UserDashboard({ onClose }: UserDashboardProps) {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      if (user) {
        try {
          const response = await fetch(`/api/events?userId=${user.id}`);
          const data: Event[] = await response.json();
          
          if (response.ok) {
            setEvents(data);
          }
        } catch (error) {
          console.error('Failed to fetch events:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchEvents();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const futureEvents = events.filter(event => event.status === 'future');
  const pastEvents = events.filter(event => event.status === 'past');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Добро пожаловать, {user.name}{user.lastName ? ` ${user.lastName}` : ''} ({user.role === 'athlete' ? 'Атлет' : 'Тренер'})!</h2>
        <div className="flex space-x-2">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-300"
            >
              Закрыть и вернуться к календарю
            </button>
          )}
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
          >
            Выйти
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Ваши события</h3>
          {loading ? (
            <p className="text-gray-700">Загрузка...</p>
          ) : (
            <p className="text-gray-700">Всего событий: {events.length}</p>
          )}
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Календарь</h3>
          <p className="text-gray-700">Просматривайте и планируйте события</p>
        </div>
        
        <Link href="/profile" className="bg-purple-50 p-6 rounded-lg hover:bg-purple-100 transition duration-300">
          <h3 className="text-xl font-semibold mb-2">Профиль</h3>
          <p className="text-gray-700">Настройте ваш профиль и предпочтения</p>
        </Link>
      </div>
      
      {/* Create Team Button for Trainers */}
      {user.role === 'trainer' && (
        <div className="mt-8">
          <button
            onClick={() => setIsCreateTeamModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
          >
            Создать команду
          </button>
        </div>
      )}
      
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">События спортсмена</h3>
        <AthleteEvents userId={user.id} />
      </div>
      
      {/* Create Team Modal */}
      <CreateTeamModal 
        isOpen={isCreateTeamModalOpen}
        onClose={() => setIsCreateTeamModalOpen(false)}
        onTeamCreated={() => {
          // Optionally refresh team data or show notification
          console.log('Team created successfully');
        }}
      />
    </div>
  );
}