'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../lib/store/useAuthStore';

import { QRCodeCanvas } from 'qrcode.react';
import { EditTeamModalProps, TeamMember, EditTeamModalUser as User } from '../../types/EditTeamModal.types';
import ErrorDisplay from '../../components/ui/ErrorDisplay';

export default function EditTeamModal({ 
  teamId, 
  teamName, 
  isOpen, 
  onClose, 
  onTeamUpdated 
}: EditTeamModalProps) {

  
  const { user, token } = useAuthStore();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [athletes, setAthletes] = useState<User[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const fetchTeamMembers = useCallback(async () => {
    try {
      // Validate teamId format
      if (!teamId || typeof teamId !== 'string' || teamId === 'undefined') {

        setTeamMembers([]);
        return;
      }

      setLoading(true);
      
      // Log the URL being constructed
      const url = `/api/teams/${teamId}/members`;

      
      // const token = localStorage.getItem('token'); // Removed direct access
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      

      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          // Ensure data is an array
          if (Array.isArray(data)) {
            setTeamMembers(data);
          } else {

            setTeamMembers([]);
          }
        } else {
          const text = await response.text();

          setError('Received unexpected response format from server');
          setTeamMembers([]);
        }
      } else {
        // Handle error responses
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();

            // Show the specific error message from the backend
            const errorMessage = errorData.message || errorData.error || `Server error: ${response.status} ${response.statusText}`;
            setError(errorMessage);
          } catch (parseError) {

            setError(`Server error: ${response.status} ${response.statusText}`);
          }
        } else {
          try {
            const errorText = await response.text();

            setError(errorText || `Server error: ${response.status} ${response.statusText}`);
          } catch (textError) {

            setError(`Server error: ${response.status} ${response.statusText}`);
          }
        }
        setTeamMembers([]);
      }
    } catch (err) {

      setError('Failed to fetch team members: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  const fetchAvailableAthletes = useCallback(async () => {
    try {
      // const token = localStorage.getItem('token'); // Removed direct access
      
      // Fetch athletes from the API
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

        try {
          const errorData = await response.json();

        } catch (e) {

        }
        setAthletes([]);
      }
    } catch (err) {

      setAthletes([]);
    }
  }, []);

  const fetchInviteCode = useCallback(async () => {
      try {
        const response = await fetch(`/api/teams/${teamId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.inviteCode) {
            setInviteCode(data.inviteCode);
            setInviteLink(`${window.location.origin}/invite/${data.inviteCode}`);
          }
        }
      } catch (err) {
        console.error('Failed to fetch invite code', err);
      }
  }, [teamId, token]);

  const generateInviteCode = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teams/${teamId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInviteCode(data.inviteCode);
        setInviteLink(`${window.location.origin}/invite/${data.inviteCode}`);
      } else {
        setError('Failed to generate invite code');
      }
    } catch (err) {
      setError('Failed to generate invite code');
    } finally {
      setLoading(false);
    }
  };

  // Fetch team members and available athletes when modal opens
  useEffect(() => {
    if (isOpen && teamId && typeof teamId === 'string' && teamId !== 'undefined') {
      fetchTeamMembers();
      fetchAvailableAthletes();
      fetchInviteCode();
    } else if (isOpen) {

    }
  }, [isOpen, teamId, fetchTeamMembers, fetchAvailableAthletes, fetchInviteCode]);

  const addTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAthlete || !user) return;

    try {
      setLoading(true);
      // const token = localStorage.getItem('token'); // Removed direct access
      
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          userId: selectedAthlete,
          role: 'ATHLETE',
        }),
      });
      
      if (response.ok) {
        // Refresh team members
        fetchTeamMembers();
        setSelectedAthlete('');
        onTeamUpdated();
      } else {
        // Try to parse error response as JSON, but handle case where it's not JSON
        let errorMessage = 'Failed to add member';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = response.statusText || 'Failed to add member';
        }
        setError(errorMessage);
      }
    } catch (err) {
      setError('Failed to add member');

    } finally {
      setLoading(false);
    }
  };

  const removeTeamMember = async (userId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      // const token = localStorage.getItem('token'); // Removed direct access
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
        // Refresh team members
        fetchTeamMembers();
        onTeamUpdated();
      } else {
        // Try to parse error response as JSON, but handle case where it's not JSON
        let errorMessage = 'Failed to remove member';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = response.statusText || 'Failed to remove member';
        }
        setError(errorMessage);
      }
    } catch (err) {
      setError('Failed to remove member');

    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Редактировать команду: {teamName}</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <ErrorDisplay error={error} onClose={() => setError(null)} className="mb-4" />

          {/* Invite Section */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium mb-3">Приглашение в команду</h3>
            <div className="flex flex-col md:flex-row gap-6 items-start">
               <div className="flex-1 w-full">
                  {!inviteCode ? (
                    <button
                      onClick={generateInviteCode}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                    >
                      Создать пригласительную ссылку
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Ссылка для приглашения</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            readOnly 
                            value={inviteLink || ''} 
                            className="flex-1 text-sm p-2 border rounded bg-white"
                          />
                          <button 
                             onClick={() => {
                               if (inviteLink) {
                                 navigator.clipboard.writeText(inviteLink);
                                 alert('Ссылка скопирована!');
                               }
                             }}
                             className="px-3 py-2 bg-gray-200 rounded text-gray-700 hover:bg-gray-300 text-sm"
                          >
                            Копировать
                          </button>
                        </div>
                      </div>
                      <button 
                        onClick={generateInviteCode}
                        disabled={loading}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Сгенерировать новую ссылку
                      </button>
                    </div>
                  )}
               </div>
               
               {inviteLink && (
                 <div className="flex flex-col items-center p-2 bg-white rounded shadow-sm">
                    <QRCodeCanvas value={inviteLink} size={100} />
                    <span className="text-xs text-gray-500 mt-1">QR код</span>
                 </div>
               )}
            </div>
          </div>
          
          {/* Add Member Form */}
          <form onSubmit={addTeamMember} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-3">Добавить спортсмена</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="athleteSelect" className="block text-sm font-medium text-gray-700 mb-1">
                  Спортсмен
                </label>
                <select
                  id="athleteSelect"
                  value={selectedAthlete}
                  onChange={(e) => setSelectedAthlete(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Выберите спортсмена</option>
                  {athletes.map((athlete) => (
                    <option key={athlete.id} value={athlete.id}>
                      {athlete.name} {athlete.lastName ? athlete.lastName : ''} ({athlete.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading || !selectedAthlete}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? 'Добавление...' : 'Добавить'}
                </button>
              </div>
            </div>
          </form>
          
          {/* Members List */}
          <div>
            <h3 className="font-medium mb-3">Участники команды</h3>
            {teamMembers && teamMembers.length === 0 ? (
              <p className="text-gray-600">В команде пока нет участников.</p>
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
                    {teamMembers && teamMembers.map((member) => (
                      <tr key={member.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {member.user.name} {member.user.lastName}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {member.user.email}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            member.user.role === 'TRAINER' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {member.user.role === 'TRAINER' ? 'Тренер' : 'Спортсмен'}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => removeTeamMember(member.userId)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
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
          
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
