'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Team } from '../../types';


export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showCreateTeamForm, setShowCreateTeamForm] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  // Fetch user's teams
  useEffect(() => {
    const fetchTeams = async () => {
      if (!user || user.role !== 'trainer') {
        setLoadingTeams(false);
        return;
      }
      
      try {
        setLoadingTeams(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch(`/api/teams?userId=${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched teams:', data);
          setTeams(data);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to fetch teams:', response.status, errorData);
          setError(errorData.message || errorData.error || `Failed to fetch teams (${response.status})`);
        }
      } catch (err) {
        console.error('Error fetching teams:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(`Error fetching teams: ${errorMessage}`);
      } finally {
        setLoadingTeams(false);
      }
    };

    fetchTeams();
  }, [user]);

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

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName.trim() || !user) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          name: teamName,
          description: teamDescription,
        }),
      });

      if (response.ok) {
        // Reset form
        setTeamName('');
        setTeamDescription('');
        setSuccess('Команда успешно создана!');
        
        // Refresh teams list
        const data = await response.json();
        setTeams(prev => [...prev, data]);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || errorData.error || 'Не удалось создать команду');
      }
    } catch (err) {
      console.error('Error creating team:', err);
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Сервис недоступен. Пожалуйста, убедитесь, что сервер запущен.');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
        setError('Не удалось создать команду: ' + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту команду?')) return;
    
    try {
      // For now, we'll implement a basic delete by calling a non-existent endpoint
      // In a real implementation, you would need to add DELETE endpoint to the backend
      alert('Функция удаления еще не реализована на бэкенде');
    } catch (err) {
      console.error('Error deleting team:', err);
      alert('Ошибка при удалении команды');
    }
  };

  const handleEditTeam = (teamId: string) => {
    router.push(`/dashboard/teams/${teamId}`);
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
            <button
              onClick={handleGoToProfile}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition duration-300"
            >
              Редактировать профиль
            </button>
          </div>
        </div>
        
        {/* Create Team Section for Trainers */}
        {user.role === 'trainer' && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold mb-2 text-indigo-600">Создать команду</h3>
            <p className="text-gray-700 mb-4">Создайте новую команду для управления спортсменами</p>
            {!showCreateTeamForm ? (
              <button 
                onClick={() => setShowCreateTeamForm(true)}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition duration-300"
              >
                Создать команду
              </button>
            ) : (
              <div className="mt-4">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {success}
                  </div>
                )}
                <form onSubmit={handleCreateTeam} className="space-y-4">
                  <div>
                    <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
                      Название команды *
                    </label>
                    <input
                      type="text"
                      id="teamName"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="teamDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Описание
                    </label>
                    <textarea
                      id="teamDescription"
                      value={teamDescription}
                      onChange={(e) => setTeamDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {loading ? 'Создание...' : 'Создать команду'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateTeamForm(false);
                        // Reset form when closing
                        setTeamName('');
                        setTeamDescription('');
                        setError(null);
                        setSuccess(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Display Teams */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Ваши команды</h4>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              {loadingTeams ? (
                <p className="text-gray-600">Загрузка команд...</p>
              ) : teams.length === 0 ? (
                <p className="text-gray-600">У вас пока нет команд</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teams.map((team) => (
                    <div key={team.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h5 className="font-medium text-gray-900">{team.name}</h5>
                        {team.description && (
                          <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditTeam(team.id)}
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 text-sm"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleDeleteTeam(team.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}