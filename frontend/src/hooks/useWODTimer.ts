import { useState, useEffect, useRef, useCallback } from 'react';
import { audioController } from '../components/timer/AudioController';

export type TimerMode = 'FOR_TIME' | 'AMRAP' | 'EMOM' | 'TABATA' | 'INTERVALS';
export type TimerStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'FINISHED';
export type TimerPhase = 'WARMUP' | 'WORK' | 'REST';

export interface TimerConfig {
  mode: TimerMode;
  timeCap?: number; // in seconds, for FOR_TIME
  duration?: number; // in seconds, for AMRAP
  intervalWork?: number; // in seconds, for EMOM/TABATA/INTERVALS
  intervalRest?: number; // in seconds, for TABATA/INTERVALS
  rounds?: number; // for TABATA/INTERVALS/EMOM
}

export interface TimerState {
  status: TimerStatus;
  phase: TimerPhase;
  timeLeft: number; // in milliseconds
  elapsedTime: number; // in milliseconds
  currentRound: number;
  totalRounds: number;
}

const WARMUP_TIME = 10 * 1000; // 10 seconds

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
  const baseTimeRef = useRef<number>(0); // Time accumulated before current run segment
  const lastTickRef = useRef<number>(0);

  // Helper to handle phase transitions
  const transitionPhase = useCallback((currentPhase: TimerPhase, currentRound: number): { nextPhase: TimerPhase, nextRound: number, nextTime: number } | null => {
    // WARMUP -> WORK
    if (currentPhase === 'WARMUP') {
      let workTime = 0;
      if (config.mode === 'AMRAP') workTime = (config.duration || 0) * 1000;
      else if (['EMOM', 'TABATA', 'INTERVALS'].includes(config.mode)) workTime = (config.intervalWork || 0) * 1000;
      else if (config.mode === 'FOR_TIME') workTime = (config.timeCap || 0) * 1000; // For Time typically counts up, check logic below
      
      // FOR_TIME is special, it counts UP, but we can model it as counting down from cap or just infinite up
      // Let's standardise: timeLeft is what's displayed. 
      // For AMRAP/Intervals: timeLeft decreases.
      // For FOR_TIME: timeLeft increases? Or timeLeft is remaining to cap?
      // Let's use timeLeft as remaining time for the current phase.
      
      audioController.playStart();
      return { nextPhase: 'WORK', nextRound: 1, nextTime: workTime };
    }

    // WORK -> REST or WORK -> FINISHED or WORK -> WORK (next round)
    if (currentPhase === 'WORK') {
      audioController.playRoundComplete();
      
      if (config.mode === 'FOR_TIME' || config.mode === 'AMRAP') {
        return null; // Finished
      }

      if (['TABATA', 'INTERVALS'].includes(config.mode)) {
        if (config.intervalRest && config.intervalRest > 0) {
           // Go to REST
           return { nextPhase: 'REST', nextRound: currentRound, nextTime: (config.intervalRest || 0) * 1000 };
        } else {
           // No rest, check rounds
           if (currentRound < (config.rounds || 1)) {
              return { nextPhase: 'WORK', nextRound: currentRound + 1, nextTime: (config.intervalWork || 0) * 1000 };
           }
           return null; // Finished
        }
      }

      if (config.mode === 'EMOM') {
        // EMOM usually doesn't have explicit rest, just next minute
        if (currentRound < (config.rounds || 1)) {
           return { nextPhase: 'WORK', nextRound: currentRound + 1, nextTime: (config.intervalWork || 60) * 1000 };
        }
        return null;
      }
    }

    // REST -> WORK or REST -> FINISHED
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

    // Calculate delta since start of this RUNNING segment
    // We add baseTimeRef (accumulated time before pause)
    // But actually, simpler logic:
    // We track `endTime` for the current phase?
    // Or just `remaining = initialDuration - (now - start)`.
    
    // Better approach for precision:
    // Store `endTime` of current phase.
    // pause: `remaining = endTime - now`.
    // resume: `endTime = now + remaining`.
  }, []);

  // Revised Tick Logic with useEffect
  useEffect(() => {
    if (state.status !== 'RUNNING') {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    let pPreviousTime = performance.now();
    
    const animate = (time: number) => {
      const deltaTime = time - pPreviousTime;
      
      if (deltaTime > 100) { // check for big jumps (throttling), mostly ignore small jitters
         // console.log('delta', deltaTime); 
      }
      pPreviousTime = time;

      setState(prev => {
        let newTimeLeft = prev.timeLeft - deltaTime;
        
        // Audio Checks for countdown (3, 2, 1)
        const prevSeconds = Math.ceil((prev.timeLeft) / 1000);
        const newSeconds = Math.ceil(newTimeLeft / 1000);
        if (newSeconds < prevSeconds && newSeconds <= 3 && newSeconds > 0) {
          audioController.playCountdown();
        }

        if (newTimeLeft <= 0) {
           // Phase complete
           const next = transitionPhase(prev.phase, prev.currentRound);
           if (next) {
             return {
               ...prev,
               phase: next.nextPhase,
               currentRound: next.nextRound,
               timeLeft: next.nextTime, // Reset timer for next phase
             };
           } else {
             // Finished completely
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
  }, [state.status, transitionPhase]); // Re-binds when status changes to RUNNING

  // Controls
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
            status: prev.status === 'RUNNING' ? 'RUNNING' : 'IDLE' // Keep status if implied
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
