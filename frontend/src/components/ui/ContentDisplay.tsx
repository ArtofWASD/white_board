import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AddToCalendarModal } from '../dashboard/AddToCalendarModal';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useToast } from '@/lib/context/ToastContext';

interface ContentItem {
  id: string;
  title: string; // or name
  content?: string; // for news
  description?: string; // for workouts/exercises
  imageUrl?: string; // for news
  videoUrl?: string; // for exercises
  date?: string; // for news/workouts
  type?: string; // for wods girl/hero
}

interface ContentDisplayProps {
  items: ContentItem[];
  viewMode: 'grid' | 'list';
  type: 'news' | 'workout' | 'exercise';
}

export function ContentDisplay({ items, viewMode, type }: ContentDisplayProps) {
  const { user } = useAuthStore();
  const { success, error: toastError } = useToast();
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calendarModalData, setCalendarModalData] = useState<{title: string, description: string} | null>(null);

  const openCalendarModal = (item: ContentItem) => {
    setCalendarModalData({ 
        title: item.title, 
        description: item.description || item.content || '' 
    });
    setIsCalendarModalOpen(true);
  };

  const handleAddToCalendar = async (date: Date) => {
    if (!user || !calendarModalData) return;
    
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          title: calendarModalData.title,
          description: calendarModalData.description,
          eventDate: date.toISOString(),
          exerciseType: type === 'workout' ? 'wod' : 'exercise', // Simple differentiation
        }),
      });

      if (response.ok) {
        success('Событие добавлено в календарь');
      } else {
        toastError('Не удалось добавить событие');
      }
    } catch (error) {
      toastError('Ошибка при добавлении события');
    }
  };

  const renderStars = () => (
    <div className="flex text-yellow-400">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  return (
    <>
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-4'}>
        {items.map((item) => (
          <div 
            key={item.id} 
            className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 ${
                viewMode === 'list' ? 'flex flex-row items-center p-4' : 'flex flex-col'
            }`}
          >
            {/* Image for News or Video Thumbnail for Exercises (Placeholder logic) */}
            {type === 'news' && item.imageUrl && viewMode === 'grid' && (
                <div className="h-48 w-full relative">
                    <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                </div>
            )}
            
            <div className={`flex-1 ${viewMode === 'grid' ? 'p-6' : 'pl-4'}`}>
              <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                  {/* Visually display stars for workouts and exercises */}
                  {(type === 'workout' || type === 'exercise') && renderStars()}
              </div>
              
              <div className="text-gray-600 mb-4 line-clamp-3">
                  {type === 'news' ? item.content?.substring(0, 150) + '...' : item.description}
              </div>

              {type === 'news' && item.date && (
                   <div className="text-sm text-gray-500 mb-4">{new Date(item.date).toLocaleDateString('ru-RU')}</div>
              )}

              <div className="flex justify-between items-center mt-auto">
                {type === 'news' ? (
                   <Link href={`/blog/news/${item.id}`} className="text-indigo-600 font-medium hover:text-indigo-800">
                     Читать далее →
                   </Link>
                ) : (
                    <button 
                        onClick={() => openCalendarModal(item)}
                        className="flex items-center space-x-2 text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Добавить в календарь</span>
                    </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

       {calendarModalData && (
        <AddToCalendarModal
            isOpen={isCalendarModalOpen}
            onClose={() => setIsCalendarModalOpen(false)}
            onSave={handleAddToCalendar}
            title={calendarModalData.title}
            description={calendarModalData.description}
        />
      )}
    </>
  );
}
