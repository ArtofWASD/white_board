import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useFeatureFlagStore } from '@/lib/store/useFeatureFlagStore';
import { AddToCalendarModal } from './AddToCalendarModal';
import { TexasMethodModule } from './calculators/TexasMethodModule';
import { StrengthTrainingModule } from './calculators/StrengthTrainingModule';

interface Exercise {
  id: string;
  name: string;
  maxWeight: number;
}

interface UniversalCalculatorProps {
  exercises: Exercise[];
}

export function UniversalCalculator({ exercises }: UniversalCalculatorProps) {
  const { user } = useAuthStore();
  const { flags } = useFeatureFlagStore();
  const [activeModule, setActiveModule] = useState<'texas' | '531'>('texas');
  
  // Calendar Modal State
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calendarModalData, setCalendarModalData] = useState<{title: string, description: string} | null>(null);

  // Determine available modules based on feature flags
  const showTexas = flags.texasMethodCalculator;
  const show531 = flags.strengthTrainingCalculator;

  useEffect(() => {
    // Set default active module based on availability
    if (showTexas && !show531) {
        setActiveModule('texas');
    } else if (!showTexas && show531) {
        setActiveModule('531');
    }
  }, [showTexas, show531]);

  // If neither is enabled, don't render anything (or handle in parent)
  if (!showTexas && !show531) {
      return null;
  }

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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Калькулятор</h2>
        
        {/* Module Switcher if both are enabled */}
        {showTexas && show531 && (
             <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                    onClick={() => setActiveModule('texas')}
                    onPointerDown={handleInputPointerDown}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        activeModule === 'texas' 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Техасский
                </button>
                <button
                    onClick={() => setActiveModule('531')}
                    onPointerDown={handleInputPointerDown}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        activeModule === '531' 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    5/3/1
                </button>
            </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
          {activeModule === 'texas' && showTexas && (
              <TexasMethodModule 
                exercises={exercises} 
                onAddToCalendar={openCalendarModal}
                handleInputPointerDown={handleInputPointerDown}
                handleInputKeyDown={handleInputKeyDown}
              />
          )}
          {activeModule === '531' && show531 && (
              <StrengthTrainingModule 
                exercises={exercises} 
                onAddToCalendar={openCalendarModal}
                handleInputPointerDown={handleInputPointerDown}
                handleInputKeyDown={handleInputKeyDown}
              />
          )}

          {!((activeModule === 'texas' && showTexas) || (activeModule === '531' && show531)) && (
              <div className="text-gray-500 text-center mt-10">Выберите доступный модуль</div>
          )}
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
