import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  noPadding = false,
  ...props 
}) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-100 ${!noPadding ? 'p-6' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
