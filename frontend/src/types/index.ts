
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
  height?: number
  weight?: number
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
    lastName?: string,
  ) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

export interface Exercise {
  id: number
  name: string
  weight: string
  repetitions: string
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
}
