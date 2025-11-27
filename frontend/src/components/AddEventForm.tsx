
'use client';

import React, { useState } from 'react';
import { Event, Exercise } from '../types';
import { AddEventFormProps } from '../types/AddEventForm.types';

export default function AddEventForm({ user, onSubmit, onClose }: AddEventFormProps) {
  const [title, setTitle] = useState('');
  const [exerciseType, setExerciseType] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      try {
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user?.id,
            title,
            description: '',
            eventDate: selectedDate,
            exerciseType,
            exercises: exercises.length > 0 ? exercises : undefined,
          }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          onSubmit(title, exerciseType, exercises);
          setTitle('');
          setExerciseType('');
          setExercises([]);
          if (onClose) onClose();
        } else {
          alert(data.message || 'Ошибка при создании события');
        }
      } catch (error) {
        console.error('Error creating event:', error);
        alert('Произошла ошибка при создании события');
      }
    }
  };

  return (
    <div className="border rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">Добавить новое событие</h3>
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