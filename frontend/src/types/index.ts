export interface User {
  id: string
  name: string
  lastName?: string
  email: string
  role: "trainer" | "athlete"
  height?: number
  weight?: number
}

export interface Team {
  id: string
  name: string
  description?: string
  ownerId: string
  created_at: string
  updated_at: string
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (
    name: string,
    email: string,
    password: string,
    role: "trainer" | "athlete",
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

export interface CalendarProps {
  isMenuOpen?: boolean
}

export interface AddEventButtonProps {
  onAddEvent: (title: string, exerciseType: string, exercises: Exercise[]) => void
  onCancel: () => void
  date: string
  position: { top: number; left: number }
}

export interface AddResultModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (time: string) => void
  eventName: string
}

export interface EventActionMenuProps {
  onDelete: () => void
  onEdit: () => void
  onAddResult: () => void
  position: { top: number; left: number }
  onClose: () => void
}

export interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (title: string, exerciseType: string, exercises: Exercise[]) => void
  date: string
  eventData?: {
    title: string
    exerciseType: string
    exercises: Exercise[]
    results?: EventResult[]
  }
}

export interface UserDashboardProps {
  onClose?: () => void
}

// New Event interface for athlete events
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
