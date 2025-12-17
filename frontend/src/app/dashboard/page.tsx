'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

import Button from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { ExerciseTracker } from '../../components/dashboard/ExerciseTracker';
import { RecentActivities } from '../../components/dashboard/RecentActivities';
import { WeightTracker } from '../../components/dashboard/WeightTracker';
import { UniversalCalculator } from '../../components/dashboard/UniversalCalculator';

import { SortableItem } from '../../components/dashboard/SortableItem';
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
  const { user, updateUser } = useAuthStore();
  const { flags } = useFeatureFlagStore();
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize state from user object or defaults
  // Default to universal calculator, but support all IDs
  const [items, setItems] = useState<string[]>(['exercise-tracker', 'weight-tracker', 'recent-activities', 'universal-calculator']);
  const [layoutMode, setLayoutMode] = useState<'asymmetric' | 'symmetric' | 'symmetric-1-1'>('asymmetric');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (user) {
      fetchData();
      
      // Sync state with user profile
      if (user.dashboardLayout && user.dashboardLayout.length > 0) {
        const savedLayout = user.dashboardLayout;
        const allWidgets = ['exercise-tracker', 'weight-tracker', 'recent-activities', 'universal-calculator', 'trainer-stats-widget'];
        
        // We support all IDs now, so no need to migrate forcedly unless we want to standardise.
        // User asked for flexibility, so we respect savedLayout IDs.
        
        const missingWidgets = allWidgets.filter(w => !savedLayout.includes(w));
        setItems([...savedLayout, ...missingWidgets]); // Append new widgets to the end
      } else {
        setItems(['exercise-tracker', 'weight-tracker', 'recent-activities', 'universal-calculator', 'trainer-stats-widget']);
      }

      if (user.dashboardLayoutMode) {
        setLayoutMode(user.dashboardLayoutMode as 'asymmetric' | 'symmetric' | 'symmetric-1-1');
      }
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [exercisesRes, eventsRes] = await Promise.all([
        fetch(`/api/exercises?userId=${user.id}`, { cache: 'no-store' }),
        fetch(`/api/events?userId=${user.id}`, { cache: 'no-store' })
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

    } finally {
      setIsLoading(false);
    }
  };

  const saveLayout = async (newItems: string[], newMode: 'asymmetric' | 'symmetric' | 'symmetric-1-1') => {
    if (!user) return;

    try {
      const response = await fetch(`/api/auth/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboardLayout: newItems,
          dashboardLayoutMode: newMode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update local user store to reflect changes
        if (data.user) {
            updateUser({
                ...user,
                dashboardLayout: newItems,
                dashboardLayoutMode: newMode
            });
        }
      }
    } catch (error) {

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

    }
  };

  const handleUpdateExercise = async (id: string, name: string) => {
    try {

      const response = await fetch(`/api/exercises/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });


      if (response.ok) {

        await fetchData();
      }
    } catch (error) {

    }
  };

  const handleGoToProfile = () => {
    router.push('/profile');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      const newItems = arrayMove(items, oldIndex, newIndex);
      
      setItems(newItems);
      saveLayout(newItems, layoutMode);
    }
  };

  const handleLayoutChange = (mode: 'asymmetric' | 'symmetric' | 'symmetric-1-1') => {
    setLayoutMode(mode);
    saveLayout(items, mode);
  };

  const renderWidget = (id: string) => {
    switch (id) {
      case 'exercise-tracker':
        return (
          <ExerciseTracker 
            exercises={exercises}
            isLoading={isLoading}
            onCreateExercise={handleCreateExercise}
            onAddRecord={handleAddRecord}
            onUpdateExercise={handleUpdateExercise}
          />
        );
      case 'weight-tracker':
        return user ? <WeightTracker user={user} /> : null;
      case 'recent-activities':
        return <RecentActivities exercises={exercises} events={events} />;
      case 'universal-calculator':
        return <UniversalCalculator exercises={exercises} />;

      default:
        return null;
    }
  };

  // Filter items based on feature flags and user state
  const visibleItems = items.filter(id => {
    // Organization Admins should not see training widgets
    if (user?.role === 'ORGANIZATION_ADMIN') {
       const trainingWidgets = [
         'exercise-tracker', 
         'weight-tracker', 
         'universal-calculator', 
         'recent-activities'
       ];
       if (trainingWidgets.includes(id)) return false;
    }

    if (id === 'exercise-tracker' && !flags.showExerciseTracker) return false;
    if (id === 'weight-tracker' && (!flags.showWeightTracker || !user)) return false;
    
    // Universal Calculator Logic
    if (id === 'universal-calculator') {
        // Show only if universal mode is ON AND at least one calc is enabled
        return flags.showUniversalCalculator && (flags.strengthTrainingCalculator || flags.texasMethodCalculator);
    }

    // Deprecated calculators
    if (id === 'strength-training-calculator' || id === 'texas-method-calculator') {
        return false;
    }

    return true;
  });

  if (isLoading) {
    return <Loader />;
  }

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
              <p className="text-sm text-gray-500">
                Роль: {user.role === 'ATHLETE' ? 'Атлет' : user.role === 'ORGANIZATION_ADMIN' ? 'Администратор организации' : 'Тренер'}
              </p>
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
            onClick={() => handleLayoutChange('asymmetric')}
            className={`p-1.5 rounded-md transition-all ${
              layoutMode === 'asymmetric' 
                ? 'bg-white shadow-sm' 
                : 'hover:bg-gray-200 opacity-60 hover:opacity-100'
            }`}
            title="2 колонки (несимметрично)"
          >
            <Image 
              src="/asymmetrical.png" 
              alt="2:1" 
              width={24} 
              height={24}
              className="w-6 h-6"
            />
          </button>
          <button
            onClick={() => handleLayoutChange('symmetric')}
            className={`p-1.5 rounded-md transition-all ${
              layoutMode === 'symmetric' 
                ? 'bg-white shadow-sm' 
                : 'hover:bg-gray-200 opacity-60 hover:opacity-100'
            }`}
            title="3 колонки (симметрично)"
          >
            <Image 
              src="/symmetric_3.png" 
              alt="1:1:1" 
              width={24} 
              height={24}
              className="w-6 h-6"
            />
          </button>
          <button
            onClick={() => handleLayoutChange('symmetric-1-1')}
            className={`p-1.5 rounded-md transition-all ${
              layoutMode === 'symmetric-1-1' 
                ? 'bg-white shadow-sm' 
                : 'hover:bg-gray-200 opacity-60 hover:opacity-100'
            }`}
            title="2 колонки (симметрично)"
          >
            <Image 
              src="/symmetric_2.png" 
              alt="1:1" 
              width={24} 
              height={24}
              className="w-6 h-6"
            />
          </button>
        </div>
      </div>
      
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={visibleItems} 
          strategy={rectSortingStrategy}
        >
          <div className={`grid grid-cols-1 gap-8 ${
            layoutMode === 'symmetric-1-1' ? 'lg:grid-cols-2' : 'lg:grid-cols-3'
          }`}>
            {visibleItems.map((id, index) => {
              const isWide = (index % 4 === 0 || index % 4 === 3) && layoutMode === 'asymmetric';
              const className = `h-[450px] overflow-hidden ${isWide ? 'lg:col-span-2' : 'lg:col-span-1'}`;
              
              return (
                <SortableItem key={id} id={id} className={className}>
                  {renderWidget(id)}
                </SortableItem>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}