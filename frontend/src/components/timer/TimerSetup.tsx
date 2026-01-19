import React, { useState } from 'react';
import { TimerConfig, TimerMode } from '../../hooks/useWODTimer';

interface TimerSetupProps {
  onStart: (config: TimerConfig) => void;
}

const MODES: { id: TimerMode; label: string; desc: string }[] = [
  { id: 'FOR_TIME', label: 'For Time', desc: 'Закончить задание как можно быстрее' },
  { id: 'AMRAP', label: 'AMRAP', desc: 'Как можно больше раундов/повторений' },
  { id: 'EMOM', label: 'EMOM', desc: 'Каждую минуту в начале минуты' },
  { id: 'TABATA', label: 'Tabata', desc: '20с Работа / 10с Отдых' },
  { id: 'INTERVALS', label: 'Intervals', desc: 'Настраиваемые интервалы' },
];

export const TimerSetup: React.FC<TimerSetupProps> = ({ onStart }) => {
  const [selectedMode, setSelectedMode] = useState<TimerMode | null>(null);
  
  // Local state for form inputs
  const [durationMinutes, setDurationMinutes] = useState(10); // AMRAP default
  const [timeCapMinutes, setTimeCapMinutes] = useState(20); // For Time cap
  const [emomInterval, setEmomInterval] = useState(60); // EMOM seconds
  const [emomRounds, setEmomRounds] = useState(10);
  
  const [workBytes, setWorkBytes] = useState(20); // Tabata/Interval default
  const [restBytes, setRestBytes] = useState(10);
  const [rounds, setRounds] = useState(8);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMode) return;

    const config: TimerConfig = { mode: selectedMode };

    switch (selectedMode) {
      case 'FOR_TIME':
        config.timeCap = timeCapMinutes * 60;
        config.rounds = 1; 
        break;
      case 'AMRAP':
        config.duration = durationMinutes * 60;
        config.rounds = 1;
        break;
      case 'EMOM':
        config.intervalWork = emomInterval;
        config.rounds = emomRounds;
        break;
      case 'TABATA':
        config.intervalWork = 20;
        config.intervalRest = 10;
        config.rounds = 8;
        break;
      case 'INTERVALS':
        config.intervalWork = workBytes;
        config.intervalRest = restBytes;
        config.rounds = rounds;
        break;
    }
    
    onStart(config);
  };

  if (!selectedMode) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 w-full max-w-5xl mx-auto">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMode(m.id)}
            className="flex flex-col items-center justify-center p-8 bg-white hover:bg-gray-50 rounded-2xl shadow-md transition-all hover:scale-105 border border-gray-200 hover:border-blue-500 group"
          >
            <h3 className="text-3xl font-bold text-gray-800 mb-2 group-hover:text-blue-600">{m.label}</h3>
            <p className="text-gray-500 text-center">{m.desc}</p>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mt-12">
      <div className="mb-6 flex items-center justify-between">
         <h2 className="text-2xl font-bold text-gray-800">{MODES.find(m => m.id === selectedMode)?.label} Настройка</h2>
         <button onClick={() => setSelectedMode(null)} className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1">
           Сменить режим
         </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {selectedMode === 'FOR_TIME' && (
          <div>
            <label className="block text-gray-600 font-medium mb-2">Лимит времени (минуты)</label>
            <input 
              type="number" 
              value={timeCapMinutes}
              onChange={e => setTimeCapMinutes(Number(e.target.value))}
              className="w-full bg-gray-50 text-gray-900 p-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-2xl text-center transition-all"
            />
          </div>
        )}

        {selectedMode === 'AMRAP' && (
          <div>
            <label className="block text-gray-600 font-medium mb-2">Длительность (минуты)</label>
            <input 
              type="number" 
              value={durationMinutes}
              onChange={e => setDurationMinutes(Number(e.target.value))}
              className="w-full bg-gray-50 text-gray-900 p-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-2xl text-center transition-all"
            />
          </div>
        )}

        {selectedMode === 'EMOM' && (
          <div className="space-y-4">
             <div>
               <label className="block text-gray-600 font-medium mb-2">Интервал (секунды)</label>
               <input 
                 type="number" 
                 value={emomInterval}
                 onChange={e => setEmomInterval(Number(e.target.value))}
                 className="w-full bg-gray-50 text-gray-900 p-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-2xl text-center transition-all"
               />
             </div>
             <div>
               <label className="block text-gray-600 font-medium mb-2">Раунды</label>
               <input 
                 type="number" 
                 value={emomRounds}
                 onChange={e => setEmomRounds(Number(e.target.value))}
                 className="w-full bg-gray-50 text-gray-900 p-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-2xl text-center transition-all"
               />
             </div>
          </div>
        )}
        
        {selectedMode === 'TABATA' && (
           <div className="text-gray-600 text-center py-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xl">Стандартная Tabata</p>
              <p className="text-3xl font-bold text-gray-900 my-2">20с Работа / 10с Отдых</p>
              <p>8 Раундов</p>
           </div>
        )}

        {selectedMode === 'INTERVALS' && (
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 font-medium mb-2">Работа (сек)</label>
                  <input 
                    type="number" 
                    value={workBytes}
                    onChange={e => setWorkBytes(Number(e.target.value))}
                    className="w-full bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-2xl text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-2">Отдых (сек)</label>
                  <input 
                    type="number" 
                    value={restBytes}
                    onChange={e => setRestBytes(Number(e.target.value))}
                    className="w-full bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-2xl text-center font-bold"
                  />
                </div>
             </div>
             <div>
               <label className="block text-gray-600 font-medium mb-2">Раунды</label>
               <input 
                 type="number" 
                 value={rounds}
                 onChange={e => setRounds(Number(e.target.value))}
                 className="w-full bg-gray-50 text-gray-900 p-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-2xl text-center transition-all"
               />
             </div>
          </div>
        )}

        <button 
           type="submit"
           className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xl mt-8 transition-colors shadow-lg shadow-blue-200"
        >
          НАЧАТЬ ТАЙМЕР
        </button>

      </form>
    </div>
  );
};
