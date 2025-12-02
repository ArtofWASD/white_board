'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setCountdown(10);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && countdown === 0) {
      router.push('/calendar');
    }
  }, [countdown, isOpen, router]);

  const handleGoToCalendar = () => {
    router.push('/calendar');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center relative overflow-hidden"
          >
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Регистрация успешна!
              </h2>
              <p className="text-gray-600">
                Добро пожаловать в команду. Мы рады видеть вас здесь.
              </p>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Переход в календарь через <span className="font-bold text-blue-600">{countdown}</span> сек.
              </p>
            </div>

            <Button
              onClick={handleGoToCalendar}
              variant="primary"
              className="w-full"
            >
              Перейти в календарь
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
