'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Header from '../../../components/layout/Header';
import LeftMenu from '../../../components/layout/LeftMenu';
import { useAuth } from '../../../contexts/AuthContext';
import Footer from '../../../components/layout/Footer';

// Define types for news
interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  content: string;
}

export default function NewsPage() {
  const [leftMenuOpen, setLeftMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [displayedNews, setDisplayedNews] = useState<NewsItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const handleLeftMenuClick = () => {
    setLeftMenuOpen(!leftMenuOpen);
  };

  const toggleAuth = () => {
    setShowAuth(!showAuth);
  };

  // Sample news data (in a real app, this would come from an API)
  const allNewsItems: NewsItem[] = [
    {
      id: '1',
      title: 'Новые возможности тренировочного календаря',
      excerpt: 'Мы добавили новые функции в наш тренировочный календарь, которые помогут вам лучше планировать свои занятия.',
      date: '15 ноября 2025',
      readTime: '5 мин чтения',
      content: 'В новом обновлении мы добавили возможность планирования групповых тренировок, интеграцию с популярными фитнес-приложениями и улучшенную систему напоминаний о предстоящих занятиях. Теперь вы можете легко делиться своими тренировками с друзьями и отслеживать прогресс всей команды.'
    },
    {
      id: '2',
      title: 'Советы по питанию для спортсменов',
      excerpt: 'Правильное питание играет ключевую роль в достижении спортивных результатов. Узнайте больше о важных аспектах спортивного питания.',
      date: '10 ноября 2025',
      readTime: '7 мин чтения',
      content: 'Спортивное питание должно быть сбалансированным и содержать все необходимые макро- и микроэлементы. Мы подготовили подробное руководство по питанию до, во время и после тренировок, которое поможет вам оптимизировать ваши спортивные результаты и ускорить восстановление.'
    },
    {
      id: '3',
      title: 'Как избежать перетренированности',
      excerpt: 'Перетренированность - частая проблема среди активных спортсменов. Узнайте, как распознать признаки и предотвратить это состояние.',
      date: '5 ноября 2025',
      readTime: '6 мин чтения',
      content: 'Перетренированность может серьезно повлиять на ваш спортивный прогресс и общее состояние здоровья. В этой статье мы рассмотрим основные симптомы перетренированности, методы диагностики и рекомендации по восстановлению. Также вы узнаете, как правильно планировать тренировочный процесс с учетом периодов отдыха и восстановления.'
    },
    {
      id: '4',
      title: 'Новый год - новая цель!',
      excerpt: 'С наступающим Новым годом! Пора ставить новые спортивные цели и достигать их с нашим приложением.',
      date: '1 января 2025',
      readTime: '3 мин чтения',
      content: 'Новый год - отличное время для того, чтобы поставить перед собой новые спортивные цели. Мы подготовили специальный планировщик целей, который поможет вам определить приоритеты, разбить большие цели на маленькие шаги и отслеживать ваш прогресс в течение всего года. Не забывайте, что регулярность и последовательность - ключ к успеху!'
    },
    {
      id: '5',
      title: 'Как выбрать правильную обувь для бега',
      excerpt: 'Выбор правильной обуви для бега может значительно повлиять на эффективность тренировок и предотвратить травмы.',
      date: '20 декабря 2024',
      readTime: '4 мин чтения',
      content: 'Правильная обувь для бега должна соответствовать вашему типу стопы, стилю бега и поверхности, на которой вы чаще всего тренируетесь. В этой статье мы расскажем, как определить ваш тип стопы, какие характеристики следует учитывать при выборе обуви и когда пора менять обувь.'
    },
    {
      id: '6',
      title: 'Йога для восстановления после тренировок',
      excerpt: 'Йога может стать отличным дополнением к вашей программе восстановления после интенсивных тренировок.',
      date: '15 декабря 2024',
      readTime: '5 мин чтения',
      content: 'Йога помогает улучшить гибкость, снизить мышечное напряжение и ускорить восстановление после тренировок. Мы собрали для вас набор поз, которые можно выполнять сразу после тренировки для максимального эффекта восстановления.'
    }
  ];

  // Simulate fetching data with pagination
  const loadNews = useCallback(() => {
    if (!hasMore || loading) return;
    
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const startIndex = (page - 1) * 3;
      const newNews = allNewsItems.slice(startIndex, startIndex + 3);
      
      setDisplayedNews(prev => [...prev, ...newNews]);
      setPage(prev => prev + 1);
      setHasMore(startIndex + 3 < allNewsItems.length);
      setLoading(false);
    }, 500);
  }, [page, hasMore, loading]);

  // Load initial data
  useEffect(() => {
    const initialLoad = () => {
      if (displayedNews.length === 0) {
        setLoading(true);
        setTimeout(() => {
          const newNews = allNewsItems.slice(0, 3);
          setDisplayedNews(newNews);
          setPage(2);
          setHasMore(3 < allNewsItems.length);
          setLoading(false);
        }, 500);
      }
    };
    
    initialLoad();
  }, [displayedNews.length]);

  // Handle scroll for infinite loading
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadNews();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadNews]);

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
            {displayedNews.map((item) => (
              <article 
                key={item.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-3 text-gray-800">{item.title}</h2>
                  <p className="text-gray-600 mb-4">{item.excerpt}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <span>{item.date}</span>
                    <span>{item.readTime}</span>
                  </div>
                  <Link 
                    href={`/blog/news/${item.id}`}
                    className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Читать статью
                  </Link>
                </div>
              </article>
            ))}
          </div>
          
          {loading && (
            <div className="mt-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}