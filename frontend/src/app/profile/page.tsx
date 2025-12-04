'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { useFeatureFlagStore } from '../../lib/store/useFeatureFlagStore';
import Button from '../../components/ui/Button';
import { Switch } from '../../components/ui/Switch';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { flags, toggleFlag } = useFeatureFlagStore();
  
  // Email state
  const [email, setEmail] = useState(user?.email || '');
  const [isEmailEditing, setIsEmailEditing] = useState(false);
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        updateUser(data.user);
        setIsEmailEditing(false);
        alert('Email успешно обновлен');
      } else {
        alert(`Не удалось обновить email: ${data.message || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Error updating email:', error);
      alert('Ошибка при обновлении email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword !== confirmPassword) {
      alert('Новые пароли не совпадают');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          password: newPassword,
          currentPassword: currentPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsPasswordEditing(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        alert('Пароль успешно обновлен');
      } else {
        alert(`Не удалось обновить пароль: ${data.message || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Ошибка при обновлении пароля');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Доступ запрещен</h2>
        <p className="mb-4">Вы должны войти в систему, чтобы просматривать эту страницу.</p>
        <Link href="/" className="text-blue-500 hover:text-blue-700 font-medium">
          Вернуться на главную
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Настройки профиля</h1>
        <Link href="/dashboard">
          <Button variant="outline">Назад в панель управления</Button>
        </Link>
      </div>

      {/* Email Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Email</h3>
          {!isEmailEditing && (
            <Button 
              variant="ghost" 
              onClick={() => setIsEmailEditing(true)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              Изменить
            </Button>
          )}
        </div>

        {isEmailEditing ? (
          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Новый Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                required
              />
            </div>
            <div className="flex space-x-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => {
                  setIsEmailEditing(false);
                  setEmail(user.email);
                }}
              >
                Отмена
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-gray-600">{user.email}</p>
        )}
      </div>

      {/* Password Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Пароль</h3>
          {!isPasswordEditing && (
            <Button 
              variant="ghost" 
              onClick={() => setIsPasswordEditing(true)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              Изменить
            </Button>
          )}
        </div>

        {isPasswordEditing ? (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Текущий пароль</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Новый пароль</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Подтвердите новый пароль</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                required
                minLength={6}
              />
            </div>
            <div className="flex space-x-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Обновление...' : 'Обновить пароль'}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => {
                  setIsPasswordEditing(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                Отмена
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-gray-600">••••••••••••</p>
        )}
      </div>

      {/* Feature Flags */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Настройки интерфейса</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Прогресс упражнений</h4>
              <p className="text-sm text-gray-500">Показывать блок с максимальными весами в упражнениях</p>
            </div>
            <Switch
              checked={flags.showExerciseTracker}
              onChange={() => toggleFlag('showExerciseTracker')}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Трекер веса</h4>
              <p className="text-sm text-gray-500">Показывать график изменения веса тела</p>
            </div>
            <Switch
              checked={flags.showWeightTracker}
              onChange={() => toggleFlag('showWeightTracker')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}