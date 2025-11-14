'use client';

import React, { useState } from 'react';
import EventModal from './EventModal';

interface Exercise {
  id: number;
  name: string;
  weight: string;
  repetitions: string;
}

interface AddEventButtonProps {
  onAddEvent: (title: string, exerciseType: string, exercises: Exercise[]) => void;
  onCancel: () => void;
  date: string;
  position: { top: number; left: number };
}

const AddEventButton: React.FC<AddEventButtonProps> = ({ onAddEvent, onCancel, date, position }) => {
  const [showModal, setShowModal] = useState(false);

  const handleAddEventClick = () => {
    setShowModal(true);
  };

  const handleSave = (title: string, exerciseType: string, exercises: Exercise[]) => {
    onAddEvent(title, exerciseType, exercises);
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
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
      />
    </>
  );
};

export default AddEventButton;