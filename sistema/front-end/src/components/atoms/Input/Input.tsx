import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  readonly label: string;
  readonly error?: string;
  readonly suggestions?: ReadonlyArray<string>;
  readonly onSelectSuggestion?: (value: string) => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  disabled,
  type,
  suggestions,
  onSelectSuggestion,
  value,
  onChange,
  onFocus,
  onKeyDown,
  ...props
}) => {
  const inputId = useId();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const isPassword = type === 'password';
  const isDate = type === 'date';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const filteredSuggestions = useMemo(() => {
    if (!suggestions || suggestions.length === 0) return [];
    const query = typeof value === 'string' ? value.trim().toLowerCase() : '';
    if (!query) return suggestions;
    return suggestions.filter((item) => item.toLowerCase().includes(query));
  }, [suggestions, value]);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent): void => {
      if (wrapperRef.current && event.target instanceof Node && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  const selectItem = (item: string): void => {
    onSelectSuggestion?.(item);
    setShowSuggestions(false);
    setActiveIndex(-1);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    onKeyDown?.(e);
    if (!filteredSuggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setShowSuggestions(true);
      setActiveIndex((prev) => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setShowSuggestions(true);
      setActiveIndex((prev) => (prev <= 0 ? filteredSuggestions.length - 1 : prev - 1));
    } else if (e.key === 'Enter' && showSuggestions && activeIndex >= 0 && filteredSuggestions[activeIndex]) {
      e.preventDefault();
      selectItem(filteredSuggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const hasRightIcon = isPassword || isDate || Boolean(suggestions?.length);

  return (
    <div ref={wrapperRef} className={`input-container ${className}`}>
      <label htmlFor={inputId} className="input-label">
        {label}:
      </label>
      <div className="input-field-wrapper">
        <input
          ref={inputRef}
          id={inputId}
          type={inputType}
          value={value}
          onChange={(e) => {
            onChange?.(e);
            if (suggestions?.length) setShowSuggestions(true);
          }}
          onFocus={(e) => {
            onFocus?.(e);
            if (suggestions?.length) setShowSuggestions(true);
          }}
          onKeyDown={handleKey}
          autoComplete={suggestions?.length ? 'off' : props.autoComplete}
          className={`input-field ${error ? 'input-field-error' : ''} ${
            hasRightIcon ? 'input-field-with-icon' : ''
          }`}
          disabled={disabled}
          {...props}
        />
        {suggestions && suggestions.length > 0 && !isPassword && (
          <button
            type="button"
            tabIndex={-1}
            className={`input-dropdown-toggle ${showSuggestions ? 'input-dropdown-open' : ''}`}
            onClick={() => !disabled && setShowSuggestions((prev) => !prev)}
            aria-label={`Exibir opções de ${label}`}
          >
            <span className="material-icons input-action-icon">expand_more</span>
          </button>
        )}
        {isDate && (
          <button
            type="button"
            tabIndex={-1}
            className="input-date-trigger"
            onClick={() => {
              if (!disabled && inputRef.current) {
                if ('showPicker' in inputRef.current && typeof inputRef.current.showPicker === 'function') {
                  inputRef.current.showPicker();
                } else {
                  inputRef.current.focus();
                }
              }
            }}
            aria-label={`Selecionar data para ${label}`}
          >
            <span className="material-icons input-action-icon">calendar_month</span>
          </button>
        )}
        {isPassword && (
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
          >
            <span className="material-icons input-action-icon">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        )}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <ul role="listbox" className="input-suggestions-menu">
            {filteredSuggestions.map((item, idx) => (
              <li
                key={`${item}-${idx}`}
                role="option"
                aria-selected={value === item}
                className={`input-suggestion-item ${idx === activeIndex ? 'input-suggestion-active' : ''} ${
                  value === item ? 'input-suggestion-selected' : ''
                }`}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectItem(item);
                }}
              >
                <span>{item}</span>
                {value === item && <span className="material-icons input-suggestion-check">check</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && (
        <span id={`${inputId}-error`} className="input-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
