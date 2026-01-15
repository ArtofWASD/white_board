'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';

// Define types for workouts
interface WorkoutItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  difficulty: string;
  content: string;
}

export default function WorkoutsPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [displayedWorkouts, setDisplayedWorkouts] = useState<WorkoutItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);



  const toggleAuth = () => {
    setShowAuth(!showAuth);
  };

  // Sample workout data (in a real app, this would come from an API)
  const allWorkoutItems: WorkoutItem[] = useMemo(() => [
    {
      id: '1',
      title: 'HIIT тренировка для начинающих',
      excerpt: 'Интенсивная интервальная тренировка для тех, кто только начинает свой путь в фитнесе.',
      date: '15 ноября 2025',
      difficulty: 'Начинающий',
      content: 'Эта HIIT тренировка состоит из 8 упражнений, выполняемых по 30 секунд с 15-секундным отдыхом между ними. Цикл повторяется 3 раза с минутным перерывом между циклами. Тренировка включает приседания, отжимания, берпи, скакалку, планку, выпады, бег на месте и прыжки. Подходит для новичков и не требует специального оборудования.'
    },
    {
      id: '2',
      title: 'Силовая тренировка для спины',
      excerpt: 'Комплекс упражнений для укрепления мышц спины и улучшения осанки.',
      date: '10 ноября 2025',
      difficulty: 'Средний',
      content: 'Тренировка направлена на развитие всех групп мышц спины: трапеций, широчайших, ромбовидных и поясничных мышц. В комплекс входят становая тяга, подтягивания, гиперэкстензия, тяга штанги в наклоне, обратные разведения в тренажере и планка. Рекомендуется выполнять 3-4 подхода по 8-12 повторений с рабочим весом 60-80% от одноповторного максимума.'
    },
    {
      id: '3',
      title: 'Кардио тренировка на улице',
      excerpt: 'Эффективная кардио тренировка, которую можно провести на свежем воздухе без специального оборудования.',
      date: '5 ноября 2025',
      difficulty: 'Начинающий',
      content: 'Прогулка на свежем воздухе может быть отличной кардио тренировкой. Мы предлагаем маршрут длиной 5 км с элементами интервальной нагрузки: чередование быстрой ходьбы и легкого бега трусцой. Также включены упражнения на каждой остановке: приседания, отжимания от стены, прыжки и растяжка. Общая продолжительность тренировки 45 минут.'
    },
    {
      id: '4',
      title: 'Тренировка для пресса',
      excerpt: 'Эффективный комплекс упражнений для развития мышц кора.',
      date: '1 ноября 2025',
      difficulty: 'Средний',
      content: 'Эта тренировка включает 6 упражнений для развития всех отделов мышц кора: верхние, нижние и боковые мышцы пресса, а также косые мышцы живота. В комплекс входят скручивания, подъем ног, планка, велосипед, боковая планка и подъем туловища. Рекомендуется выполнять 3 подхода по 15-20 повторений каждого упражнения с 30-секундным отдыхом между подходами.'
    },
    {
      id: '5',
      title: 'Функциональная тренировка всего тела',
      excerpt: 'Комплекс упражнений, задействующих все основные группы мышц для развития силы, выносливости и координации.',
      date: '25 октября 2025',
      difficulty: 'Средний',
      content: 'Функциональная тренировка направлена на развитие силы, выносливости и координации движений, которые используются в повседневной жизни. В комплекс входят выпады с подъемом колен, берпи, планка с ротацией, приседания с выпрыгиванием, горизонтальные подтягивания и боковые выпады. Рекомендуется выполнять 4 круга по 40 секунд на упражнение с 20-секундным отдыхом между упражнениями и 1-минутным между кругами.'
    },
    {
      id: '6',
      title: 'Растяжка и восстановление',
      excerpt: 'Комплекс упражнений для улучшения гибкости и восстановления после интенсивных тренировок.',
      date: '20 октября 2025',
      difficulty: 'Начинающий',
      content: 'Растяжка после тренировки помогает улучшить гибкость, снизить мышечное напряжение и ускорить восстановление. В комплекс входят растяжка мышц спины, ног, плеч и шеи. Каждое упражнение выполняется по 30-60 секунд. Особое внимание уделяется глубокому дыханию и расслаблению.'
    }
  ], []);

  // Simulate fetching data with pagination
  const loadWorkouts = useCallback(() => {
    if (!hasMore || loading) return;
    
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const startIndex = (page - 1) * 3;
      const newWorkouts = allWorkoutItems.slice(startIndex, startIndex + 3);
      
      setDisplayedWorkouts(prev => [...prev, ...newWorkouts]);
      setPage(prev => prev + 1);
      setHasMore(startIndex + 3 < allWorkoutItems.length);
      setLoading(false);
    }, 500);
  }, [page, hasMore, loading, allWorkoutItems]);

  // Load initial data
  useEffect(() => {
    const initialLoad = () => {
      if (displayedWorkouts.length === 0) {
        setLoading(true);
        setTimeout(() => {
          const newWorkouts = allWorkoutItems.slice(0, 3);
          setDisplayedWorkouts(newWorkouts);
          setPage(2);
          setHasMore(3 < allWorkoutItems.length);
          setLoading(false);
        }, 500);
      }
    };
    
    initialLoad();
  }, [displayedWorkouts.length, allWorkoutItems]);

  // Handle scroll for infinite loading
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadWorkouts();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadWorkouts]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onRightMenuClick={() => {}} 
      />
      
      <main className={`flex-grow transition-all duration-300 ease-in-out ml-0 p-4`}>
        <div className="max-w-4xl mx-auto">
          {/* Development Message */}
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">Раздел находится в стадии разработки</h1>
            <div className="mt-8">
              <Link 
                href="/" 
                className="px-6 py-3 bg-white text-black border border-black font-medium rounded-lg hover:bg-gray-100 transition-colors duration-300"
              >
                На главную
              </Link>
            </div>
          </div>

          {/* Temporary Content - Hidden */}
          <div className="hidden">
            <div className="flex items-center justify-between mb-8">
              <Link 
                href="/blog" 
                className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Назад
              </Link>
              <div className="w-24"></div> {/* Spacer for alignment */}
            </div>
            
            <div className="space-y-8">
              {displayedWorkouts.map((item) => (
                <article 
                  key={item.id} 
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-3 text-gray-800">{item.title}</h2>
                    <p className="text-gray-600 mb-4">{item.excerpt}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                      <span>{item.date}</span>
                      <span className="px-2 py-1 bg-gray-200 rounded-full text-xs">{item.difficulty}</span>
                    </div>
                    <Link 
                      href={`/blog/workouts/${item.id}`}
                      className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Посмотреть тренировку
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            
            {loading && (
              <div className="mt-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}