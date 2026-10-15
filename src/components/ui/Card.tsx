import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'navy' | 'interactive';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white border border-slate-200/90 shadow-xs text-slate-900',
    subtle: 'bg-slate-50/80 border border-slate-200 text-slate-900',
    navy: 'bg-slate-900 border border-slate-800 text-white shadow-md',
    interactive:
      'bg-white border border-slate-200 shadow-xs hover:border-teal-500/60 hover:shadow-sm transition-all duration-150 cursor-pointer text-slate-900',
  };

  return (
    <div className={`rounded-xl p-5 md:p-6 ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};
