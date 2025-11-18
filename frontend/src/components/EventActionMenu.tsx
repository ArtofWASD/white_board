'use client';

import React from 'react';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook
import { EventActionMenuProps } from '../types';

const EventActionMenu: React.FC<EventActionMenuProps> = ({ onDelete, onEdit, onAddResult, position, onClose }) => {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth(); // Get authentication status

  const handleMenuClick = (e: React.MouseEvent) => {
    // Prevent the click from propagating to the overlay which would close the menu
    e.stopPropagation();
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div 
      ref={menuRef}
      className="absolute bg-white border border-gray-300 rounded shadow-lg z-20"
      style={{ 
        top: `${position.top}px`, 
        left: `${position.left}px`,
        transform: 'translate(-50%, -50%)'
      }}
      onClick={handleMenuClick}
    >
      <div className="p-2">
        <button 
          onClick={onEdit}
          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
          disabled={!isAuthenticated} // Disable if not authenticated
        >
          Редактировать
        </button>
        <button 
          onClick={onDelete}
          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-red-600"
          disabled={!isAuthenticated} // Disable if not authenticated
        >
          Удалить
        </button>
        <button 
          onClick={onAddResult}
          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 border-t border-gray-200 mt-1"
          disabled={!isAuthenticated} // Disable if not authenticated
        >
          Добавить результат
        </button>
        <button 
          onClick={onClose}
          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 border-t border-gray-200 mt-1"
        >
          Отмена
        </button>
      </div>
    </div>
  );
};

export default EventActionMenu;