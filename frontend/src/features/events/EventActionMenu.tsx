'use client';

import React, { useEffect, useRef } from 'react';
import { useAuthStore } from '../../lib/store/useAuthStore';

interface EventActionMenuProps {
  onDelete: () => void;
  onEdit: () => void;
  onAddResult: () => void;
  onStartTimer: () => void;
  position: { top: number; left: number };
  onClose: () => void;
}

const EventActionMenu: React.FC<EventActionMenuProps> = ({ 
  onDelete, 
  onEdit, 
  onAddResult,
  onStartTimer,
  position, 
  onClose 
}) => {
  const { isAuthenticated } = useAuthStore();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  useEffect(() => {
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
      className="absolute bg-white border border-gray-300 rounded shadow-lg z-20 event-action-menu"
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
          disabled={!isAuthenticated} // Отключить, если не авторизован
        >
          Редактировать
        </button>
        <button 
          onClick={onDelete}
          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-red-600"
          disabled={!isAuthenticated} // Отключить, если не авторизован
        >
          Удалить
        </button>
        <button 
          onClick={onStartTimer}
          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 border-t border-gray-200 mt-1 font-medium text-blue-600"
          disabled={!isAuthenticated} 
        >
          Запустить таймер
        </button>
        <button 
          onClick={onAddResult}
          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 border-t border-gray-200 mt-1"
          disabled={!isAuthenticated} // Отключить, если не авторизован
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