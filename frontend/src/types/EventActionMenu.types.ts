export interface EventActionMenuProps {
  onDelete: () => void
  onEdit: () => void
  onAddResult: () => void
  position: { top: number; left: number }
  onClose: () => void
}
