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
    console.log('Левое меню нажато');
  };

  const handleRightMenuClick = () => {
    setRightMenuOpen(!rightMenuOpen);
    console.log('Правое меню нажато');
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
          <p>Содержимое левого меню</p>
        </div>
      )}
      
      <main className="flex-grow">
        <Calendar />
      </main>
      
      {rightMenuOpen && (
        <div className="bg-green-100 p-4">
          <p>Содержимое правого меню</p>
        </div>
      )}
      
      <Footer />
    </div>
  );
}