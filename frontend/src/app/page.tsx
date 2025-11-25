'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [hoveredSection, setHoveredSection] = useState<'blog' | 'calendar' | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main split-screen content */}
      <main className="flex-grow flex flex-col md:flex-row">
        {/* Blog Section - Left Half */}
        <Link 
          href="/blog"
          className={`transition-all duration-300 ease-in-out p-8 flex flex-col justify-center ${
            hoveredSection === 'blog' ? 'md:w-[85%]' : 'md:w-1/2'
          } bg-gradient-to-br from-blue-50 to-indigo-100 cursor-pointer`}
          onMouseEnter={() => setHoveredSection('blog')}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <div className="max-w-2xl mx-auto w-full text-center">
            <h1 className={`text-4xl font-bold mb-6 transition-all duration-300 ${
              hoveredSection === 'blog' ? 'text-5xl' : ''
            } text-gray-800`}>
              Блог
            </h1>
            <p className="text-xl text-gray-600">
              Читайте последние статьи и новости
            </p>
          </div>
        </Link>
        
        {/* Calendar Section - Right Half */}
        <Link 
          href="/calendar"
          className={`transition-all duration-300 ease-in-out p-8 flex flex-col justify-center ${
            hoveredSection === 'calendar' ? 'md:w-[85%]' : 'md:w-1/2'
          } bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer`}
          onMouseEnter={() => setHoveredSection('calendar')}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <div className="max-w-2xl mx-auto w-full text-center">
            <h1 className={`text-4xl font-bold mb-6 transition-all duration-300 ${
              hoveredSection === 'calendar' ? 'text-5xl' : ''
            } text-gray-800`}>
              Календарь
            </h1>
            <p className="text-xl text-gray-600">
              Планируйте свои тренировки
            </p>
          </div>
        </Link>
      </main>
    </div>
  );
}