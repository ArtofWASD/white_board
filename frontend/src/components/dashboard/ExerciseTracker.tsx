import React, { useState } from 'react';
import { ExerciseCard } from './ExerciseCard';
import { ListFilters, ViewMode } from '../ui/ListFilters';
import Button from '../ui/Button';

interface Exercise {
  id: string;
  name: string;
  maxWeight: number;
  records: any[];
}

interface ExerciseTrackerProps {
  exercises: Exercise[];
  isLoading: boolean;
  onCreateExercise: (name: string, initialWeight?: number) => Promise<void>;
  onAddRecord: (exerciseId: string, weight: number) => Promise<void>;
}

export function ExerciseTracker({ 
  exercises, 
  isLoading, 
  onCreateExercise, 
  onAddRecord 
}: ExerciseTrackerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [initialWeight, setInitialWeight] = useState('');

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExerciseName.trim()) return;

    await onCreateExercise(
      newExerciseName, 
      initialWeight ? parseFloat(initialWeight) : undefined
    );
    
    setNewExerciseName('');
    setInitialWeight('');
    setIsCreating(false);
  };

  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Прогресс упражнений</h2>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? 'Отмена' : 'Добавить упражнение'}
        </Button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateExercise} onPointerDown={(e) => e.stopPropagation()} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 animate-in fade-in slide-in-from-top-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Название упражнения (например, Жим лежа)"
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <input
              type="number"
              step="0.5"
              placeholder="Вес (кг)"
              value={initialWeight}
              onChange={(e) => setInitialWeight(e.target.value)}
              className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="submit" disabled={!newExerciseName.trim()}>
              Сохранить упражнение
            </Button>
          </div>
        </form>
      )}

      <ListFilters
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Фильтр упражнений..."
      />

      <div className="flex-1 overflow-y-auto min-h-0 pr-2">
        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">Упражнения не найдены. Начните с добавления нового!</p>
          </div>
        ) : (
          <div className={viewMode === 'list' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}>
            {filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onAddRecord={onAddRecord}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
