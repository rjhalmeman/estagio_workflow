import React from 'react';
import '@material/web/button/filled-button';
import '@material/web/button/outlined-button';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  disabled,
  type,
  onClick,
  className = '',
  ...props
}) => {
  const buttonStyle = {
    '--md-filled-button-container-height': '38px',
    '--md-outlined-button-container-height': '38px',
    '--md-filled-button-container-shape': '10px',
    '--md-outlined-button-container-shape': '10px',
    '--md-filled-button-label-text-font': "'Poppins', sans-serif",
    '--md-outlined-button-label-text-font': "'Poppins', sans-serif",
    '--md-filled-button-label-text-weight': '500',
    '--md-outlined-button-label-text-weight': '500',
    ...(variant === 'danger' ? { '--md-sys-color-primary': 'var(--error)' } : {}),
  } as React.CSSProperties;

  if (variant === 'secondary') {
    return (
      <md-outlined-button
        type={type}
        disabled={disabled || isLoading}
        onClick={onClick}
        className={className}
        style={buttonStyle}
        {...props}
      >
        {isLoading ? 'Carregando...' : children}
      </md-outlined-button>
    );
  }

  // Variant primary ou danger
  return (
    <md-filled-button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={className}
      style={buttonStyle}
      {...props}
    >
      {isLoading ? 'Carregando...' : children}
    </md-filled-button>
  );
};
