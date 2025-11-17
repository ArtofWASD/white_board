export interface User {
  id: string;
  name: string;
  email: string;
  role: 'trainer' | 'athlete';
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: 'trainer' | 'athlete') => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface Exercise {
  id: number;
  name: string;
  weight: string;
  repetitions: string;
}

export interface EventResult {
  id: string;
  time: string;
  dateAdded: string;
  username: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  exerciseType?: string;
  exercises?: Exercise[];
  results?: EventResult[];
  color?: string;
}

export interface CalendarProps {
  isMenuOpen?: boolean;
}

export interface AddEventButtonProps {
  onAddEvent: (title: string, exerciseType: string, exercises: Exercise[]) => void;
  onCancel: () => void;
  date: string;
  position: { top: number; left: number };
}

export interface AddResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (time: string) => void;
  eventName: string;
}

export interface EventActionMenuProps {
  onDelete: () => void;
  onEdit: () => void;
  onAddResult: () => void;
  position: { top: number; left: number };
  onClose: () => void;
}

export interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, exerciseType: string, exercises: Exercise[]) => void;
  date: string;
  eventData?: {
    title: string;
    exerciseType: string;
    exercises: Exercise[];
    results?: EventResult[];
  };
}

export interface UserDashboardProps {
  onClose?: () => void;
}