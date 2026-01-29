'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ContentDisplay } from '@/components/ui/ContentDisplay';
import { ViewSwitcher } from '@/components/ui/ViewSwitcher';
import Link from 'next/link';
import { useFeatureFlagStore } from '@/lib/store/useFeatureFlagStore';

export default function WorkoutsPage() {
  const [wods, setWods] = useState([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const { flags } = useFeatureFlagStore();

  useEffect(() => {
    const fetchWods = async () => {
      try {
        const res = await fetch('/api/wods');
        if (res.ok) {
           const data = await res.json();
           // Map wods to match ContentItem interface if needed, relying on consistent naming for now
           const mappedData = data.map((wod: any) => ({
               id: wod.id,
               title: wod.name,
               description: wod.description,
               type: 'wod', // Internal type for ContentDisplay logic if needed
           }));
           setWods(mappedData);
        }
      } catch (error) {
        console.error('Failed to fetch wods:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWods();
  }, []);

   if (flags.hideBlogContent) {
      return (
        <div className="min-h-screen flex flex-col">
          <Header onRightMenuClick={() => {}} />
          <main className="flex-grow flex items-center justify-center">
             <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Раздел находится в разработке</h1>
                <Link href="/" className="text-indigo-600 hover:text-indigo-800">На главную</Link>
             </div>
          </main>
          <Footer />
        </div>
      )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onRightMenuClick={() => {}} />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
             <div>
                <h1 className="text-3xl font-bold text-gray-900">Воркауты</h1>
                <p className="mt-2 text-gray-600">Коллекция тренировок (WODs)</p>
             </div>
             
             <ViewSwitcher viewMode={viewMode} onChange={setViewMode} />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
             <>
                {wods.length > 0 ? (
                    <ContentDisplay items={wods} viewMode={viewMode} type="workout" />
                ) : (
                    <div className="text-center text-gray-500 py-12">
                        Воркаутов пока нет
                    </div>
                )}
            </>
          )}

           <div className="mt-12 text-center">
             <Link href="/blog" className="text-indigo-600 font-medium hover:text-indigo-800">
                ← Назад в блог
             </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}