import React, { useState, useEffect } from 'react';
import { Team, User } from '../../types';
import { Card } from '../../components/ui/Card';
import { UserDetailModal } from './UserDetailModal';
import { ListFilters, ViewMode } from '../../components/ui/ListFilters';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface AthleteTeamViewProps {
  teams: Team[];
}

const AthleteTeamView: React.FC<AthleteTeamViewProps & { 
  isTrainer?: boolean;
  onRemoveMember?: (teamId: string, userId: string) => Promise<void>;
  onEditTeam?: (teamId: string) => void;
}> = ({ teams, isTrainer, onRemoveMember, onEditTeam }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const isMobileOrTablet = useMediaQuery('(max-width: 1024px)'); // Adjust breakpoint as needed

  useEffect(() => {
    if (isMobileOrTablet) {
      setViewMode('list');
    }
  }, [isMobileOrTablet]);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  if (teams.length === 0) {
    return (
      <Card className="p-12 text-center max-w-2xl mx-auto mt-8">
        <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Вы пока не состоите в команде</h3>
        <p className="text-gray-500 text-lg leading-relaxed">
          Попросите своего тренера прислать вам ссылку-приглашение или QR-код для вступления в команду.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {teams.map((team) => (
        <Card key={team.id} noPadding className="overflow-hidden border-0 shadow-md">
          {/* Team Header */}
          <div className="p-3 sm:p-6 md:p-8 border-b border-gray-100 bg-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-blue-600 w-2 h-8 rounded-full"></span>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{team.name}</h2>
                  {isTrainer && onEditTeam && (
                     <button 
                       onClick={() => onEditTeam(team.id)}
                       className="ml-2 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all flex-shrink-0"
                       title="Редактировать команду"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                       </svg>
                     </button>
                  )}
                </div>
                {team.description && (
                  <p className="text-gray-500 text-lg max-w-3xl ml-5">{team.description}</p>
                )}
              </div>
              
              <div 
                className="flex items-center bg-gray-50 p-4 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => team.owner && handleUserClick(team.owner)}
              >
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-0.5">Тренер</p>
                  <p className="font-semibold text-gray-900">
                    {team.owner?.name} {team.owner?.lastName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-6 md:p-8">
            <ListFilters
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              hideViewToggle={isMobileOrTablet}
            >
               <div className="flex items-center">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center mr-4">
                    <span className="bg-gray-100 text-gray-600 p-2 rounded-lg mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </span>
                    Состав команды
                  </h3>
                  <span className="text-xs sm:text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    {team.members?.length || 0} участников
                  </span>
               </div>
            </ListFilters>

            {viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {team.members?.map((member) => (
                  <div 
                    key={member.id} 
                    className="relative flex items-center p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-300 hover:bg-white transition-all duration-200 group shadow-sm hover:shadow-md cursor-pointer"
                    onClick={() => handleUserClick(member.user)}
                  >
                    <div className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors shadow-sm">
                      <span className="text-xs font-bold uppercase">
                        {member.user.name.charAt(0)}{member.user.lastName?.charAt(0) || ''}
                      </span>
                    </div>
                    <div className="ml-4 overflow-hidden flex-1">
                      <p className="font-bold text-gray-900 truncate">
                        {member.user.name} {member.user.lastName}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                        {member.role === 'OWNER' ? 'Главный тренер' : member.role === 'ADMIN' ? 'Тренер' : 'Атлет'}
                      </p>
                    </div>
                    {isTrainer && onRemoveMember && member.role !== 'OWNER' && (
                      <button
                        className="ml-2 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Вы уверены, что хотите удалить ${member.user.name} из команды?`)) {
                            onRemoveMember(team.id, member.user.id);
                          }
                        }}
                        title="Удалить из команды"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-2 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Имя
                      </th>
                      <th scope="col" className="px-2 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-2 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Роль
                      </th>
                      {isTrainer && onRemoveMember && (
                        <th scope="col" className="relative px-2 py-2 sm:px-6 sm:py-3">
                          <span className="sr-only">Действия</span>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {team.members?.map((member) => (
                      <tr 
                        key={member.id}
                        className="hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={() => handleUserClick(member.user)}
                      >
                        <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 hidden sm:block">
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold border border-gray-200">
                                {member.user.name.charAt(0)}{member.user.lastName?.charAt(0) || ''}
                              </div>
                            </div>
                            <div className="sm:ml-4">
                              <div className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-900">
                                {member.user.name} {member.user.lastName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-500">{member.user.email}</div>
                        </td>
                        <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                             member.role === 'OWNER' ? 'bg-purple-100 text-purple-800' :
                             member.role === 'ADMIN' ? 'bg-green-100 text-green-800' :
                             'bg-blue-100 text-blue-800'
                          }`}>
                            {member.role === 'OWNER' ? 'Главный тренер' : member.role === 'ADMIN' ? 'Тренер' : 'Спортсмен'}
                          </span>
                        </td>
                        {isTrainer && onRemoveMember && (
                          <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                            {member.role !== 'OWNER' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Вы уверены, что хотите удалить ${member.user.name} из команды?`)) {
                                    onRemoveMember(team.id, member.user.id);
                                  }
                                }}
                                className="inline-flex p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                                title="Удалить из команды"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      ))}

      <UserDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
      />
    </div>
  );
};

export default AthleteTeamView;
