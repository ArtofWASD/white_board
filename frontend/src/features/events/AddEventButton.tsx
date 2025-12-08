'use client';

import React from 'react';
import { useAuthStore } from '../../lib/store/useAuthStore';

interface AddEventButtonProps {
  onAddEvent: () => void;
  onCancel: () => void;
  date: string;
  position: { top: number; left: number };
  teamId?: string;
}

const AddEventButton: React.FC<AddEventButtonProps> = ({ onAddEvent, onCancel, date, position, teamId }) => {
  const { isAuthenticated } = useAuthStore();

  const handleAddEventClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Вы должны быть авторизованы для создания события');
      return;
    }
    onAddEvent();
  };

  return (
    <div 
      className="add-event-button absolute bg-white border border-gray-300 rounded shadow-lg z-10"
      style={{ 
        top: `${position.top}px`, 
        left: `${position.left}px`,
        transform: 'translate(0, -100%)'
      }}
    >
      <div className="p-2">
        <button 
          onClick={handleAddEventClick}
          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
        >
          Добавить событие
        </button>
        <button 
          onClick={onCancel}
          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
        >
          Отмена
        </button>
      </div>
    </div>
  );
};

export default AddEventButton;