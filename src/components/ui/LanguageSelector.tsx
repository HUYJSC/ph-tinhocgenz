import React, { useState, useRef, useEffect, useId } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage, SupportedLocale } from '../../i18n';

export interface LanguageSelectorProps {
  variant?: 'nav' | 'chatbot' | 'compact';
  className?: string;
  id?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'nav',
  className = '',
  id
}) => {
  const { currentLocale, setLocale, locales, currentConfig } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const generatedId = useId();
  const menuId = id || `lang-menu-${generatedId}`;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation: Close on Escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      }
    }
  };

  const handleSelect = (localeCode: SupportedLocale) => {
    setLocale(localeCode);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const isChatbot = variant === 'chatbot' || variant === 'compact';

  return (
    <div
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
      className={`language-selector-wrapper ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        fontFamily: 'inherit'
      }}
    >
      {/* ── TRIGGER BUTTON ── */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={menuId}
        aria-label={`Ngôn ngữ: ${currentConfig.label}`}
        style={
          isChatbot
            ? {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                outline: 'none'
              }
            : {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#0B2545',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                outline: 'none',
                minHeight: '36px'
              }
        }
        onFocus={e => {
          e.currentTarget.style.boxShadow = isChatbot
            ? '0 0 0 2px rgba(255, 255, 255, 0.5)'
            : '0 0 0 2px rgba(0, 87, 184, 0.3)';
        }}
        onBlur={e => {
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <Globe size={isChatbot ? 13 : 15} color={isChatbot ? '#FFFFFF' : '#0057B8'} />

        {/* Desktop: Full Native Label */}
        <span
          className="lang-label-desktop"
          style={{
            display: 'inline-block',
            lineHeight: 1
          }}
        >
          {currentConfig.label}
        </span>

        <ChevronDown
          size={isChatbot ? 12 : 14}
          color={isChatbot ? '#FFFFFF' : '#64748B'}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        />
      </button>

      {/* ── DROPDOWN LIST ── */}
      {isOpen && (
        <ul
          id={menuId}
          role="listbox"
          aria-label="Danh sách ngôn ngữ"
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: '6px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(11, 37, 69, 0.15), 0 0 0 1px rgba(0, 87, 184, 0.08)',
            zIndex: 9999,
            minWidth: '160px',
            padding: '4px',
            listStyle: 'none',
            margin: '6px 0 0 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            animation: 'lang-popover-in 0.15s ease-out'
          }}
        >
          {locales.map(loc => {
            const isSelected = loc.code === currentLocale;
            return (
              <li
                key={loc.code}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(loc.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  background: isSelected ? '#F4F8FD' : 'transparent',
                  color: isSelected ? '#0057B8' : '#0B2545',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                  userSelect: 'none'
                }}
                onMouseEnter={e => {
                  if (!isSelected) e.currentTarget.style.background = '#F8FAFC';
                }}
                onMouseLeave={e => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{loc.flag}</span>
                  <span>{loc.label}</span>
                </div>
                {isSelected && <Check size={14} color="#0057B8" strokeWidth={2.5} />}
              </li>
            );
          })}
        </ul>
      )}

      {/* Responsive mobile breakpoint style */}
      <style>{`
        @keyframes lang-popover-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .language-selector-wrapper .lang-label-desktop {
            display: ${isChatbot ? 'none' : 'inline-block'};
          }
        }
      `}</style>
    </div>
  );
};
