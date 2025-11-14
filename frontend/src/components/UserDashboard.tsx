'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

interface UserDashboardProps {
  onClose?: () => void;
}

export default function UserDashboard({ onClose }: UserDashboardProps) {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Добро пожаловать, {user.name}!</h2>
        <div className="flex space-x-2">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-300"
            >
              Закрыть и вернуться к календарю
            </button>
          )}
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
          >
            Выйти
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Ваши события</h3>
          <p className="text-gray-700">Управляйте своими событиями и задачами</p>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Календарь</h3>
          <p className="text-gray-700">Просматривайте и планируйте события</p>
        </div>
        
        <Link href="/profile" className="bg-purple-50 p-6 rounded-lg hover:bg-purple-100 transition duration-300">
          <h3 className="text-xl font-semibold mb-2">Профиль</h3>
          <p className="text-gray-700">Настройте ваш профиль и предпочтения</p>
        </Link>
      </div>
      
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Последние действия</h3>
        <ul className="border rounded-lg divide-y">
          <li className="p-4 hover:bg-gray-50">Создано новое событие: &quot;Встреча с командой&quot;</li>
          <li className="p-4 hover:bg-gray-50">Обновлен календарь на эту неделю</li>
          <li className="p-4 hover:bg-gray-50">Добавлены напоминания для важных задач</li>
        </ul>
      </div>
    </div>
  );
}