
export interface Team {
  id: string
  name: string
  description?: string
  ownerId: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  name: string
  lastName?: string
  email: string
  role: "trainer" | "athlete"
  isAdmin: boolean
  gender?: string
  registrationType?: string
  height?: number
  weight?: number
}

export interface TeamMember {
  id: string
  userId: string
  role: string
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
    role: "trainer" | "athlete",
    gender?: string,
    registrationType?: string,
    lastName?: string,
  ) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

export interface Exercise {
  id: number
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
}

export interface Event {
  id: string
  title: string
  description?: string
  eventDate: string
  status: "past" | "future"
  exerciseType?: string
  userId: string
  createdAt: string
  updatedAt: string
  timeCap?: string
  rounds?: string
}

export interface NavItem {
  label: string;
  href: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  tooltip?: string;
}
