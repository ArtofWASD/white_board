import React from 'react';
import { useTeamStore } from '../../lib/store/useTeamStore';
import { Team } from '../../types';

interface TeamSelectorProps {
  selectedTeamId: string | null;
  onSelectTeam: (teamId: string | null) => void;
  className?: string;
}

const TeamSelector: React.FC<TeamSelectorProps> = ({ selectedTeamId, onSelectTeam, className = '' }) => {
  const { teams } = useTeamStore();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <label htmlFor="team-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
        Команда:
      </label>
      <select
        id="team-select"
        value={selectedTeamId || ''}
        onChange={(e) => onSelectTeam(e.target.value === '' ? null : e.target.value)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
      >
        <option value="">Все события (Мои + Организация)</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TeamSelector;
