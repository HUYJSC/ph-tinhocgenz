import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  style,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#0B2545',
            display: 'block'
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
        {leftIcon && (
          <span style={{
            position: 'absolute',
            left: '12px',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none'
          }}>
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          style={{
            width: '100%',
            padding: `9px ${rightIcon ? '38px' : '14px'} 9px ${leftIcon ? '38px' : '14px'}`,
            fontSize: '13.5px',
            borderRadius: '8px',
            border: error ? '1px solid #EF4444' : '1px solid #CBD5E1',
            background: '#FFFFFF',
            color: '#0F172A',
            outline: 'none',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            ...style
          }}
          className={`tinhocgenz-input ${className}`}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error ? '#EF4444' : '#0057B8';
            e.currentTarget.style.boxShadow = error
              ? '0 0 0 3px rgba(239, 68, 68, 0.15)'
              : '0 0 0 3px rgba(0, 87, 184, 0.15)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? '#EF4444' : '#CBD5E1';
            e.currentTarget.style.boxShadow = 'none';
          }}
          {...props}
        />

        {rightIcon && (
          <span style={{
            position: 'absolute',
            right: '12px',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center'
          }}>
            {rightIcon}
          </span>
        )}
      </div>

      {error ? (
        <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: 500 }}>{error}</span>
      ) : helperText ? (
        <span style={{ fontSize: '12px', color: '#64748B' }}>{helperText}</span>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
