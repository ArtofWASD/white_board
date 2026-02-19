import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AddToCalendarModal } from '../dashboard/AddToCalendarModal';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useToast } from '@/lib/context/ToastContext';
import { RatingStar } from './RatingStar';

interface ContentItem {
  id: string;
  title: string;
  content?: string; // для новостей
  description?: string; // для воркаутов/упражнений
  imageUrl?: string; // для новостей
  videoUrl?: string; // для упражнений
  date?: string; // для новостей/воркаутов
  type?: string;
  rating?: number;
  muscleGroups?: string[];
  wodType?: string; // напр. GIRL, HERO
  wodScheme?: string; // напр. FOR_TIME, AMRAP
}

interface ContentCardsProps {
  items: ContentItem[];
  viewMode: 'grid' | 'list';
  type: 'news' | 'workout' | 'exercise';
}

const MUSCLE_GROUPS_MAP: Record<string, string> = {
  CHEST: 'Грудные мышцы',
  BACK: 'Мышцы спины',
  LEGS: 'Мышцы ног',
  SHOULDERS: 'Плечи',
  ARMS: 'Руки',
  CORE: 'Мышцы кора',
};

const SCHEME_MAP: Record<string, string> = {
  FOR_TIME: 'For Time',
  AMRAP: 'AMRAP',
  EMOM: 'EMOM',
  TABATA: 'Tabata',
  NOT_SPECIFIED: 'Other',
};

export function ContentCards({ items, viewMode, type }: ContentCardsProps) {
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
          exerciseType: type === 'workout' ? 'wod' : 'exercise',
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

  const renderStars = (rating: number = 0) => {
    return (
        <div className="flex items-center space-x-1">
            <svg 
                className="w-4 h-4 text-yellow-400 fill-current" 
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
             <span className="text-sm font-medium text-gray-700">{Math.round(rating)}</span>
        </div>
    );
  };

  return (
    <>
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-4'}>
        {items.map((item) => {
          const ContentWrapper = ({ children }: { children: React.ReactNode }) => {
            if (type === 'workout' || type === 'exercise') {
              const href = type === 'workout' ? `/knowledge/workouts/${item.id}` : `/knowledge/exercises/${item.id}`;
              return (
                <Link href={href} className="block h-full">
                  {children}
                </Link>
              );
            }
            return <>{children}</>;
          };

          return (
            <div 
              key={item.id} 
              className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 ${
                  viewMode === 'list' ? 'flex flex-row items-center' : 'flex flex-col'
              }`}
            >
              <ContentWrapper>
                <div className={`${viewMode === 'list' ? 'flex flex-row items-center w-full p-4' : 'flex flex-col h-full'}`}>
                  {/* Изображение для Новости */}
                  {type === 'news' && item.imageUrl && viewMode === 'grid' && (
                      <div className="h-48 w-full relative">
                          <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                      </div>
                  )}
                  
                  <div className={`flex-1 ${viewMode === 'grid' ? 'p-6' : 'pl-4'}`}>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
                        {/* Отображение бейджей типа и схемы WOD */}
                        {type === 'workout' && (
                            <div className="flex space-x-2 ml-auto">
                                {item.wodType && (
                                    <span className="px-2 py-1 text-xs font-semibold rounded bg-white text-gray-900 border border-gray-900 shadow-sm">
                                        {item.wodType}
                                    </span>
                                )}
                                {item.wodScheme && (
                                    <span className="px-2 py-1 text-xs font-semibold rounded bg-white text-gray-900 border border-gray-900 shadow-sm">
                                        {SCHEME_MAP[item.wodScheme] || item.wodScheme}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                     {/* Чипсы групп мышц */}
                     {item.muscleGroups && item.muscleGroups.length > 0 && (
                         <div className="flex flex-wrap gap-2 mb-3">
                             {item.muscleGroups.map(mg => (
                                 <span key={mg} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                     {MUSCLE_GROUPS_MAP[mg] || mg}
                                 </span>
                             ))}
                         </div>
                     )}
                    
                    <div className="text-gray-600 mb-4 line-clamp-3 text-sm">
                        {type === 'news' ? item.content?.substring(0, 150) + '...' : item.description}
                    </div>

                    {type === 'news' && item.date && (
                         <div className="text-sm text-gray-500 mb-4">{new Date(item.date).toLocaleDateString('ru-RU')}</div>
                    )}

                    <div className="flex justify-between items-center mt-auto">
                      {type === 'news' ? (
                         <Link href={`/knowledge/news/${item.id}`} className="text-indigo-600 font-medium hover:text-indigo-800 text-sm">
                           Читать далее →
                         </Link>
                      ) : (
                          <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openCalendarModal(item);
                              }}
                              className="flex items-center space-x-2 text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors z-10 relative"
                          >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>Добавить в календарь</span>
                          </button>
                      )}
                       {/* Отображение рейтинга внизу для воркаутов/упражнений */}
                       {(type === 'workout' || type === 'exercise') && (
                           <div className="ml-auto">
                               <RatingStar 
                                 initialRating={item.rating || 0} 
                                 id={item.id} 
                                 type={type as 'workout' | 'exercise'} 
                                 size={16}
                               />
                           </div>
                       )}
                    </div>
                  </div>
                </div>
              </ContentWrapper>
            </div>
          );
        })}
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
