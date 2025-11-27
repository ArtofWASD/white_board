import { Exercise, CalendarEvent } from './index';

export interface BackendEvent {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  exerciseType?: string;
  exercises?: Exercise[];
  status: 'past' | 'future';
}

export interface CalendarProps {
  isMenuOpen: boolean;
  onUpdateEvents?: (events: CalendarEvent[]) => void;
}
