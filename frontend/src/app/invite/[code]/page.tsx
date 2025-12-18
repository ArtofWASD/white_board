'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '../../../lib/store/useAuthStore';
import ErrorDisplay from '../../../components/ui/ErrorDisplay';

export default function InvitePage() {
  const { code } = useParams();
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If no code, invalid
    if (!code) {
      setStatus('error');
      setError('Invalid invite link');
      return;
    }

    // If not logged in, redirect to login
    if (!token) {
        // Encode current path to redirect back after login.
        const returnUrl = encodeURIComponent(`/invite/${code}`);
        router.push(`/login?redirect=${returnUrl}&inviteCode=${code}`);
        return;
    }

    // Logged in, try to join
    const joinTeam = async () => {
      try {
        const response = await fetch(`/api/teams/invite/${code}/join`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setStatus('success');
          // Wait a bit then redirect
          setTimeout(() => {
            router.push('/dashboard/teams');
          }, 2000);
        } else {
            let message = 'Failed to join team';
            try {
                const data = await response.json();
                message = data.message || message;
            } catch (e) {}
            
            // If already a member, we can consider it success or just redirect
            if (message.includes('Already a member')) {
                // Redirect immediately
                router.push('/dashboard/teams');
                return;
            }
            
            setStatus('error');
            setError(message);
        }
      } catch (err) {
        setStatus('error');
        setError('An unexpected error occurred');
      }
    };

    joinTeam();
  }, [code, token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
             <p className="text-gray-600">Присоединяемся к команде...</p>
          </div>
        )}

        {status === 'success' && (
           <div className="flex flex-col items-center">
              <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">Успешно!</h2>
              <p className="text-gray-600 mb-4">Вы были добавлены в команду. Перенаправление...</p>
           </div>
        )}

        {status === 'error' && (
            <div className="flex flex-col items-center">
                <div className="h-12 w-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold mb-2">Ошибка</h2>
                <ErrorDisplay error={error} />
                <button 
                  onClick={() => router.push('/dashboard/teams')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Перейти к командам
                </button>
            </div>
        )}
      </div>
    </div>
  );
}
