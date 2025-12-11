
export interface Team {
  id: string
  name: string
  description?: string
  ownerId: string
  created_at: string
  updated_at: string
  organizationId?: string
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
    organizationName?: string
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
}

export interface EventResult {
  id: string
  time: string
  dateAdded: string
  username: string
  userId?: string
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
  description?: string;
}

export interface Event {
  id: string
  title: string
  description?: string
  eventDate: string
  status: "FUTURE" | "COMPLETED" | "CANCELLED"
  exerciseType?: string
  userId: string
  createdAt: string
  updatedAt: string
  timeCap?: string
  rounds?: string
  teamId?: string
  exercises?: Exercise[]
  results?: EventResult[]
}

export interface NavItem {
  label: string;
  href: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  tooltip?: string;
}
