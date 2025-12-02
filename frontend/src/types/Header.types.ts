import { NavItem } from './index';

export interface HeaderProps {
  onLeftMenuClick: () => void;
  onRightMenuClick: () => void;
  navItems?: NavItem[];
}
