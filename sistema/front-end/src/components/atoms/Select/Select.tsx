import React, { useEffect, useId, useRef, useState } from 'react';
import './Select.css';

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export interface SelectChangeEvent {
  readonly target: { readonly value: string };
}

export interface SelectProps {
  readonly label: string;
  readonly options: ReadonlyArray<SelectOption>;
  readonly value?: string;
  readonly onChange?: (event: SelectChangeEvent) => void;
  readonly onValueChange?: (value: string) => void;
  readonly placeholder?: string;
  readonly error?: string;
  readonly className?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly id?: string;
}

function useOutsideClose(
  ref: React.RefObject<HTMLDivElement | null>,
  onClose: () => void
): void {
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent): void => {
      if (ref.current && event.target instanceof Node && !ref.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [ref, onClose]);
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value = '',
  onChange,
  onValueChange,
  placeholder = 'Selecione...',
  error,
  className = '',
  disabled = false,
  id,
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  const listboxId = `${selectId}-listbox`;
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  useOutsideClose(wrapperRef, () => setIsOpen(false));

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;
  const isPlaceholder = !selectedOption || selectedOption.value === '';

  const commitValue = (nextValue: string): void => {
    onValueChange?.(nextValue);
    onChange?.({ target: { value: nextValue } });
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (disabled) return;
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((prev) => (prev + 1) % Math.max(options.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((prev) => (prev <= 0 ? options.length - 1 : prev - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isOpen && activeIndex >= 0 && options[activeIndex]) {
        commitValue(options[activeIndex].value);
      } else {
        setIsOpen((prev) => !prev);
      }
    }
  };

  return (
    <div ref={wrapperRef} className={`select-container ${className}`}>
      <label htmlFor={selectId} className="select-label">
        {label}
      </label>
      <div className="select-field-wrapper">
        <button
          id={selectId}
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          disabled={disabled}
          className={`select-field ${error ? 'select-field-error' : ''} ${
            isOpen ? 'select-field-open' : ''
          } ${isPlaceholder ? 'select-field-placeholder' : ''}`}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
        >
          <span className="select-field-text">{displayLabel}</span>
          <span className={`material-icons select-arrow ${isOpen ? 'select-arrow-open' : ''}`}>
            expand_more
          </span>
        </button>

        {isOpen && (
          <ul id={listboxId} role="listbox" className="select-dropdown-menu">
            {options.map((opt, idx) => {
              const isSelected = opt.value === value;
              const isActive = idx === activeIndex;
              return (
                <li
                  key={`${opt.value}-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  className={`select-dropdown-option ${
                    isSelected ? 'select-option-selected' : ''
                  } ${isActive ? 'select-option-active' : ''}`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    commitValue(opt.value);
                  }}
                >
                  <span>{opt.label}</span>
                  {isSelected && <span className="material-icons select-check-icon">check</span>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {error && (
        <span id={`${selectId}-error`} className="select-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
