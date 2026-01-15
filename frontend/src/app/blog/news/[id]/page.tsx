'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '../../../../components/layout/Header';
import Footer from '../../../../components/layout/Footer';

// Define types for news
interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  content: string;
}

export default function NewsDetailPage({ params }: { params: { id: string } }) {
  const [showAuth, setShowAuth] = useState(false);

  const toggleAuth = () => {
    setShowAuth(!showAuth);
  };

  // Sample news data
  const newsItems: NewsItem[] = [
    {
      id: '1',
      title: 'Новые возможности тренировочного календаря',
      excerpt: 'Мы добавили новые функции в наш тренировочный календарь, которые помогут вам лучше планировать свои занятия.',
      date: '15 ноября 2025',
      readTime: '5 мин чтения',
      content: 'В новом обновлении мы добавили возможность планирования групповых тренировок, интеграцию с популярными фитнес-приложениями и улучшенную систему напоминаний о предстоящих занятиях. Теперь вы можете легко делиться своими тренировками с друзьями и отслеживать прогресс всей команды.\n\nНовая функция групповых тренировок позволяет создавать события, в которых могут участвовать несколько человек. Вы можете назначать тренировки для всей команды, отслеживать прогресс каждого участника и сравнивать результаты.\n\nИнтеграция с фитнес-приложениями позволяет автоматически импортировать данные о ваших тренировках из других источников. Это особенно удобно, если вы используете фитнес-трекеры или другие спортивные приложения.\n\nУлучшенная система напоминаний отправляет уведомления за день, час и 15 минут до начала тренировки. Вы можете настроить способ получения уведомлений: push-уведомления, электронная почта или SMS.'
    },
    {
      id: '2',
      title: 'Советы по питанию для спортсменов',
      excerpt: 'Правильное питание играет ключевую роль в достижении спортивных результатов. Узнайте больше о важных аспектах спортивного питания.',
      date: '10 ноября 2025',
      readTime: '7 мин чтения',
      content: 'Спортивное питание должно быть сбалансированным и содержать все необходимые макро- и микроэлементы. Мы подготовили подробное руководство по питанию до, во время и после тренировок, которое поможет вам оптимизировать ваши спортивные результаты и ускорить восстановление.\n\nПеред тренировкой рекомендуется употреблять легкоусвояемые углеводы за 1-2 часа до начала. Это может быть банан, йогурт или энергетический батончик. Главное, чтобы пища не вызывала дискомфорта во время тренировки.\n\nВо время длительных тренировок (более 60 минут) рекомендуется принимать дополнительные порции углеводов в виде спортивных напитков или гелей. Это поможет поддерживать уровень гликогена в мышцах и предотвратит преждевременную усталость.\n\nПосле тренировки в течение первых 30 минут необходимо употребить комбинацию белков и углеводов в соотношении 3:1 или 4:1. Это запустит процессы восстановления мышц и пополнит запасы энергии.'
    },
    {
      id: '3',
      title: 'Как избежать перетренированности',
      excerpt: 'Перетренированность - частая проблема среди активных спортсменов. Узнайте, как распознать признаки и предотвратить это состояние.',
      date: '5 ноября 2025',
      readTime: '6 мин чтения',
      content: 'Перетренированность может серьезно повлиять на ваш спортивный прогресс и общее состояние здоровья. В этой статье мы рассмотрим основные симптомы перетренированности, методы диагностики и рекомендации по восстановлению. Также вы узнаете, как правильно планировать тренировочный процесс с учетом периодов отдыха и восстановления.\n\nОсновные признаки перетренированности включают:\n- Постоянное чувство усталости и апатии\n- Снижение спортивных результатов\n- Нарушение сна\n- Повышенная раздражительность\n- Частые простудные заболевания\n- Потеря аппетита\n\nДля диагностики перетренированности рекомендуется вести дневник тренировок, отслеживать пульс в покое и после нагрузки, а также регулярно проходить медицинские обследования.'
    },
    {
      id: '4',
      title: 'Новый год - новая цель!',
      excerpt: 'С наступающим Новым годом! Пора ставить новые спортивные цели и достигать их с нашим приложением.',
      date: '1 января 2025',
      readTime: '3 мин чтения',
      content: 'Новый год - отличное время для того, чтобы поставить перед собой новые спортивные цели. Мы подготовили специальный планировщик целей, который поможет вам определить приоритеты, разбить большие цели на маленькие шаги и отслеживать ваш прогресс в течение всего года. Не забывайте, что регулярность и последовательность - ключ к успеху!\n\nПри планировании своих целей следуйте правилу SMART:\n- Specific (конкретные)\n- Measurable (измеримые)\n- Achievable (достижимые)\n- Relevant (значимые)\n- Time-bound (ограниченные по времени)\n\nНапример, вместо "стать более здоровым" поставьте конкретную цель: "пробегать 5 км за 30 минут к лету 2025 года". Такая формулировка позволит вам четко понимать, чего вы хотите достичь и как измерить свой прогресс.'
    }
  ];

  // Find the news item by ID
  const newsItem = newsItems.find(item => item.id === params.id);

  if (!newsItem) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header 
          onRightMenuClick={() => {}} 
        />
        
        <main className={`flex-grow transition-all duration-300 ease-in-out ml-0 p-4`}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <Link 
                href="/blog/news" 
                className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Назад к новостям
              </Link>
              <h1 className="text-3xl font-bold text-center flex-grow">Новость не найдена</h1>
              <div className="w-24"></div> {/* Spacer for alignment */}
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <p className="text-gray-600 mb-6">Запрашиваемая новость не найдена.</p>
              <Link 
                href="/blog/news" 
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Вернуться к списку новостей
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
        onRightMenuClick={() => {}} 
      />
      
      <main className={`flex-grow transition-all duration-300 ease-in-out ml-0 p-4`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/blog/news" 
              className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Назад к новостям
            </Link>
            <h1 className="text-3xl font-bold text-center flex-grow">Новости</h1>
            <div className="w-24"></div> {/* Spacer for alignment */}
          </div>
          
          <article className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 md:p-8">
              <h1 className="text-3xl font-bold mb-4 text-gray-800">{newsItem.title}</h1>
              <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
                <span>{newsItem.date}</span>
                <span>{newsItem.readTime}</span>
              </div>
              <div className="prose max-w-none">
                {newsItem.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </article>
          
          <div className="mt-8 flex justify-between">
            <Link 
              href="/blog/news" 
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Назад к новостям
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}