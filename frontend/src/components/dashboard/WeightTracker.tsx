import React, { useState } from 'react';
import { User } from '../../types';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { useToast } from '../../lib/context/ToastContext';

interface WeightTrackerProps {
  user: User;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function WeightTracker({ user, isExpanded = true, onToggle }: WeightTrackerProps) {
  const { updateUser } = useAuthStore();
  const { success, error: toastError } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [newWeight, setNewWeight] = useState(user.weight?.toString() || '');
  const [isLoading, setIsLoading] = useState(false);
  // const [isCollapsed, setIsCollapsed] = useState(false);

  const currentWeight = user.weight || 0;
  const weightHistory = user.weightHistory || [];

  // Calculate progress
  const startWeight = weightHistory.length > 0 ? weightHistory[0].weight : currentWeight;
  const weightChange = currentWeight - startWeight;
  const isWeightLoss = weightChange <= 0;

  const handleSaveWeight = async () => {
    if (!newWeight || isNaN(parseFloat(newWeight))) return;

    const weightValue = parseFloat(newWeight);
    setIsLoading(true);
    try {
      // Update backend (only weight for now)
      const response = await fetch(`/api/auth/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight: weightValue }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        // Create new history entry
        const newEntry = {
          weight: weightValue,
          date: new Date().toISOString(),
        };




        // Update local user with new weight AND history
        // We merge the backend response (which has updated weight) with our local history
        const updatedUser = {
          ...data.user,
          weightHistory: [...(user.weightHistory || []), newEntry],
        };



        updateUser(updatedUser);
        setIsEditing(false);
        success('Вес успешно обновлен');
      } else {
        toastError(`Не удалось обновить вес: ${data.message || 'Неизвестная ошибка'}`);
      }
    } catch (error) {

      toastError('Ошибка при обновлении веса');
    } finally {
      setIsLoading(false);
    }
  };

  // Chart helpers
  const getChartPath = (width: number, height: number) => {
    if (weightHistory.length < 2) return '';

    const weights = weightHistory.map(h => h.weight);
    const minWeight = Math.min(...weights) - 0.5;
    const maxWeight = Math.max(...weights) + 0.5;
    const range = maxWeight - minWeight || 1;

    const points = weightHistory.map((h, index) => {
      const x = (index / (weightHistory.length - 1)) * width;
      const y = height - ((h.weight - minWeight) / range) * height;
      return `${x},${y}`;
    });

    return `M${points.join(' L')}`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md h-full flex flex-col transition-all duration-300 ${!isExpanded ? 'overflow-hidden justify-center px-4' : 'p-6'}`}>
      <div className={`flex justify-between items-center ${!isExpanded ? '' : 'mb-6'}`}>
        <h2 className={`font-bold text-gray-800 transition-all ${!isExpanded ? 'text-lg' : 'text-2xl'}`}>Мой Вес</h2>
        <button 
          onClick={onToggle}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
          title={!isExpanded ? "Развернуть" : "Свернуть"}
          onPointerDown={(e) => e.stopPropagation()} 
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={`transform transition-transform duration-200 ${!isExpanded ? 'rotate-180' : ''}`}
          >
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
      </div>
      
      {isExpanded && (
       <>
      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
        <div className="flex items-end space-x-4 mb-6">
          <div className="text-5xl font-bold text-gray-900">
            {currentWeight > 0 ? currentWeight : '--'}
            <span className="text-xl text-gray-500 ml-2">kg</span>
          </div>
          
          {currentWeight > 0 && (
            <div className={`flex items-center mb-2 px-2 py-1 rounded-full text-sm font-medium ${
              isWeightLoss ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <span>{isWeightLoss ? '↓' : '↑'} {Math.abs(weightChange).toFixed(1)} kg</span>
              <span className="ml-1 text-xs opacity-75">всего</span>
            </div>
          )}
        </div>

        <div className="relative h-32 w-full bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center mb-6 overflow-hidden">
          {weightHistory.length > 1 ? (
            <svg className="absolute inset-0 w-full h-full text-blue-500" preserveAspectRatio="none">
              <path 
                d={getChartPath(300, 128)} // Approximate width, exact height
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                vectorEffect="non-scaling-stroke"
              />
              <path 
                d={`${getChartPath(300, 128)} L 300,128 L 0,128 Z`} 
                fill="url(#gradient)" 
                stroke="none" 
                opacity="0.2"
              />
              <defs>
                <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          ) : (
            <p className="text-gray-400 text-sm">Недостаточно данных для графика</p>
          )}
        </div>

        {/* Weight History List */}
        <div className="flex-1 overflow-y-auto min-h-0 mb-4 pr-2">
          <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">История</h3>
          {weightHistory.length === 0 ? (
            <p className="text-sm text-gray-400 italic">История пуста</p>
          ) : (
            <div className="space-y-2">
              {[...weightHistory].reverse().map((entry, index) => (
                <div key={index} className="flex justify-between items-center text-sm py-1 border-b border-gray-100 last:border-0">
                  <span className="text-gray-600">
                    {new Date(entry.date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="font-medium text-gray-900">{entry.weight} kg</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto text-center pt-2 border-t border-gray-100">
          {isEditing ? (
            <div 
              className="flex flex-col space-y-2"
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="Введите вес"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                autoFocus
              />
              <div className="flex space-x-2 justify-center">
                <button 
                  onClick={handleSaveWeight}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? '...' : 'Сохранить'}
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => {
                setNewWeight(user.weight?.toString() || '');
                setIsEditing(true);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            >
              + Добавить замер
            </button>
          )}
        </div>
      </div>
       </>
      )}
    </div>
  );
}
