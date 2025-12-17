import React, { useState } from 'react';
import { useAuthStore } from '../../lib/store/useAuthStore';

import ErrorDisplay from '../../components/ui/ErrorDisplay';

interface AddResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { time: string }) => void;
  eventName: string;
}

const AddResultModal: React.FC<AddResultModalProps> = ({ isOpen, onClose, onSave, eventName }) => {
  const { user, isAuthenticated } = useAuthStore();

  const [time, setTime] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Вы должны быть авторизованы для добавления результата');
      return;
    }
    setError(null);
    if (time.trim()) {
      onSave({ time });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg min-w-[300px] max-w-2xl w-auto">
        <h3 className="text-lg font-semibold mb-4">
          Добавить результат для события &quot;{eventName}&quot;
        </h3>
        <ErrorDisplay error={error} onClose={() => setError(null)} className="mb-4" />
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Пользователь
            </label>
            <input
              type="text"
              value={user?.name || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
              Время выполнения
            </label>
            <input
              type="text"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите время (например: 10:30)"
              autoFocus
              disabled={!isAuthenticated} // Disable if not authenticated
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              Отмена
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-md focus:outline-none ${
                isAuthenticated 
                  ? 'bg-blue-500 hover:bg-blue-600' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              disabled={!isAuthenticated} // Disable if not authenticated
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddResultModal;