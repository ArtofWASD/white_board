export interface UserDashboardProps {
  onClose?: () => void
}

export interface DashboardEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  exerciseType?: string;
  status: 'past' | 'future';
}
