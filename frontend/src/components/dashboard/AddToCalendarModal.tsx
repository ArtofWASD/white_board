import React, { useState } from 'react';
import Button from '../ui/Button';

interface AddToCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (date: Date) => void;
  title: string;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exercises?: any[];
}

export function AddToCalendarModal({ isOpen, onClose, onSave, title, description, exercises }: AddToCalendarModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(new Date(date));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/25 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onPointerDown={(e) => e.stopPropagation()}>
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-900">Добавить в календарь</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div>
           <p className="font-medium text-gray-900 mb-1">{title}</p>
           {description && !exercises?.length && <p className="text-sm text-gray-500 whitespace-pre-wrap">{description}</p>}
           
           {exercises && exercises.length > 0 && (
             <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-2">
               <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Упражнения:</p>
               {exercises.map((ex, idx) => (
                 <div key={idx} className="bg-gray-50 rounded p-2 text-sm border border-gray-100">
                   <div className="font-medium text-gray-800">{ex.name}</div>
                   <div className="text-gray-500 text-xs flex gap-3 mt-1">
                     {ex.weight && <span>Вес: <span className="font-medium">{ex.weight}</span></span>}
                     {ex.repetitions && <span>Повторы: <span className="font-medium">{ex.repetitions}</span></span>}
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Дата тренировки</label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Отмена</Button>
          <Button variant="primary" size="sm" onClick={handleSave}>Сохранить</Button>
        </div>
      </div>
    </div>
  );
}
