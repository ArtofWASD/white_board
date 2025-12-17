'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../lib/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../lib/context/ToastContext';
import { Team } from '../../../types';
import Button from '../../../components/ui/Button';
import { Loader } from '../../../components/ui/Loader';

export default function TeamsPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const { error: toastError, info } = useToast();
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
      if (!user || (user.role !== 'TRAINER' && user.role !== 'ORGANIZATION_ADMIN')) {
        setLoadingTeams(false);
        return;
      }
      
      try {
        setLoadingTeams(true);
        // const token = localStorage.getItem('token'); // Removed direct access
        
        const response = await fetch(`/api/teams?userId=${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        });
        
        if (response.ok) {
          const data = await response.json();
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

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName.trim() || !user) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Get token from localStorage
      // const token = localStorage.getItem('token'); // Removed direct access
      
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
      setLoading(true);
      // const token = localStorage.getItem('token'); // Removed direct access
      
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        setTeams(prev => prev.filter(t => t.id !== teamId));
        info('Команда успешно удалена');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Не удалось удалить команду');
      }
    } catch (err) {
      console.error('Error deleting team:', err);
      setError('Ошибка при удалении команды');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTeam = (teamId: string) => {
    router.push(`/dashboard/teams/${teamId}`);
  };

  if (!user || (user.role !== 'TRAINER' && user.role !== 'ORGANIZATION_ADMIN')) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2 text-red-600">Доступ запрещен</h2>
        <p className="text-gray-700">Только тренеры и администраторы организаций могут управлять командами.</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Управление командами</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-2 text-indigo-600">Создать команду</h3>
        <p className="text-gray-700 mb-4">Создайте новую команду для управления спортсменами</p>
        {!showCreateTeamForm ? (
          <Button 
            onClick={() => setShowCreateTeamForm(true)}
            variant="outline"
          >
            Создать команду
          </Button>
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
                <Button
                  type="submit"
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? 'Создание...' : 'Создать команду'}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowCreateTeamForm(false);
                    // Reset form when closing
                    setTeamName('');
                    setTeamDescription('');
                    setError(null);
                    setSuccess(null);
                  }}
                  variant="outline"
                >
                  Отмена
                </Button>
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
            <Loader />
          ) : teams.length === 0 ? (
            <p className="text-gray-600">У вас пока нет команд</p>
          ) : (
            <div className="flex flex-col gap-4">
              {teams.map((team) => (
                <div key={team.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h5 className="font-medium text-gray-900">{team.name}</h5>
                    {team.description && (
                      <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleEditTeam(team.id)}
                      size="sm"
                      variant="outline"
                    >
                      Редактировать
                    </Button>
                    <Button
                      onClick={() => handleDeleteTeam(team.id)}
                      size="sm"
                      variant="outline"
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
