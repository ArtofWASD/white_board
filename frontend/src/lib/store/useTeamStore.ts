import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Team } from '../../types';
import { useAuthStore } from './useAuthStore';

interface TeamState {
  teams: Team[];
  selectedTeam: Team | null;
  loading: boolean;
  error: string | null;
  fetchTeams: () => Promise<void>;
  selectTeam: (teamId: string) => void;
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      teams: [],
      selectedTeam: null,
      loading: false,
      error: null,

      fetchTeams: async () => {
        const { user, isAuthenticated } = useAuthStore.getState();

        if (!isAuthenticated || !user) {
          set({ teams: [], selectedTeam: null });
          return;
        }

        set({ loading: true, error: null });
        try {
          const { token } = useAuthStore.getState();
          const response = await fetch(`/api/teams?userId=${user.id}`, {
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` }),
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
              set({ teams: data });
              
              // Logic to ensure selectedTeam is valid or default to first
              const currentSelected = get().selectedTeam;
              if (currentSelected) {
                 const stillExists = data.find(t => t.id === currentSelected.id);
                 if (!stillExists) {
                    set({ selectedTeam: data.length > 0 ? data[0] : null });
                 } else {
                    // Update the selected team data in case it changed
                    set({ selectedTeam: stillExists });
                 }
              } else if (data.length > 0) {
                 set({ selectedTeam: data[0] });
              }
            } else {
              set({ teams: [] });
            }
          } else {
            console.error('Failed to fetch teams');
            set({ error: 'Failed to fetch teams' });
          }
        } catch (err) {
          console.error('Error fetching teams:', err);
          set({ error: 'Error fetching teams' });
        } finally {
          set({ loading: false });
        }
      },

      selectTeam: (teamId: string) => {
        const team = get().teams.find((t) => t.id === teamId);
        if (team) {
          set({ selectedTeam: team });
        }
      },
    }),
    {
      name: 'team-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ selectedTeam: state.selectedTeam }), // Only persist selectedTeam
    }
  )
);
