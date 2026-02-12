/**
 * API модуль для работы с командами.
 *
 * @example
 * ```ts
 * import { teamsApi } from '@/lib/api/teams'
 * const teams = await teamsApi.getUserTeams('userId')
 * ```
 */

import { apiClient } from "./apiClient"
import { Team, TeamMember } from "../../types"

interface CreateTeamData {
  name: string
  description?: string
}

interface UpdateTeamData {
  name?: string
  description?: string
}

interface InviteResponse {
  inviteCode?: string
  inviteLink?: string
  [key: string]: unknown
}

export const teamsApi = {
  /** Получить команды пользователя */
  getUserTeams: (userId: string) => apiClient.get<Team[]>("/api/teams", { userId }),

  /** Получить команду по ID */
  getTeam: (teamId: string) => apiClient.get<Team>(`/api/teams/${teamId}`),

  /** Создать команду */
  createTeam: (data: CreateTeamData) => apiClient.post<Team>("/api/teams", data),

  /** Обновить команду */
  updateTeam: (teamId: string, data: UpdateTeamData) =>
    apiClient.put<Team>(`/api/teams/${teamId}`, data),

  /** Удалить команду */
  deleteTeam: (teamId: string) => apiClient.delete<void>(`/api/teams/${teamId}`),

  /** Получить участников команды */
  getMembers: (teamId: string) =>
    apiClient.get<TeamMember[]>(`/api/teams/${teamId}/members`),

  /** Добавить участника в команду */
  addMember: (teamId: string, userId: string, role: string = "MEMBER") =>
    apiClient.post<void>(`/api/teams/${teamId}/members`, { userId, role }),

  /** Удалить участника из команды */
  removeMember: (teamId: string, userId: string) =>
    apiClient.delete<void>(`/api/teams/${teamId}/members`),

  /** Создать приглашение в команду */
  createInvite: (teamId: string) =>
    apiClient.post<InviteResponse>(`/api/teams/${teamId}/invite`),

  /** Присоединиться по коду приглашения */
  joinByInviteCode: (code: string) =>
    apiClient.post<Team>(`/api/teams/invite/${code}/join`),
}
