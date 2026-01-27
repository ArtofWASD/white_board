'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { OverviewTab } from '../../components/admin/OverviewTab';
import { UsersTab } from '../../components/admin/UsersTab';
import { OrganizationsTab } from '../../components/admin/OrganizationsTab';
import { ContentTab } from '../../components/admin/ContentTab';
import { SettingsTab } from '../../components/admin/SettingsTab';

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'organizations' | 'content' | 'settings'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
       if (!isAuthenticated) {
          router.push('/login');
       } else if (user && user.role !== 'SUPER_ADMIN') {
          router.push('/dashboard');
       }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center bg-gray-100">Загрузка...</div>;
  }

  if (user?.role !== 'SUPER_ADMIN') {
      return null;
  }

  return (
      <div className="flex h-screen bg-gray-100 font-sans">
          <AdminSidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isMobileMenuOpen={isMobileMenuOpen} 
            setIsMobileMenuOpen={setIsMobileMenuOpen} 
          />

          {/* Overlay */}
          {isMobileMenuOpen && (
              <div 
                  className="fixed inset-0 z-20 bg-black opacity-50 md:hidden"
                  onClick={() => setIsMobileMenuOpen(false)}
              ></div>
          )}

          <div className="flex-1 flex flex-col overflow-hidden">
              <AdminHeader 
                activeTab={activeTab} 
                user={user} 
                setIsMobileMenuOpen={setIsMobileMenuOpen} 
              />

              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                 {activeTab === 'overview' && <OverviewTab />}
                 {activeTab === 'users' && <UsersTab />}
                 {activeTab === 'organizations' && <OrganizationsTab />}
                 {activeTab === 'content' && <ContentTab />}
                 {activeTab === 'settings' && <SettingsTab />}
              </main>
          </div>
      </div>
  );
}
