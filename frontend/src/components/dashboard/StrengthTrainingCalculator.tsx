import React, { useState } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { AddToCalendarModal } from './AddToCalendarModal';
import { StrengthTrainingModule } from './calculators/StrengthTrainingModule';

interface Exercise {
  id: string;
  name: string;
  maxWeight: number;
}

interface StrengthTrainingCalculatorProps {
  exercises: Exercise[];
}

export function StrengthTrainingCalculator({ exercises }: StrengthTrainingCalculatorProps) {
  const { user } = useAuthStore();
  
  // Calendar Modal State
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calendarModalData, setCalendarModalData] = useState<{title: string, description: string} | null>(null);

  const openCalendarModal = (title: string, description: string) => {
    setCalendarModalData({ title, description });
    setIsCalendarModalOpen(true);
  };

  const handleAddToCalendar = async (date: Date) => {
    if (!user || !calendarModalData) return;
    
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          title: calendarModalData.title,
          description: calendarModalData.description,
          eventDate: date.toISOString(),
          exerciseType: 'strength_training',
        }),
      });

      if (response.ok) {
        alert('Тренировка добавлена в календарь');
      } else {
        console.error('Failed to add event');
      }
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleInputPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Калькулятор 5/3/1</h2>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <StrengthTrainingModule 
            exercises={exercises} 
            onAddToCalendar={openCalendarModal}
            handleInputPointerDown={handleInputPointerDown}
            handleInputKeyDown={handleInputKeyDown}
        />
      </div>

      {calendarModalData && (
        <AddToCalendarModal
            isOpen={isCalendarModalOpen}
            onClose={() => setIsCalendarModalOpen(false)}
            onSave={handleAddToCalendar}
            title={calendarModalData.title}
            description={calendarModalData.description}
        />
      )}
    </div>
  );
}
