'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ContentDisplay } from '@/components/ui/ContentDisplay';
import { ViewSwitcher } from '@/components/ui/ViewSwitcher';
import Link from 'next/link';
import { useFeatureFlagStore } from '@/lib/store/useFeatureFlagStore';

export default function ExercisesPage() {
  const [exercises, setExercises] = useState([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const { flags } = useFeatureFlagStore();

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await fetch('/api/content-exercises');
        if (res.ok) {
           const data = await res.json();
           const mappedData = data.map((ex: any) => ({
               id: ex.id,
               title: ex.name,
               description: ex.description,
               videoUrl: ex.videoUrl,
               type: 'exercise',
           }));
           setExercises(mappedData);
        }
      } catch (error) {
        console.error('Failed to fetch exercises:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
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
                <h1 className="text-3xl font-bold text-gray-900">Упражнения</h1>
                <p className="mt-2 text-gray-600">Библиотека упражнений и техник</p>
             </div>
             
             <ViewSwitcher viewMode={viewMode} onChange={setViewMode} />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
             <>
                {exercises.length > 0 ? (
                    <ContentDisplay items={exercises} viewMode={viewMode} type="exercise" />
                ) : (
                    <div className="text-center text-gray-500 py-12">
                        Упражнений пока нет
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
