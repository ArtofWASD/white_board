import React, { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { Modal } from '../ui/Modal';
import { User } from '../../types';

export const UsersTab: React.FC = () => {
  const { user, token } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Action states
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
        if (!token) return;
        try {
            const res = await fetch('/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                console.error('Failed to fetch users');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingUsers(false);
        }
    };
    fetchUsers();
  }, [token]);

  const openRoleModal = (u: any) => {
      setSelectedUser(u);
      setNewRole(u.role);
      setIsRoleModalOpen(true);
  };

  const handleUpdateRole = async () => {
      if (!selectedUser || !newRole) return;
      
      setActionLoading(true);
      // Optimistic update
      const oldUsers = [...users];
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, role: newRole as any } : u));
      
      try {
          const res = await fetch(`/api/users/${selectedUser.id}/role`, {
              method: 'PATCH',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ role: newRole })
          });
          if (!res.ok) {
              setUsers(oldUsers);
              alert('Не удалось обновить роль');
          }
           setIsRoleModalOpen(false);
           setSelectedUser(null);
      } catch (e) {
          setUsers(oldUsers);
          alert('Ошибка обновления роли');
      } finally {
        setActionLoading(false);
      }
  };

  const handleToggleBlock = async (u: any) => {
      if (!confirm(`Вы уверены, что хотите ${u.isBlocked ? 'разблокировать' : 'заблокировать'} пользователя ${u.email}?`)) return;

      const newStatus = !u.isBlocked;
      const oldUsers = [...users];
      setUsers(users.map(user => user.id === u.id ? { ...user, isBlocked: newStatus } : user));

      try {
          const res = await fetch(`/api/users/${u.id}`, {
              method: 'PATCH',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ isBlocked: newStatus })
          });

          if (!res.ok) {
              setUsers(oldUsers);
              alert('Не удалось изменить статус блокировки');
          }
      } catch (e) {
           setUsers(oldUsers);
           alert('Ошибка запроса');
      }
  };

  const handleDeleteUser = async (u: any) => {
      if (!confirm(`Вы уверены, что хотите УДАЛИТЬ пользователя ${u.email}? Это действие необратимо.`)) return;
      
       const oldUsers = [...users];
       setUsers(users.filter(user => user.id !== u.id));

       try {
          const res = await fetch(`/api/users/${u.id}`, {
              method: 'DELETE',
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          
          if (!res.ok) {
              setUsers(oldUsers);
              alert('Не удалось удалить пользователя');
          }
       } catch (e) {
           setUsers(oldUsers);
           alert('Ошибка при удалении');
       }
  };

  const roleTranslations: { [key: string]: string } = {
      'ATHLETE': 'Атлет',
      'TRAINER': 'Тренер',
      'ORGANIZATION_ADMIN': 'Админ Организации',
      'SUPER_ADMIN': 'Супер Админ'
  };

  const getRoleName = (role: string) => roleTranslations[role] || role;

  const filteredUsers = useMemo(() => {
      return users.filter(u => {
          if (user && u.id === user.id) return false; // Don't show current user

          const matchesSearch = (
              (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
              (u.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
              (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
          );
          const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
          return matchesSearch && matchesRole;
      });
  }, [users, searchTerm, roleFilter, user]);

  if (loadingUsers) {
      return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Поиск по имени, фамилии или email..." 
            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
              <option value="ALL">Все роли</option>
              <option value="ATHLETE">Атлет</option>
              <option value="TRAINER">Тренер</option>
              <option value="ORGANIZATION_ADMIN">Админ Организации</option>
              <option value="SUPER_ADMIN">Супер Админ</option>
          </select>
      </div>

      {/* Mobile View (Cards) */}
      <div className="md:hidden space-y-4 p-4">
          {filteredUsers.map(u => (
              <div key={u.id} className={`bg-white rounded-lg shadow p-4 ${u.isBlocked ? 'opacity-75' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                          <div className={`h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold mr-3 ${u.isBlocked ? 'bg-gray-200 text-gray-500' : 'bg-indigo-100 text-indigo-600'}`}>
                              {(u.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                              <p className="text-gray-900 font-medium">{u.name} {u.lastName}</p>
                              {u.isBlocked && <span className="text-xs text-red-500 font-bold">(Блок)</span>}
                          </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full
                          ${u.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-800' : 
                            u.role === 'ORGANIZATION_ADMIN' ? 'bg-purple-100 text-purple-800' : 
                            u.role === 'TRAINER' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {getRoleName(u.role)}
                      </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-3">{u.email}</p>
                  <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                      <button onClick={() => openRoleModal(u)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Роль</button>
                      <button onClick={() => handleToggleBlock(u)} className={`${u.isBlocked ? 'text-green-600' : 'text-orange-500'} hover:opacity-80 text-sm font-medium`}>
                          {u.isBlocked ? 'Разблок.' : 'Блок.'}
                      </button>
                      <button onClick={() => handleDeleteUser(u)} className="text-red-600 hover:text-red-900 text-sm font-medium">Удалить</button>
                  </div>
              </div>
          ))}
      </div>

      {/* Desktop View (Table) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full leading-normal">
            <thead>
                <tr>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Пользователь</th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Текущая Роль</th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Действия</th>
                </tr>
            </thead>
            <tbody>
                {filteredUsers.map(u => (
                    <tr key={u.id} className={u.isBlocked ? 'bg-gray-50 opacity-75' : ''}>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <div className="flex items-center">
                                <div className={`h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold ${u.isBlocked ? 'bg-gray-200 text-gray-500' : 'bg-indigo-100 text-indigo-600'}`}>
                                    {(u.name || '?').charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-3">
                                    <p className="text-gray-900 whitespace-no-wrap font-medium">
                                        {u.name} {u.lastName}
                                        {u.isBlocked && <span className="ml-2 text-xs text-red-500 font-bold">(Заблокирован)</span>}
                                    </p>
                                    <p className="text-gray-500 text-xs">{u.id}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <p className="text-gray-900 whitespace-no-wrap">{u.email}</p>
                        </td>
                         <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <span className={`relative inline-block px-3 py-1 font-semibold leading-tight text-white rounded-full text-xs
                                ${u.role === 'SUPER_ADMIN' ? 'bg-red-500' : 
                                  u.role === 'ORGANIZATION_ADMIN' ? 'bg-purple-500' : 
                                  u.role === 'TRAINER' ? 'bg-blue-500' : 'bg-green-500'}`}>
                                {getRoleName(u.role)}
                            </span>
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                            <div className="flex justify-center items-center gap-4">
                                <button 
                                    onClick={() => openRoleModal(u)} 
                                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors" 
                                    title="Сменить роль"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                                
                                <button 
                                    onClick={() => handleToggleBlock(u)} 
                                    className={`${u.isBlocked ? 'text-green-600 hover:text-green-900' : 'text-orange-500 hover:text-orange-700'} p-1 rounded hover:bg-gray-100 transition-colors`} 
                                    title={u.isBlocked ? "Разблокировать" : "Заблокировать"}
                                >
                                    {u.isBlocked ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>
                                    )}
                                </button>

                                <button 
                                    onClick={() => handleDeleteUser(u)} 
                                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors" 
                                    title="Удалить"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {filteredUsers.length === 0 && (
            <div className="bg-white p-8 text-center text-gray-500">
                Пользователи не найдены
            </div>
        )}
      </div>

      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Смена роли пользователя"
        size="sm"
        footer={
            <div className="flex justify-end gap-2">
                 <button 
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
                    onClick={() => setIsRoleModalOpen(false)}
                    disabled={actionLoading}
                 >
                     Отмена
                 </button>
                <button 
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition disabled:opacity-50"
                    onClick={handleUpdateRole}
                    disabled={actionLoading}
                >
                    {actionLoading ? 'Сохранение...' : 'Сохранить'}
                </button>
            </div>
        }
      >
        <div className="space-y-4">
            {selectedUser && (
                <p className="text-sm text-gray-600">
                    Выберите новую роль для пользователя <strong>{selectedUser.name} {selectedUser.lastName}</strong> ({selectedUser.email})
                </p>
            )}
             <select 
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="block w-full bg-white border border-gray-300 hover:border-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
                <option value="ATHLETE">Атлет</option>
                <option value="TRAINER">Тренер</option>
                <option value="ORGANIZATION_ADMIN">Админ Организации</option>
            </select>
        </div>
      </Modal>
    </div>
  );
};
