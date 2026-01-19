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
    ];

    if (user.role === 'TRAINER' || user.role === 'ORGANIZATION_ADMIN') {
      items.push({
        label: 'Управление', 
        href: '/dashboard/organization',
        icon: <Image src="/menegment.png" alt="Management" width={32} height={32} />,
        tooltip: 'Управление'
      });
    }

    if (user.role === 'TRAINER' || user.role === 'ORGANIZATION_ADMIN') {
      items.push({ 
        label: 'Атлеты', 
        href: '/dashboard/athletes',
        icon: <Image src="/athlet_icon.png" alt="Athletes" width={32} height={32} />,
        tooltip: 'Атлеты'
      });

      if (user.role === 'TRAINER') {
        items.push({ 
          label: 'Занятия', 
          href: '/dashboard/activities',
          icon: <Image src="/workout_icon.png" alt="Activities" width={32} height={32} />,
          tooltip: 'Занятия'
        });
      }
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

      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
