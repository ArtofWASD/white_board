export interface AddResultModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (time: string) => void
  eventName: string
}
