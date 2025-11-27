'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Team } from '../types';
import { useAuth } from './AuthContext';

interface TeamContextType {
  teams: Team[];
  selectedTeam: Team | null;
  loading: boolean;
  error: string | null;
  selectTeam: (teamId: string) => void;
  refreshTeams: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async () => {
    if (!isAuthenticated || !user) {
      setTeams([]);
      setSelectedTeam(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/teams?userId=${user.id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setTeams(data);
          
          // Restore selected team from local storage or default to first team
          const storedTeamId = localStorage.getItem('selectedTeamId');
          if (storedTeamId) {
            const foundTeam = data.find(t => t.id === storedTeamId);
            if (foundTeam) {
              setSelectedTeam(foundTeam);
            } else if (data.length > 0) {
              setSelectedTeam(data[0]);
              localStorage.setItem('selectedTeamId', data[0].id);
            }
          } else if (data.length > 0) {
            setSelectedTeam(data[0]);
            localStorage.setItem('selectedTeamId', data[0].id);
          }
        } else {
          setTeams([]);
        }
      } else {
        console.error('Failed to fetch teams');
        setError('Failed to fetch teams');
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Error fetching teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [isAuthenticated, user]);

  const selectTeam = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      setSelectedTeam(team);
      localStorage.setItem('selectedTeamId', team.id);
    }
  };

  return (
    <TeamContext.Provider
      value={{
        teams,
        selectedTeam,
        loading,
        error,
        selectTeam,
        refreshTeams: fetchTeams,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}
