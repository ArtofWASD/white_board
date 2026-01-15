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
    // Only stop propagation if we are interacting with interactive elements inside the widget
    // But usually for dnd-kit grid, we want the *header* or specific handle to drag, 
    // and the content to be interactive. 
    // However, the current issue described in the audit is that dnd-kit interferes with inputs.
    // So we should stop bubbling for pointer events on the content area if strictly needed, 
    // OR just rely on dnd-kit's sensor configuration.
    // A common pattern for cards in dnd-grids is to have a specific drag handle or 
    // ensure inputs stop propagation.
    
    // For this 'Smart Widget', let's just provide the structure. 
    // The specific stopPropagation usually needs to happen ON the input itself or a wrapper of the input.
    // If we stop propagation on the whole card content, we might break dragging if the user grabs the body? 
    // Typically in these dashboards, the whole card is draggable.
    
    // Strategy: We will provide a helper or wrapper for content that should remain interactive (inputs, buttons).
  };

  return (
    <Card className={`h-full flex flex-col relative transition-all duration-300 ${className} ${!isExpanded ? 'overflow-hidden' : ''}`} noPadding={true}>
      {(title || headerActions) && (
         <div className={`flex justify-between items-center shrink-0 ${!isExpanded ? 'px-4 h-full' : 'p-4 border-b border-gray-100'}`}>
           {title && <h2 className={`font-bold text-gray-900 transition-all ${!isExpanded ? 'text-base' : 'text-xl'}`}>{title}</h2>}
           <div className="flex items-center gap-2">
             {headerActions && <div>{headerActions}</div>}
             {/* Collapse button - only visible on mobile/tablet */}
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
        // We can add a class here to mark it as "no-drag" region if we configure dnd-sensor to ignore it
      >
        {children}
      </div>
      )}
    </Card>
  );
};

// Helper to wrap interactive elements
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
