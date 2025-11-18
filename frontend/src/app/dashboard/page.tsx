'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Доступ запрещен</h2>
        <p className="mb-4">Вы должны войти в систему, чтобы просматривать эту страницу.</p>
        <button 
          onClick={() => router.push('/')}
          className="text-blue-500 hover:text-blue-700 font-medium"
        >
          Вернуться на главную страницу
        </button>
      </div>
    );
  }

  const handleReturnToCalendar = () => {
    router.push('/');
  };

  const handleGoToProfile = () => {
    router.push('/profile');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Панель управления</h1>
          <div className="flex space-x-3">
            <button
              onClick={handleReturnToCalendar}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
            >
              Вернуться к календарю
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
            >
              Выйти
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mr-4">
              <span className="text-2xl font-bold text-white">{user.name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">ID: {user.id}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-blue-600">Ваши события</h3>
            <p className="text-gray-700 mb-4">Управляйте своими событиями и задачами</p>
            <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition duration-300">
              Перейти к событиям
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-green-600">Календарь</h3>
            <p className="text-gray-700 mb-4">Просматривайте и планируйте события</p>
            <button 
              onClick={handleReturnToCalendar}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition duration-300"
            >
              Открыть календарь
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md hover:bg-gray-50 transition duration-300 cursor-pointer" onClick={handleGoToProfile}>
            <h3 className="text-xl font-semibold mb-2 text-purple-600">Профиль</h3>
            <p className="text-gray-700 mb-4">Настройте ваш профиль и предпочтения</p>
            <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition duration-300">
              Редактировать профиль
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h3 className="text-xl font-semibold mb-4">Последние действия</h3>
          <ul className="border rounded-lg divide-y">
            <li className="p-4 hover:bg-gray-50">Создано новое событие: &quot;Встреча с командой&quot;</li>
            <li className="p-4 hover:bg-gray-50">Обновлен календарь на эту неделю</li>
            <li className="p-4 hover:bg-gray-50">Добавлены напоминания для важных задач</li>
          </ul>
        </div>
      </div>
    </div>
  );
}