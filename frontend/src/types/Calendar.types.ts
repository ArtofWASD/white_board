import { Exercise, CalendarEvent, EventResult } from './index';

export type { CalendarEvent, EventResult };

export interface BackendEvent {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  exerciseType?: string;
  exercises?: Exercise[];
  status: 'past' | 'future';
  teamId?: string;
  timeCap?: string;
  rounds?: string;
}

export interface CalendarProps {
  isMenuOpen: boolean;
  onUpdateEvents?: (events: CalendarEvent[]) => void;
}
