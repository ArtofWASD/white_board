'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isOpen && countdown === 0) {
      router.push('/calendar');
    }
    return () => clearInterval(timer);
  }, [isOpen, countdown, router]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center relative overflow-hidden"
        >
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Регистрация успешна!
          </h2>
          
          <p className="text-gray-600 mb-8">
            Добро пожаловать в команду. Ваш аккаунт был успешно создан.
          </p>
          
          <div className="mb-6">
            <p className="text-sm text-gray-500">
              Перенаправление на календарь через {countdown} сек...
            </p>
          </div>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/calendar')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Перейти сейчас
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SuccessModal;
