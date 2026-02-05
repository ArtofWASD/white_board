'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { useAuthStore } from '../../../lib/store/useAuthStore';
import { Event, UserEventResult } from '../../../types';
import { Heart, MessageSquare } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';

export default function LeaderboardPage() {
  const { user, token } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [results, setResults] = useState<(UserEventResult & { likes?: { userId: string }[] })[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all events for the selector
  useEffect(() => {
    const fetchEvents = async () => {
      if (user && token) {
        try {
          const response = await fetch(`/api/events?userId=${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            // Filter out events without results if needed, or show all
            setEvents(data);
            if (data.length > 0) {
              setSelectedEventId(data[0].id);
            } else {
              setLoading(false);
            }
          }
        } catch (error) {
          console.error("Failed to fetch events", error);
          setLoading(false);
        }
      }
    };
    fetchEvents();
  }, [user, token]);

  // Fetch results when event is selected
  useEffect(() => {
    const fetchResults = async () => {
      if (selectedEventId && token) {
        setLoading(true);
        // Find selected event details to know the scheme
        const event = events.find(e => e.id === selectedEventId);
        setSelectedEvent(event || null);

        try {
          const response = await fetch(`/api/events/${selectedEventId}/results`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setResults(data);
          }
        } catch (error) {
          console.error("Failed to fetch results", error);
        } finally {
          setLoading(false);
        }
      } else {
          setLoading(false);
      }
    };
    fetchResults();
  }, [selectedEventId, events, token]);

  // Sorting Logic
  const getSortedResults = () => {
    if (!selectedEvent) return [];

    return [...results].sort((a, b) => {
        // 1. Sort by Scaling: RX > SCALED > INDIVIDUAL
        const scalingOrder = { 'RX': 1, 'SCALED': 2, 'INDIVIDUAL': 3 };
        const scalingA = scalingOrder[(a.scaling || 'RX') as keyof typeof scalingOrder] || 2;
        const scalingB = scalingOrder[(b.scaling || 'RX') as keyof typeof scalingOrder] || 2;

        if (scalingA !== scalingB) {
            return scalingA - scalingB;
        }

        // 2. Sort by Value based on Scheme
        // FOR_TIME: Lower is better
        // AMRAP, WEIGHTLIFTING, EMOM: Higher is better
        
        const valA = a.value || 0;
        const valB = b.value || 0;

        if (selectedEvent.scheme === 'FOR_TIME') {
            return valA - valB; // Ascending time
        } else {
            return valB - valA; // Descending reps/weight
        }
    });
  };

  const sortedResults = getSortedResults();

  const formatResultValue = (result: UserEventResult) => {
      if (selectedEvent?.scheme === 'FOR_TIME') {
          return result.time; // Already formatted string
      } else if (selectedEvent?.scheme === 'AMRAP') {
          return `${result.value} reps`;
      } else if (selectedEvent?.scheme === 'WEIGHTLIFTING' || selectedEvent?.scheme === 'EMOM') {
          return `${result.value} kg`;
      }
      return result.time;
  };

  const toggleLike = async (resultId: string) => {
    if (!user || !token) return;

    // Optimistic update
    setResults(prev => prev.map(r => {
        if (r.id === resultId) {
            const isLiked = r.likes?.some(l => l.userId === user.id);
            const newLikes = isLiked 
                ? r.likes?.filter(l => l.userId !== user.id) 
                : [...(r.likes || []), { userId: user.id }];
            
            return { ...r, likes: newLikes };
        }
        return r;
    }));

    try {
        const response = await fetch(`/api/events/results/${resultId}/like`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: user.id })
        });
        
        if (!response.ok) {
            // Revert on failure? For now silent fail or console error
            console.error("Failed to toggle like");
        }
    } catch (error) {
        console.error("Error toggling like", error);
    }
  };

  // Comment Logic
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [resultToComment, setResultToComment] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  const openCommentModal = (resultId: string) => {
      setResultToComment(resultId);
      setCommentText('');
      setCommentModalOpen(true);
  };

  const handleSaveComment = async () => {
      if (!user || !resultToComment || !commentText.trim() || sendingComment) return;
      setSendingComment(true);

      const formattedName = `${user.name} ${user.lastName ? user.lastName.charAt(0) : ''}`;
      const finalNote = `${formattedName}: ${commentText}`;

      // Optimistic update
      setResults(prev => prev.map(r => {
          if (r.id === resultToComment) {
              return { ...r, notes: finalNote };
          }
          return r;
      }));

      try {
          const response = await fetch(`/api/events/results/${resultToComment}/notes`, {
              method: 'POST',
              headers: { 
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ notes: finalNote, userId: user.id })
          });
          
          if (!response.ok) {
              const errText = await response.text();
              console.error(`Failed to save comment: ${response.status} ${errText}`);
              // Revert optimistic update if needed?
          }
      } catch (error) {
          console.error("Error saving comment", error);
      } finally {
          setSendingComment(false);
          setCommentModalOpen(false);
          setResultToComment(null);
      }
  };

  const getRowStyle = (index: number) => {
      // Pastel colors with transparency
      if (index === 0) return 'bg-yellow-100/40 hover:bg-yellow-100/60'; // Gold
      if (index === 1) return 'bg-gray-100/60 hover:bg-gray-200/60'; // Silver
      if (index === 2) return 'bg-orange-100/40 hover:bg-orange-100/60'; // Bronze
      return 'hover:bg-gray-50';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Лидерборд</h1>
        <div className="w-full sm:w-64">
             {events.length > 0 ? (
                <select 
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {events.map(event => (
                        <option key={event.id} value={event.id}>
                            {event.title} ({new Date(event.eventDate).toLocaleDateString()})
                        </option>
                    ))}
                </select>
             ) : (
                 <div className="text-sm text-gray-500">Нет доступных событий</div>
             )}
        </div>
      </div>

      <Card className="overflow-hidden" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wider w-20 text-center">
                  #
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Атлет
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">
                  Результат
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wider text-center">
                  Категория
                </th>


                <th className="py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-24">
                  {/* Actions */}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                  // Skeleton state
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                        <td className="py-4 px-6"><div className="h-4 w-4 bg-gray-200 rounded mx-auto"></div></td>
                        <td className="py-4 px-6"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                        <td className="py-4 px-6"><div className="h-4 w-16 bg-gray-200 rounded ml-auto"></div></td>
                        <td className="py-4 px-6"><div className="h-4 w-12 bg-gray-200 rounded mx-auto"></div></td>

                    </tr>
                  ))
              ) : sortedResults.length > 0 ? (
                  sortedResults.map((result, index) => (
                    <tr key={result.id} className={`${getRowStyle(index)} transition-colors`}>
                      <td className="py-4 px-6 text-center text-gray-500 font-medium">
                        {index + 1}
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-900">
                        {result.username}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-gray-800">
                        {formatResultValue(result)}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                           ${result.scaling === 'RX' ? 'bg-blue-100 text-blue-800' : 
                             result.scaling === 'SCALED' ? 'bg-green-100 text-green-800' : 
                             'bg-yellow-100 text-yellow-800'}`}>
                           {result.scaling || 'RX'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-end gap-3 pr-8">
                            <button
                                onClick={() => openCommentModal(result.id)}
                                className="text-gray-400 hover:text-blue-500 transition-colors focus:outline-none"
                                title="Оставить комментарий"
                            >
                                <MessageSquare size={20} />
                            </button>
                            
                            <div className="relative flex items-center">
                                <button 
                                    onClick={() => toggleLike(result.id)}
                                    className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                >
                                    <Heart 
                                        size={20} 
                                        className={`${
                                            result.likes?.some(l => l.userId === user?.id) 
                                            ? 'fill-red-500 text-red-500' 
                                            : 'text-gray-300 hover:text-red-500'
                                        }`}
                                    />
                                </button>
                                {result.likes && result.likes.length > 0 && (
                                    <span className="absolute left-full ml-1 text-xs text-gray-500 font-medium whitespace-nowrap">
                                        {result.likes.length}
                                    </span>
                                )}
                            </div>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                        Нет результатов для этого события
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Comment Modal */}
      <Modal
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        title="Оставить комментарий"
        size="sm"
      >
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Комментарий
                </label>
                <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    placeholder="Введите текст..."
                />
                <p className="text-xs text-gray-500 mt-1">
                    Ваше имя будет добавлено автоматически: {user?.name} {user?.lastName ? user.lastName.charAt(0) : ''}
                </p>
            </div>
            <div className="flex justify-end gap-2">
                <button
                    onClick={() => setCommentModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                    Отмена
                </button>
                <button
                    onClick={handleSaveComment}
                    className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 ${sendingComment ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!commentText.trim() || sendingComment}
                >
                    {sendingComment ? 'Отправка...' : 'Отправить'}
                </button>
            </div>
        </div>
      </Modal>
    </div>
  );
}
