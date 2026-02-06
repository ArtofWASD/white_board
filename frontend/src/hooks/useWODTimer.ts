import { useState, useEffect, useRef, useCallback } from 'react';
import { audioController } from '../components/timer/AudioController';

export type TimerMode = 'FOR_TIME' | 'AMRAP' | 'EMOM' | 'TABATA' | 'INTERVALS';
export type TimerStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'FINISHED';
export type TimerPhase = 'WARMUP' | 'WORK' | 'REST';

export interface TimerConfig {
  mode: TimerMode;
  timeCap?: number; // в секундах, для FOR_TIME
  duration?: number; // в секундах, для AMRAP
  intervalWork?: number; // в секундах, для EMOM/TABATA/INTERVALS
  intervalRest?: number; // в секундах, для TABATA/INTERVALS
  rounds?: number; // для TABATA/INTERVALS/EMOM
}

export interface TimerState {
  status: TimerStatus;
  phase: TimerPhase;
  timeLeft: number; // в миллисекундах
  elapsedTime: number; // в миллисекундах
  currentRound: number;
  totalRounds: number;
}

const WARMUP_TIME = 10 * 1000; // 10 секунд

export const useWODTimer = (config: TimerConfig) => {
  const [state, setState] = useState<TimerState>({
    status: 'IDLE',
    phase: 'WARMUP',
    timeLeft: WARMUP_TIME,
    elapsedTime: 0,
    currentRound: 1,
    totalRounds: config.rounds || 1,
  });

  const requestRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);
  const baseTimeRef = useRef<number>(0); // Время, накопленное до текущего сегмента запуска
  const lastTickRef = useRef<number>(0);

  // Помощник для обработки смены фаз
  const transitionPhase = useCallback((currentPhase: TimerPhase, currentRound: number): { nextPhase: TimerPhase, nextRound: number, nextTime: number } | null => {
    // РАЗМИНКА -> РАБОТА
    if (currentPhase === 'WARMUP') {
      let workTime = 0;
      if (config.mode === 'AMRAP') workTime = (config.duration || 0) * 1000;
      else if (['EMOM', 'TABATA', 'INTERVALS'].includes(config.mode)) workTime = (config.intervalWork || 0) * 1000;
      else if (config.mode === 'FOR_TIME') workTime = (config.timeCap || 0) * 1000; // FOR_TIME обычно считает вверх, см. логику ниже
      
      // FOR_TIME особенный, он считает ВВЕРХ, но мы можем моделировать его как обратный отсчет от лимита или просто бесконечный вверх.
      // Давайте стандартизируем: timeLeft - это то, что отображается.
      // Для AMRAP/Intervals: timeLeft уменьшается.
      // Для FOR_TIME: timeLeft увеличивается? Или timeLeft оставшееся до лимита?
      // Давайте использовать timeLeft как оставшееся время для текущей фазы.
      
      audioController.playStart();
      return { nextPhase: 'WORK', nextRound: 1, nextTime: workTime };
    }

    // РАБОТА -> ОТДЫХ или РАБОТА -> ГОТОВО или РАБОТА -> РАБОТА (след. раунд)
    if (currentPhase === 'WORK') {
      audioController.playRoundComplete();
      
      if (config.mode === 'FOR_TIME' || config.mode === 'AMRAP') {
        return null; // Finished
      }

      if (['TABATA', 'INTERVALS'].includes(config.mode)) {
        if (config.intervalRest && config.intervalRest > 0) {
           // Переход к ОТДЫХУ
           return { nextPhase: 'REST', nextRound: currentRound, nextTime: (config.intervalRest || 0) * 1000 };
        } else {
           // Без отдыха, проверка раундов
           if (currentRound < (config.rounds || 1)) {
              return { nextPhase: 'WORK', nextRound: currentRound + 1, nextTime: (config.intervalWork || 0) * 1000 };
           }
           return null; // Finished
        }
      }

      if (config.mode === 'EMOM') {
        // EMOM обычно не имеет явного отдыха, просто следующая минута
        if (currentRound < (config.rounds || 1)) {
           return { nextPhase: 'WORK', nextRound: currentRound + 1, nextTime: (config.intervalWork || 60) * 1000 };
        }
        return null;
      }
    }

    // ОТДЫХ -> РАБОТА или ОТДЫХ -> ГОТОВО
    if (currentPhase === 'REST') {
      audioController.playStart();
      if (currentRound < (config.rounds || 1)) {
        return { nextPhase: 'WORK', nextRound: currentRound + 1, nextTime: (config.intervalWork || 0) * 1000 };
      }
      return null;
    }

    return null;
  }, [config]);

  const tick = useCallback((timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;

    // Расчет дельты с начала этого сегмента RUNNING
    // Мы добавляем baseTimeRef (накопленное время до паузы)
    // Но на самом деле, более простая логика:
    // Мы отслеживаем `endTime` для текущей фазы?
    // Или просто `remaining = initialDuration - (now - start)`.
    
    // Лучший подход для точности:
    // Хранить `endTime` текущей фазы.
    // пауза: `remaining = endTime - now`.
    // возобновление: `endTime = now + remaining`.
  }, []);

  // Пересмотренная логика тика с useEffect
  useEffect(() => {
    if (state.status !== 'RUNNING') {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    let pPreviousTime = performance.now();
    
    const animate = (time: number) => {
      const deltaTime = time - pPreviousTime;
      
      if (deltaTime > 100) { // проверка больших скачков (троттлинг), в основном игнорируем мелкие дрожания
         // console.log('delta', deltaTime); 
      }
      pPreviousTime = time;

      setState(prev => {
        let newTimeLeft = prev.timeLeft - deltaTime;
        
        // Аудио проверки для отсчета (3, 2, 1)
        const prevSeconds = Math.ceil((prev.timeLeft) / 1000);
        const newSeconds = Math.ceil(newTimeLeft / 1000);
        if (newSeconds < prevSeconds && newSeconds <= 3 && newSeconds > 0) {
          audioController.playCountdown();
        }

        if (newTimeLeft <= 0) {
           // Фаза завершена
           const next = transitionPhase(prev.phase, prev.currentRound);
           if (next) {
             return {
               ...prev,
               phase: next.nextPhase,
               currentRound: next.nextRound,
               timeLeft: next.nextTime, // Сброс таймера для следующей фазы
             };
           } else {
             // Полностью завершено
             audioController.playStop();
             return {
               ...prev,
               status: 'FINISHED',
               timeLeft: 0,
             };
           }
        }

        return {
          ...prev,
          timeLeft: newTimeLeft,
          elapsedTime: prev.elapsedTime + deltaTime
        };
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [state.status, transitionPhase]); // Перепривязывается, когда статус меняется на RUNNING

  // Управление
  const start = () => setState(prev => ({ ...prev, status: 'RUNNING' }));
  const pause = () => setState(prev => ({ ...prev, status: 'PAUSED' }));
  const reset = () => {
    setState({
      status: 'IDLE',
      phase: 'WARMUP',
      timeLeft: WARMUP_TIME,
      elapsedTime: 0,
      currentRound: 1,
      totalRounds: config.rounds || 1
    });
  };

  const skipWarmup = () => {
     if (state.phase === 'WARMUP') {
        const next = transitionPhase('WARMUP', 1);
        if (next) {
          setState(prev => ({
            ...prev,
            phase: next.nextPhase,
            currentRound: next.nextRound,
            timeLeft: next.nextTime,
            status: prev.status === 'RUNNING' ? 'RUNNING' : 'IDLE' // Сохранить статус, если подразумевается
          }));
        }
     }
  };

  const addRound = () => {
    setState(prev => ({ ...prev, currentRound: prev.currentRound + 1 }));
    audioController.playRoundComplete();
  };

  return { state, start, pause, reset, skipWarmup, addRound };
};
