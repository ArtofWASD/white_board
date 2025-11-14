'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();

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
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
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
            <span className="text-3xl font-bold text-white">{user.name.charAt(0)}</span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">Информация об аккаунте</h3>
            <p className="text-gray-700">ID: {user.id}</p>
            <p className="text-gray-700">Статус: Активный пользователь</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">Статистика</h3>
            <p className="text-gray-700">Событий создано: 12</p>
            <p className="text-gray-700">Активных задач: 5</p>
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
        
        <button className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-300">
          Редактировать профиль
        </button>
      </div>
    </div>
  );
}