import React from 'react';
import { Card } from '../ui/Card';

interface DashboardWidgetProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  noPadding?: boolean;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  className = '',
  children,
  headerActions,
  noPadding = false,
}) => {
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
    <Card className={`h-full flex flex-col relative ${className}`} noPadding={true}>
      {(title || headerActions) && (
         <div className="p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
           {title && <h2 className="text-xl font-bold text-gray-900">{title}</h2>}
           {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
         </div>
      )}
      
      <div 
        className={`flex-1 overflow-hidden ${!noPadding ? 'p-4' : ''}`}
        // We can add a class here to mark it as "no-drag" region if we configure dnd-sensor to ignore it
      >
        {children}
      </div>
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
