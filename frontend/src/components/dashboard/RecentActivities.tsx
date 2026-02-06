import React, { useState } from 'react';

interface Exercise {
  id: string;
  name: string;
  records: {
    id: string;
    weight: number;
    date: string;
  }[];
}

interface EventResult {
  id: string;
  time: string;
  dateAdded: string;
  username: string;
}

interface Event {
  id: string;
  title: string;
  results: EventResult[];
}

interface RecentActivitiesProps {
  exercises: Exercise[];
  events: Event[];
  isExpanded?: boolean;
  onToggle?: () => void;
}

interface Activity {
  id: string;
  type: 'exercise' | 'event';
  name: string;
  value: string;
  date: string;
  originalId: string; // ID упражнения или ID события
}

export function RecentActivities({ exercises, events, isExpanded = true, onToggle }: RecentActivitiesProps) {
  // const [isCollapsed, setIsCollapsed] = useState(false);
  // Разворачивание записей упражнений
  const exerciseActivities: Activity[] = exercises.flatMap((exercise) => 
    exercise.records.map((record) => ({
      id: record.id,
      type: 'exercise',
      name: exercise.name,
      value: `${record.weight} кг`,
      date: record.date,
      originalId: exercise.id,
    }))
  );

  // Разворачивание результатов событий
  const eventActivities: Activity[] = events.flatMap((event) => 
    event.results.map((result) => ({
      id: result.id,
      type: 'event',
      name: event.title,
      value: result.time,
      date: result.dateAdded,
      originalId: event.id,
    }))
  );

  // Объединение и сортировка по убыванию даты
  const allActivities = [...exerciseActivities, ...eventActivities].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Взять топ-10
  const recentActivities = allActivities.slice(0, 10);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md h-full flex flex-col transition-all duration-300 ${!isExpanded ? 'overflow-hidden justify-center px-4' : 'p-6'}`}>
      <div className={`flex justify-between items-center ${!isExpanded ? '' : 'mb-6'}`}>
        <h2 className={`font-bold text-gray-800 transition-all ${!isExpanded ? 'text-lg' : 'text-2xl'}`}>Последние активности</h2>
        <button 
          onClick={onToggle}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
          title={!isExpanded ? "Развернуть" : "Свернуть"}
          onPointerDown={(e) => e.stopPropagation()} 
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={`transform transition-transform duration-200 ${!isExpanded ? 'rotate-180' : ''}`}
          >
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
      </div>

      {isExpanded && (
       <>
      
      <div className="flex-1 overflow-y-auto min-h-0 pr-2">
        {recentActivities.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Нет недавних активностей
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div 
                key={`${activity.type}-${activity.id}`} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-gray-800">{activity.name}</h3>
                  <p className="text-sm text-gray-500">
                    {activity.type === 'event' ? 'Событие' : 'Упражнение'} • {formatDate(activity.date)}
                  </p>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {activity.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
}
