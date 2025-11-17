import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface HeaderProps {
  onLeftMenuClick: () => void;
  onRightMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLeftMenuClick, onRightMenuClick }) => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleRegisterClick = () => {
    // Navigate to the registration page
    router.push('/register');
  };

  const handleUserIconClick = () => {
    // Navigate to the dashboard page
    router.push('/dashboard');
  };

  return (
    <header className="bg-gray-800 text-white py-2 px-4 flex justify-between items-center">
      <button 
        onClick={onLeftMenuClick}
        className="bg-transparent hover:bg-transparent text-white font-bold p-3 rounded-full cursor-pointer"
        aria-label="Menu"
      >
        <Image src="/menu.png" alt="Menu" width={40} height={40} />
      </button>
      <h1 className="text-xl font-bold">My White Board</h1>
      {isAuthenticated && user ? (
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={handleUserIconClick}
        >
          <span className="hidden md:inline">Привет, {user.name}!</span>
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="font-bold">{user.name.charAt(0)}</span>
          </div>
        </div>
      ) : (
        <button 
          onClick={handleRegisterClick}
          className="bg-transparent hover:bg-transparent text-white font-bold p-3 rounded-full cursor-pointer"
        >
          <Image src="/login.png" alt="Login" width={40} height={40} />
        </button>
      )}
    </header>
  );
};

export default Header;