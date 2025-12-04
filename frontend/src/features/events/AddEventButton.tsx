'use client';

import React, { useState } from 'react';
import { useAuthStore } from '../../lib/store/useAuthStore';
import EventModal from './EventModal';

interface Exercise {
  id: number;
  name: string;
  weight?: string;
  repetitions?: string;
  rxWeight?: string;
  rxReps?: string;
  scWeight?: string;
  scReps?: string;
}

interface AddEventButtonProps {
  onAddEvent: (title: string, exerciseType: string, exercises: Exercise[], teamId?: string, timeCap?: string, rounds?: string) => void;
  onCancel: () => void;
  date: string;
  position: { top: number; left: number };
  teamId?: string;
}

const AddEventButton: React.FC<AddEventButtonProps> = ({ onAddEvent, onCancel, date, position, teamId }) => {
  const { isAuthenticated } = useAuthStore();
  const [showModal, setShowModal] = useState(false);

  const handleAddEventClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Вы должны быть авторизованы для создания события');
      return;
    }
    setShowModal(true);
  };

  const handleSave = (title: string, exerciseType: string, exercises: Exercise[], teamId?: string, timeCap?: string, rounds?: string) => {
    onAddEvent(title, exerciseType, exercises, teamId, timeCap, rounds);
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Always call onCancel when handleCloseModal is explicitly called
    // The global click handler should be responsible for preventing accidental closing
    onCancel();
  };

  return (
    <>
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
      
      <EventModal 
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        date={date}
        initialTeamId={teamId}
      />
    </>
  );
};

export default AddEventButton;