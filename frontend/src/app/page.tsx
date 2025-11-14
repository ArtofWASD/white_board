'use client';

import React, { useState } from 'react';
import Header from '../components/Header';
import Calendar from '../components/Calendar';
import Footer from '../components/Footer';
import AuthForms from '../components/AuthForms';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const [leftMenuOpen, setLeftMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  
  const { isAuthenticated, user } = useAuth();

  const handleLeftMenuClick = () => {
    setLeftMenuOpen(!leftMenuOpen);
  };

  const handleRightMenuClick = () => {
    // This function is no longer needed as dashboard is a separate page
  };

  const toggleAuth = () => {
    setShowAuth(!showAuth);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onLeftMenuClick={handleLeftMenuClick} 
        onRightMenuClick={handleRightMenuClick} 
      />
      
      {/* Sliding Left Menu */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out overflow-y-auto ${leftMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Меню</h2>
            <button 
              onClick={handleLeftMenuClick}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div className="mt-4">
            {isAuthenticated && user ? (
              <div className="mb-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Информация о пользователе</h3>
                  <p className="text-gray-700"><span className="font-medium">Имя:</span> {user.name}</p>
                  <p className="text-gray-700"><span className="font-medium">Email:</span> {user.email}</p>
                </div>
              </div>
            ) : (
              <p className="mb-4">Содержимое левого меню</p>
            )}
            {!isAuthenticated && (
              <button 
                onClick={toggleAuth}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {showAuth ? 'Скрыть форму' : 'Показать форму входа/регистрации'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Overlay for closing left menu */}
      {leftMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-transparent backdrop-blur-sm"
          onClick={handleLeftMenuClick}
        ></div>
      )}
      
      <main className={`flex-grow transition-all duration-300 ease-in-out ${leftMenuOpen ? 'ml-64' : 'ml-0'}`}>
        {isAuthenticated ? (
          <Calendar isMenuOpen={leftMenuOpen} />
        ) : showAuth ? (
          <AuthForms />
        ) : (
          <Calendar isMenuOpen={leftMenuOpen} />
        )}
      </main>
      
      <Footer />
    </div>
  );
}