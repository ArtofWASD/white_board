'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [height, setHeight] = useState(user?.height?.toString() || '');
  const [weight, setWeight] = useState(user?.weight?.toString() || '');

  const handleSave = async () => {
    console.log('Handle save function called');
    if (user) {
      try {
        // Log the data being sent
        console.log('Sending profile update for user:', user.id);
        console.log('Height:', height ? Number(height) : undefined);
        console.log('Weight:', weight ? Number(weight) : undefined);
        
        // Prepare the data to send
        const requestData = {
          height: height && height !== '' ? Number(height) : undefined,
          weight: weight && weight !== '' ? Number(weight) : undefined,
        };
        
        // Remove undefined values
        const cleanData = Object.fromEntries(
          Object.entries(requestData).filter(([, v]) => v !== undefined)
        );
        
        console.log('Clean data being sent:', cleanData);
        
        // Check if there's actually data to send
        if (Object.keys(cleanData).length === 0) {
          console.log('No data to send');
          setIsEditing(false);
          return;
        }
        
        // Send data through Next.js API route instead of directly to NestJS backend
        console.log('Making fetch request to:', `/api/auth/profile/${user.id}`);
        const response = await fetch(`/api/auth/profile/${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cleanData),
        });

        console.log('Response received:', response.status, response.statusText);
        const data = await response.json();
        console.log('Profile update response:', data);

        if (response.ok && data.user) {
          // Update localStorage and context with new data
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Update state with new values
          setHeight(data.user.height?.toString() || '');
          setWeight(data.user.weight?.toString() || '');
          
          // Exit edit mode
          setIsEditing(false);
          
          console.log('Profile updated successfully');
        } else {
          console.error('Failed to update profile:', data.message);
          alert(`Failed to update profile: ${data.message || 'Unknown error'}`);
        }
      } catch (error: unknown) {
        console.error('Error updating profile:', error);
        alert(`Error updating profile: ${(error as Error).message || 'Unknown error'}`);
      }
    } else {
      console.log('No user found');
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Доступ запрещен</h2>
        <p className="mb-4">Вы должны войти в систему, чтобы просматривать эту страницу.</p>
        <Link 
          href="/" 
          className="text-blue-500 hover:text-blue-700 font-medium"
        >
          Вернуться на главную страницу
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Профиль пользователя</h1>
        <Link 
          href="/" 
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-300"
        >
          Назад
        </Link>
      </div>
      
      <div className="border rounded-lg p-6 mb-6">
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center mr-6">
            <span className="text-3xl font-bold text-white">{user.name.charAt(0)}{user.lastName ? user.lastName.charAt(0) : ''}</span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{user.name}{user.lastName ? ` ${user.lastName}` : ''}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">Информация об аккаунте</h3>
            <p className="text-gray-700">Роль: {user.role === 'athlete' ? 'Атлет' : 'Тренер'}</p>
            <p className="text-gray-700">Статус: Активный пользователь</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">Физические параметры</h3>
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Рост (см)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="Введите рост"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Вес (кг)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="Введите вес"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Рост:</span> {user.height ? `${user.height} см` : 'Не указан'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Вес:</span> {user.weight ? `${user.weight} кг` : 'Не указан'}
                </p>
              </div>
            )}
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">Статистика</h3>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
        >
          Выйти из аккаунта
        </button>
        
        {isEditing ? (
          <>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
            >
              Сохранить
            </button>
            <button 
              onClick={() => {
                setIsEditing(false);
                setHeight(user.height?.toString() || '');
                setWeight(user.weight?.toString() || '');
              }}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-300"
            >
              Отмена
            </button>
          </>
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
          >
            Редактировать профиль
          </button>
        )}
      </div>
    </div>
  );
}