'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { Team, EventResult } from '../../types';

interface Exercise {
  id: number;
  name: string;
  weight?: string;
  repetitions?: string;
  rxWeight?: string;
  rxReps?: string;
  scWeight?: string;
  scReps?: string;
}

interface EventData {
  title?: string;
  exerciseType?: string;
  exercises?: Exercise[];
  results?: EventResult[];
  teamId?: string;
  timeCap?: string;
  rounds?: string;
}


interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  date: string;
  eventData?: EventData;
  initialTeamId?: string;
}

const EventModal: React.FC<EventModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  date, 
  eventData,
  initialTeamId 
}) => {
  const { user } = useAuthStore();
  
  // Form state
  const [eventTitle, setEventTitle] = useState(eventData?.title || '');
  const [exerciseType, setExerciseType] = useState(eventData?.exerciseType || '');
  const [exercises, setExercises] = useState<Exercise[]>(eventData?.exercises || []);
  const [timeCap, setTimeCap] = useState(eventData?.timeCap || '');
  const [rounds, setRounds] = useState(eventData?.rounds || '');
  
  // Exercise input state
  const [exerciseName, setExerciseName] = useState('');
  const [rxWeight, setRxWeight] = useState('');
  const [rxReps, setRxReps] = useState('');
  const [scWeight, setScWeight] = useState('');
  const [scReps, setScReps] = useState('');
  
  const [sortedResults, setSortedResults] = useState<EventResult[]>(eventData?.results || []);
  const [isSorted, setIsSorted] = useState(false);
  
  // Team state
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(eventData?.teamId || initialTeamId || '');

  // Fetch teams
  useEffect(() => {
    const fetchTeams = async () => {
      if (user) {
        try {
          const response = await fetch(`/api/teams?userId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setTeams(data);
          }
        } catch (error) {

        }
      }
    };
    fetchTeams();
  }, [user]);

  // Handle form initialization and updates
  useEffect(() => {
    if (isOpen && eventData) {
      setEventTitle(eventData.title || '');
      setExerciseType(eventData.exerciseType || '');
      setExercises(eventData.exercises || []);
      setSortedResults(eventData.results || []);
      setSelectedTeamId(eventData.teamId || '');
      setTimeCap(eventData.timeCap || '');
      setRounds(eventData.rounds || '');
    } else if (isOpen) {
      // Reset form when opening without eventData
      setEventTitle('');
      setExerciseType('');
      setExercises([]);
      setExerciseName('');
      setRxWeight('');
      setRxReps('');
      setScWeight('');
      setScReps('');
      setSortedResults([]);
      setIsSorted(false);
      setSelectedTeamId(initialTeamId || '');
      setTimeCap('');
      setRounds('');
    }
  }, [isOpen, eventData, initialTeamId]);

  const resetForm = () => {
    setEventTitle(eventData?.title || '');
    setExerciseType(eventData?.exerciseType || '');
    setExercises(eventData?.exercises || []);
    setExerciseName('');
    setRxWeight('');
    setRxReps('');
    setScWeight('');
    setScReps('');
    setSortedResults(eventData?.results || []);
    setIsSorted(false);
    setSelectedTeamId(eventData?.teamId || initialTeamId || '');
    setTimeCap(eventData?.timeCap || '');
    setRounds(eventData?.rounds || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (eventTitle.trim()) {
      onSave({
        title: eventTitle,
        exerciseType,
        exercises,
        teamId: selectedTeamId || undefined,
        timeCap,
        rounds
      });
    }
  };

  const handleAddExercise = () => {
    if (exerciseName.trim()) {
      const newExercise: Exercise = {
        id: Date.now(),
        name: exerciseName.trim(),
        weight: rxWeight, // Default to Rx values
        repetitions: rxReps,
        rxWeight,
        rxReps,
        scWeight,
        scReps
      };
      setExercises([...exercises, newExercise]);
      setExerciseName('');
      setRxWeight('');
      setRxReps('');
      setScWeight('');
      setScReps('');
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
          
          <div className="mb-4">
            <label htmlFor="team" className="block text-sm font-medium text-gray-700 mb-1">
              Команда (необязательно)
            </label>
            <select
              id="team"
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Личное событие</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="exerciseType" className="block text-sm font-medium text-gray-700 mb-1">
              Тип задания
            </label>
            <select
              id="exerciseType"
              value={exerciseType}
              onChange={(e) => setExerciseType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Выберите тип</option>
              <option value="For Time">For Time (На время)</option>
              <option value="AMRAP">AMRAP (Макс. раундов)</option>
              <option value="EMOM">EMOM (Каждую минуту)</option>
              <option value="Not for Time">Не на время</option>
            </select>
          </div>

          {(exerciseType === 'For Time' || exerciseType === 'AMRAP' || exerciseType === 'EMOM') && (
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="timeCap" className="block text-sm font-medium text-gray-700 mb-1">
                  Time Cap (Лимит времени)
                </label>
                <input
                  type="text"
                  id="timeCap"
                  value={timeCap}
                  onChange={(e) => setTimeCap(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Например: 15:00"
                />
              </div>
              {exerciseType === 'EMOM' && (
                <div>
                  <label htmlFor="rounds" className="block text-sm font-medium text-gray-700 mb-1">
                    Количество раундов
                  </label>
                  <input
                    type="text"
                    id="rounds"
                    value={rounds}
                    onChange={(e) => setRounds(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Например: 10"
                  />
                </div>
              )}
            </div>
          )}

          <div className="mb-4 border p-4 rounded-md bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Упражнения
            </label>
            
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Название</label>
                <input
                  type="text"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Например: Трастеры"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-center font-semibold text-blue-800 mb-2 text-sm">Rx</div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={rxWeight}
                      onChange={(e) => setRxWeight(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Вес (кг)"
                    />
                    <input
                      type="text"
                      value={rxReps}
                      onChange={(e) => setRxReps(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Повторы"
                    />
                  </div>
                </div>
                
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-center font-semibold text-green-800 mb-2 text-sm">Sc</div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={scWeight}
                      onChange={(e) => setScWeight(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Вес (кг)"
                    />
                    <input
                      type="text"
                      value={scReps}
                      onChange={(e) => setScReps(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Повторы"
                    />
                  </div>
                </div>
              </div>
              
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleAddExercise();
                }}
                className="w-full py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition text-sm"
              >
                Добавить упражнение
              </button>
            </div>
            
            {exercises.length > 0 && (
              <ul className="border border-gray-200 rounded-md max-h-40 overflow-y-auto bg-white">
                {exercises.map((exercise) => (
                  <li 
                    key={exercise.id} 
                    className="flex justify-between items-center px-3 py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div>
                      <div className="font-medium text-sm">{exercise.name}</div>
                      <div className="text-xs text-gray-500">
                        Rx: {exercise.rxWeight || '-'} / {exercise.rxReps || '-'} | 
                        Sc: {exercise.scWeight || '-'} / {exercise.scReps || '-'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleRemoveExercise(exercise.id);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm px-2"
                    >
                      ✕
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
                    e.stopPropagation();
                    e.preventDefault();
                    
                    const sorted = [...(isSorted ? eventData.results! : sortedResults)].sort((a, b) => {
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
                e.stopPropagation();
                e.preventDefault();
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
                e.stopPropagation();
                e.preventDefault();
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