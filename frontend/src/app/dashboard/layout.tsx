'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTeamStore } from '../../lib/store/useTeamStore';
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
  const { user, isAuthenticated, logout, isLoading, verifyUser } = useAuthStore();
  const { fetchTeams } = useTeamStore();
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);
  const router = useRouter();
  const navItems = React.useMemo<NavItem[]>(() => {
    if (!user) return [];

    const items: NavItem[] = [
      { 
        label: 'Главная', 
        href: '/dashboard',
        icon: <Image src="/home_icon.png" alt="Home" width={32} height={32} />,
        tooltip: 'Главная'
      },
      { 
        label: 'Команды', 
        href: '/dashboard/teams',
        icon: <Image src="/teams_icon.png" alt="Teams" width={32} height={32} />,
        tooltip: 'Команды'
      },
      {
        label: 'Лидерборд',
        href: '/dashboard/leaderboard',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0V9.499a2.25 2.25 0 00-2.25-2.25H11.525a2.25 2.25 0 00-2.25 2.25v2.875M12 2.25v4.5" />
          </svg>
        ),
        tooltip: 'Лидерборд'
      },
    ];

    if (user.role === 'TRAINER' || user.role === 'ORGANIZATION_ADMIN' || user.role === 'SUPER_ADMIN') {
      items.push({
        label: 'Управление', 
        href: '/dashboard/organization',
        icon: <Image src="/menegment.png" alt="Management" width={32} height={32} />,
        tooltip: 'Управление'
      });
    }

    if (user.role === 'TRAINER' || user.role === 'ORGANIZATION_ADMIN' || user.role === 'SUPER_ADMIN') {
      items.push({ 
        label: 'Атлеты', 
        href: '/dashboard/athletes',
        icon: <Image src="/athlet_icon.png" alt="Athletes" width={32} height={32} />,
        tooltip: 'Атлеты'
      });

      if (user.role === 'TRAINER' || user.role === 'SUPER_ADMIN') {
        items.push({ 
          label: 'Занятия', 
          href: '/dashboard/activities',
          icon: <Image src="/workout_icon.png" alt="Activities" width={32} height={32} />,
          tooltip: 'Занятия'
        });
      }
    }



    if (user.role === 'SUPER_ADMIN') {
        items.push({
            label: 'Админ',
            href: '/admin',
            // No icon for now, or use a generic one
            icon: (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                 </svg>
            ),
            tooltip: 'Админ'
        });
    }

    items.push({
      label: 'Таймер',
      href: '/timer',
      icon: <Image src="/stopwatch.png" alt="Timer" width={32} height={32} />,
      tooltip: 'Таймер'
    });

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

    return items;
  }, [user, logout]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
        fetchTeams();
        verifyUser();
    }
  }, [user, isAuthenticated, router, isLoading, fetchTeams, verifyUser]);



  if (!isAuthenticated || !user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        onRightMenuClick={() => {}} 
        onLeftMenuClick={() => setIsLeftMenuOpen(true)}
        navItems={navItems}
      />
      
      <LeftMenu
        isOpen={isLeftMenuOpen}
        onClose={() => setIsLeftMenuOpen(false)}
        showAuth={false}
        toggleAuth={() => {}}
        events={[]}
        onShowEventDetails={() => {}}
        navItems={navItems}
      />

      <main className="flex-grow container mx-auto p-2 sm:p-4 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
