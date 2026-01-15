import { NavItem } from './index';

export interface HeaderProps {
  onRightMenuClick: () => void;
  navItems?: NavItem[];
}
