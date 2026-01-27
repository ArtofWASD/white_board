import React from 'react';

interface AdminSidebarProps {
  activeTab: 'overview' | 'users' | 'organizations' | 'content' | 'settings';
  setActiveTab: (tab: 'overview' | 'users' | 'organizations' | 'content' | 'settings') => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) => {
  return (
    <div className={`w-64 bg-white shadow-md flex-shrink-0 fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-indigo-600">Admin</h2>
        <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav className="mt-6">
        <a href="#" onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }} className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${activeTab === 'overview' ? 'bg-gray-100 border-r-4 border-indigo-600' : ''}`}>
          <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Обзор
        </a>
        <a href="#" onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); }} className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${activeTab === 'users' ? 'bg-gray-100 border-r-4 border-indigo-600' : ''}`}>
          <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Пользователи
        </a>

        <a href="#" onClick={() => { setActiveTab('content'); setIsMobileMenuOpen(false); }} className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${activeTab === 'content' ? 'bg-gray-100 border-r-4 border-indigo-600' : ''}`}>
          <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Контент
        </a>
        
        <a href="#" onClick={() => { setActiveTab('organizations'); setIsMobileMenuOpen(false); }} className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${activeTab === 'organizations' ? 'bg-gray-100 border-r-4 border-indigo-600' : ''}`}>
           <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
           </svg>
           Организации
        </a>

        <a href="#" onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${activeTab === 'settings' ? 'bg-gray-100 border-r-4 border-indigo-600' : ''}`}>
          <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Настройки
        </a>
        <a href="/" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
          <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          На сайт
        </a>
      </nav>
    </div>
  );
};
