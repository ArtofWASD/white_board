import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { Modal } from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  existingMemberIds: string[];
  onMemberAdded: () => void;
  token: string | null;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  teamId,
  existingMemberIds,
  onMemberAdded,
  token,
}) => {
  const [athletes, setAthletes] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableAthletes();
      setSearchQuery('');
      setError(null);
    }
  }, [isOpen]);

  const fetchAvailableAthletes = async () => {
    try {
      const response = await fetch('/api/auth/athletes', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setAthletes(data);
        } else {
          setAthletes([]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch athletes', err);
    }
  };

  const addTeamMember = async (athleteId: string) => {
    try {
      setAddingId(athleteId);
      setError(null);
      
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          userId: athleteId,
          role: 'MEMBER',
        }),
      });
      
      if (response.ok) {
        onMemberAdded();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Не удалось добавить спортсмена');
      }
    } catch (err) {
      setError('Ошибка при добавлении спортсмена');
    } finally {
      setAddingId(null);
    }
  };

  const filteredAthletes = athletes.filter(athlete => {
    const fullName = `${athlete.name} ${athlete.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase());
    const notInTeam = !existingMemberIds.includes(athlete.id);
    return matchesSearch && notInTeam;
  });

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        onClick={onClose}
        size="sm"
      >
        Закрыть
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Добавить спортсмена"
      size="md"
      footer={footer}
    >
      <div className="flex flex-col h-96">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Поиск по имени..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredAthletes.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {searchQuery ? 'Спортсмены не найдены' : 'Нет доступных спортсменов'}
            </p>
          ) : (
            <div className="space-y-2">
              {filteredAthletes.map((athlete) => (
                <div key={athlete.id} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100">
                  <div className="min-w-0 mr-4">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {athlete.name} {athlete.lastName || ''}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{athlete.email}</p>
                  </div>
                  <Button
                    onClick={() => addTeamMember(athlete.id)}
                    disabled={addingId !== null}
                    size="sm"
                    variant="primary"
                    className="!py-1 !px-3"
                  >
                    {addingId === athlete.id ? '...' : 'Добавить'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
