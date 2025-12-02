'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Button from '../../components/ui/Button';


export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Доступ запрещен</h2>
        <p className="mb-4">Вы должны войти в систему, чтобы просматривать эту страницу.</p>
        <Button 
          onClick={() => router.push('/')}
          variant="outline"
          className="text-blue-500 hover:text-blue-700 font-medium"
        >
          Вернуться на главную страницу
        </Button>
      </div>
    );
  }

  const handleGoToProfile = () => {
    router.push('/profile');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        {/* Title removed */}
      </div>

      <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mr-4">
              <span className="text-2xl font-bold text-white">{user.name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">Роль: {user.role === 'athlete' ? 'Атлет' : 'Тренер'}</p>
            </div>
          </div>
          <Button
            onClick={handleGoToProfile}
            variant="outline"
          >
            Редактировать профиль
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Статистика</h3>
          <p className="text-gray-600">Здесь будет отображаться ваша статистика тренировок.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Последние активности</h3>
          <p className="text-gray-600">Здесь будут отображаться ваши последние активности.</p>
        </div>
      </div>
    </div>
  );
}