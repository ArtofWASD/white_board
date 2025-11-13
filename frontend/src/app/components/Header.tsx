import React from 'react';

interface HeaderProps {
  onLeftMenuClick: () => void;
  onRightMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLeftMenuClick, onRightMenuClick }) => {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <button 
        onClick={onLeftMenuClick}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Левое меню
      </button>
      <h1 className="text-xl font-bold">My White Board</h1>
      <button 
        onClick={onRightMenuClick}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Правое меню
      </button>
    </header>
  );
};

export default Header;