'use client';

import React, { useState } from 'react';
import { Event } from '../types';

interface AddEventFormProps {
  userId: string;
  onEventAdded: (event: Event) => void;
}

export default function AddEventForm({ userId, onEventAdded }: AddEventFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [exerciseType, setExerciseType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !eventDate) {
      setError('Пожалуйста, заполните обязательные поля');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          title,
          description,
          eventDate: new Date(eventDate).toISOString(),
          exerciseType,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Reset form
        setTitle('');
        setDescription('');
        setEventDate('');
        setExerciseType('');
        
        // Notify parent component
        onEventAdded(data.event);
      } else {
        setError(data.message || 'Ошибка при создании события');
      }
    } catch (err) {
      setError('Произошла ошибка при создании события');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">Добавить новое событие</h3>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
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
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Описание
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введите описание события"
            rows={3}
          />
        </div>
        
        <div>
          <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">
            Дата события *
          </label>
          <input
            type="date"
            id="eventDate"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 disabled:opacity-50"
          >
            {loading ? 'Создание...' : 'Создать событие'}
          </button>
        </div>
      </form>
    </div>
  );
}