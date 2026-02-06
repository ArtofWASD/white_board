'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../lib/store/useAuthStore';
import Button from '../../components/ui/Button';
import ErrorDisplay from '../../components/ui/ErrorDisplay';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const inviteCode = searchParams.get('inviteCode');

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirect || '/');
    }
  }, [isAuthenticated, router, isLoading, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        // Перенаправление на целевую страницу или на главную
        router.push(redirect || '/');
      } else {
        setError('Не удалось войти. Пожалуйста, проверьте учетные данные.');
      }
    } catch (error) {

      setError('Произошла ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || isAuthenticated) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl flex flex-col md:flex-row p-2">
        {/* Левая сторона - Изображение (Видно на md+) */}
        <div className="hidden md:block md:w-1/2 relative min-h-[500px] rounded-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <Image
                src="/register_pic_1.jpg"
                alt="Login"
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Правая сторона - Форма */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center overflow-hidden">
          <h2 className="text-3xl font-bold text-center mb-6">Вход</h2>
          
          <div className="text-center mb-6">
            <p className="text-gray-600 text-sm">Добро пожаловать обратно! Пожалуйста, войдите в свой аккаунт.</p>
          </div>

          <ErrorDisplay error={error} onClose={() => setError('')} className="mb-6" />
          
          <form onSubmit={handleSubmit}>
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                  Пароль
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                className="w-full mt-6"
              >
                {loading ? 'Обработка...' : 'Войти'}
              </Button>
            </motion.div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Нет аккаунта?{' '}
              <Button
                href={inviteCode ? `/register?inviteCode=${inviteCode}` : '/register'}
                variant="link"
                className="font-medium p-0 h-auto"
              >
                Зарегистрируйтесь
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-100">Загрузка...</div>}>
      <LoginForm />
    </Suspense>
  );
}