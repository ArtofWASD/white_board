'use client';

import React, { useState, use, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { logApiError } from '@/lib/logger';

// Define types for news
interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  createdAt: string;
  content: string;
}

export default function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`/api/news/${id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setNewsItem(data);
      } catch (err) {
        logApiError(`Fetch news detail ${id}`, err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [id]);

  useEffect(() => {
    if (newsItem) {
      document.title = `${newsItem.title} - Whiteboard`
    }
  }, [newsItem])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header onRightMenuClick={() => {}} />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </main>
        <Footer />
      </div>
    );
  }

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
                href="/knowledge/news" 
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
                href="/knowledge/news" 
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
              href="/knowledge/news" 
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
                <span>{new Date(newsItem.createdAt).toLocaleDateString()}</span>
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
              href="/knowledge/news" 
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