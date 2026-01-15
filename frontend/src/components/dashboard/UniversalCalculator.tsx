import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useFeatureFlagStore } from '@/lib/store/useFeatureFlagStore';
import { useToast } from '@/lib/context/ToastContext';
import { AddToCalendarModal } from './AddToCalendarModal';
import { DashboardWidget, InteractiveArea } from './DashboardWidget';
import { TexasMethodModule } from './calculators/TexasMethodModule';
import { StrengthTrainingModule } from './calculators/StrengthTrainingModule';

interface Exercise {
  id: string;
  name: string;
  maxWeight: number;
}

interface UniversalCalculatorProps {
  exercises: Exercise[];
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function UniversalCalculator({ exercises, isExpanded, onToggle }: UniversalCalculatorProps) {
  const { user } = useAuthStore();
  const { flags } = useFeatureFlagStore();
  const { success, error: toastError } = useToast();
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
        success('Тренировка добавлена в календарь');
      } else {

        toastError('Не удалось добавить тренировку в календарь');
      }
    } catch (error) {

      toastError('Ошибка при добавлении события');
    }
  };

  const moduleSwitcher = (showTexas && show531) ? (
     <InteractiveArea className="flex bg-gray-100 p-1 rounded-lg">
        <button
            onClick={() => setActiveModule('texas')}
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
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeModule === '531' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
            }`}
        >
            5/3/1
        </button>
    </InteractiveArea>
  ) : null;

  return (
    <DashboardWidget 
        title="Калькулятор" 
        headerActions={moduleSwitcher}
        className="shadow-md border-0"
        isExpanded={isExpanded}
        onToggle={onToggle}
    >
      <InteractiveArea className="h-full flex flex-col">
          {activeModule === 'texas' && showTexas && (
              <TexasMethodModule 
                exercises={exercises} 
                onAddToCalendar={openCalendarModal}
                handleInputPointerDown={() => {}} // Deprecated, handled by Wrapper
                handleInputKeyDown={() => {}} // Deprecated
              />
          )}
          {activeModule === '531' && show531 && (
              <StrengthTrainingModule 
                exercises={exercises} 
                onAddToCalendar={openCalendarModal}
                handleInputPointerDown={() => {}}
                handleInputKeyDown={() => {}}
              />
          )}

          {!((activeModule === 'texas' && showTexas) || (activeModule === '531' && show531)) && (
              <div className="text-gray-500 text-center mt-10">Выберите доступный модуль</div>
          )}
      </InteractiveArea>

      {calendarModalData && (
        <AddToCalendarModal
            isOpen={isCalendarModalOpen}
            onClose={() => setIsCalendarModalOpen(false)}
            onSave={handleAddToCalendar}
            title={calendarModalData.title}
            description={calendarModalData.description}
        />
      )}
    </DashboardWidget>
  );
}
