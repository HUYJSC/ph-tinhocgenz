import React from 'react';
import { BookOpen, Layers, BarChart2, PlusCircle, BookmarkCheck, Smartphone } from 'lucide-react';
import { soundFx } from '../../utils/audio';

export type ActiveTab = 'quizzes' | 'flashcards' | 'analytics' | 'creator' | 'bookmarks';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  bookmarkCount: number;
  onOpenInstallModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  bookmarkCount,
  onOpenInstallModal
}) => {
  const navItems = [
    { id: 'quizzes', label: 'Kho Bài Tập & Đề Thi', icon: BookOpen },
    { id: 'flashcards', label: 'Thẻ Ghi Nhớ (Cards)', icon: Layers },
    { id: 'analytics', label: 'Tiến Độ & Thành Tích', icon: BarChart2 },
    { id: 'creator', label: 'Tạo Đề Thi Mới', icon: PlusCircle },
    { id: 'bookmarks', label: 'Câu Đã Đánh Dấu', icon: BookmarkCheck, count: bookmarkCount }
  ];

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    soundFx.playClick();
  };

  return (
    <aside className="sidebar">
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.85rem'
            }}
          >
            PH
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>PH- TINHOCGENZ</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>v1.0.0 • Web & Mobile</div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id as ActiveTab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.18s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} color={isActive ? 'var(--accent-primary)' : 'currentColor'} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    background: 'var(--accent-primary)',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 700
                  }}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom PWA Info / Help */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
        <button
          onClick={onOpenInstallModal}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px dashed rgba(99, 102, 241, 0.3)',
            color: 'var(--text-secondary)',
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Smartphone size={16} color="var(--accent-primary)" />
          <span>Cài app trên Điện thoại</span>
        </button>
      </div>
    </aside>
  );
};
