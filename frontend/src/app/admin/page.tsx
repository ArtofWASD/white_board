'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { User } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts';

export default function AdminDashboard() {
  const { user, isAuthenticated, token, isLoading } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]); // Use any to accommodate createdAt if missing in User type
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'settings'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Action states
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isLoading) {
       if (!isAuthenticated) {
          router.push('/login');
       } else if (user && user.role !== 'SUPER_ADMIN') {
          router.push('/dashboard');
       }
    }
  }, [isLoading, isAuthenticated, user, router]);

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
    if (user?.role === 'SUPER_ADMIN') {
        fetchUsers();
    } else if (!isLoading && !user) {
        setLoadingUsers(false);
    }
  }, [user, token, isLoading]);

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

  // Settings state
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loadingSettings, setLoadingSettings] = useState(false);

  useEffect(() => {
     if (activeTab === 'settings' && user?.role === 'SUPER_ADMIN') {
         fetchSettings();
     }
  }, [activeTab, user]);

  const fetchSettings = async () => {
      setLoadingSettings(true);
      try {
          const res = await fetch('/api/settings', {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
              const data = await res.json();
              // Convert array to object
              const settingsMap: Record<string, string> = {};
              data.forEach((s: any) => settingsMap[s.key] = s.value);
              setSettings(settingsMap);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setLoadingSettings(false);
      }
  };

  const handleUpdateSetting = async (key: string, value: string) => {
      // Optimistic update
      setSettings(prev => ({ ...prev, [key]: value }));
      
      try {
          await fetch(`/api/settings/${key}`, {
              method: 'PATCH',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ value })
          });
      } catch (e) {
          console.error(e);
          alert('Ошибка сохранения настройки');
          fetchSettings(); // Revert
      }
  };



  // Statistics state
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [registrationHistory, setRegistrationHistory] = useState<any[]>([]);
  const [roleDistribution, setRoleDistribution] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (activeTab === 'overview' && user?.role === 'SUPER_ADMIN') {
        fetchStats();
    }
  }, [activeTab, user]);

  const fetchStats = async () => {
      setLoadingStats(true);
      try {
          const [statsRes, historyRes, rolesRes] = await Promise.all([
              fetch('/api/statistics/dashboard', { headers: { 'Authorization': `Bearer ${token}` } }),
              fetch('/api/statistics/registrations', { headers: { 'Authorization': `Bearer ${token}` } }),
              fetch('/api/statistics/roles', { headers: { 'Authorization': `Bearer ${token}` } })
          ]);

          if (statsRes.ok) setDashboardStats(await statsRes.json());
          if (historyRes.ok) setRegistrationHistory(await historyRes.json());
          if (rolesRes.ok) setRoleDistribution(await rolesRes.json());
      } catch (e) {
          console.error(e);
      } finally {
          setLoadingStats(false);
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

  const stats = useMemo(() => {
      const totalUsers = users.length;
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      const newUsers = users.filter(u => new Date(u.createdAt) >= thirtyDaysAgo).length;
      return { totalUsers, newUsers };
  }, [users]);

  // Custom colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Calculate retention (mock roughly based on active users vs total)
  const retentionRate = (dashboardStats && dashboardStats.totalUsers > 0) ? Math.round((dashboardStats.activeUsersLast30Days / dashboardStats.totalUsers) * 100) : 0;

  if (loadingUsers && user?.role !== 'SUPER_ADMIN') {
      return <div className="min-h-screen flex items-center justify-center bg-gray-100">Загрузка...</div>;
  }

  if (user?.role !== 'SUPER_ADMIN') {
      return null; 
  }

  return (
      <div className="flex h-screen bg-gray-100 font-sans">
          {/* Sidebar */}
          <div className={`w-64 bg-white shadow-md flex-shrink-0 fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className="p-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-indigo-600">Admin</h2>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
              </div>
              <nav className="mt-6">
                  {/* ... same nav items ... */}
                  <a href="#" onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }} className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${activeTab === 'overview' ? 'bg-gray-100 border-r-4 border-indigo-600' : ''}`}>
                      <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Обзор
                  </a>
                  <a href="#" onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); }} className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${activeTab === 'users' ? 'bg-gray-100 border-r-4 border-indigo-600' : ''}`}>
                      <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Пользователи
                  </a>
                  <a href="#" onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${activeTab === 'settings' ? 'bg-gray-100 border-r-4 border-indigo-600' : ''}`}>
                       <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                       </svg>
                       Настройки
                  </a>
                  <a href="/" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
                      <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      На сайт
                  </a>
              </nav>
          </div>

          {/* Overlay */}
          {isMobileMenuOpen && (
              <div 
                  className="fixed inset-0 z-20 bg-black opacity-50 md:hidden"
                  onClick={() => setIsMobileMenuOpen(false)}
              ></div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
              <header className="flex justify-between items-center py-4 px-6 bg-white border-b-2 border-gray-200">
                  <div className="flex items-center">
                       <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden text-gray-500 focus:outline-none focus:text-gray-600 mr-4"
                       >
                           <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                           </svg>
                       </button>
                       <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
                           {activeTab === 'overview' && 'Обзор Системы'}
                           {activeTab === 'users' && 'Управление Пользователями'}
                           {activeTab === 'settings' && 'Настройки'}
                       </h1>
                  </div>
                  
                  <div className="flex items-center">
                      <div className="flex items-center gap-3">
                          <div className="text-right hidden sm:block">
                              <p className="text-sm font-semibold text-gray-700">{user?.name} {user?.lastName}</p>
                              <p className="text-xs text-indigo-600 font-bold tracking-wide">{user?.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : user?.role}</p>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shadow-lg">
                             {(user?.name || '?').charAt(0).toUpperCase()}
                          </div>
                      </div>
                  </div>
              </header>

              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                      {loadingStats ? (
                          <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
                      ) : dashboardStats ? (
                          <>
                              {/* Stats Cards */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                                      <div className="flex items-center">
                                          <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                                              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                              </svg>
                                          </div>
                                          <div className="ml-4">
                                              <p className="mb-2 text-sm font-medium text-gray-600">Всего пользователей</p>
                                              <p className="text-3xl font-semibold text-gray-700">{dashboardStats.totalUsers}</p>
                                          </div>
                                      </div>
                                  </div>

                                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                                      <div className="flex items-center">
                                          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                             <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                              </svg>
                                          </div>
                                          <div className="ml-4">
                                              <p className="mb-2 text-sm font-medium text-gray-600">Организаций</p>
                                              <p className="text-3xl font-semibold text-gray-700">{dashboardStats.totalOrganizations}</p>
                                          </div>
                                      </div>
                                  </div>

                                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                                      <div className="flex items-center">
                                          <div className="p-3 rounded-full bg-green-100 text-green-600">
                                              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                              </svg>
                                          </div>
                                          <div className="ml-4">
                                              <p className="mb-2 text-sm font-medium text-gray-600">Всего событий</p>
                                              <p className="text-3xl font-semibold text-gray-700">{dashboardStats.totalEvents}</p>
                                          </div>
                                      </div>
                                  </div>

                                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                                      <div className="flex items-center">
                                          <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                                              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                              </svg>
                                          </div>
                                          <div className="ml-4">
                                              <p className="mb-2 text-sm font-medium text-gray-600">Активность (30 дн)</p>
                                              <p className="text-3xl font-semibold text-gray-700">{dashboardStats.activeUsersLast30Days} <span className="text-xs text-gray-400">({retentionRate}%)</span></p>
                                          </div>
                                      </div>
                                  </div>
                              </div>

                              {/* Charts Row 1 */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                      <h3 className="text-lg font-semibold mb-4 text-gray-700">Динамика Регистраций (30 дней)</h3>
                                      <div className="h-64">
                                          <ResponsiveContainer width="100%" height="100%">
                                              <LineChart data={registrationHistory}>
                                                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                  <XAxis dataKey="date" tick={{fontSize: 12}} tickFormatter={(value) => value.split('-').slice(1).join('/')} />
                                                  <YAxis allowDecimals={false} />
                                                  <Tooltip />
                                                  <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={2} activeDot={{ r: 8 }} name="Новые пользователи" />
                                              </LineChart>
                                          </ResponsiveContainer>
                                      </div>
                                  </div>

                                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                       <h3 className="text-lg font-semibold mb-4 text-gray-700">Распределение Ролей</h3>
                                       <div className="h-64 flex justify-center">
                                          <ResponsiveContainer width="100%" height="100%">
                                              <PieChart>
                                                  <Pie
                                                    data={roleDistribution}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                  >
                                                    {roleDistribution.map((entry, index) => (
                                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                  </Pie>
                                                  <Tooltip />
                                                  <Legend verticalAlign="bottom" height={36}/>
                                              </PieChart>
                                          </ResponsiveContainer>
                                       </div>
                                  </div>
                              </div>
                          </>
                      ) : (
                          <div className="text-center text-gray-500">Не удалось загрузить данные</div>
                      )}
                  </div>
                )}

            {activeTab === 'users' && (
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
                </div>
            )}
            
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

             {activeTab === 'settings' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-6 text-gray-800">Настройки Системы (Feature Flags)</h3>
                    
                    {loadingSettings ? (
                        <div className="flex justify-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
                    ) : (
                        <div className="space-y-6">
                            <div className="border-b pb-4">
                                <h4 className="font-medium text-gray-700 mb-4">Регистрация пользователей</h4>
                                <div className="space-y-4">
                                    {[
                                        { key: 'REGISTRATION_ATHLETE', label: 'Разрешить регистрацию Атлетов' },
                                        { key: 'REGISTRATION_TRAINER', label: 'Разрешить регистрацию Тренеров' },
                                        { key: 'REGISTRATION_ORGANIZATION', label: 'Разрешить регистрацию Организаций' },
                                    ].map(({ key, label }) => (
                                        <div key={key} className="flex items-center justify-between">
                                            <span className="text-gray-600">{label}</span>
                                            <button 
                                                onClick={() => handleUpdateSetting(key, settings[key] === 'true' ? 'false' : 'true')}
                                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${settings[key] === 'true' ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                            >
                                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings[key] === 'true' ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-700 mb-4">Обслуживание</h4>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-gray-600 block">Режим технического обслуживания</span>
                                        <span className="text-xs text-gray-400">Блокирует доступ для всех кроме админов</span>
                                    </div>
                                    <button 
                                        onClick={() => handleUpdateSetting('MAINTENANCE_MODE', settings['MAINTENANCE_MODE'] === 'true' ? 'false' : 'true')}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 ${settings['MAINTENANCE_MODE'] === 'true' ? 'bg-red-600' : 'bg-gray-200'}`}
                                    >
                                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings['MAINTENANCE_MODE'] === 'true' ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            </main>
          </div>
      </div>
  );
}
