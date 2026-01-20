import React from 'react';
import { CalendarEvent } from './hooks/useCalendarEvents';

interface EventTooltipProps {
  event: CalendarEvent;
  position: { top: number; left: number };
  onClose: () => void;
}

export const EventTooltip: React.FC<EventTooltipProps> = ({ event, position, onClose }) => {
  return (
    <div 
      className="fixed z-50 bg-white rounded-lg shadow-xl p-4 border border-gray-200 w-64 pointer-events-none"
      style={{ 
        top: position.top, 
        left: position.left,
        transform: 'translate(-50%, -100%)',
        marginTop: '-10px'
      }}
    >
      {event.teamName && (
        <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 mb-1">
          {event.teamName}
        </span>
      )}
      {event.participants && event.participants.length > 0 && (
        <div className="mb-2 text-xs text-gray-600 bg-blue-50 p-1.5 rounded border border-blue-100">
          <span className="font-semibold text-blue-800">Assignees: </span>
          {event.participants.map((p) => p.name + (p.lastName ? ` ${p.lastName}` : '')).join(', ')}
        </div>
      )}
      <h3 className="font-bold text-lg mb-2">{event.title}</h3>
      {event.exerciseType && (
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-semibold">Тип:</span> {event.exerciseType}
        </p>
      )}
      {event.description && (
        <div className="text-sm text-gray-600 mb-2 whitespace-pre-wrap border-l-2 border-blue-200 pl-2">
          {event.description}
        </div>
      )}
      {event.timeCap && (
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-semibold">Time Cap:</span> {event.timeCap}
        </p>
      )}
      {event.rounds && (
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-semibold">Rounds:</span> {event.rounds}
        </p>
      )}
      {event.exercises && event.exercises.length > 0 && (
        <div className="mt-2">
          <p className="font-semibold text-sm mb-1">Упражнения:</p>
          <ul className="text-sm list-disc pl-4">
            {event.exercises.slice(0, 3).map((ex, idx) => (
              <li key={idx}>{ex.name}</li>
            ))}
            {event.exercises.length > 3 && <li>...</li>}
          </ul>
        </div>
      )}
      {event.results && event.results.length > 0 && (
        <div className="mt-2 text-sm border-t pt-2 border-gray-100">
          <p className="font-semibold text-sm mb-1">Результаты:</p>
          <ul className="list-disc pl-4 text-gray-700">
            {event.results.slice(0, 3).map((result, idx) => (
              <li key={idx} className="flex flex-col">
                 <span className="font-medium">{result.time}</span>
                 <span className="text-xs text-gray-500">{result.username}</span>
              </li>
            ))}
            {event.results.length > 3 && <li>...</li>}
          </ul>
        </div>
      )}
    </div>
  );
};
