'use client';

import React, { useState, useEffect } from 'react';
import { Exercise, EventResult, EventModalProps } from '../types';

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, date, eventData }) => {
  const [eventTitle, setEventTitle] = useState(eventData?.title || '');
  const [exerciseType, setExerciseType] = useState(eventData?.exerciseType || '');
  const [rounds, setRounds] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>(eventData?.exercises || []);
  const [exerciseInput, setExerciseInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [repetitionsInput, setRepetitionsInput] = useState('');
  const [sortedResults, setSortedResults] = useState<EventResult[]>(eventData?.results || []);
  const [isSorted, setIsSorted] = useState(false);

  // Handle form initialization and updates without directly calling setState in effects
  useEffect(() => {
    let isMounted = true;
    
    // Use requestAnimationFrame to defer state updates
    const updateState = () => {
      if (!isMounted) return;
      
      if (isOpen && eventData) {
        setEventTitle(eventData.title || '');
        setExerciseType(eventData.exerciseType || '');
        setExercises(eventData.exercises || []);
        setSortedResults(eventData.results || []);
      } else if (isOpen) {
        // Reset form when opening without eventData
        setEventTitle('');
        setExerciseType('');
        setExercises([]);
        setRounds('');
        setExerciseInput('');
        setWeightInput('');
        setRepetitionsInput('');
        setSortedResults([]);
        setIsSorted(false);
      }
    };
    
    const rafId = requestAnimationFrame(updateState);
    
    return () => {
      isMounted = false;
      cancelAnimationFrame(rafId);
    };
  }, [isOpen, eventData]);

  const resetForm = () => {
    setEventTitle(eventData?.title || '');
    setExerciseType(eventData?.exerciseType || '');
    setExercises(eventData?.exercises || []);
    setRounds('');
    setExerciseInput('');
    setWeightInput('');
    setRepetitionsInput('');
    setSortedResults(eventData?.results || []);
    setIsSorted(false);
  };

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
    <div 
      className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 event-modal"
      onClick={(e) => e.stopPropagation()}
      data-event-modal="true"
    >
      <div 
        className="bg-white p-4 sm:p-6 rounded-lg shadow-lg min-w-[300px] max-w-2xl w-auto max-h-[90vh] overflow-y-auto sm:m-4"
        onClick={(e) => e.stopPropagation()}
        data-event-modal-content="true"
      >
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={exerciseInput}
                  onChange={(e) => setExerciseInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите упражнение"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    className="w-16 sm:w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Вес"
                    maxLength={3}
                  />
                  <input
                    type="text"
                    value={repetitionsInput}
                    onChange={(e) => setRepetitionsInput(e.target.value)}
                    className="w-16 sm:w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Повт."
                    maxLength={3}
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    // Prevent the event from bubbling up to the global click handler
                    e.stopPropagation();
                    e.preventDefault();
                    
                    // Also stop immediate propagation to ensure no other handlers are called
                    if (e.nativeEvent) {
                      e.nativeEvent.stopImmediatePropagation();
                    }
                    
                    handleAddExercise();
                  }}
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
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-3 py-2 border-b border-gray-100 last:border-b-0 gap-2"
                  >
                    <div className="flex-1">
                      <span className="font-medium">{exercise.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {exercise.weight || '0'} kg × {exercise.repetitions || '0'}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        // Prevent the event from bubbling up to the global click handler
                        e.stopPropagation();
                        e.preventDefault();
                        
                        // Also stop immediate propagation to ensure no other handlers are called
                        if (e.nativeEvent) {
                          e.nativeEvent.stopImmediatePropagation();
                        }
                        
                        handleRemoveExercise(exercise.id);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Удалить
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Results section */}
          {eventData?.results && eventData.results.length > 0 && (
            <div className="mb-4 pt-4 border-t border-dotted border-gray-300">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Результаты
                </label>
                <button 
                  onClick={(e) => {
                    // Prevent the event from bubbling up to the global click handler
                    e.stopPropagation();
                    e.preventDefault();
                    
                    // Also stop immediate propagation to ensure no other handlers are called
                    if (e.nativeEvent) {
                      e.nativeEvent.stopImmediatePropagation();
                    }
                    
                    // Sort results by time
                    const sorted = [...(isSorted ? eventData.results! : sortedResults)].sort((a, b) => {
                      // Convert time strings to numbers for comparison (assuming format like "10:30")
                      const [aMinutes, aSeconds] = a.time.split(':').map(Number);
                      const [bMinutes, bSeconds] = b.time.split(':').map(Number);
                      const aTotalSeconds = aMinutes * 60 + (aSeconds || 0);
                      const bTotalSeconds = bMinutes * 60 + (bSeconds || 0);
                      return aTotalSeconds - bTotalSeconds;
                    });
                    setSortedResults(sorted);
                    setIsSorted(!isSorted);
                  }}
                  className="text-xs text-blue-500 hover:text-blue-700"
                >
                  {isSorted ? 'Отменить сортировку' : 'Сортировать по времени'}
                </button>
              </div>
              <ul className="border border-gray-200 rounded-md max-h-32 overflow-y-auto bg-gray-50">
                {(isSorted ? sortedResults : eventData.results).map((result) => (
                  <li 
                    key={result.id} 
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-3 py-2 border-b border-gray-100 last:border-b-0 text-sm gap-1"
                  >
                    <span className="font-medium">{result.time}</span>
                    <div className="text-gray-500 text-xs">
                      <div>{result.dateAdded}</div>
                      <div>{result.username}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={(e) => {
                // Prevent the event from bubbling up to the global click handler
                e.stopPropagation();
                e.preventDefault();
                
                // Also stop immediate propagation to ensure no other handlers are called
                if (e.nativeEvent) {
                  e.nativeEvent.stopImmediatePropagation();
                }
                
                resetForm();
                onClose();
              }}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none w-full sm:w-auto"
            >
              Отмена
            </button>
            <button
              type="submit"
              onClick={(e) => {
                // Prevent the event from bubbling up to the global click handler
                e.stopPropagation();
                e.preventDefault();
                
                // Also stop immediate propagation to ensure no other handlers are called
                if (e.nativeEvent) {
                  e.nativeEvent.stopImmediatePropagation();
                }
                
                // Call the handleSubmit function to save the event
                handleSubmit(e as React.FormEvent);
              }}
              className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none w-full sm:w-auto"
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