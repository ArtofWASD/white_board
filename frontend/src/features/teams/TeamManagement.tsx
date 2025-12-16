'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { useToast } from '../../lib/context/ToastContext';

import { TeamManagementUser as User, TeamMember, Team } from '../../types/TeamManagement.types';

export default function TeamManagement() {
  const { user, token } = useAuthStore();
  const { success, error: toastError } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<{[key: string]: TeamMember[]}>({});
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'ATHLETE' | 'TRAINER'>('ATHLETE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserTeams = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teams/user/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setTeams(data);
    } catch (err) {
      toastError('Failed to fetch teams');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchTeamMembers = useCallback(async (teamId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(prev => ({...prev, [teamId]: data}));
      } else {
        // Try to parse error response as JSON, but handle case where it's not JSON
        let errorMessage = 'Failed to fetch team members';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If JSON parsing fails, use the status text or a generic message
          errorMessage = response.statusText || 'Failed to fetch team members';
        }
        toastError(errorMessage);
      }
    } catch (err) {
      toastError('Failed to fetch team members');
      console.error(err);
    }
  }, []);

  // Fetch user's teams
  useEffect(() => {
    if (user) {
      fetchUserTeams();
    }
  }, [user, fetchUserTeams]);

  // Fetch team members when a team is selected
  useEffect(() => {
    if (selectedTeam) {
      fetchTeamMembers(selectedTeam);
    }
  }, [selectedTeam, fetchTeamMembers]);

  const createTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !user) return;

    try {
      setLoading(true);
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newTeamName,
          description: newTeamDescription,
        }),
      });
      
      if (response.ok) {
        const newTeam = await response.json();
        setTeams(prev => [...prev, newTeam]);
        
        // Reset form
        setNewTeamName('');
        setNewTeamDescription('');
        
        success('Team created successfully!');
      } else {
        if (response.status === 401) {
          toastError('Session expired. Please login again.');
          // Optional: You might want to redirect to login or clear auth store here
        } else {
          toastError('Failed to create team');
        }
      }
    } catch (err) {
      toastError('An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const lookupUserByEmail = async (email: string): Promise<User | null> => {
    try {
      const response = await fetch(`/api/auth/lookup?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (response.ok) {
        const user = await response.json();
        return user;
      }
      return null;
    } catch (err) {
      console.error('Error looking up user:', err);
      return null;
    }
  };

  const addTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !newMemberEmail.trim() || !user) return;

    try {
      setLoading(true);
      
      // Lookup user by email
      const foundUser = await lookupUserByEmail(newMemberEmail);
      if (!foundUser) {
        toastError('User not found with that email');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`/api/teams/${selectedTeam}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: foundUser.id,
          role: newMemberRole,
        }),
      });
      
      if (response.ok) {
        // Refresh team members
        fetchTeamMembers(selectedTeam);
        
        // Reset form
        setNewMemberEmail('');
        success('Member added successfully!');
      } else {
        // Try to parse error response as JSON, but handle case where it's not JSON
        let errorMessage = 'Failed to add member';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = response.statusText || 'Failed to add member';
        }
        toastError(errorMessage);
      }
    } catch (err) {
      toastError('Failed to add member');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeTeamMember = async (teamId: string, userId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userId,
        }),
      });
      
      if (response.ok) {
        // Refresh team members
        fetchTeamMembers(teamId);
        success('Member removed successfully!');
      } else {
        // Try to parse error response as JSON, but handle case where it's not JSON
        let errorMessage = 'Failed to remove member';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = response.statusText || 'Failed to remove member';
        }
        toastError(errorMessage);
      }
    } catch (err) {
      toastError('Failed to remove member');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'TRAINER') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Team Management</h2>
        <p className="text-gray-600">Only trainers can manage teams.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Team Management</h2>
      

      
      {/* Create Team Form */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Create New Team</h3>
        <form onSubmit={createTeam} className="space-y-4">
          <div>
            <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
              Team Name *
            </label>
            <input
              type="text"
              id="teamName"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="teamDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="teamDescription"
              value={newTeamDescription}
              onChange={(e) => setNewTeamDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Team'}
          </button>
        </form>
      </div>
      
      {/* Teams List */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Your Teams</h3>
        {teams.length === 0 ? (
          <p className="text-gray-600">You have not created any teams yet.</p>
        ) : (
          <div className="space-y-4">
            {teams.map((team) => (
              <div 
                key={team.id} 
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedTeam === team.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedTeam(selectedTeam === team.id ? null : team.id)}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{team.name}</h4>
                  <span className="text-sm text-gray-500">
                    {teamMembers[team.id]?.length || 0} members
                  </span>
                </div>
                {team.description && (
                  <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Team Members Management */}
      {selectedTeam && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-3">Manage Team Members</h3>
          
          {/* Add Member Form */}
          <form onSubmit={addTeamMember} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-3">Add Member</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="memberEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="memberEmail"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="memberRole" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="memberRole"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as 'ATHLETE' | 'TRAINER')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ATHLETE">Athlete</option>
                  <option value="TRAINER">Trainer</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </div>
          </form>
          
          {/* Members List */}
          <div>
            <h4 className="font-medium mb-3">Team Members</h4>
            {teamMembers[selectedTeam]?.length === 0 ? (
              <p className="text-gray-600">No members in this team yet.</p>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Email
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Role
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {teamMembers[selectedTeam]?.map((member) => (
                      <tr key={member.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {member.user.name}
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
                            {member.user.role === 'TRAINER' ? 'Trainer' : 'Athlete'}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => removeTeamMember(selectedTeam, member.userId)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            Remove
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
      )}
    </div>
  );
}