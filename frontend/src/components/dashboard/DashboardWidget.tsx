import React, { useState } from 'react';
import { Card } from '../ui/Card';

interface DashboardWidgetProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  noPadding?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  className = '',
  children,
  headerActions,
  noPadding = false,
  isExpanded = true,
  onToggle,
}) => {
  // const [isCollapsed, setIsCollapsed] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
  // Останавливать распространение только при взаимодействии с интерактивными элементами внутри виджета
    // Но обычно для сетки dnd-kit мы хотим перетаскивать *заголовок* или специальную ручку,
    // а контент должен быть интерактивным.
    // Однако текущая проблема, описанная в аудите, заключается в том, что dnd-kit мешает вводу.
    // Поэтому мы должны остановить всплытие событий указателя в области контента, если это строго необходимо,
    // ИЛИ просто полагаться на конфигурацию сенсора dnd-kit.
    // Распространенный паттерн для карточек в dnd-сетках - иметь специальную ручку перетаскивания или
    // убедиться, что ввод останавливает распространение.
    
    // Для этого 'Smart Widget' давайте просто предоставим структуру.
    // Конкретный stopPropagation обычно должен происходить НА самом вводе или его обертке.
    // Если мы остановим распространение на всем контенте карточки, мы можем сломать перетаскивание, если пользователь схватит тело?
    // Обычно в этих панелях управления вся карточка перетаскиваемая.
    
    // Стратегия: Мы предоставим помощник или обертку для контента, который должен оставаться интерактивным (вводы, кнопки).
  };

  return (
    <Card className={`h-full flex flex-col relative transition-all duration-300 ${className} ${!isExpanded ? 'overflow-hidden' : ''}`} noPadding={true}>
      {(title || headerActions) && (
         <div className={`flex justify-between items-center shrink-0 ${!isExpanded ? 'px-4 h-full' : 'p-4 border-b border-gray-100'}`}>
           {title && <h2 className={`font-bold text-gray-900 transition-all ${!isExpanded ? 'text-base' : 'text-xl'}`}>{title}</h2>}
           <div className="flex items-center gap-2">
             {headerActions && <div>{headerActions}</div>}
             {/* Кнопка сворачивания - видна только на мобильных/планшетах */}
             <button 
                onClick={onToggle}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                title={!isExpanded ? "Развернуть" : "Свернуть"}
                onPointerDown={(e) => e.stopPropagation()} 
             >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={`transform transition-transform duration-200 ${!isExpanded ? 'rotate-180' : ''}`}
                >
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
             </button>
           </div>
         </div>
      )}
      
      {isExpanded && (
      <div 
        className={`flex-1 overflow-hidden ${!noPadding ? 'p-4' : ''}`}
        // Мы можем добавить здесь класс, чтобы пометить его как область "без перетаскивания", если настроим dnd-sensor на его игнорирование
      >
        {children}
      </div>
      )}
    </Card>
  );
};

// Помощник для обертки интерактивных элементов
export const InteractiveArea: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => {
    return (
        <div 
            className={className}
            onPointerDown={(e) => e.stopPropagation()} 
            onKeyDown={(e) => e.stopPropagation()}
        >
            {children}
        </div>
    );
}
