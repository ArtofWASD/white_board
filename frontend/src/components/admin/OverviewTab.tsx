import React, { useEffect, useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useAuthStore } from '../../lib/store/useAuthStore';

export const OverviewTab: React.FC = () => {
  const { token } = useAuthStore();
  
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [registrationHistory, setRegistrationHistory] = useState<any[]>([]);
  const [roleDistribution, setRoleDistribution] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  // Custom colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
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
    
    if (token) {
        fetchStats();
    }
  }, [token]);

  // Calculate retention (mock roughly based on active users vs total)
  const retentionRate = (dashboardStats && dashboardStats.totalUsers > 0) ? Math.round((dashboardStats.activeUsersLast30Days / dashboardStats.totalUsers) * 100) : 0;

  if (loadingStats) {
      return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  if (!dashboardStats) {
      return <div className="text-center text-gray-500">Не удалось загрузить данные</div>;
  }

  return (
    <div className="space-y-6">
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
                              label={({name, percent}) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
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
    </div>
  );
};
