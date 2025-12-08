import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface Exercise {
  id: string;
  name: string;
  maxWeight: number;
}

interface TexasMethodCalculatorProps {
  exercises: Exercise[];
}

export function TexasMethodCalculator({ exercises }: TexasMethodCalculatorProps) {
  const { user } = useAuthStore();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [fiveRepMax, setFiveRepMax] = useState<number>(0);
  const [dayThreeMode, setDayThreeMode] = useState<'1x5' | '1x3' | '1x1'>('1x5');

  useEffect(() => {
    if (selectedExerciseId) {
      const exercise = exercises.find(ex => ex.id === selectedExerciseId);
      if (exercise) {
        // Assuming maxWeight in DB is 1RM. For Texas Method we need 5RM.
        // We can estimate 5RM from 1RM (approx 85-87%) or let user input it.
        // Let's use 85% estimate as default but allow override.
        setFiveRepMax(Math.round(exercise.maxWeight * 0.85));
      }
    }
  }, [selectedExerciseId, exercises]);

  const handleInputPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  // Calculations for 4 weeks
  const weeks = [0, 1, 2, 3].map(weekIndex => {
      const weekly5RM = fiveRepMax + (weekIndex * 2.5); // +2.5kg per week progression
      
      const day1Weight = Math.round(weekly5RM * 0.9);
      const day2Weight = Math.round(day1Weight * 0.8);
      
      const day3BaseWeight = weekly5RM + 2.5;
      let day3Weight = day3BaseWeight; 
      
      if (dayThreeMode === '1x3') {
          day3Weight = day3BaseWeight + 2.5;
      } else if (dayThreeMode === '1x1') {
          day3Weight = day3BaseWeight + 5;
      }

      return {
          weekNum: weekIndex + 1,
          day1: `${day1Weight} кг (5x5)`,
          day2: `${day2Weight} кг (2x5)`,
          day3: `${day3Weight} кг (${dayThreeMode})`
      };
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Техасский Метод</h2>
        {/* Toggle Mode Selector */}
        <select 
          value={dayThreeMode}
          onChange={(e) => setDayThreeMode(e.target.value as any)}
          onPointerDown={handleInputPointerDown}
          className="text-sm border border-gray-200 rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-blue-100 outline-none"
        >
            <option value="1x5">Режим: Рекорд (1x5)</option>
            <option value="1x3">Режим: Тяжело (1x3)</option>
            <option value="1x1">Режим: Пик (1x1)</option>
        </select>
      </div>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Упражнение</label>
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            onPointerDown={handleInputPointerDown}
            onKeyDown={handleInputKeyDown}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
          >
            <option value="">Выберите упражнение</option>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Текущий 5ПМ (Старт)</label>
            <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={fiveRepMax || ''}
                  onChange={(e) => setFiveRepMax(Number(e.target.value))}
                  onPointerDown={handleInputPointerDown}
                  onKeyDown={handleInputKeyDown}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  placeholder="кг"
                />
                <span className="text-sm text-gray-500 whitespace-nowrap">
                   +2.5кг/нед
                </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Начальный 5ПМ для расчета цикла.</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto mb-4">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-2 py-3">Нед</th>
              <th className="px-2 py-3">Объем (Пн)</th>
              <th className="px-2 py-3">Легкая (Ср)</th>
              <th className="px-2 py-3 text-right">Интенс. (Пт)</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
                <tr key={week.weekNum} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-2 py-3 font-medium text-gray-900 text-center">{week.weekNum}</td>
                  <td className="px-2 py-3 text-gray-600">{week.day1}</td>
                  <td className="px-2 py-3 text-gray-500">{week.day2}</td>
                  <td className="px-2 py-3 text-right font-bold text-blue-600">{week.day3}</td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-auto bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">Прогрессия Месяца</h4>
          <p className="text-xs text-blue-700">
             Цикл рассчитан на 4 недели с линейным повышением весов. 
             Цель: увеличивать рабочий вес на 2.5 кг каждую неделю в день рекордов.
          </p>
      </div>

    </div>
  );
}
