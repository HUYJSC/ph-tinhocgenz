import React from 'react';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}

export const Form: React.FC<FormProps> = ({ onSubmit, children, className = '', style, ...props }) => {
  return (
    <form
      onSubmit={onSubmit}
      className={`space-y-4 ${className}`}
      style={{ display: 'flex', flexDirection: 'column', gap: '16px', ...style }}
      {...props}
    >
      {children}
    </form>
  );
};

export interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  helpText?: string;
  children: React.ReactNode;
  id?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  helpText,
  children,
  id
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#0B2545',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {label}
          {required && <span style={{ color: '#EF4444' }}>*</span>}
        </label>
      )}
      {children}
      {helpText && !error && (
        <span style={{ fontSize: '12px', color: '#64748B' }}>
          {helpText}
        </span>
      )}
      {error && (
        <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: 500 }}>
          {error}
        </span>
      )}
    </div>
  );
};
