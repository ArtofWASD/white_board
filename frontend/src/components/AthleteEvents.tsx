'use client';

import React, { useState, useEffect } from 'react';
import { Event } from '../types';
import AddEventForm from './AddEventForm';

interface AthleteEventsProps {
  userId: string;
}

export default function AthleteEvents({ userId }: AthleteEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // API call to fetch events
        const response = await fetch(`/api/events?userId=${userId}`);
        const data = await response.json();
        
        if (response.ok) {
          setEvents(data);
        } else {
          setError(data.message || 'Failed to fetch events');
        }
      } catch (err) {
        setError('Failed to fetch events');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchEvents();
    }
  }, [userId]);

  const updateEventStatus = async (eventId: string, status: 'past' | 'future') => {
    try {
      const response = await fetch(`/api/events/${eventId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Update the event in the local state
        setEvents(events.map(event => 
          event.id === eventId ? { ...event, status } : event
        ));
      } else {
        setError(data.message || 'Failed to update event status');
      }
    } catch (err) {
      setError('Failed to update event status');
      console.error(err);
    }
  };

  const handleEventAdded = (newEvent: Event) => {
    setEvents([newEvent, ...events]);
  };

  if (loading) {
    return <div className="text-center py-4">Загрузка событий...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Ошибка: {error}</div>;
  }

  // Create a minimal user object for AddEventForm
  const user = { id: userId, name: '', email: '' };

  const futureEvents = events.filter(event => event.status === 'future');
  const pastEvents = events.filter(event => event.status === 'past');

  return (
    <div className="space-y-6">
      <AddEventForm user={user} onSubmit={(title, exerciseType, exercises) => {
        // Handle form submission
        // This is a simplified version - you might want to implement proper event creation logic here
      }} />
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Предстоящие события</h3>
        {futureEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {futureEvents.map(event => (
              <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-lg">{event.title}</h4>
                <p className="text-gray-600">{event.description}</p>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Дата: {new Date(event.eventDate).toLocaleDateString('ru-RU')}</p>
                  {event.exerciseType && <p>Тип: {event.exerciseType}</p>}
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => updateEventStatus(event.id, 'past')}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition duration-300"
                  >
                    Отметить как прошедшее
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Нет предстоящих событий</p>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Прошедшие события</h3>
        {pastEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastEvents.map(event => (
              <div key={event.id} className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold text-lg">{event.title}</h4>
                <p className="text-gray-600">{event.description}</p>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Дата: {new Date(event.eventDate).toLocaleDateString('ru-RU')}</p>
                  {event.exerciseType && <p>Тип: {event.exerciseType}</p>}
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => updateEventStatus(event.id, 'future')}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition duration-300"
                  >
                    Отметить как предстоящее
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Нет прошедших событий</p>
        )}
      </div>
    </div>
  );
}