'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { TimerLayout } from '../../components/timer/TimerLayout';
import { TimerSetup } from '../../components/timer/TimerSetup';
import { TimerDisplay } from '../../components/timer/TimerDisplay';
import { useWODTimer, TimerConfig, TimerMode } from '../../hooks/useWODTimer';
import { useAuthStore } from '../../lib/store/useAuthStore';

// Wrapper for Suspense boundary required by useSearchParams
export default function TimerPage() {
  return (
    <Suspense fallback={<TimerLayout><div>Loading...</div></TimerLayout>}>
      <TimerPageContent />
    </Suspense>
  );
}

function TimerPageContent() {
  const [config, setConfig] = useState<TimerConfig | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam && !config) {
       const initialConfig: TimerConfig = {
         mode: modeParam as TimerMode,
         rounds: Number(searchParams.get('rounds')) || 1,
         timeCap: Number(searchParams.get('timeCap')) || undefined,
         duration: Number(searchParams.get('duration')) || undefined,
         intervalWork: Number(searchParams.get('intervalWork')) || undefined,
         intervalRest: Number(searchParams.get('intervalRest')) || undefined,
       };
       setConfig(initialConfig);
       
       const eId = searchParams.get('eventId');
       if (eId) setEventId(eId);
    }
  }, [searchParams, config]);
  
  // We need user info to save result
  // But useWODTimer doesn't provide user.
  // We need to fetch it from store?
  // TimerPageContent is child of TimerPage which is client component.
  // We can use useAuthStore here.
  
  // Wait, I need to import useAuthStore first.
  
  const { user } = useAuthStore();

  const handleSaveResult = async (resultVal: string) => {
    if (!eventId || !user) return;
    
    try {
      console.log('Saving result:', { resultVal, mode: config?.mode, eventId });
      const response = await fetch(`/api/events/${eventId}/results`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              time: resultVal,
              dateAdded: new Date().toISOString(),
              userId: user.id,
              username: user.name
          }),
      });
      
      if (response.ok) {
         router.push('/calendar');
      } else {
         alert('Ошибка при сохранении результата');
      }
    } catch (e) {
      console.error(e);
      alert('Ошибка при сохранении результата');
    }
  };

  return (
    <TimerLayout>
      {!config ? (
        <TimerSetup onStart={setConfig} />
      ) : (
        <ActiveTimer 
           config={config} 
           onBack={() => {
             setConfig(null);
             setEventId(null);
             router.replace('/timer'); // clear params
           }}
           onSaveResult={eventId ? handleSaveResult : undefined}
        />
      )}
    </TimerLayout>
  );
}

// Separate component to ensure hook is initialized with fresh config when mounted
const ActiveTimer: React.FC<{ 
  config: TimerConfig; 
  onBack: () => void;
  onSaveResult?: (val: string) => void; 
}> = ({ config, onBack, onSaveResult }) => {
  const { state, start, pause, reset, skipWarmup, addRound } = useWODTimer(config);
  
  React.useEffect(() => {
     start();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = () => {
    reset();
    onBack();
  };
  
  const formatResult = () => {
     if (config.mode === 'AMRAP') {
        return `${state.currentRound} Раундов`;
     }
     if (config.mode === 'FOR_TIME') {
        const ms = state.elapsedTime;
        const totalSeconds = Math.ceil(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
     }
     return 'Done';
  };

  return (
    <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={handleReset}
        className="mb-6 text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors"
      >
        ← Назад к настройкам
      </button>
      
      <TimerDisplay 
        state={state}
        config={config}
        onPause={pause}
        onResume={start}
        onReset={handleReset}
        onSkipWarmup={skipWarmup}
        onAddRound={addRound}
        onAddResult={onSaveResult ? () => onSaveResult(formatResult()) : undefined}
      />
      
      <div className="mt-8 text-center text-gray-600 font-mono text-sm">
         Режим: {config.mode} • Раунды: {config.rounds || 1} • Время: {config.intervalWork || config.duration || config.timeCap}с
      </div>
    </div>
  );
};
