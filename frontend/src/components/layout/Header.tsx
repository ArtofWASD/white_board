import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { HeaderProps } from '../../types/Header.types';

const Header: React.FC<HeaderProps> = ({ onLeftMenuClick }) => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLoginClick = () => {
    // Navigate to the login page
    router.push('/login');
  };

  const handleTitleClick = () => {
    // Navigate to the main calendar page
    router.push('/');
  };

  const handleUserIconClick = () => {
    // Navigate to the dashboard page
    router.push('/dashboard');
  };

  return (
    <header className="bg-gray-800 text-white py-2 px-2 sm:px-4 flex justify-between items-center">
      <button 
        onClick={onLeftMenuClick}
        className="bg-transparent hover:bg-transparent text-white font-bold p-2 sm:p-3 rounded-full cursor-pointer"
        aria-label="Menu"
      >
        <Image src="/menu.png" alt="Menu" width={32} height={32} className="sm:w-10 sm:h-10" />
      </button>
      <h1 
        className="text-lg sm:text-xl font-bold cursor-pointer hover:text-gray-300 transition-colors absolute left-1/2 transform -translate-x-1/2"
        onClick={handleTitleClick}
      >
        My White Board
      </h1>
      {isAuthenticated && user ? (
        <div 
          className="flex items-center space-x-1 sm:space-x-2 cursor-pointer"
          onClick={handleUserIconClick}
        >
          <span className="hidden md:inline text-sm sm:text-base">Привет, {user.name}{user.lastName ? ` ${user.lastName}` : ''}!</span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="font-bold text-sm sm:text-base">{user.name.charAt(0)}{user.lastName ? user.lastName.charAt(0) : ''}</span>
          </div>
        </div>
      ) : (
        <button 
          onClick={handleLoginClick}
          className="bg-transparent hover:bg-transparent text-white font-bold p-2 sm:p-3 rounded-full cursor-pointer"
        >
          <Image src="/login.png" alt="Login" width={32} height={32} className="sm:w-10 sm:h-10" />
        </button>
      )}
    </header>
  );
};

export default Header;