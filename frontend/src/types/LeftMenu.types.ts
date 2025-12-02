import { CalendarEvent, NavItem } from './index';

export interface LeftMenuProps {
  isOpen: boolean;
  onClose: () => void;
  showAuth: boolean;
  toggleAuth: () => void;
  events: CalendarEvent[];
  onShowEventDetails: (event: CalendarEvent) => void;
  navItems?: NavItem[];
}
