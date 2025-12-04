'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Button from '../../components/ui/Button';
import { ExerciseTracker } from '../../components/dashboard/ExerciseTracker';
import { RecentActivities } from '../../components/dashboard/RecentActivities';
import { WeightTracker } from '../../components/dashboard/WeightTracker';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { useFeatureFlagStore } from '../../lib/store/useFeatureFlagStore';

interface Exercise {
  id: string;
  name: string;
  maxWeight: number;
  records: any[];
}

interface Event {
  id: string;
  title: string;
  results: any[];
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { flags } = useFeatureFlagStore();
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [layoutMode, setLayoutMode] = useState<'asymmetric' | 'symmetric'>('asymmetric');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [exercisesRes, eventsRes] = await Promise.all([
        fetch(`/api/exercises?userId=${user.id}`),
        fetch(`/api/events?userId=${user.id}`)
      ]);

      if (exercisesRes.ok) {
        const data = await exercisesRes.json();
        setExercises(data);
      }

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateExercise = async (name: string, initialWeight?: number) => {
    if (!user) return;
    try {
      const body: any = { name, userId: user.id };
      if (initialWeight) {
        body.initialWeight = initialWeight;
      }

      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create exercise:', error);
    }
  };

  const handleAddRecord = async (exerciseId: string, weight: number) => {
    try {
      const response = await fetch(`/api/exercises/${exerciseId}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to add record:', error);
    }
  };

  const handleGoToProfile = () => {
    router.push('/profile');
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Доступ запрещен</h2>
        <p className="mb-4">Вы должны войти в систему, чтобы просматривать эту страницу.</p>
        <Button 
          onClick={() => router.push('/')}
          variant="outline"
          className="text-blue-500 hover:text-blue-700 font-medium"
        >
          Вернуться на главную страницу
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mr-4">
              <span className="text-2xl font-bold text-white">{user.name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">Роль: {user.role === 'athlete' ? 'Атлет' : 'Тренер'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleGoToProfile}
              variant="ghost"
              isIcon={true}
              tooltip="Редактировать профиль"
              className="mr-12"
            >
              <Image 
                src="/edit_profile_icon.png" 
                alt="Редактировать профиль" 
                width={40} 
                height={40} 
              />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setLayoutMode('asymmetric')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              layoutMode === 'asymmetric' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title="2 колонки (несимметрично)"
          >
            2:1
          </button>
          <button
            onClick={() => setLayoutMode('symmetric')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              layoutMode === 'symmetric' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title="3 колонки (симметрично)"
          >
            1:1:1
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {flags.showExerciseTracker && (
          <div className={`h-[600px] overflow-hidden ${
            layoutMode === 'asymmetric' ? 'lg:col-span-2' : 'lg:col-span-1'
          }`}>
            <ExerciseTracker 
              exercises={exercises}
              isLoading={isLoading}
              onCreateExercise={handleCreateExercise}
              onAddRecord={handleAddRecord}
            />
          </div>
        )}
        
        {flags.showWeightTracker && user && (
          <div className="h-[600px] overflow-hidden lg:col-span-1">
            <WeightTracker user={user} />
          </div>
        )}

        <div className="h-[600px] overflow-hidden lg:col-span-1">
          <RecentActivities exercises={exercises} events={events} />
        </div>
      </div>
    </div>
  );
}