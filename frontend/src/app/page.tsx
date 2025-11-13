'use client';

import React, { useState } from 'react';
import Header from './components/Header';
import Calendar from './components/Calendar';
import Footer from './components/Footer';

export default function Home() {
  const [leftMenuOpen, setLeftMenuOpen] = useState(false);
  const [rightMenuOpen, setRightMenuOpen] = useState(false);

  const handleLeftMenuClick = () => {
    setLeftMenuOpen(!leftMenuOpen);
    console.log('Left menu clicked');
  };

  const handleRightMenuClick = () => {
    setRightMenuOpen(!rightMenuOpen);
    console.log('Right menu clicked');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onLeftMenuClick={handleLeftMenuClick} 
        onRightMenuClick={handleRightMenuClick} 
      />
      
      {/* Menu placeholders */}
      {leftMenuOpen && (
        <div className="bg-blue-100 p-4">
          <p>Left Menu Content</p>
        </div>
      )}
      
      <main className="flex-grow">
        <Calendar />
      </main>
      
      {rightMenuOpen && (
        <div className="bg-green-100 p-4">
          <p>Right Menu Content</p>
        </div>
      )}
      
      <Footer />
    </div>
  );
}