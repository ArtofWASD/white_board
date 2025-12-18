import React, { useState } from 'react';
import { useAuthStore } from '../../lib/store/useAuthStore';
import ErrorDisplay from '../../components/ui/ErrorDisplay';

export default function AuthForms() {
  const { login, register } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'TRAINER' | 'ATHLETE'>('ATHLETE');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        // Login logic
        const success = await login(email, password);
        if (!success) {
          setError('Не удалось войти. Пожалуйста, проверьте учетные данные.');
        }
      } else {
        // Registration logic
        if (password !== confirmPassword) {
          setError('Пароли не совпадают');
          setLoading(false);
          return;
        }
        
        // Use separate first name and last name fields
        const success = await register(name, email, password, role);
        if (!success) {
          setError('Не удалось зарегистрироваться. Попробуйте еще раз.');
        }
      }
    } catch {
      setError('Произошла ошибка. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isLogin ? 'Вход' : 'Регистрация'}
      </h2>
      
      <ErrorDisplay error={error} onClose={() => setError('')} className="mb-4" />
      
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
              Имя
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={!isLogin}
            />
          </div>
        )}
        
        {!isLogin && (
          <div className="mb-4">
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
        )}
        
        {!isLogin && (
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Роль
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="role"
                  checked={role === 'ATHLETE'}
                  onChange={() => setRole('ATHLETE')}
                  className="form-radio"
                />
                <span className="ml-2">Атлет</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="role"
                  checked={role === 'TRAINER'}
                  onChange={() => setRole('TRAINER')}
                  className="form-radio"
                />
                <span className="ml-2">Тренер</span>
              </label>
            </div>
          </div>
        )}
        
        <div className="mb-4">
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
        
        <div className="mb-4">
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
        
        {!isLogin && (
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
              Подтвердите пароль
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={!isLogin}
            />
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-300 disabled:opacity-50"
        >
          {loading ? 'Обработка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-500 hover:text-blue-700 font-medium"
        >
          {isLogin 
            ? 'Нет аккаунта? Зарегистрируйтесь' 
            : 'Уже есть аккаунт? Войдите'}
        </button>
      </div>
    </div>
  );
}