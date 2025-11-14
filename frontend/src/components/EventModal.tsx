'use client';

import React, { useState, useEffect } from 'react';

interface Exercise {
  id: number;
  name: string;
  weight: string;
  repetitions: string;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, exerciseType: string, exercises: Exercise[]) => void;
  date: string;
  eventData?: {
    title: string;
    exerciseType: string;
    exercises: Exercise[];
  };
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, date, eventData }) => {
  const [eventTitle, setEventTitle] = useState('');
  const [exerciseType, setExerciseType] = useState('');
  const [rounds, setRounds] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseInput, setExerciseInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [repetitionsInput, setRepetitionsInput] = useState('');

  const resetForm = () => {
    setEventTitle('');
    setExerciseType('');
    setExercises([]);
    setRounds('');
    setExerciseInput('');
    setWeightInput('');
    setRepetitionsInput('');
  };

  // Handle form initialization and reset
  useEffect(() => {
    if (isOpen) {
      // Initialize form when modal opens or eventData changes
      setEventTitle(eventData?.title || '');
      setExerciseType(eventData?.exerciseType || '');
      setExercises(eventData?.exercises || []);
      setRounds('');
      setExerciseInput('');
      setWeightInput('');
      setRepetitionsInput('');
    }
    
    // Cleanup function to reset form when modal closes
    return () => {
      if (!isOpen) {
        resetForm();
      }
    };
  }, [isOpen, eventData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (eventTitle.trim()) {
      onSave(eventTitle, exerciseType, exercises);
      resetForm();
    }
  };

  const handleAddExercise = () => {
    if (exerciseInput.trim()) {
      const newExercise: Exercise = {
        id: Date.now(),
        name: exerciseInput.trim(),
        weight: weightInput.trim(),
        repetitions: repetitionsInput.trim()
      };
      setExercises([...exercises, newExercise]);
      setExerciseInput('');
      setWeightInput('');
      setRepetitionsInput('');
    }
  };

  const handleRemoveExercise = (id: number) => {
    setExercises(exercises.filter(exercise => exercise.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg min-w-[300px] max-w-2xl w-auto max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {eventData ? 'Редактировать событие для' : 'Добавить событие для'} {date}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="eventTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Название события
            </label>
            <input
              type="text"
              id="eventTitle"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите название события"
              autoFocus
            />
          </div>
          
          <div className="border-t border-dotted border-gray-300 pt-4 mb-4"></div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="exerciseType" className="block text-sm font-medium text-gray-700 mb-1">
                Тип упражнения
              </label>
              <input
                type="text"
                id="exerciseType"
                value={exerciseType}
                onChange={(e) => setExerciseType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите тип упражнения"
              />
            </div>
            <div>
              <label htmlFor="rounds" className="block text-sm font-medium text-gray-700 mb-1">
                Количество раундов
              </label>
              <input
                type="number"
                id="rounds"
                value={rounds}
                onChange={(e) => setRounds(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите количество раундов"
                min="1"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Упражнения
            </label>
            <div className="space-y-2 mb-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={exerciseInput}
                  onChange={(e) => setExerciseInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите упражнение"
                />
                <input
                  type="text"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="w-16 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Вес"
                  maxLength={3}
                />
                <input
                  type="text"
                  value={repetitionsInput}
                  onChange={(e) => setRepetitionsInput(e.target.value)}
                  className="w-16 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Повт."
                  maxLength={3}
                />
                <button
                  type="button"
                  onClick={handleAddExercise}
                  className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
                >
                  Добавить
                </button>
              </div>
            </div>
            
            {exercises.length > 0 && (
              <ul className="border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                {exercises.map((exercise) => (
                  <li 
                    key={exercise.id} 
                    className="flex justify-between items-center px-3 py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex-1">
                      <span className="font-medium">{exercise.name}</span>
                    </div>
                    <div className="text-sm text-gray-600 mx-2">
                      {exercise.weight || '0'} kg × {exercise.repetitions || '0'}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(exercise.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Удалить
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none"
            >
              {eventData ? 'Сохранить изменения' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;