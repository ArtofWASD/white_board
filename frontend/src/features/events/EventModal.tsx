import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { Team, EventResult, TeamMember, Exercise } from '../../types';

// Removed local Exercise interface to avoid conflict or need to update it to use string id matching global type

interface EventData {
  title?: string;
  scheme?: string; // Add scheme
  exerciseType?: string;
  exercises?: Exercise[];
  results?: EventResult[];
  teamId?: string;
  timeCap?: string;
  rounds?: string;
  participants?: { id: string; name: string; lastName?: string }[];
}


interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  date: string;
  eventData?: EventData;
  initialTeamId?: string;
}

const EventModal: React.FC<EventModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  date, 
  eventData,
  initialTeamId 
}) => {
  const { user, token } = useAuthStore();
  
  // Form state
  const [eventTitle, setEventTitle] = useState(eventData?.title || '');
  const [scheme, setScheme] = useState(eventData?.scheme || 'FOR_TIME'); // Default to FOR_TIME
  const [exerciseType, setExerciseType] = useState(eventData?.exerciseType || '');
  const [exercises, setExercises] = useState<Exercise[]>(eventData?.exercises || []);
  const [timeCap, setTimeCap] = useState(eventData?.timeCap || '');
  const [rounds, setRounds] = useState(eventData?.rounds || '');
  
  // Exercise input state
  const [exerciseName, setExerciseName] = useState('');
  const [rxWeight, setRxWeight] = useState('');
  const [rxReps, setRxReps] = useState('');
  const [scWeight, setScWeight] = useState('');
  const [scReps, setScReps] = useState('');
  
  // Exercise measurement state
  const [exerciseMeasurement, setExerciseMeasurement] = useState<'weight' | 'calories'>('weight');
  const [rxCalories, setRxCalories] = useState('');
  const [scCalories, setScCalories] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  
  const [sortedResults, setSortedResults] = useState<EventResult[]>(eventData?.results || []);
  const [isSorted, setIsSorted] = useState(false);
  
  // Team state
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(eventData?.teamId || initialTeamId || '');
  
  // Member assignment state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [assignMode, setAssignMode] = useState<'all' | 'selected'>('all');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // Fetch teams
  useEffect(() => {
    const fetchTeams = async () => {
      if (user && token) {
        try {
          const response = await fetch(`/api/teams?userId=${user.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setTeams(data);
          }
        } catch (error) {
           console.error("Failed to fetch teams", error);
        }
      }
    };
    fetchTeams();
  }, [user, token]);

  // Fetch team members when team changes
  useEffect(() => {
    const fetchMembers = async () => {
        if (selectedTeamId && token) {
            try {
                const response = await fetch(`/api/teams/${selectedTeamId}/members`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setTeamMembers(data);
                } else {
                    setTeamMembers([]);
                }
            } catch (error) {
                console.error("Failed to fetch team members", error);
                setTeamMembers([]);
            }
        } else {
            setTeamMembers([]);
        }
    };
    fetchMembers();
  }, [selectedTeamId, token]);

  // Handle form initialization and updates
  useEffect(() => {
    if (isOpen && eventData) {
      setEventTitle(eventData.title || '');
      setScheme(eventData.scheme || 'FOR_TIME');
      setExerciseType(eventData.exerciseType || '');
      setExercises(eventData.exercises || []);
      setSortedResults(eventData.results || []);
      setSelectedTeamId(eventData.teamId || '');
      setTimeCap(eventData.timeCap || '');
      setRounds(eventData.rounds || '');
      
      // Initialize assignment state
      if (eventData.participants && eventData.participants.length > 0) {
          setAssignMode('selected');
          setSelectedMemberIds(eventData.participants.map(p => p.id));
      } else {
          setAssignMode('all');
          setSelectedMemberIds([]);
      }
    } else if (isOpen) {
      // Reset form when opening without eventData
      setEventTitle('');
      setScheme('FOR_TIME');
      setExerciseType('');
      setExercises([]);
      setExerciseName('');
      setRxWeight('');
      setRxReps('');
      setScWeight('');
      setScReps('');
      setExerciseMeasurement('weight');
      setRxCalories('');
      setScCalories('');
      setError(null);
      setSortedResults([]);
      setIsSorted(false);
      setSelectedTeamId(initialTeamId || '');
      setTimeCap('');
      setRounds('');
      setAssignMode('all');
      setSelectedMemberIds([]);
    }
  }, [isOpen, eventData, initialTeamId]);

  const resetForm = () => {
    setEventTitle(eventData?.title || '');
    setScheme(eventData?.scheme || 'FOR_TIME');
    setExerciseType(eventData?.exerciseType || '');
    setExercises(eventData?.exercises || []);
    setExerciseName('');
    setRxWeight('');
    setRxReps('');
    setScWeight('');
    setScReps('');
    setExerciseMeasurement('weight');
    setRxCalories('');
    setScCalories('');
    setError(null);
    setSortedResults(eventData?.results || []);
    setIsSorted(false);
    setSelectedTeamId(eventData?.teamId || initialTeamId || '');
    setTimeCap(eventData?.timeCap || '');
    setRounds(eventData?.rounds || '');
    setAssignMode('all');
    setSelectedMemberIds([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!eventTitle.trim()) {
      setError('Название события обязательно для заполнения');
      return;
    }

    if (exercises.length === 0) {
      setError('Необходимо добавить хотя бы одно упражнение');
      return;
    }

    if (eventTitle.trim()) {
      onSave({
        title: eventTitle,
        scheme,
        exerciseType,
        exercises,
        teamId: selectedTeamId || undefined,
        timeCap,
        rounds,
        // Pass assignment info. If 'all', assignedUserIds is undefined or empty implies whole team
        assignedUserIds: assignMode === 'selected' ? selectedMemberIds : undefined
      });
    }
  };

  const handleClose = () => {
    // Check if we are in edit mode (eventData exists)
    if (eventData) {
      const confirmClose = window.confirm('Внесенные изменения не сохранятся. Вы уверены, что хотите закрыть?');
      if (confirmClose) {
        resetForm();
        onClose();
      }
    } else {
      // Creation mode - just close
      resetForm();
      onClose();
    }
  };

  const handleAddExercise = () => {
    if (exerciseName.trim()) {
      const newExercise: Exercise = {
        id: Date.now().toString(), // Use string ID
        name: exerciseName.trim(),
        weight: rxWeight, // Default to Rx values
        repetitions: rxReps,
        scWeight, // Add scWeight
        scReps,
        measurement: exerciseMeasurement,
        rxCalories: exerciseMeasurement === 'calories' ? rxCalories : undefined,
        scCalories: exerciseMeasurement === 'calories' ? scCalories : undefined
      };
      setExercises([...exercises, newExercise]);
      setExerciseName('');
      setRxWeight('');
      setRxReps('');
      setScWeight('');
      setScReps('');
      setRxCalories('');
      setScCalories('');
    }
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter(exercise => exercise.id !== id));
  };
  
  const toggleMemberSelection = (userId: string) => {
      setSelectedMemberIds(prev => 
        prev.includes(userId) 
            ? prev.filter(id => id !== userId)
            : [...prev, userId]
      );
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 event-modal"
      onClick={handleClose}
      data-event-modal="true"
    >
      <div 
        className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto sm:m-4"
        onClick={(e) => e.stopPropagation()}
        data-event-modal-content="true"
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">
            {eventData ? 'Редактировать событие для' : 'Добавить событие для'} {date}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="eventTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Название события <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="eventTitle"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите название события"
              autoFocus
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="team" className="block text-sm font-medium text-gray-700 mb-1">
              Команда (необязательно)
            </label>
            <select
              id="team"
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Личное событие</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Athlete Assignment UI */}
          {selectedTeamId && teamMembers.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Назначить:</label>
                  <div className="flex gap-4 mb-3">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input 
                            type="radio" 
                            name="assignMode" 
                            checked={assignMode === 'all'} 
                            onChange={() => setAssignMode('all')}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          Всей команде
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input 
                            type="radio" 
                            name="assignMode" 
                            checked={assignMode === 'selected'} 
                            onChange={() => setAssignMode('selected')}
                             className="text-blue-600 focus:ring-blue-500"
                          />
                          Выбрать атлетов
                      </label>
                  </div>
                  
                  {assignMode === 'selected' && (
                      <div className="max-h-40 overflow-y-auto border border-gray-300 rounded bg-white p-2">
                          <div className="text-xs text-gray-500 mb-2">Выберите одного или нескольких</div>
                          {teamMembers.map(member => (
                              <label key={member.id} className="flex items-center gap-2 py-1 px-2 hover:bg-gray-50 cursor-pointer rounded">
                                  <input 
                                    type="checkbox"
                                    checked={selectedMemberIds.includes(member.user.id)}
                                    onChange={() => toggleMemberSelection(member.user.id)}
                                    className="rounded text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm">{member.user.name} {member.user.lastName || ''}</span>
                              </label>
                          ))}
                      </div>
                  )}
              </div>
          )}

          <div className="mb-4">
            <label htmlFor="scheme" className="block text-sm font-medium text-gray-700 mb-1">
              Тип задания (Scheme)
            </label>
            <select
              id="scheme"
              value={scheme}
              onChange={(e) => setScheme(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="FOR_TIME">For Time (На время)</option>
              <option value="AMRAP">AMRAP (Макс. раундов)</option>
              <option value="EMOM">EMOM (Каждую минуту)</option>
              <option value="WEIGHTLIFTING">Weightlifting (Силовая)</option>
            </select>
          </div>

          {(scheme === 'FOR_TIME' || scheme === 'AMRAP' || scheme === 'EMOM') && (
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="timeCap" className="block text-sm font-medium text-gray-700 mb-1">
                  Time Cap (Лимит времени)
                </label>
                <input
                  type="text"
                  id="timeCap"
                  value={timeCap}
                  onChange={(e) => setTimeCap(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Например: 15:00"
                />
              </div>
              {scheme === 'EMOM' && (
                <div>
                  <label htmlFor="rounds" className="block text-sm font-medium text-gray-700 mb-1">
                    Количество раундов
                  </label>
                  <input
                    type="text"
                    id="rounds"
                    value={rounds}
                    onChange={(e) => setRounds(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Например: 10"
                  />
                </div>
              )}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="exerciseType" className="block text-sm font-medium text-gray-700 mb-1">
              Название комплекса (опционально)
            </label>
             <input
              type="text"
              id="exerciseType"
              value={exerciseType}
              onChange={(e) => setExerciseType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Например: Fran, Murph"
            />
          </div>

          <div className="mb-4 border p-4 rounded-md bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Упражнения
            </label>
            
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Название</label>
                <input
                  type="text"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Например: Трастеры"
                />
              </div>
              
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setExerciseMeasurement('weight')}
                  className={`px-3 py-1 text-xs font-medium rounded ${
                    exerciseMeasurement === 'weight'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Вес / Повторы
                </button>
                <button
                  type="button"
                  onClick={() => setExerciseMeasurement('calories')}
                  className={`px-3 py-1 text-xs font-medium rounded ${
                    exerciseMeasurement === 'calories'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Каллории
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-center font-semibold text-blue-800 mb-2 text-sm">Rx</div>
                  <div className="space-y-2">
                    {exerciseMeasurement === 'weight' ? (
                      <>
                        <input
                          type="text"
                          value={rxWeight}
                          onChange={(e) => setRxWeight(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Вес (кг)"
                        />
                        <input
                          type="text"
                          value={rxReps}
                          onChange={(e) => setRxReps(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Повторы"
                        />
                      </>
                    ) : (
                      <input
                        type="text"
                        value={rxCalories}
                        onChange={(e) => setRxCalories(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Каллории"
                      />
                    )}
                  </div>
                </div>
                
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-center font-semibold text-green-800 mb-2 text-sm">Sc</div>
                  <div className="space-y-2">
                    {exerciseMeasurement === 'weight' ? (
                      <>
                        <input
                          type="text"
                          value={scWeight}
                          onChange={(e) => setScWeight(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Вес (кг)"
                        />
                        <input
                          type="text"
                          value={scReps}
                          onChange={(e) => setScReps(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Повторы"
                        />
                      </>
                    ) : (
                      <input
                        type="text"
                        value={scCalories}
                        onChange={(e) => setScCalories(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Каллории"
                      />
                    )}
                  </div>
                </div>
              </div>
              
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleAddExercise();
                }}
                className="w-full py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition text-sm"
              >
                Добавить упражнение
              </button>
            </div>
            
            {exercises.length > 0 && (
              <ul className="border border-gray-200 rounded-md max-h-40 overflow-y-auto bg-white">
                {exercises.map((exercise) => (
                  <li 
                    key={exercise.id} 
                    className="flex justify-between items-center px-3 py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div>
                      <div className="font-medium text-sm">{exercise.name}</div>
                      <div className="text-xs text-gray-500">
                        {exercise.measurement === 'calories' ? (
                          <>
                            Rx: {exercise.rxCalories || '-'} кал. | 
                            Sc: {exercise.scCalories || '-'} кал.
                          </>
                        ) : (
                          <>
                            Rx: {exercise.rxWeight || exercise.weight || '-'} кг. / {exercise.rxReps || exercise.repetitions || '-'} пов. | 
                            Sc: {exercise.scWeight || '-'} кг. / {exercise.scReps || '-'} пов.
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleRemoveExercise(exercise.id);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm px-2"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Results section */}
          {eventData?.results && eventData.results.length > 0 && (
            <div className="mb-4 pt-4 border-t border-dotted border-gray-300">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Результаты
                </label>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    
                    const currentScheme = eventData?.scheme || 'FOR_TIME';
                    
                    const sorted = [...(isSorted ? eventData?.results! : sortedResults)].sort((a, b) => {
                       let valA = a.value;
                       let valB = b.value;
                       
                       // Fallback for legacy FOR_TIME data without 'value'
                       if (valA === undefined || valA === null) {
                           const parts = a.time.split(':');
                           if (parts.length >= 2) {
                             valA = parseInt(parts[0]) * 60 + parseInt(parts[1]);
                           } else {
                             valA = parseFloat(a.time) || 0;
                           }
                       }
                       
                       if (valB === undefined || valB === null) {
                           const parts = b.time.split(':');
                           if (parts.length >= 2) {
                             valB = parseInt(parts[0]) * 60 + parseInt(parts[1]);
                           } else {
                             valB = parseFloat(b.time) || 0;
                           }
                       }

                       // Sort Direction
                       if (currentScheme === 'FOR_TIME') {
                           return (valA || 0) - (valB || 0); // Ascending
                       } else {
                           return (valB || 0) - (valA || 0); // Descending
                       }
                    });
                    setSortedResults(sorted);
                    setIsSorted(!isSorted);
                  }}
                  className="text-xs text-blue-500 hover:text-blue-700"
                >
                  {isSorted ? 'Отменить сортировку' : 'Сортировать по результату'}
                </button>
              </div>
              <ul className="border border-gray-200 rounded-md max-h-32 overflow-y-auto bg-gray-50">
                {(isSorted ? sortedResults : eventData.results).map((result) => (
                  <li 
                    key={result.id} 
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-3 py-2 border-b border-gray-100 last:border-b-0 text-sm gap-1"
                  >
                    <span className="font-medium">{result.time}</span>
                    <div className="text-gray-500 text-xs">
                      <div>{result.dateAdded}</div>
                      <div>{result.username}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                e.stopPropagation();
                e.preventDefault();
                handleClose();
              }}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none w-full sm:w-auto"
            >
              Отмена
            </button>
            <button
              type="submit"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleSubmit(e as React.FormEvent);
              }}
              className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none w-full sm:w-auto"
            >
              {eventData ? 'Сохранить изменения' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;