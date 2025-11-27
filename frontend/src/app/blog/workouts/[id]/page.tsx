'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '../../../../components/layout/Header';
import LeftMenu from '../../../../components/layout/LeftMenu';
import Footer from '../../../../components/layout/Footer';

// Define types for workouts
interface WorkoutItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  difficulty: string;
  content: string;
}

export default function WorkoutDetailPage({ params }: { params: { id: string } }) {
  const [leftMenuOpen, setLeftMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const handleLeftMenuClick = () => {
    setLeftMenuOpen(!leftMenuOpen);
  };

  const toggleAuth = () => {
    setShowAuth(!showAuth);
  };

  // Sample workout data
  const workoutItems: WorkoutItem[] = [
    {
      id: '1',
      title: 'HIIT тренировка для начинающих',
      excerpt: 'Интенсивная интервальная тренировка для тех, кто только начинает свой путь в фитнесе.',
      date: '15 ноября 2025',
      difficulty: 'Начинающий',
      content: 'Эта HIIT тренировка состоит из 8 упражнений, выполняемых по 30 секунд с 15-секундным отдыхом между ними. Цикл повторяется 3 раза с минутным перерывом между циклами. Тренировка включает приседания, отжимания, берпи, скакалку, планку, выпады, бег на месте и прыжки. Подходит для новичков и не требует специального оборудования.\n\nРазминка (5 минут):\n- Вращения суставов\n- Легкая растяжка мышц\n- Прыжки на месте\n\nОсновная часть (20 минут):\n1. Приседания - 30 секунд\n   Отдых - 15 секунд\n2. Отжимания от стены - 30 секунд\n   Отдых - 15 секунд\n3. Берпи - 30 секунд\n   Отдых - 15 секунд\n4. Скакалка (или имитация) - 30 секунд\n   Отдых - 15 секунд\n5. Планка - 30 секунд\n   Отдых - 15 секунд\n6. Выпады - 30 секунд\n   Отдых - 15 секунд\n7. Бег на месте - 30 секунд\n   Отдых - 15 секунд\n8. Прыжки - 30 секунд\n   Отдых - 15 секунд\n\nЗавершение (5 минут):\n- Медленная растяжка всех групп мышц\n- Дыхательные упражнения'
    },
    {
      id: '2',
      title: 'Силовая тренировка для спины',
      excerpt: 'Комплекс упражнений для укрепления мышц спины и улучшения осанки.',
      date: '10 ноября 2025',
      difficulty: 'Средний',
      content: 'Тренировка направлена на развитие всех групп мышц спины: трапеций, широчайших, ромбовидных и поясничных мышц. В комплекс входят становая тяга, подтягивания, гиперэкстензия, тяга штанги в наклоне, обратные разведения в тренажере и планка. Рекомендуется выполнять 3-4 подхода по 8-12 повторений с рабочим весом 60-80% от одноповторного максимума.\n\nРазминка (10 минут):\n- Кардио на велотренажере или беговой дорожке\n- Динамическая растяжка спины\n- Ротации корпуса\n\nОсновная часть (45 минут):\n1. Становая тяга\n   4 подхода по 8-10 повторений\n   Вес: 60-70% от 1ПМ\n2. Подтягивания (или тяга верхнего блока)\n   3 подхода по 8-12 повторений\n3. Гиперэкстензия\n   3 подхода по 12-15 повторений\n4. Тяга штанги в наклоне\n   3 подхода по 10-12 повторений\n   Вес: 60-70% от 1ПМ\n5. Обратные разведения в тренажере\n   3 подхода по 12-15 повторений\n6. Планка\n   3 подхода по 30-60 секунд\n\nЗавершение (5 минут):\n- Статическая растяжка мышц спины\n- Релаксация'
    },
    {
      id: '3',
      title: 'Кардио тренировка на улице',
      excerpt: 'Эффективная кардио тренировка, которую можно провести на свежем воздухе без специального оборудования.',
      date: '5 ноября 2025',
      difficulty: 'Начинающий',
      content: 'Прогулка на свежем воздухе может быть отличной кардио тренировкой. Мы предлагаем маршрут длиной 5 км с элементами интервальной нагрузки: чередование быстрой ходьбы и легкого бега трусцой. Также включены упражнения на каждой остановке: приседания, отжимания от стены, прыжки и растяжка. Общая продолжительность тренировки 45 минут.\n\nМаршрут (5 км):\n1. Стартовая точка - 5 минут легкой ходьбы\n2. Первый интервал - 1 км быстрой ходьбы\n3. Первая остановка - 5 приседаний, 5 отжиманий от стены\n4. Второй интервал - 1 км бег трусцой\n5. Вторая остановка - 10 прыжков, растяжка икр\n6. Третий интервал - 1 км быстрой ходьбы\n7. Третья остановка - 5 приседаний, 5 отжиманий от стены\n8. Четвертый интервал - 1 км бег трусцой\n9. Четвертая остановка - 10 прыжков, растяжка квадрицепсов\n10. Финишный интервал - 1 км быстрой ходьбы\n\nЗавершение:\n- 5 минут медленной ходьбы для восстановления\n- Комплекс растяжки всех групп мышц'
    },
    {
      id: '4',
      title: 'Тренировка для пресса',
      excerpt: 'Эффективный комплекс упражнений для развития мышц кора.',
      date: '1 ноября 2025',
      difficulty: 'Средний',
      content: 'Эта тренировка включает 6 упражнений для развития всех отделов мышц кора: верхние, нижние и боковые мышцы пресса, а также косые мышцы живота. В комплекс входят скручивания, подъем ног, планка, велосипед, боковая планка и подъем туловища. Рекомендуется выполнять 3 подхода по 15-20 повторений каждого упражнения с 30-секундным отдыхом между подходами.\n\nРазминка (5 минут):\n- Легкая кардио активность\n- Вращения корпуса\n- Растяжка мышц живота\n\nОсновная часть (25 минут):\n1. Скручивания\n   3 подхода по 15-20 повторений\n2. Подъем ног (лежа)\n   3 подхода по 12-15 повторений\n3. Планка\n   3 подхода по 30-45 секунд\n4. Велосипед\n   3 подхода по 20 повторений (10 на каждую сторону)\n5. Боковая планка\n   3 подхода по 20-30 секунд на каждую сторону\n6. Подъем туловища (обратные скручивания)\n   3 подхода по 12-15 повторений\n\nЗавершение (5 минут):\n- Глубокая растяжка мышц кора\n- Дыхательные упражнения для расслабления'
    }
  ];

  // Find the workout item by ID
  const workoutItem = workoutItems.find(item => item.id === params.id);

  if (!workoutItem) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header 
          onLeftMenuClick={handleLeftMenuClick} 
          onRightMenuClick={() => {}} 
        />
        
        <LeftMenu 
          isOpen={leftMenuOpen}
          onClose={handleLeftMenuClick}
          showAuth={showAuth}
          toggleAuth={toggleAuth}
          events={[]}
          onShowEventDetails={() => {}}
        />
        
        <main className={`flex-grow transition-all duration-300 ease-in-out ${leftMenuOpen ? 'ml-80' : 'ml-0'} p-4`}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <Link 
                href="/blog/workouts" 
                className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Назад к воркаутам
              </Link>
              <h1 className="text-3xl font-bold text-center flex-grow">Тренировка не найдена</h1>
              <div className="w-24"></div> {/* Spacer for alignment */}
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <p className="text-gray-600 mb-6">Запрашиваемая тренировка не найдена.</p>
              <Link 
                href="/blog/workouts" 
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Вернуться к списку тренировок
              </Link>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onLeftMenuClick={handleLeftMenuClick} 
        onRightMenuClick={() => {}} 
      />
      
      <LeftMenu 
        isOpen={leftMenuOpen}
        onClose={handleLeftMenuClick}
        showAuth={showAuth}
        toggleAuth={toggleAuth}
        events={[]}
        onShowEventDetails={() => {}}
      />
      
      <main className={`flex-grow transition-all duration-300 ease-in-out ${leftMenuOpen ? 'ml-80' : 'ml-0'} p-4`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/blog/workouts" 
              className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Назад к воркаутам
            </Link>
            <h1 className="text-3xl font-bold text-center flex-grow">Воркауты</h1>
            <div className="w-24"></div> {/* Spacer for alignment */}
          </div>
          
          <article className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex flex-wrap justify-between items-start mb-6">
                <h1 className="text-3xl font-bold mb-4 text-gray-800">{workoutItem.title}</h1>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm whitespace-nowrap">
                  {workoutItem.difficulty}
                </span>
              </div>
              <div className="text-sm text-gray-500 mb-6">
                {workoutItem.date}
              </div>
              <div className="prose max-w-none">
                {workoutItem.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </article>
          
          <div className="mt-8 flex justify-between">
            <Link 
              href="/blog/workouts" 
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Назад к воркаутам
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}