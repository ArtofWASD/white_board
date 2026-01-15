'use client';

import React from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        onRightMenuClick={() => {}} 
      />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">О нас</h1>
          
          <div className="space-y-6 text-gray-600 leading-relaxed">
            <p className="text-lg">
              Добро пожаловать в <span className="font-semibold text-blue-600">The Slate</span> — ваш персональный инструмент для планирования и отслеживания тренировок.
            </p>
            
            <p>
              Мы создали это приложение с одной простой целью: сделать процесс тренировок максимально прозрачным, эффективным и удобным. Больше никаких потерянных блокнотов или сложных таблиц. The Slate предоставляет чистый, интуитивно понятный интерфейс для всего, что важно атлету и тренеру.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 my-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-800 mb-3">Для Атлетов</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Отслеживайте свой прогресс в реальном времени</li>
                  <li>Ведите дневник тренировок</li>
                  <li>Анализируйте результаты с помощью удобных графиков</li>
                  <li>Планируйте занятия в календаре</li>
                </ul>
              </div>
              
              <div className="bg-indigo-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-indigo-800 mb-3">Для Тренеров</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Управляйте командами и группами</li>
                  <li>Создавайте планы тренировок</li>
                  <li>Следите за показателями подопечных</li>
                  <li>Будьте на связи со своими учениками</li>
                </ul>
              </div>
            </div>
            
            <p>
              <span className="font-semibold">The Slate</span> — это не просто "белая доска", это чистый лист для ваших новых достижений. Начните свою историю успеха уже сегодня.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
