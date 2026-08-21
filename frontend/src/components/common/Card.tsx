import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hover = false,
  glass = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-200';
  const hoverStyles = hover ? 'hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5' : '';
  const glassStyles = glass ? 'glass-panel' : '';

  return (
    <div className={`${baseStyles} ${hoverStyles} ${glassStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-6 border-b border-slate-100 flex items-center justify-between gap-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-4 sm:p-6 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-4 ${className}`} {...props}>
      {children}
    </div>
  );
};
