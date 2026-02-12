export interface Team {
  id: string
  name: string
  description?: string
  ownerId: string
  createdAt: string
  updatedAt: string
  inviteCode?: string
  organizationId?: string
  owner?: User
  members?: TeamMember[]
}

export interface User {
  id: string
  name: string
  lastName?: string
  email: string
  role: "TRAINER" | "ATHLETE" | "ORGANIZATION_ADMIN" | "SUPER_ADMIN"
  isAdmin: boolean
  gender?: "MALE" | "FEMALE" | "OTHER"
  userType?: string
  organizationName?: string
  organizationId?: string
  height?: number
  weight?: number
  weightHistory?: { weight: number; date: string }[]
  dashboardLayout?: string[]
  dashboardLayoutMode?: string
  isBlocked?: boolean
}

export interface TeamMember {
  id: string
  teamId: string
  userId: string
  role: "OWNER" | "ADMIN" | "MEMBER"
  user: User
}

export interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (
    name: string,
    email: string,
    password: string,
    role: "TRAINER" | "ATHLETE" | "ORGANIZATION_ADMIN",
    gender?: string,
    userType?: string,
    lastName?: string,
    organizationName?: string,
  ) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

// Exercise interface updated to match schema (UUID string id)
export interface Exercise {
  id: string
  name: string
  weight: string
  repetitions: string
  rxWeight?: string
  rxReps?: string
  scWeight?: string
  scReps?: string
  measurement?: "weight" | "calories"
  rxCalories?: string
  scCalories?: string
}

export interface EventResult {
  id: string
  time: string
  dateAdded: string
  username: string
  userId?: string
  value?: number
  scaling?: string
  notes?: string
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  exerciseType?: string
  exercises?: Exercise[]
  results?: EventResult[]
  color?: string
  teamId?: string
  timeCap?: string
  rounds?: string
  status?: "FUTURE" | "COMPLETED" | "CANCELLED"
  description?: string
  participants?: { id: string; name: string; lastName?: string }[]
  teamName?: string
  scheme?: string
}

export interface Event {
  id: string
  title: string
  description?: string
  eventDate: string
  status: "FUTURE" | "COMPLETED" | "CANCELLED"
  exerciseType?: string
  scheme?: string
  userId: string
  createdAt: string
  updatedAt: string
  timeCap?: string
  rounds?: string
  teamId?: string
  exercises?: Exercise[]
  results?: EventResult[]
  participants?: { id: string; name: string; lastName?: string }[]
}

export interface StrengthWorkoutResult {
  id: string
  userId: string
  exerciseId: string
  date: string
  week: number
  weight: number
  reps: number
  createdAt: string
  exercise?: {
    id: string
    name: string
  }
}

export interface UserEventResult extends EventResult {
  event?: {
    title: string
    eventDate: string
    exerciseType?: string
  }
}

export interface NavItem {
  label: string
  href: string
  onClick?: () => void
  icon?: React.ReactNode
  tooltip?: string
}
