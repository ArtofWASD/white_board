'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { SuccessModal } from '../../components/auth/SuccessModal';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, register, isLoading } = useAuth();
  
  // Form State
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'trainer' | 'athlete'>('athlete');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [registrationType, setRegistrationType] = useState<'individual' | 'organization'>('individual');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated && !showSuccessModal) {
      router.push('/');
    }
  }, [isAuthenticated, router, showSuccessModal, isLoading]);

  const validateStep1 = () => {
    if (!email || !password || !confirmPassword) {
      setError('Пожалуйста, заполните все поля');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!name) {
      setError('Пожалуйста, введите имя');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    let isValid = false;

    if (step === 1) {
      isValid = validateStep1();
    } else if (step === 2) {
      isValid = validateStep2();
    }

    if (isValid) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 3) {
      handleNext();
      return;
    }

    setError('');
    setLoading(true);

    try {
      const success = await register(name, email, password, role, gender, registrationType, lastName);
      if (!success) {
        setError('Не удалось зарегистрироваться. Попробуйте еще раз.');
      } else {
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Произошла ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || (isAuthenticated && !showSuccessModal)) {
    return null;
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((item) => (
        <div key={item} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= item
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {item}
          </div>
          {item < 3 && (
            <div
              className={`w-12 h-1 ${
                step > item ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const getImageForStep = () => {
    switch (step) {
      case 1:
        return '/register_pic_1.jpg';
      case 2:
        return '/register_pic_2.jpg';
      case 3:
        return '/register_pic_3.jpg';
      default:
        return '/register_pic_1.jpg';
    }
  };

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0
      };
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
      
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl flex flex-col md:flex-row p-2">
        {/* Left Side - Image (Visible on md+) */}
        <div className="hidden md:block md:w-1/2 relative min-h-[500px] rounded-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <Image
                src={getImageForStep()}
                alt={`Registration Step ${step}`}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center overflow-hidden">
          <h2 className="text-3xl font-bold text-center mb-6">Регистрация</h2>
          
          {renderStepIndicator()}

          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold mb-2">Данные аккаунта</h3>
                    <p className="text-gray-600 text-sm">Начните свой путь к успеху сегодня.</p>
                  </div>
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
                  <div>
                    <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                      Подтвердите пароль
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold mb-2">Личные данные</h3>
                    <p className="text-gray-600 text-sm">Расскажите нам немного о себе.</p>
                  </div>
                  <div>
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                      Имя
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">
                      Фамилия
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Пол
                    </label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          checked={gender === 'male'}
                          onChange={() => setGender('male')}
                          className="form-radio h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">Мужской</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          checked={gender === 'female'}
                          onChange={() => setGender('female')}
                          className="form-radio h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">Женский</span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold mb-2">Роль и предпочтения</h3>
                    <p className="text-gray-600 text-sm">Выберите свою роль в команде.</p>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Роль
                    </label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="role"
                          checked={role === 'athlete'}
                          onChange={() => setRole('athlete')}
                          className="form-radio h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">Атлет</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="role"
                          checked={role === 'trainer'}
                          onChange={() => setRole('trainer')}
                          className="form-radio h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">Тренер</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Вид деятельности
                    </label>
                    <div className="flex flex-col space-y-2">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="registrationType"
                          checked={registrationType === 'individual'}
                          onChange={() => setRegistrationType('individual')}
                          className="form-radio h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">Индивидуальный</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="registrationType"
                          checked={registrationType === 'organization'}
                          onChange={() => setRegistrationType('organization')}
                          className="form-radio h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">Организация</span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 flex gap-4">
              {step > 1 && (
                <Button
                  type="button"
                  onClick={handleBack}
                  variant="primary"
                  className="flex-1"
                >
                  Назад
                </Button>
              )}
              
              {step < 3 ? (
                <Button
                  key="next-btn"
                  type="button"
                  onClick={handleNext}
                  variant="primary"
                  className="flex-1"
                >
                  Далее
                </Button>
              ) : (
                <Button
                  key="submit-btn"
                  type="submit"
                  disabled={loading}
                  variant="primary"
                  className="flex-1"
                >
                  {loading ? 'Обработка...' : 'Зарегистрироваться'}
                </Button>
              )}
            </div>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Уже есть аккаунт?{' '}
              <Button
                href="/login"
                variant="link"
                className="font-medium p-0 h-auto"
              >
                Войдите
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}