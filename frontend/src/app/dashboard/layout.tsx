'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '../../components/layout/Header';
import LeftMenu from '../../components/layout/LeftMenu';
import { NavItem } from '../../types';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [leftMenuOpen, setLeftMenuOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavItem[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      const items: NavItem[] = [
        { label: 'Главная', href: '/dashboard' },
      ];

      if (user.role === 'trainer') {
        items.push(
          { label: 'Команды', href: '/dashboard/teams' },
          { label: 'Атлеты', href: '/dashboard/athletes' },
          { label: 'Занятия', href: '/dashboard/activities' }
        );
      }

      // Add common items for all users
      items.push(
        { label: 'Календарь', href: '/calendar' },
        { 
          label: 'Выйти', 
          href: '#', 
          onClick: () => {
            logout();
          } 
        }
      );

      setNavItems(items);
    }
  }, [user, isAuthenticated, router, logout]);

  const handleLeftMenuClick = () => {
    setLeftMenuOpen(!leftMenuOpen);
  };

  if (!isAuthenticated || !user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        onLeftMenuClick={handleLeftMenuClick} 
        onRightMenuClick={() => {}} 
        navItems={navItems}
      />
      
      <LeftMenu 
        isOpen={leftMenuOpen}
        onClose={() => setLeftMenuOpen(false)}
        showAuth={false}
        toggleAuth={() => {}}
        events={[]} // We might need to pass events here if we want to show them in the menu
        onShowEventDetails={() => {}}
        navItems={navItems}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
