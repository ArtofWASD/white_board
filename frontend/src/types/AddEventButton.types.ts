import { Exercise } from './index';

export interface AddEventButtonProps {
  onAddEvent: (title: string, exerciseType: string, exercises: Exercise[], teamId?: string, timeCap?: string, rounds?: string) => void
  onCancel: () => void
  date: string
  position: { top: number; left: number }
  teamId?: string
}
