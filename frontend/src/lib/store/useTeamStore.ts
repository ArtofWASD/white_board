import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { Team } from "../../types"
import { useAuthStore } from "./useAuthStore"
import { teamsApi } from "../api/teams"

interface TeamState {
  teams: Team[]
  selectedTeam: Team | null
  loading: boolean
  error: string | null
  fetchTeams: () => Promise<void>
  selectTeam: (teamId: string) => void
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      teams: [],
      selectedTeam: null,
      loading: false,
      error: null,

      fetchTeams: async () => {
        const { user, isAuthenticated } = useAuthStore.getState()

        if (!isAuthenticated || !user) {
          set({ teams: [], selectedTeam: null })
          return
        }

        set({ loading: true, error: null })
        try {
          // Используем teamsApi, он берет userId из второго аргумента? Нет, getUserTeams(userId)
          const data = await teamsApi.getUserTeams(user.id)

          if (data && Array.isArray(data)) {
            set({ teams: data })

            // Логика для обеспечения валидности selectedTeam или выбор первого по умолчанию
            const currentSelected = get().selectedTeam
            if (currentSelected) {
              const stillExists = data.find((t) => t.id === currentSelected.id)
              if (!stillExists) {
                set({ selectedTeam: data.length > 0 ? data[0] : null })
              } else {
                // Обновление данных выбранной команды, если они изменились
                set({ selectedTeam: stillExists })
              }
            } else if (data.length > 0) {
              set({ selectedTeam: data[0] })
            }
          } else {
            set({ teams: [] })
          }
        } catch (err) {
          console.error("Error fetching teams:", err)
          set({ error: "Error fetching teams" })
        } finally {
          set({ loading: false })
        }
      },

      selectTeam: (teamId: string) => {
        const team = get().teams.find((t) => t.id === teamId)
        if (team) {
          set({ selectedTeam: team })
        }
      },
    }),
    {
      name: "team-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ selectedTeam: state.selectedTeam }), // Сохранять только selectedTeam
    },
  ),
)
