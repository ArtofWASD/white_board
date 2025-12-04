import React, { ReactNode } from 'react';

export type ViewMode = 'list' | 'card';

interface ListFiltersProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
}

export function ListFilters({
  viewMode,
  onViewModeChange,
  onSearchChange,
  searchPlaceholder = 'Поиск...',
  children
}: ListFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4" onPointerDown={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-4 w-full sm:w-auto">
        {onSearchChange && (
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>
        )}
        {children}
      </div>

      <div className="flex bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => onViewModeChange('list')}
          className={`p-2 rounded-md transition-all ${
            viewMode === 'list' 
              ? 'bg-white shadow-sm text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          title="Список"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </button>
        <button
          onClick={() => onViewModeChange('card')}
          className={`p-2 rounded-md transition-all ${
            viewMode === 'card' 
              ? 'bg-white shadow-sm text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          title="Карточки"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </button>
      </div>
    </div>
  );
}
