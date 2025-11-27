import { Exercise, EventResult } from './index';

export interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (title: string, exerciseType: string, exercises: Exercise[], teamId?: string, timeCap?: string, rounds?: string) => void
  date: string
  eventData?: {
    title: string
    exerciseType: string
    exercises: Exercise[]
    results?: EventResult[]
    teamId?: string
    timeCap?: string
    rounds?: string
  }
  initialTeamId?: string
}
