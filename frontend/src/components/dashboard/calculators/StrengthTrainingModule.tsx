import React, { useState, useEffect } from 'react';
import Button from '../../ui/Button';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface Exercise {
  id: string;
  name: string;
  maxWeight: number;
}

interface StrengthResult {
  id: string;
  date: string;
  week: number;
  weight: number;
  reps: number;
}

interface StrengthTrainingModuleProps {
  exercises: Exercise[];
  onAddToCalendar: (title: string, description: string) => void;
  handleInputPointerDown: (e: React.PointerEvent) => void;
  handleInputKeyDown: (e: React.KeyboardEvent) => void;
}

export function StrengthTrainingModule({ 
    exercises, 
    onAddToCalendar,
    handleInputPointerDown,
    handleInputKeyDown 
}: StrengthTrainingModuleProps) {
  const { user } = useAuthStore();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [oneRepMax, setOneRepMax] = useState<number>(0);
  const [trainingMax, setTrainingMax] = useState<number>(0);
  const [history, setHistory] = useState<StrengthResult[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Logging state
  const [loggingWeek, setLoggingWeek] = useState<number | null>(null);
  const [logWeight, setLogWeight] = useState<number>(0);
  const [logReps, setLogReps] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedExerciseId) {
      const exercise = exercises.find(ex => ex.id === selectedExerciseId);
      if (exercise) {
        setOneRepMax(exercise.maxWeight);
      }
      fetchHistory();
    } else {
      setHistory([]);
    }
  }, [selectedExerciseId, exercises]);

  useEffect(() => {
    // Training Max is typically 90% of 1RM
    setTrainingMax(Math.round(oneRepMax * 0.9));
  }, [oneRepMax]);

  const fetchHistory = async () => {
    if (!user?.id || !selectedExerciseId) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/strength-results?userId=${user.id}&exerciseId=${selectedExerciseId}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch history', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const calculateWeight = (percentage: number) => {
    return Math.round(trainingMax * percentage);
  };

  const startLogging = (week: number, weight: number) => {
    setLoggingWeek(week);
    setLogWeight(weight);
    setLogReps(0);
  };

  const saveResult = async () => {
    if (!user?.id || !selectedExerciseId || loggingWeek === null) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/strength-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          exerciseId: selectedExerciseId,
          week: loggingWeek,
          weight: logWeight,
          reps: logReps,
          date: new Date(),
        }),
      });

      if (res.ok) {
        await fetchHistory();
        setLoggingWeek(null);
        setLogReps(0);
      }
    } catch (error) {
      console.error('Failed to save result', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col relative w-full">
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Упражнение</label>
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            onPointerDown={handleInputPointerDown}
            onKeyDown={handleInputKeyDown}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
          >
            <option value="">Выберите упражнение</option>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">1RM (Максимум)</label>
            <input
              type="number"
              value={oneRepMax || ''}
              onChange={(e) => setOneRepMax(Number(e.target.value))}
              onPointerDown={handleInputPointerDown}
              onKeyDown={handleInputKeyDown}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              placeholder="кг"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Тренировочный Вес (90%)</label>
            <input
              type="number"
              value={trainingMax || ''}
              onChange={(e) => setTrainingMax(Number(e.target.value))}
              onPointerDown={handleInputPointerDown}
              onKeyDown={handleInputKeyDown}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              placeholder="кг"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto mb-4">
        <table className="w-full text-sm text-left table-fixed">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-2 py-3 w-12 text-center">Нед</th>
              <th className="px-2 py-3 w-1/3">Разминка</th>
              <th className="px-2 py-3 w-1/3">Рабочие сеты</th>
              <th className="px-2 py-3 text-right">Действие</th>
            </tr>
          </thead>
          <tbody>
            {/* Week 1 */}
            <tr className="bg-white border-b hover:bg-gray-50 align-top">
              <td className="px-2 py-3 font-medium text-gray-900 text-center">1</td>
              <td className="px-2 py-3 text-gray-500 break-words text-xs sm:text-sm">
                <div className="space-y-1">
                  <div>40% × 5 ({calculateWeight(0.40)}кг)</div>
                  <div>50% × 5 ({calculateWeight(0.50)}кг)</div>
                  <div>60% × 3 ({calculateWeight(0.60)}кг)</div>
                </div>
              </td>
              <td className="px-2 py-3 break-words text-xs sm:text-sm">
                <div className="space-y-1">
                  <div>65% × 5 ({calculateWeight(0.65)}кг)</div>
                  <div>75% × 5 ({calculateWeight(0.75)}кг)</div>
                  <div className="font-bold text-blue-600">85% × 5+ ({calculateWeight(0.85)}кг)</div>
                </div>
              </td>
              <td className="px-2 py-3 text-right">
                {loggingWeek === 1 ? (
                  <div className="flex flex-col items-end gap-2" onPointerDown={handleInputPointerDown} onKeyDown={handleInputKeyDown}>
                      <input 
                        type="number" 
                        className="w-16 px-1 py-1 border rounded text-right text-sm"
                        placeholder="Reps"
                        value={logReps || ''}
                        onChange={(e) => setLogReps(Number(e.target.value))}
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <button onClick={() => setLoggingWeek(null)} className="text-xs text-gray-500 hover:text-gray-700">Отм</button>
                        <Button variant="primary" size="sm" onClick={saveResult} disabled={isSubmitting}>OK</Button>
                      </div>
                  </div>
                ) : (
                  <div className="flex gap-1 justify-end">
                    <Button variant="outline" size="sm" onClick={() => startLogging(1, calculateWeight(0.85))} onPointerDown={handleInputPointerDown} className="px-2 text-xs">Зап</Button>
                    <button 
                         onClick={() => onAddToCalendar(
                             `${exercises.find(e => e.id === selectedExerciseId)?.name || '5/3/1'}: Неделя 1`, 
                             `${exercises.find(e => e.id === selectedExerciseId)?.name || 'Упражнение'}:
Warm-up: 5x${calculateWeight(0.40)}кг, 5x${calculateWeight(0.50)}кг, 3x${calculateWeight(0.60)}кг
Work: 5x${calculateWeight(0.65)}кг, 5x${calculateWeight(0.75)}кг, 5+x${calculateWeight(0.85)}кг`
                         )}
                         className="text-gray-300 hover:text-blue-500 p-1"
                         title="Добавить в календарь"
                         onPointerDown={handleInputPointerDown}
                     >
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                         </svg>
                     </button>
                  </div>
                )}
              </td>
            </tr>

            {/* Week 2 */}
            <tr className="bg-white border-b hover:bg-gray-50 align-top">
              <td className="px-2 py-3 font-medium text-gray-900 text-center">2</td>
              <td className="px-2 py-3 text-gray-500 break-words text-xs sm:text-sm">
                <div className="space-y-1">
                  <div>40% × 5 ({calculateWeight(0.40)}кг)</div>
                  <div>50% × 5 ({calculateWeight(0.50)}кг)</div>
                  <div>60% × 3 ({calculateWeight(0.60)}кг)</div>
                </div>
              </td>
              <td className="px-2 py-3 break-words text-xs sm:text-sm">
                <div className="space-y-1">
                  <div>70% × 3 ({calculateWeight(0.70)}кг)</div>
                  <div>80% × 3 ({calculateWeight(0.80)}кг)</div>
                  <div className="font-bold text-blue-600">90% × 3+ ({calculateWeight(0.90)}кг)</div>
                </div>
              </td>
              <td className="px-2 py-3 text-right">
                {loggingWeek === 2 ? (
                  <div className="flex flex-col items-end gap-2" onPointerDown={handleInputPointerDown} onKeyDown={handleInputKeyDown}>
                      <input 
                        type="number" 
                        className="w-16 px-1 py-1 border rounded text-right text-sm"
                        placeholder="Reps"
                        value={logReps || ''}
                        onChange={(e) => setLogReps(Number(e.target.value))}
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <button onClick={() => setLoggingWeek(null)} className="text-xs text-gray-500 hover:text-gray-700" onPointerDown={handleInputPointerDown}>Отм</button>
                        <Button variant="primary" size="sm" onClick={saveResult} disabled={isSubmitting} onPointerDown={handleInputPointerDown}>OK</Button>
                      </div>
                  </div>
                ) : (
                  <div className="flex gap-1 justify-end">
                    <Button variant="outline" size="sm" onClick={() => startLogging(2, calculateWeight(0.90))} onPointerDown={handleInputPointerDown} className="px-2 text-xs">Зап</Button>
                    <button 
                         onClick={() => onAddToCalendar(
                             `${exercises.find(e => e.id === selectedExerciseId)?.name || '5/3/1'}: Неделя 2`, 
                             `${exercises.find(e => e.id === selectedExerciseId)?.name || 'Упражнение'}:
Warm-up: 5x${calculateWeight(0.40)}кг, 5x${calculateWeight(0.50)}кг, 3x${calculateWeight(0.60)}кг
Work: 3x${calculateWeight(0.70)}кг, 3x${calculateWeight(0.80)}кг, 3+x${calculateWeight(0.90)}кг`
                         )}
                         className="text-gray-300 hover:text-blue-500 p-1"
                         title="Добавить в календарь"
                         onPointerDown={handleInputPointerDown}
                     >
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                         </svg>
                     </button>
                  </div>
                )}
              </td>
            </tr>

            {/* Week 3 */}
            <tr className="bg-white border-b hover:bg-gray-50 align-top">
              <td className="px-2 py-3 font-medium text-gray-900 text-center">3</td>
              <td className="px-2 py-3 text-gray-500 break-words text-xs sm:text-sm">
                <div className="space-y-1">
                  <div>40% × 5 ({calculateWeight(0.40)}кг)</div>
                  <div>50% × 5 ({calculateWeight(0.50)}кг)</div>
                  <div>60% × 3 ({calculateWeight(0.60)}кг)</div>
                </div>
              </td>
              <td className="px-2 py-3 break-words text-xs sm:text-sm">
                <div className="space-y-1">
                  <div>75% × 5 ({calculateWeight(0.75)}кг)</div>
                  <div>85% × 3 ({calculateWeight(0.85)}кг)</div>
                  <div className="font-bold text-blue-600">95% × 1+ ({calculateWeight(0.95)}кг)</div>
                </div>
              </td>
              <td className="px-2 py-3 text-right">
                {loggingWeek === 3 ? (
                  <div className="flex flex-col items-end gap-2" onPointerDown={handleInputPointerDown} onKeyDown={handleInputKeyDown}>
                      <input 
                        type="number" 
                        className="w-16 px-1 py-1 border rounded text-right text-sm"
                        placeholder="Reps"
                        value={logReps || ''}
                        onChange={(e) => setLogReps(Number(e.target.value))}
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <button onClick={() => setLoggingWeek(null)} className="text-xs text-gray-500 hover:text-gray-700" onPointerDown={handleInputPointerDown}>Отм</button>
                        <Button variant="primary" size="sm" onClick={saveResult} disabled={isSubmitting} onPointerDown={handleInputPointerDown}>OK</Button>
                      </div>
                  </div>
                ) : (
                  <div className="flex gap-1 justify-end">
                    <Button variant="outline" size="sm" onClick={() => startLogging(3, calculateWeight(0.95))} onPointerDown={handleInputPointerDown} className="px-2 text-xs">Зап</Button>
                    <button 
                         onClick={() => onAddToCalendar(
                             `${exercises.find(e => e.id === selectedExerciseId)?.name || '5/3/1'}: Неделя 3`, 
                             `${exercises.find(e => e.id === selectedExerciseId)?.name || 'Упражнение'}:
Warm-up: 5x${calculateWeight(0.40)}кг, 5x${calculateWeight(0.50)}кг, 3x${calculateWeight(0.60)}кг
Work: 5x${calculateWeight(0.75)}кг, 3x${calculateWeight(0.85)}кг, 1+x${calculateWeight(0.95)}кг`
                         )}
                         className="text-gray-300 hover:text-blue-500 p-1"
                         title="Добавить в календарь"
                         onPointerDown={handleInputPointerDown}
                     >
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                         </svg>
                     </button>
                  </div>
                )}
              </td>
            </tr>

            {/* Week 4 (Deload) */}
            <tr className="bg-white hover:bg-gray-50 align-top">
              <td className="px-2 py-3 font-medium text-gray-900 text-center">4</td>
              <td className="px-2 py-3 text-gray-500 break-words text-xs sm:text-sm">
                <div className="space-y-1">
                  <div>40% × 5 ({calculateWeight(0.40)}кг)</div>
                  <div>50% × 5 ({calculateWeight(0.50)}кг)</div>
                  <div>60% × 5 ({calculateWeight(0.60)}кг)</div>
                </div>
              </td>
              <td className="px-2 py-3 break-words text-xs sm:text-sm">
                <div className="space-y-1 text-gray-500">
                  <div>40% × 5 ({calculateWeight(0.40)}кг)</div>
                  <div>50% × 5 ({calculateWeight(0.50)}кг)</div>
                  <div>60% × 5 ({calculateWeight(0.60)}кг)</div>
                </div>
              </td>
              <td className="px-2 py-3 text-right">
                <span className="text-xs text-gray-400">Deload</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-auto">
        <Button 
            variant="ghost" 
            className="w-full justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => setShowHistory(true)}
            onPointerDown={handleInputPointerDown}
        >
            История
        </Button>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm p-4 flex flex-col rounded-lg animate-in fade-in duration-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">История</h3>
                <button 
                    onClick={() => setShowHistory(false)}
                    onPointerDown={handleInputPointerDown}
                    className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div className="flex-1 overflow-auto">
             {loadingHistory ? (
                <div className="text-center py-4 text-gray-500">Загрузка...</div>
             ) : history.length > 0 ? (
                <div className="relative">
                  {history.map((record) => (
                    <div key={record.id} className="mb-4 pb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                          Неделя {record.week}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Вес: <span className="font-semibold text-gray-900">{record.weight}кг</span></span>
                        <span className="text-gray-600">Повторения: <span className="font-semibold text-gray-900">{record.reps}</span></span>
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        1RM: {(record.weight * record.reps * 0.0333 + record.weight).toFixed(1)}кг
                      </div>
                    </div>
                  ))}
                </div>
             ) : (
                <div className="text-center py-8 text-gray-400">
                  {selectedExerciseId ? 'Нет записей' : 'Выберите упражнение'}
                </div>
             )}
            </div>
        </div>
      )}
    </div>
  );
}
