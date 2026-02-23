'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function FeaturesPage() {
  const features = [
    {
      name: 'Просмотр персональных тренировок',
      athlete: true,
      trainer: true,
      orgAdmin: true,
    },
    {
      name: 'Добавление результатов тренировок',
      athlete: true,
      trainer: true,
      orgAdmin: true,
    },
    {
      name: 'Статистика и аналитика',
      athlete: true,
      trainer: true,
      orgAdmin: true,
    },
    {
      name: 'Создание тренировок',
      athlete: false,
      trainer: true,
      orgAdmin: true,
    },
    {
      name: 'Добавление собственных баз упражнений',
      athlete: false,
      trainer: true,
      orgAdmin: true,
    },
    {
      name: 'Управление командой (Добавление/удаление участников)',
      athlete: false,
      trainer: true,
      orgAdmin: true,
    },
    {
      name: 'Создание организаций',
      athlete: false,
      trainer: false,
      orgAdmin: true,
    },
    {
      name: 'Управление тренерами внутри организации',
      athlete: false,
      trainer: false,
      orgAdmin: true,
    },
    {
      name: 'Глобальная настройка пространства',
      athlete: false,
      trainer: false,
      orgAdmin: true,
    },
  ];

  const CheckIcon = () => (
    <svg className="w-6 h-6 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  const MinusIcon = () => (
    <svg className="w-6 h-6 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onRightMenuClick={() => {}} />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-8 py-10 md:py-16 text-center border-b border-gray-100">
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Возможности платформы The Slate
            </h1>
            <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Узнайте, какие функции доступны для вашей роли, и выберите оптимальный вариант для достижения своих спортивных и тренерских целей.
            </p>
          </div>

          <div className="p-8 md:p-12">
            <div className="mb-14">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">Почему The Slate?</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Скорость и Удобство</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Никаких лишних кликов. Записывайте результаты тренировок, просматривайте комплексы и следите за статистикой в пару касаний.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Командная Работа</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Создавайте группы атлетов, формируйте тренировочные планы для всех сразу и следите за результативностью всей команды.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Детальная Аналитика</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Следите за прогрессом на графиках, анализируйте рост силы и выносливости для каждого отдельного упражнения.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center pt-8 border-t border-gray-100">Таблица Возможностей</h2>

            <div className="overflow-x-auto -mx-8 px-8 md:mx-0 md:px-0">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr>
                    <th className="py-4 px-6 bg-gray-50 font-semibold text-gray-700 border-b-2 border-gray-200 uppercase tracking-wider text-xs md:text-sm sticky left-0 z-10 w-1/3 md:w-2/5">
                      Функция
                    </th>
                    <th className="py-4 px-2 md:px-6 bg-gray-50 font-semibold text-gray-700 border-b-2 border-gray-200 text-center uppercase tracking-wider text-xs md:text-sm">
                      Спортсмен
                    </th>
                    <th className="py-4 px-2 md:px-6 bg-gray-50 font-semibold text-gray-700 border-b-2 border-gray-200 text-center uppercase tracking-wider text-xs md:text-sm">
                      Тренер
                    </th>
                    <th className="py-4 px-2 md:px-6 bg-gray-50 font-semibold text-gray-700 border-b-2 border-gray-200 text-center uppercase tracking-wider text-xs md:text-sm relative">
                      Организация
                      <span className="absolute -top-1 right-2 md:-right-1 bg-yellow-400 text-yellow-900 text-[9px] md:text-[10px] uppercase font-bold px-1.5 md:px-2 py-0.5 rounded-full rotate-12 shadow-sm">
                        Pro
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {features.map((feature, index) => (
                    <tr 
                      key={index} 
                      className={`hover:bg-blue-50/50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="py-4 px-4 md:px-6 text-gray-800 text-sm md:text-base font-medium sticky left-0 z-10 bg-inherit border-r border-gray-100 md:border-r-0 max-w-[150px] md:max-w-none break-words">
                        {feature.name}
                      </td>
                      <td className="py-4 px-2 md:px-6 text-center">
                        {feature.athlete ? <CheckIcon /> : <MinusIcon />}
                      </td>
                      <td className="py-4 px-2 md:px-6 text-center bg-blue-50/30">
                        {feature.trainer ? <CheckIcon /> : <MinusIcon />}
                      </td>
                      <td className="py-4 px-2 md:px-6 text-center">
                        {feature.orgAdmin ? <CheckIcon /> : <MinusIcon />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-16 text-center bg-gray-50 rounded-2xl p-8 md:p-12 border border-gray-100 shadow-sm">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Готовы приступить к работе?</h3>
              <p className="text-gray-600 max-w-2xl mx-auto mb-8 text-base md:text-lg">
                Создайте аккаунт прямо сейчас и начните использовать все ресурсы платформы The Slate для достижения своих высот.
              </p>
              <a 
                href="/register" 
                className="inline-block bg-black hover:bg-gray-800 text-white font-semibold py-3 px-8 md:px-10 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 text-lg"
              >
                Начать бесплатно
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
