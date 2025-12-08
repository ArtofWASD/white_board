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
  onUpdateExercise: (id: string, name: string) => Promise<void>;
}

export function ExerciseCard({ exercise, onAddRecord, onUpdateExercise }: ExerciseCardProps) {
  const [newWeight, setNewWeight] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Edit logic
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(exercise.name);

  React.useEffect(() => {
    setEditName(exercise.name);
  }, [exercise.name]);

  const handleUpdate = async () => {
    console.log('Updating exercise:', exercise.id, 'to', editName);
    if (!editName.trim() || editName === exercise.name) {
      setIsEditing(false);
      setEditName(exercise.name);
      return;
    }
    
    await onUpdateExercise(exercise.id, editName);
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName(exercise.name);
  };

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
        <div className="w-full sm:w-auto">
          {isEditing ? (
             <div className="flex items-center gap-2 mb-1" onPointerDown={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
               <input 
                 value={editName}
                 onChange={(e) => setEditName(e.target.value)}
                 className="px-2 py-1 text-lg font-bold border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
                 autoFocus
               />
               <button onClick={handleUpdate} className="text-green-600 hover:text-green-700 p-1">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                 </svg>
               </button>
               <button onClick={handleCancelEdit} className="text-red-500 hover:text-red-600 p-1">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
             </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h3 className="text-xl font-bold text-gray-800">{exercise.name}</h3>
              <button 
                onClick={() => setIsEditing(true)}
                onPointerDown={(e) => e.stopPropagation()} 
                className="text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Макс. вес: <span className="font-bold text-black text-lg">{exercise.maxWeight} кг</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} onPointerDown={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} className="flex gap-2 w-full sm:w-auto">
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
