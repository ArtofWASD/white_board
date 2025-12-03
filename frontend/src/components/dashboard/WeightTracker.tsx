import React from 'react';
import { User } from '../../types';

interface WeightTrackerProps {
  user: User;
}

export function WeightTracker({ user }: WeightTrackerProps) {
  const currentWeight = user.weight || 0;
  // Mock data for progress since we don't have history yet
  const weightChange = -2.5; 
  const isWeightLoss = weightChange < 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Мой Вес</h2>
      
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="flex items-end space-x-4 mb-6">
          <div className="text-5xl font-bold text-gray-900">
            {currentWeight > 0 ? currentWeight : '--'}
            <span className="text-xl text-gray-500 ml-2">kg</span>
          </div>
          
          {currentWeight > 0 && (
            <div className={`flex items-center mb-2 px-2 py-1 rounded-full text-sm font-medium ${
              isWeightLoss ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <span>{isWeightLoss ? '↓' : '↑'} {Math.abs(weightChange)} kg</span>
              <span className="ml-1 text-xs opacity-75">за 30 дней</span>
            </div>
          )}
        </div>

        <div className="relative h-32 w-full bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center">
          <p className="text-gray-400 text-sm">График изменения веса</p>
          {/* Placeholder for chart */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-blue-50 to-transparent opacity-50"></div>
          <svg className="absolute bottom-0 left-0 right-0 h-24 w-full text-blue-400 opacity-30" preserveAspectRatio="none">
             <path d="M0,100 L20,90 L40,95 L60,80 L80,85 L100,60 L120,70 L140,50 L160,55 L180,40 L200,45 L220,30 L240,35 L260,20 L280,25 L300,10 L320,15 L340,0 L340,100 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="mt-6 text-center">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
            + Добавить замер
          </button>
        </div>
      </div>
    </div>
  );
}
