import React from 'react';
import { TimerState, TimerPhase, TimerStatus, TimerConfig } from '../../hooks/useWODTimer';

interface TimerDisplayProps {
  state: TimerState;
  config: TimerConfig; // Добавлен конфиг, чтобы знать режим
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSkipWarmup: () => void;
  onAddRound: () => void;
  onAddResult?: () => void;
}

const formatTime = (ms: number) => {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const getPhaseColor = (phase: TimerPhase, status: TimerStatus) => {
  if (status === 'FINISHED') return 'text-gray-400';
  switch (phase) {
    case 'WARMUP': return 'text-yellow-600';
    case 'WORK': return 'text-green-600';
    case 'REST': return 'text-red-600';
    default: return 'text-gray-900';
  }
};

const getPhaseLabel = (phase: TimerPhase, status: TimerStatus) => {
   if (status === 'FINISHED') return 'ГОТОВО';
   switch (phase) {
      case 'WARMUP': return 'РАЗМИНКА';
      case 'WORK': return 'РАБОТА';
      case 'REST': return 'ОТДЫХ';
      default: return '';
   }
};

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ state, config, onPause, onResume, onReset, onSkipWarmup, onAddRound, onAddResult }) => {
  const { timeLeft, phase, status, currentRound, totalRounds } = state;
  
  const showRoundButton = (config.mode === 'AMRAP' || config.mode === 'FOR_TIME') && status === 'RUNNING' && phase === 'WORK';
  const displayRounds = (config.mode === 'AMRAP' || config.mode === 'FOR_TIME') 
     ? `Раунд ${currentRound}` 
     : `${currentRound} / ${totalRounds}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full bg-white rounded-3xl p-8 shadow-xl border border-gray-100 space-y-8">
      
      {/* Информация в заголовке */}
      <div className="flex w-full justify-between items-end px-4 text-gray-500 font-mono">
        <div className="flex flex-col items-start">
           <span className="text-sm uppercase tracking-widest text-gray-400">Фаза</span>
           <span className={`text-2xl font-bold ${getPhaseColor(phase, status)}`}>
             {getPhaseLabel(phase, status)}
           </span>
        </div>
        <div className="flex flex-col items-end">
           <span className="text-sm uppercase tracking-widest text-gray-400">Раунды</span>
           <span className="text-2xl font-bold text-gray-800">
             {displayRounds}
           </span>
        </div>
      </div>

      {/* Основной таймер */}
      <div className={`text-[12rem] leading-none font-bold tabular-nums tracking-tighter transition-colors duration-300 ${getPhaseColor(phase, status)}`}>
        {formatTime(timeLeft)}
      </div>

      {/* Управление */}
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        {status === 'RUNNING' && (
           <button 
             onClick={onPause}
             className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-xl font-bold transition-all active:scale-95 shadow-lg shadow-yellow-200"
           >
             ПАУЗА
           </button>
        )}
        
        {showRoundButton && (
           <button 
             onClick={onAddRound}
             className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xl font-bold transition-all active:scale-95 shadow-lg shadow-purple-200"
           >
             РАУНД +1
           </button>
        )}
        
        {(status === 'PAUSED' || status === 'IDLE') && (
           <button 
             onClick={onResume} // Запуск или продолжение
             className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xl font-bold transition-all active:scale-95 shadow-lg shadow-green-200"
           >
             {status === 'IDLE' ? 'СТАРТ' : 'ПРОДОЛЖИТЬ'}
           </button>
        )}

        {(status === 'PAUSED' || status === 'FINISHED') && (
           <button 
             onClick={onReset}
             className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xl font-bold transition-all active:scale-95"
           >
             СБРОС
           </button>
        )}
        
        {phase === 'WARMUP' && status === 'RUNNING' && (
           <button 
             onClick={onSkipWarmup}
             className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-200"
           >
             ПРОПУСТИТЬ
           </button>
        )}

        {status === 'FINISHED' && onAddResult && (
           <button 
             onClick={onAddResult}
             className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-200"
           >
             ДОБАВИТЬ РЕЗУЛЬТАТ
           </button>
        )}
      </div>
    </div>
  );
};
