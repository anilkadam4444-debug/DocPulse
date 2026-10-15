import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'teal' | 'navy' | 'amber' | 'green' | 'blue';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 rounded',
    md: 'text-xs px-2.5 py-1 rounded-md font-medium',
  };

  const variantStyles = {
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200/80',
    teal: 'bg-teal-50 text-teal-800 border border-teal-200/60',
    navy: 'bg-slate-900 text-slate-200 border border-slate-800',
    amber: 'bg-amber-50 text-amber-800 border border-amber-200/60',
    green: 'bg-emerald-50 text-emerald-800 border border-emerald-200/60',
    blue: 'bg-sky-50 text-sky-800 border border-sky-200/60',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 tracking-tight ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
