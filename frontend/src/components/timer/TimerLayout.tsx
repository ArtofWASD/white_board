"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export const TimerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
       <header className="p-6 border-b border-gray-200 flex justify-between items-center bg-white shadow-sm">
         <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            WOD TIMER
         </h1>
         <button onClick={() => router.back()} className="text-gray-600 hover:text-blue-600 font-medium flex items-center gap-2 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Назад
         </button>
       </header>
       <main className="flex-1 flex flex-col items-center justify-start p-4 md:p-8">
         {children}
       </main>
    </div>
  );
};
