'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  lastName?: string;
}

interface TeamMember {
  id: string;
  userId: string;
  role: string;
  user: User;
}

interface Team {
  id: string;
  name: string;
  description?: string;
}

export default function EditTeamPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [athletes, setAthletes] = useState<User[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (teamId) {
      fetchTeamDetails();
      fetchTeamMembers();
      fetchAvailableAthletes();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  const fetchTeamDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/teams/${teamId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTeam(data);
      } else {
        console.error('Failed to fetch team details');
        setError('Не удалось загрузить информацию о команде');
      }
    } catch (err) {
      console.error('Error fetching team details:', err);
      setError('Ошибка при загрузке информации о команде');
    }
  };

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/teams/${teamId}/members`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setTeamMembers(data);
        } else {
          setTeamMembers([]);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Не удалось загрузить участников команды');
      }
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError('Ошибка при загрузке участников команды');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableAthletes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/athletes', {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setAthletes(data);
        } else {
          setAthletes([]);
        }
      } else {
        console.error('Failed to fetch athletes');
      }
    } catch (err) {
      console.error('Error fetching athletes:', err);
    }
  };

  const addTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAthlete || !user) return;

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          userId: selectedAthlete,
          role: 'athlete',
        }),
      });
      
      if (response.ok) {
        fetchTeamMembers();
        setSelectedAthlete('');
        setSuccess('Спортсмен успешно добавлен');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Не удалось добавить спортсмена');
      }
    } catch (err) {
      setError('Ошибка при добавлении спортсмена');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeTeamMember = async (userId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого участника?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          userId: userId,
        }),
      });
      
      if (response.ok) {
        fetchTeamMembers();
        setSuccess('Участник успешно удален');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Не удалось удалить участника');
      }
    } catch (err) {
      setError('Ошибка при удалении участника');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="p-8 text-center">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="mr-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            {team ? `Редактирование команды: ${team.name}` : 'Загрузка...'}
          </h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Добавить спортсмена</h2>
          <form onSubmit={addTeamMember} className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2">
                <label htmlFor="athleteSelect" className="block text-sm font-medium text-gray-700 mb-1">
                  Выберите спортсмена
                </label>
                <select
                  id="athleteSelect"
                  value={selectedAthlete}
                  onChange={(e) => setSelectedAthlete(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Выберите из списка --</option>
                  {athletes
                    .filter(athlete => !teamMembers.some(member => member.userId === athlete.id))
                    .map((athlete) => (
                    <option key={athlete.id} value={athlete.id}>
                      {athlete.name} {athlete.lastName ? athlete.lastName : ''} ({athlete.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading || !selectedAthlete}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? 'Добавление...' : 'Добавить в команду'}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Состав команды</h2>
          
          {teamMembers.length === 0 ? (
            <p className="text-gray-600 italic">В команде пока нет участников.</p>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Имя
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Роль
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Действия</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {teamMembers.map((member) => (
                    <tr key={member.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {member.user.name} {member.user.lastName}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {member.user.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.user.role === 'trainer' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {member.user.role === 'trainer' ? 'Тренер' : 'Спортсмен'}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => removeTeamMember(member.userId)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 font-medium"
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
