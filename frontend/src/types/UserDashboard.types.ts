import { Exercise } from './index';

export interface UserDashboardProps {
  onClose?: () => void
}

export interface DashboardEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  exerciseType?: string;
  exercises?: Exercise[];
  status: 'past' | 'future';
  userId?: string;
  teamId?: string;
}
