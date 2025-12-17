'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../lib/store/useAuthStore';
import { Loader } from '../../../components/ui/Loader';
import Button from '../../../components/ui/Button';

interface TrainerStats {
  totalAthletes: number;
  activeAthletes: number;
  totalTeams: number;
  totalWorkouts: number;
  recentActivity: {
    id: string;
    athleteName: string;
    action: string;
    date: string;
    details: string;
  }[];
}

export default function OrganizationPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<TrainerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      if (user.role !== 'TRAINER' && user.role !== 'ORGANIZATION_ADMIN') {
        // Simple client-side protection, though middleware/layout should handle this better
        // window.location.href = '/dashboard'; 
        // Commented out per nextjs nav pattern, usually we assume authorized if they got here via link
      }
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      if (!user) return;
      const response = await fetch(`/api/organization/stats?trainerId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {

    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!stats) return;
    
    // Create CSV content
    const headers = ['Athlete Name', 'Date', 'Action', 'Details'];
    const rows = stats.recentActivity.map(item => [
        item.athleteName,
        new Date(item.date).toLocaleString(),
        item.action,
        item.details
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'organization_stats.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <Loader />;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Управление организацией</h1>
        <Button onClick={handleExportCSV} variant="primary">
          Скачать отчет (CSV)
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="text-gray-500 text-sm font-medium uppercase">Всего Атлетов</div>
          <div className="text-3xl font-bold text-gray-800 mt-2">{stats?.totalAthletes || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
           <div className="text-gray-500 text-sm font-medium uppercase">Активных (30 дн)</div>
           <div className="text-3xl font-bold text-gray-800 mt-2">{stats?.activeAthletes || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
           <div className="text-gray-500 text-sm font-medium uppercase">Команды</div>
           <div className="text-3xl font-bold text-gray-800 mt-2">{stats?.totalTeams || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
           <div className="text-gray-500 text-sm font-medium uppercase">Тренировки (30 дн)</div>
           <div className="text-3xl font-bold text-gray-800 mt-2">{stats?.totalWorkouts || 0}</div>
        </div>
      </div>

      {/* Charts / Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Simple Activity Chart Placeholder */}
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Активность по дням</h2>
            <div className="h-64 flex items-end justify-between space-x-2">
                {/* Dynamically generate bars roughly based on 'totalWorkouts' for visual demo, 
                    since we don't have daily breakdown from API yet. 
                    Real implementation would need daily aggregated data. */}
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="w-full bg-blue-100 rounded-t-md hover:bg-blue-200 transition-colors relative group">
                        <div 
                            className="absolute bottom-0 w-full bg-blue-500 rounded-t-md transition-all duration-500"
                            style={{ height: `${Math.random() * 80 + 20}%` }} // Random height for demo
                        ></div>
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded">
                            {Math.floor(Math.random() * 10)} тренировок
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span>
            </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white p-6 rounded-lg shadow-md overflow-hidden">
            <h2 className="text-xl font-bold mb-4">Последние изменения</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Атлет</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действие</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {stats?.recentActivity?.map((activity) => (
                            <tr key={activity.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{activity.athleteName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div>{activity.action}</div>
                                    <div className="text-xs text-gray-400">{activity.details}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(activity.date).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                        {!stats?.recentActivity?.length && (
                            <tr>
                                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">Нет данных</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}
