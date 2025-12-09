'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Header from '../../components/layout/Header';
import LeftMenu from '../../components/layout/LeftMenu';
import { NavItem } from '../../types';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, logout, isLoading } = useAuthStore();
  const router = useRouter();
  const [leftMenuOpen, setLeftMenuOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavItem[]>([]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      const items: NavItem[] = [
        { 
          label: 'Главная', 
          href: '/dashboard',
          icon: <Image src="/home_icon.png" alt="Home" width={32} height={32} />,
          tooltip: 'Главная'
        },
      ];

      if (user.role === 'trainer' || user.role === 'organization_admin') {
        const adminItems = [
          {
            label: 'Управление', 
            href: '/dashboard/organization',
            icon: <Image src="/menegment.png" alt="Management" width={32} height={32} />,
            tooltip: 'Управление'
          },
          { 
            label: 'Команды', 
            href: '/dashboard/teams',
            icon: <Image src="/teams_icon.png" alt="Teams" width={32} height={32} />,
            tooltip: 'Команды'
          },
          { 
            label: 'Атлеты', 
            href: '/dashboard/athletes',
            icon: <Image src="/athlet_icon.png" alt="Athletes" width={32} height={32} />,
            tooltip: 'Атлеты'
          }
        ];

        // Trainers get "Activities" (Logs), strictly admin user does not unless they are also a trainer (logic handled by role)
        // Actually, if role is 'trainer', they see everything.
        // If role is 'organization_admin', they see adminItems.
        // But wait, 'trainer' also needs to see adminItems if they are admin? 
        // Current logic: All trainers see these items? No, standard trainers might not need "Management" if they are not Owners.
        // But for now, let's assume 'trainer' + 'organization' type covers the previous 'trainer' role behavior.
        
        // Let's refine:
        // organization_admin -> Management, Teams, Athletes
        // trainer -> Management (maybe?), Teams, Athletes, Activities
        
        // For now, let's keep it simple: Both get these 3 items.
        items.push(...adminItems);

        // Only trainers get "Activities" (Workout Logs)
        if (user.role === 'trainer') {
           items.push({ 
            label: 'Занятия', 
            href: '/dashboard/activities',
            icon: <Image src="/workout_icon.png" alt="Activities" width={32} height={32} />,
            tooltip: 'Занятия'
          });
        }
      }

      // Add common items for all users
      items.push(
        { 
          label: 'Календарь', 
          href: '/calendar',
          icon: <Image src="/calendar_icon.png" alt="Calendar" width={32} height={32} />,
          tooltip: 'Календарь'
        },
        { 
          label: 'Выйти', 
          href: '#', 
          onClick: () => {
            logout();
          },
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          ),
          tooltip: 'Выйти'
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
