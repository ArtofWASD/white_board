import React, { useState } from 'react';
import Button from '../ui/Button';

interface ExerciseRecord {
  id: string;
  weight: number;
  date: string;
}

interface Exercise {
  id: string;
  name: string;
  maxWeight: number;
  records: ExerciseRecord[];
}

interface ExerciseCardProps {
  exercise: Exercise;
  onAddRecord: (exerciseId: string, weight: number) => Promise<void>;
}

export function ExerciseCard({ exercise, onAddRecord }: ExerciseCardProps) {
  const [newWeight, setNewWeight] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;

    setIsAdding(true);
    try {
      await onAddRecord(exercise.id, parseFloat(newWeight));
      setNewWeight('');
    } catch (error) {
      console.error('Failed to add record', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{exercise.name}</h3>
          <p className="text-sm text-gray-500 mt-1">
            Макс. вес: <span className="font-bold text-black text-lg">{exercise.maxWeight} кг</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} onPointerDown={(e) => e.stopPropagation()} className="flex gap-2 w-full sm:w-auto">
          <input
            type="number"
            step="0.5"
            placeholder="Новый вес"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            className="w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <Button type="submit" disabled={isAdding || !newWeight} size="sm">
            {isAdding ? '...' : 'Добавить'}
          </Button>
        </form>
      </div>

      <div className="border-t pt-2">
        <button
          onClick={() => setShowHistory(!showHistory)}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 w-full justify-center"
        >
          {showHistory ? 'Скрыть историю' : 'Показать историю'}
          <svg
            className={`w-4 h-4 transform transition-transform ${showHistory ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showHistory && (
          <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
            {exercise.records && exercise.records.length > 0 ? (
              exercise.records.map((record) => (
                <div key={record.id} className="flex justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  <span>{new Date(record.date).toLocaleDateString()}</span>
                  <span className="font-medium">{record.weight} кг</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-2">История пуста</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
