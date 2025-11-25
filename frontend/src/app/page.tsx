'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [hoveredSection, setHoveredSection] = useState<'blog' | 'calendar' | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main split-screen content */}
      <main className="flex-grow flex flex-col md:flex-row h-screen">
        {/* Blog Section - Top Half on Mobile, Left Half on Desktop */}
        <Link 
          href="/blog"
          className={`transition-all duration-300 ease-in-out p-8 flex flex-col justify-center relative ${
            hoveredSection === 'blog' ? 'md:w-3/5 z-20' : hoveredSection === 'calendar' ? 'md:w-2/5' : 'md:w-1/2'
          } bg-gradient-to-br from-blue-50 to-indigo-100 cursor-pointer w-full h-1/2 md:h-full overflow-hidden`}
          onMouseEnter={() => setHoveredSection('blog')}
          onMouseLeave={() => setHoveredSection(null)}
        >
          {/* Blog image that appears on hover */}
          <div className={`absolute inset-0 transition-opacity duration-300 flex items-center justify-center ${
            hoveredSection === 'blog' ? 'opacity-30' : 'opacity-0'
          }`}>
            <Image 
              src="/blog.png" 
              alt="Blog" 
              fill
              className="object-cover"
            />
          </div>
          
          {/* Text content with higher z-index to stay on top */}
          <div className="max-w-2xl mx-auto w-full text-center relative z-10">
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
        
        {/* Calendar Section - Bottom Half on Mobile, Right Half on Desktop */}
        <Link 
          href="/calendar"
          className={`transition-all duration-300 ease-in-out p-8 flex flex-col justify-center relative ${
            hoveredSection === 'calendar' ? 'md:w-3/5 z-20' : hoveredSection === 'blog' ? 'md:w-2/5' : 'md:w-1/2'
          } bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer w-full h-1/2 md:h-full overflow-hidden`}
          onMouseEnter={() => setHoveredSection('calendar')}
          onMouseLeave={() => setHoveredSection(null)}
        >
          {/* Calendar image that appears on hover */}
          <div className={`absolute inset-0 transition-opacity duration-300 flex items-center justify-center ${
            hoveredSection === 'calendar' ? 'opacity-30' : 'opacity-0'
          }`}>
            <Image 
              src="/calendar.png" 
              alt="Calendar" 
              fill
              className="object-cover"
            />
          </div>
          
          {/* Text content with higher z-index to stay on top */}
          <div className="max-w-2xl mx-auto w-full text-center relative z-10">
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