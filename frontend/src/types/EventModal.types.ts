import { Exercise, EventResult } from './index';

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
