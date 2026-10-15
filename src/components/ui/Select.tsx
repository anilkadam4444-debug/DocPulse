import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: (string | SelectOption)[];
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, helperText, error, leftIcon, id, className = '', ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <select
            id={selectId}
            ref={ref}
            className={`w-full appearance-none bg-white text-slate-900 text-sm rounded-lg border transition-all duration-150 py-2.5 px-3.5 pr-10 ${
              leftIcon ? 'pl-10' : ''
            } ${
              error
                ? 'border-red-400 focus:border-red-600 focus:ring-2 focus:ring-red-100'
                : 'border-slate-300 hover:border-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100'
            } focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer ${className}`}
            {...props}
          >
            {options.map((opt) => {
              const val = typeof opt === 'string' ? opt : opt.value;
              const lbl = typeof opt === 'string' ? opt : opt.label;
              return (
                <option key={val} value={val}>
                  {lbl}
                </option>
              );
            })}
          </select>
          <div className="absolute right-3 flex items-center pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error ? (
          <p className="text-xs text-red-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
