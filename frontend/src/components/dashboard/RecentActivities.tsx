import React from 'react';

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
}

interface Activity {
  id: string;
  type: 'exercise' | 'event';
  name: string;
  value: string;
  date: string;
  originalId: string; // exerciseId or eventId
}

export function RecentActivities({ exercises, events }: RecentActivitiesProps) {
  // Flatten exercise records
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

  // Flatten event results
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

  // Merge and sort by date descending
  const allActivities = [...exerciseActivities, ...eventActivities].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Take top 10
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
    <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Последние активности</h2>
      
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
    </div>
  );
}
