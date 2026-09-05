import React, { useId } from 'react';
import './Select.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  className = '',
  disabled,
  ...props
}) => {
  const selectId = useId();

  return (
    <div className={`select-container ${className}`}>
      <label htmlFor={selectId} className="select-label">
        {label}
      </label>
      <div className="select-field-wrapper">
        <select
          id={selectId}
          className={`select-field ${error ? 'select-field-error' : ''}`}
          disabled={disabled}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="select-arrow">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
      {error && (
        <span id={`${selectId}-error`} className="select-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
