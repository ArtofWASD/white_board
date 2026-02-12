export interface TeamManagementUser {
  id: string
  name: string
  email: string
  role: string
}

export interface TeamMember {
  id: string
  userId: string
  role: string
  user: TeamManagementUser
}

export interface Team {
  id: string
  name: string
  description?: string
  ownerId: string
  inviteCode?: string
  inviteCodeCreatedAt?: string
  createdAt: string
  updatedAt: string
}
