import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../ui/Button';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { Loader } from '../ui/Loader';

interface TrainerStats {
  totalAthletes: number;
  activeAthletes: number;
  totalTeam: number;
  totalWorkouts: number;
  recentActivity: {
    id: string;
    athleteName: string;
    action: string;
    date: string;
    details: string;
  }[];
}

export function TrainerStatsWidget() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<TrainerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Организация</h2>
        <Button 
          onClick={() => router.push('/dashboard/organization')}
          variant="outline"
          size="sm"
        >
          Управление
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-600">{stats?.totalAthletes || 0}</div>
            <div className="text-sm text-gray-600">Всего атлетов</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-600">{stats?.activeAthletes || 0}</div>
            <div className="text-sm text-gray-600">Активных (30 дн)</div>
        </div>
      </div>

      <h3 className="font-semibold text-gray-700 mb-3">Последние тренировки</h3>
      
      <div className="flex-1 overflow-y-auto min-h-0 pr-2">
        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                <div className="flex justify-between mb-1">
                    <span className="font-semibold text-gray-900">{activity.athleteName}</span>
                    <span className="text-gray-500 text-xs">{formatDate(activity.date)}</span>
                </div>
                <div className="text-gray-700">{activity.action}</div>
                <div className="text-gray-500 text-xs mt-1">{activity.details}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 text-sm">
            Нет активностей
          </div>
        )}
      </div>
    </div>
  );
}
