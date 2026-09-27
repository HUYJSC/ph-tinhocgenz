import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { UserProfile } from '../../types/auth';
import type { AdminPortalSubTab } from './AdminPortal';
import {
  getAdminNavigationForUser,
  getAdminNavigationItem,
  type AdminNavigationSection
} from '../../config/adminNavigation';

export interface AdminCapabilityNavigationProps {
  activeTab: string;
  onSelectTab: (tab: AdminPortalSubTab) => void;
  currentUser?: UserProfile | null;
  isCollapsed?: boolean;
  badges?: Partial<Record<AdminPortalSubTab, string | number | null | undefined>>;
  variant?: 'shell' | 'standalone';
}

/**
 * The single renderer for the admin sidebar. Both the unified AppShell and
 * the standalone /admin route use this component so labels, grouping and
 * permission filtering cannot drift apart again.
 */
export const AdminCapabilityNavigation: React.FC<AdminCapabilityNavigationProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  isCollapsed = false,
  badges,
  variant = 'shell'
}) => {
  const sections = useMemo(() => getAdminNavigationForUser(currentUser), [currentUser]);
  const activeItem = getAdminNavigationItem(activeTab);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach(section => {
      initial[section.id] = section.items.some(item => item.tab === activeItem?.tab);
    });
    return initial;
  });

  useEffect(() => {
    if (!activeItem) return;
    const owner = sections.find(section => section.items.some(item => item.tab === activeItem.tab));
    if (owner) setExpanded(prev => ({ ...prev, [owner.id]: true }));
  }, [activeItem, sections]);

  const muted = '#94A3B8';
  const sectionMuted = '#93C5FD';
  const activeBackground = variant === 'standalone'
    ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
    : '#0057B8';

  const handleSectionClick = (section: AdminNavigationSection) => {
    const isOpen = !!expanded[section.id];
    setExpanded(prev => ({ ...prev, [section.id]: !isOpen }));
    if (!isOpen && section.items[0]) onSelectTab(section.items[0].tab);
  };

  return (
    <nav aria-label="LMS Admin navigation" style={{ display: 'flex', flexDirection: 'column', gap: variant === 'standalone' ? '10px' : '12px' }}>
      {sections.map(section => {
        const SectionIcon = section.icon;
        const isOpen = !!expanded[section.id];
        const isSectionActive = section.items.some(item => item.tab === activeItem?.tab);

        return (
          <div key={section.id}>
            <button
              type="button"
              onClick={() => handleSectionClick(section)}
              title={isCollapsed ? section.label : undefined}
              aria-expanded={isOpen}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                width: '100%',
                minHeight: variant === 'standalone' ? '38px' : '36px',
                padding: isCollapsed ? '8px 0' : '7px 10px',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                borderRadius: '8px',
                border: 'none',
                background: isSectionActive && isCollapsed ? activeBackground : 'transparent',
                color: isSectionActive ? (isCollapsed ? '#FFFFFF' : '#DBEAFE') : sectionMuted,
                fontWeight: 800,
                fontSize: variant === 'standalone' ? '0.78rem' : '11px',
                letterSpacing: isCollapsed ? undefined : '0.025em',
                cursor: 'pointer',
                textAlign: 'left',
                textTransform: isCollapsed ? undefined : 'none'
              }}
            >
              <SectionIcon size={isCollapsed ? 18 : 16} />
              {!isCollapsed && <span style={{ flex: 1 }}>{section.label}</span>}
              {!isCollapsed && (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
            </button>

            {!isCollapsed && isOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '3px', paddingLeft: '9px' }}>
                {section.items.map(item => {
                  const ItemIcon = item.icon;
                  const isActive = activeItem?.tab === item.tab;
                  const badge = badges?.[item.tab];
                  return (
                    <button
                      key={item.tab}
                      type="button"
                      onClick={() => onSelectTab(item.tab)}
                      title={item.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '9px',
                        width: '100%',
                        minHeight: '35px',
                        padding: '7px 9px',
                        borderRadius: '7px',
                        border: 'none',
                        background: isActive ? activeBackground : 'transparent',
                        color: isActive ? '#FFFFFF' : muted,
                        fontWeight: isActive ? 700 : 500,
                        fontSize: variant === 'standalone' ? '0.78rem' : '12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        boxShadow: isActive && variant === 'standalone' ? '0 4px 14px rgba(37, 99, 235, 0.3)' : 'none'
                      }}
                    >
                      <ItemIcon size={15} />
                      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                      {badge !== undefined && badge !== null && badge !== '' && (
                        <span style={{
                          minWidth: '18px',
                          textAlign: 'center',
                          background: isActive ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)',
                          color: isActive ? '#FFFFFF' : muted,
                          padding: '1px 5px',
                          borderRadius: '9999px',
                          fontSize: '0.67rem',
                          fontWeight: 800
                        }}>{badge}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};
