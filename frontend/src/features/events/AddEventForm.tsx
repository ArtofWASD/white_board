'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '../../lib/context/ToastContext';
import { AddEventFormProps } from '../../types/AddEventForm.types';
import { Exercise, Team } from '../../types';
import ErrorDisplay from '../../components/ui/ErrorDisplay';

export default function AddEventForm({ user, onSubmit, onClose }: AddEventFormProps) {
  const { success } = useToast();
  const [title, setTitle] = useState('');
  const [exerciseType, setExerciseType] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Exercise input state
  const [exerciseName, setExerciseName] = useState('');
  const [rxWeight, setRxWeight] = useState('');
  const [rxReps, setRxReps] = useState('');
  const [scWeight, setScWeight] = useState('');
  const [scReps, setScReps] = useState('');

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

  const handleAddExercise = () => {
    if (!exerciseName) return;
    
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: exerciseName,
      weight: rxWeight, // Default to Rx values for backward compatibility
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
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError(null);

    if (!user?.id) {
      setError('Ошибка: Пользователь не идентифицирован');
      return;
    }

    try {
      const payload = {
        userId: user.id,
        teamId: selectedTeamId || undefined,
        title,
        description: '',
        eventDate: selectedDate,
        exerciseType,
        exercises: exercises.length > 0 ? exercises : undefined,
      };

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();

      if (response.ok) {
        if (onSubmit) {
          onSubmit(title, exerciseType, exercises);
        }
        setTitle('');
        setExerciseType('');
        setExercises([]);
        setSelectedTeamId('');
        setExerciseName('');
        setRxWeight('');
        setRxReps('');
        setScWeight('');
        setScReps('');
        if (onClose) onClose();
        success('Событие успешно создано');
      } else {
        setError(data.message || 'Ошибка при создании события');
      }
    } catch (error) {
      setError('Произошла ошибка при создании события');
    }
  };

  return (
    <div className="border rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">Добавить новое событие</h3>
      <ErrorDisplay error={error} onClose={() => setError(null)} className="mb-4" />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Название события *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введите название события"
          />
        </div>
        
        <div>
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
        <div>
          <label htmlFor="exerciseType" className="block text-sm font-medium text-gray-700 mb-1">
            Тип упражнения
          </label>
          <select
            id="exerciseType"
            value={exerciseType}
            onChange={(e) => setExerciseType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Выберите тип упражнения</option>
            <option value="running">Бег</option>
            <option value="swimming">Плавание</option>
            <option value="cycling">Велоспорт</option>
            <option value="strength">Силовые тренировки</option>
            <option value="yoga">Йога</option>
            <option value="other">Другое</option>
          </select>
        </div>

        <div className="border p-4 rounded-md bg-gray-50">
          <h4 className="font-medium mb-3">Упражнения</h4>
          
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Название упражнения</label>
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
                <div className="text-center font-semibold text-blue-800 mb-2">Rx</div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={rxWeight}
                    onChange={(e) => setRxWeight(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    placeholder="Вес (кг)"
                  />
                  <input
                    type="text"
                    value={rxReps}
                    onChange={(e) => setRxReps(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    placeholder="Повторы"
                  />
                </div>
              </div>
              
              <div className="bg-green-50 p-3 rounded">
                <div className="text-center font-semibold text-green-800 mb-2">Sc</div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={scWeight}
                    onChange={(e) => setScWeight(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    placeholder="Вес (кг)"
                  />
                  <input
                    type="text"
                    value={scReps}
                    onChange={(e) => setScReps(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    placeholder="Повторы"
                  />
                </div>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleAddExercise}
              className="w-full py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
            >
              Добавить упражнение
            </button>
          </div>

          {exercises.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-700">Список упражнений:</h5>
              {exercises.map((ex) => (
                <div key={ex.id} className="flex justify-between items-center bg-white p-2 rounded border">
                  <div>
                    <span className="font-medium">{ex.name}</span>
                    <div className="text-xs text-gray-500">
                      Rx: {ex.rxWeight || '-'}кг / {ex.rxReps || '-'} повт. | 
                      Sc: {ex.scWeight || '-'}кг / {ex.scReps || '-'} повт.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExercise(ex.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">
            Дата события *
          </label>
          <input
            type="date"
            id="eventDate"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
          >
            Создать событие
          </button>
        </div>
      </form>
    </div>
  );
}