import React, { useState, useEffect } from 'react';
import {
  Home, BookOpen, Layers, BookmarkCheck,
  Calendar, GitBranch, RotateCcw, Bot,
  ShieldAlert, Shield, FileText, QrCode,
  ChevronDown, GraduationCap
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export type ActiveTab =
  | 'dashboard'
  | 'learning_path'
  | 'quizzes'
  | 'smart_review'
  | 'assignments'
  | 'attendance'
  | 'schedule'
  | 'flashcards'
  | 'early_warning'
  | 'analytics'
  | 'creator'
  | 'bookmarks'
  | 'admin';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  bookmarkCount: number;
  unreadNotificationCount?: number;
  onOpenAITutor?: () => void;
  isAdmin: boolean;
}

interface SubMenuItem {
  id: ActiveTab;
  label: string;
  icon: any;
  count?: number;
}

interface AccordionGroup {
  id: string;
  label: string;
  icon: any;
  items: SubMenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  bookmarkCount,
  unreadNotificationCount = 0,
  onOpenAITutor,
  isAdmin
}) => {
  // Student Accordion Groups (Clean, No Duplicate Navigation)
  const studentGroups: AccordionGroup[] = [
    {
      id: 'study',
      label: 'Học tập & Giáo trình',
      icon: GraduationCap,
      items: [
        { id: 'attendance',   label: 'Điểm danh & Quét QR',   icon: QrCode },
        { id: 'learning_path', label: 'Lộ trình đào tạo',       icon: GitBranch },
        { id: 'quizzes',      label: 'Khóa học & Chuyên đề',   icon: BookOpen },
        { id: 'schedule',     label: 'Thời khóa biểu lớp',     icon: Calendar }
      ]
    },
    {
      id: 'practice',
      label: 'Ôn luyện & Củng cố',
      icon: RotateCcw,
      items: [
        { id: 'smart_review', label: 'Ôn câu sai thông minh',  icon: RotateCcw },
        { id: 'flashcards',   label: 'Thẻ ghi nhớ kiến thức', icon: Layers },
        { id: 'bookmarks',    label: 'Câu hỏi đã đánh dấu',   icon: BookmarkCheck, count: bookmarkCount }
      ]
    },
    {
      id: 'exam',
      label: 'Khảo thí & Thực hành',
      icon: FileText,
      items: [
        { id: 'assignments',  label: 'Bài tập & Nộp bài thực hành', icon: FileText }
      ]
    }
  ];

  // Admin / Teacher Accordion Groups
  const adminGroups: AccordionGroup[] = [
    {
      id: 'admin_mgmt',
      label: 'Quản trị đào tạo',
      icon: Shield,
      items: [
        { id: 'early_warning',label: 'Cảnh báo học vụ sớm',    icon: ShieldAlert },
        { id: 'admin',        label: 'Danh sách học viên',    icon: Shield },
        { id: 'attendance',   label: 'Điểm danh lớp học',     icon: QrCode },
        { id: 'assignments',  label: 'Chấm bài & Google Drive',icon: FileText, count: unreadNotificationCount }
      ]
    },
    {
      id: 'admin_bank',
      label: 'Học liệu & Lịch giảng',
      icon: BookOpen,
      items: [
        { id: 'quizzes',      label: 'Ngân hàng đề thi',      icon: BookOpen },
        { id: 'schedule',     label: 'Lịch giảng dạy',        icon: Calendar },
        { id: 'flashcards',   label: 'Thẻ ghi nhớ học phần',  icon: Layers }
      ]
    }
  ];

  const groups = isAdmin ? adminGroups : studentGroups;

  // Find which group contains activeTab
  const getActiveGroupId = (tab: ActiveTab): string => {
    for (const g of groups) {
      if (g.items.some(item => item.id === tab)) {
        return g.id;
      }
    }
    return 'study';
  };

  // State: Only open group is expanded (accordion style)
  const [openGroupId, setOpenGroupId] = useState<string>(() => getActiveGroupId(activeTab));

  // Auto-expand group when activeTab changes externally
  useEffect(() => {
    const activeG = getActiveGroupId(activeTab);
    setOpenGroupId(activeG);
  }, [activeTab]);

  const toggleGroup = (groupId: string) => {
    soundFx.playClick();
    setOpenGroupId(prev => (prev === groupId ? '' : groupId));
  };

  const handleSelectTab = (tab: ActiveTab) => {
    soundFx.playClick();
    setActiveTab(tab);
  };

  return (
    <aside
      className="sidebar"
      style={{
        width: 'var(--sidebar-width)',
        minWidth: 'var(--sidebar-width)',
        height: '100vh',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        userSelect: 'none'
      }}
    >
      {/* ── 1. LOGO & BRAND HEADER (64px) ── */}
      <div
        style={{
          height: 'var(--header-height)',
          padding: '0 16px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <div
          style={{
            height: '36px',
            maxWidth: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start'
          }}
        >
          <img src="/logo.png" alt="PH DIGITAL EDUCATION" style={{ height: '100%', width: 'auto', objectFit: 'contain' }} />
        </div>
      </div>

      {/* ── 2. NAVIGATION LIST ── */}
      <nav
        style={{
          padding: '12px 12px',
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}
      >
        {/* TOP ITEM: TRANG CHỦ (44px) */}
        <button
          onClick={() => handleSelectTab('dashboard')}
          style={{
            width: '100%',
            height: 'var(--menu-item-h)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '0 12px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: activeTab === 'dashboard' ? 'var(--brand-light)' : 'transparent',
            color: activeTab === 'dashboard' ? 'var(--brand)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'dashboard' ? 600 : 500,
            fontSize: 'var(--text-nav)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease'
          }}
        >
          <Home size={19} color={activeTab === 'dashboard' ? 'var(--brand)' : 'var(--text-muted)'} />
          <span style={{ flex: 1 }}>Trang chủ</span>
        </button>

        {/* ACCORDION GROUPS */}
        {groups.map(group => {
          const isExpanded = openGroupId === group.id;
          const GroupIcon = group.icon;
          const isGroupActive = group.items.some(i => i.id === activeTab);

          return (
            <div key={group.id} style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Accordion Group Header (44px) */}
              <button
                onClick={() => toggleGroup(group.id)}
                style={{
                  width: '100%',
                  height: 'var(--menu-item-h)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 12px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: isGroupActive && !isExpanded ? 'rgba(79, 110, 247, 0.05)' : 'transparent',
                  color: isGroupActive ? 'var(--brand)' : 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: 'var(--text-nav)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <GroupIcon size={19} color={isGroupActive ? 'var(--brand)' : 'var(--text-muted)'} />
                  <span>{group.label}</span>
                </div>
                <ChevronDown
                  size={16}
                  color="var(--text-muted)"
                  style={{
                    transition: 'transform 0.2s ease',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                />
              </button>

              {/* Accordion Submenu Items (40px) */}
              {isExpanded && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '16px', margin: '2px 0 4px' }}>
                  {group.items.map((item, idx) => {
                    const SubIcon = item.icon;
                    const isSubActive = activeTab === item.id;

                    return (
                      <button
                        key={`${group.id}_${item.id}_${idx}`}
                        onClick={() => handleSelectTab(item.id)}
                        style={{
                          width: '100%',
                          height: 'var(--submenu-item-h)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '0 12px',
                          borderRadius: 'var(--radius-sm)',
                          border: 'none',
                          background: isSubActive ? 'var(--brand-light)' : 'transparent',
                          color: isSubActive ? 'var(--brand)' : 'var(--text-secondary)',
                          fontWeight: isSubActive ? 600 : 500,
                          fontSize: '13.5px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <SubIcon size={16} color={isSubActive ? 'var(--brand)' : 'var(--text-muted)'} />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.label}
                        </span>

                        {item.count !== undefined && item.count > 0 && (
                          <span
                            style={{
                              padding: '1px 6px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: 'var(--brand)',
                              color: '#fff'
                            }}
                          >
                            {item.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* BOTTOM ITEM: AI TUTOR (44px) */}
        {onOpenAITutor && (
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenAITutor();
            }}
            style={{
              width: '100%',
              height: 'var(--menu-item-h)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '0 12px',
              marginTop: '4px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              background: 'rgba(139, 92, 246, 0.08)',
              color: 'var(--purple-ai)',
              fontWeight: 600,
              fontSize: 'var(--text-nav)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <Bot size={19} color="var(--purple-ai)" />
            <span style={{ flex: 1 }}>AI Tutor</span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                background: 'var(--purple-ai)',
                color: '#fff',
                padding: '1px 5px',
                borderRadius: 'var(--radius-full)'
              }}
            >
              AI
            </span>
          </button>
        )}
      </nav>
    </aside>
  );
};
