import type { DetailedHTMLProps, HTMLAttributes } from 'react';

interface MdButtonProps extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  disabled?: boolean;
  type?: string;
}

interface MdTextFieldProps extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  disabled?: boolean;
  type?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  error?: boolean;
  errorText?: string;
  required?: boolean;
}

interface MdCheckboxProps extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  checked?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'md-filled-button': MdButtonProps;
      'md-outlined-button': MdButtonProps;
      'md-outlined-text-field': MdTextFieldProps;
      'md-checkbox': MdCheckboxProps;
    }
  }
}

