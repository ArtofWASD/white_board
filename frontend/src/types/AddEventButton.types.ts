import { Exercise } from './index';

export interface AddEventButtonProps {
  onAddEvent: (title: string, exerciseType: string, exercises: Exercise[]) => void
  onCancel: () => void
  date: string
  position: { top: number; left: number }
}
