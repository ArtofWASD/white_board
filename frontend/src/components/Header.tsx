import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

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
        <img src="/menu.png" alt="Menu" className="w-10 h-10" />
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
          <img src="/login.png" alt="Login" className="w-10 h-10" />
        </button>
      )}
    </header>
  );
};

export default Header;