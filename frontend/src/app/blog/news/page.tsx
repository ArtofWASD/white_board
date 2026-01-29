'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Header from '../../../components/layout/Header';
import { useAuthStore } from '../../../lib/store/useAuthStore';
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
  const [showAuth, setShowAuth] = useState(false);
  const [displayedNews, setDisplayedNews] = useState<NewsItem[]>([]);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showContent, setShowContent] = useState(true);
  const [loadingConfig, setLoadingConfig] = useState(true);
  


  const toggleAuth = () => {
    setShowAuth(!showAuth);
  };

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings/public');
            if (res.ok) {
                const settings = await res.json();
                setShowContent(settings['HIDE_BLOG_CONTENT'] !== true);
            }
        } catch (e) {
            console.error('Failed to fetch settings', e);
        } finally {
            setLoadingConfig(false);
        }
    };
    fetchSettings();
  }, []);

  // Fetch news from backend
  const loadNews = useCallback(async () => {
    if (!hasMore || loading) return;
    
    setLoading(true);
    try {
        // Fetch real data
        const res = await fetch(`/api/news?limit=10`); // Simplified pagination for now
        if (res.ok) {
            const data = await res.json();
            // In a real pagination scenario, we would append and check total count
            // For now, just setting all data since we don't have pagination params in backend yet
             const formattedData = data.map((item: any) => ({
                id: item.id,
                title: item.title,
                excerpt: item.excerpt || '',
                date: new Date(item.createdAt).toLocaleDateString('ru-RU'),
                readTime: '5 мин чтения', // Placeholder
                content: item.content
            }));
            
            setDisplayedNews(formattedData);
            setHasMore(false); // Disable infinite scroll for now
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  }, [page, hasMore, loading]);

  // Simulate fetching data with pagination


  // Load initial data
  useEffect(() => {
    if (showContent && displayedNews.length === 0) {
        loadNews();
    }
  }, [showContent, displayedNews.length, loadNews]);

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
        onRightMenuClick={() => {}} 
      />
      
      <main className={`flex-grow transition-all duration-300 ease-in-out ml-0 p-4`}>
        <div className="max-w-4xl mx-auto">
          {/* Development Message */}
          {/* Development Message */}
          {!loadingConfig && !showContent && (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">Раздел находится в стадии разработки</h1>
                <div className="mt-8">
                <Link 
                    href="/blog" 
                    className="px-6 py-3 bg-white text-black border border-black font-medium rounded-lg hover:bg-gray-100 transition-colors duration-300"
                >
                    Назад в Блог
                </Link>
                </div>
            </div>
          )}

          {/* Temporary Content - Hidden */}
          {!loadingConfig && showContent && (
          <div className="">
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
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}