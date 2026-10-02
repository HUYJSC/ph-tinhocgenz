import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search, Bell, Menu, ChevronDown, User, LogOut, Key,
  BookOpen, FileText, Sparkles, X, ArrowRight, Layers, Globe
} from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';
import { UserRole } from '../../types/auth';
import { LanguageSelector } from '../ui/LanguageSelector';

export interface TopbarProps {
  user?: {
    name?: string;
    role?: UserRole;
    studentCode?: string;
    teacherCode?: string;
    avatar?: string;
    email?: string;
  } | null;
  onToggleSidebar?: () => void;
  onOpenAITutor?: (prompt?: string) => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  onOpenChangePassword?: () => void;
  onLogout?: () => void;
  onSearch?: (query: string) => void;
  currentPortal?: string;
  onSwitchPortal?: (portal: string) => void;
}

interface SearchCatalogItem {
  id: string;
  type: 'course' | 'lesson' | 'document';
  title: string;
  subtitle: string;
  badge: string;
  tag?: string;
}

const SEARCH_CATALOG: SearchCatalogItem[] = [
  // ── Khóa học (Courses) ──
  {
    id: 'c1',
    type: 'course',
    title: 'Word, Excel, PowerPoint 3-in-1 Thực Chiến',
    subtitle: '16/24 bài học • 68% hoàn thành',
    badge: 'Khóa học',
    tag: 'MOS 2026'
  },
  {
    id: 'c2',
    type: 'course',
    title: 'Lập trình Python Ứng Dụng Dân Văn Phòng',
    subtitle: '12 chuyên đề tự động hóa dữ liệu',
    badge: 'Khóa học',
    tag: 'Python'
  },
  {
    id: 'c3',
    type: 'course',
    title: 'Tin Học Văn Phòng MOS Chuẩn Quốc Tế',
    subtitle: 'Luyện thi chứng chỉ Microsoft MOS',
    badge: 'Khóa học',
    tag: 'Chứng chỉ'
  },
  {
    id: 'c4',
    type: 'course',
    title: 'Thiết Kế Dashboard & Phân Tích Excel Nâng Cao',
    subtitle: 'Power Query, Data Model, Power Pivot',
    badge: 'Khóa học',
    tag: 'Nâng cao'
  },

  // ── Bài học (Lessons) ──
  {
    id: 'l1',
    type: 'lesson',
    title: 'Bài 17: Phân tích dữ liệu bằng Pivot Table và Slicer',
    subtitle: 'Khóa học Word, Excel, PowerPoint 3-in-1',
    badge: 'Bài học',
    tag: 'Excel'
  },
  {
    id: 'l2',
    type: 'lesson',
    title: 'Bài 03: Thiết kế mẫu biểu báo cáo tài chính',
    subtitle: 'Khóa học Word, Excel, PowerPoint 3-in-1',
    badge: 'Bài học',
    tag: 'Kế toán'
  },
  {
    id: 'l3',
    type: 'lesson',
    title: 'Bài 05: Hàm VLOOKUP, INDEX & MATCH thực chiến',
    subtitle: 'Xử lý dữ liệu bảng tra cứu lớn',
    badge: 'Bài học',
    tag: 'Hàm Excel'
  },
  {
    id: 'l4',
    type: 'lesson',
    title: 'Bài 08: Thiết kế slide thuyết trình PowerPoint chuẩn công sở',
    subtitle: 'Bố cục hiện đại, chuyển động tinh tế',
    badge: 'Bài học',
    tag: 'PowerPoint'
  },

  // ── Tài liệu (Documents) ──
  {
    id: 'd1',
    type: 'document',
    title: 'Giáo trình Tin Học Gen Z 2026 (PDF)',
    subtitle: 'Tài liệu học tập chính thức • 240 trang',
    badge: 'Tài liệu',
    tag: 'PDF'
  },
  {
    id: 'd2',
    type: 'document',
    title: 'Sổ tay 100 phím tắt Excel tăng 200% hiệu suất',
    subtitle: 'Tài liệu tham khảo nhanh công sở',
    badge: 'Tài liệu',
    tag: 'Phím tắt'
  },
  {
    id: 'd3',
    type: 'document',
    title: 'Bộ đề ôn thi thực hành chứng chỉ MOS Excel',
    subtitle: '5 đề thi mẫu kèm đáp án chi tiết',
    badge: 'Tài liệu',
    tag: 'Đề thi'
  },
  {
    id: 'd4',
    type: 'document',
    title: 'Quy chế học vụ & Hướng dẫn nộp bài tập trực tuyến',
    subtitle: 'Quy định chấm điểm và phúc khảo',
    badge: 'Tài liệu',
    tag: 'Quy chế'
  }
];

export const Topbar: React.FC<TopbarProps> = ({
  user,
  onToggleSidebar,
  onOpenAITutor,
  onOpenNotifications,
  onOpenProfile,
  onOpenChangePassword,
  onLogout,
  onSearch,
  currentPortal = 'student',
  onSwitchPortal
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';
  const isTeacher = user?.role === 'teacher';
  const isGiaoVu = user?.role === 'giaovu' || user?.role === 'academic_staff' || user?.role === 'academic_manager';
  const isStudent = user?.role === 'student' || (!isAdmin && !isTeacher && !isGiaoVu);

  const displayName = user?.name || (isAdmin ? 'Nguyễn Đình Huy' : 'Học Viên THGZ01');
  const userCode = user?.studentCode || (isTeacher ? user?.teacherCode || 'GV01' : 'THGZ01');

  const displaySubtitle = isStudent
    ? `Học viên • ${userCode}`
    : isSuperAdmin
    ? 'Super Admin'
    : isAdmin
    ? 'Quản trị viên'
    : isTeacher
    ? `Giảng viên • ${userCode}`
    : 'Giáo vụ đào tạo';

  const roleBadgeLabel = isStudent
    ? 'Học viên'
    : isTeacher
    ? 'Giảng viên'
    : isAdmin
    ? 'Quản trị viên'
    : 'Giáo vụ';

  // ── Global shortcut (Cmd+K / Ctrl+K) & Click Outside Handlers ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setShowUserMenu(false);
        setIsMobileSearchExpanded(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ── Filtered Search Results ──
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return {
        courses: SEARCH_CATALOG.filter(i => i.type === 'course').slice(0, 2),
        lessons: SEARCH_CATALOG.filter(i => i.type === 'lesson').slice(0, 2),
        documents: SEARCH_CATALOG.filter(i => i.type === 'document').slice(0, 2),
        total: 6,
        isDefaultSuggestions: true
      };
    }

    const matches = SEARCH_CATALOG.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      (item.tag && item.tag.toLowerCase().includes(q))
    );

    return {
      courses: matches.filter(i => i.type === 'course'),
      lessons: matches.filter(i => i.type === 'lesson'),
      documents: matches.filter(i => i.type === 'document'),
      total: matches.length,
      isDefaultSuggestions: false
    };
  }, [searchQuery]);

  const handleSelectSearchItem = (title: string) => {
    setSearchQuery(title);
    setIsSearchOpen(false);
    setIsMobileSearchExpanded(false);
    if (onSearch) {
      onSearch(title);
    }
  };

  const handleAskAIFromSearch = (promptText: string) => {
    setIsSearchOpen(false);
    setIsMobileSearchExpanded(false);
    if (onOpenAITutor) {
      onOpenAITutor(promptText);
    }
  };

  const handleSearchFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSelectSearchItem(searchQuery.trim());
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  return (
    <header
      className="lms-top-nav"
      style={{
        height: '64px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 900,
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        userSelect: 'none'
      }}
    >
      {/* ── ACTION 1 & 2: SIDEBAR MENU TOGGLE & PH-TINHOCGENZ LOGO ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Điều hướng menu"
            title="Đóng / mở menu điều hướng"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              cursor: 'pointer',
              color: '#0B2545',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F4F8FD';
              e.currentTarget.style.borderColor = '#0057B8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = '#E2E8F0';
            }}
          >
            <Menu size={18} />
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BrandLogo variant="horizontal" height={36} />
        </div>
      </div>

      {/* ── ACTION 3: SMART GLOBAL SEARCH BAR & CATEGORIZED DROPDOWN ── */}
      <div
        ref={searchContainerRef}
        className="lms-search-container"
        style={{
          flex: 1,
          maxWidth: '480px',
          margin: '0 24px',
          position: 'relative'
        }}
      >
        <form onSubmit={handleSearchFormSubmit} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search
            size={16}
            color={isSearchOpen ? '#0057B8' : '#94A3B8'}
            style={{
              position: 'absolute',
              left: '14px',
              pointerEvents: 'none',
              transition: 'color 0.15s ease'
            }}
          />

          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchOpen(true)}
            placeholder={isAdmin ? 'Tìm kiếm người dùng, khóa học, tài liệu...' : 'Tìm kiếm khóa học, bài học, tài liệu…'}
            aria-label="Tìm kiếm nội dung LMS"
            aria-expanded={isSearchOpen}
            aria-haspopup="listbox"
            style={{
              width: '100%',
              height: '40px',
              paddingLeft: '40px',
              paddingRight: searchQuery ? '72px' : '52px',
              borderRadius: '10px',
              border: `1px solid ${isSearchOpen ? '#0057B8' : '#E2E8F0'}`,
              backgroundColor: isSearchOpen ? '#FFFFFF' : '#F8FAFC',
              fontSize: '13px',
              color: '#0B2545',
              outline: 'none',
              boxShadow: isSearchOpen ? '0 0 0 3px rgba(0, 87, 184, 0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          />

          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              title="Xóa tìm kiếm"
              aria-label="Xóa nội dung tìm kiếm"
              style={{
                position: 'absolute',
                right: '42px',
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px'
              }}
            >
              <X size={14} />
            </button>
          )}

          <div
            className="lms-search-kbd hide-on-mobile"
            style={{
              position: 'absolute',
              right: '10px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '5px',
              padding: '2px 6px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#94A3B8',
              pointerEvents: 'none'
            }}
          >
            ⌘ K
          </div>
        </form>

        {/* ── Search Dropdown (Courses, Lessons, Documents & AI Question) ── */}
        {isSearchOpen && (
          <div
            role="listbox"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 12px 32px rgba(11, 37, 69, 0.12)',
              maxHeight: '430px',
              overflowY: 'auto',
              zIndex: 999,
              padding: '8px 0'
            }}
          >
            {/* Quick Prompt to Ask AI directly */}
            {searchQuery.trim() && (
              <div style={{ padding: '0 8px 8px 8px', borderBottom: '1px solid #F1F5F9' }}>
                <button
                  type="button"
                  onClick={() => handleAskAIFromSearch(searchQuery.trim())}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #BFDBFE',
                    backgroundColor: '#EFF6FF',
                    color: '#0057B8',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#DBEAFE')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#EFF6FF')}
                >
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid rgba(0, 87, 184, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2px',
                      flexShrink: 0
                    }}
                  >
                    <img
                      src="/chatbot.ai.png"
                      alt="AI"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        e.currentTarget.src = '/assets/chatbot.ai.png';
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0057B8' }}>
                      Hỏi Trợ lý AI: &ldquo;{searchQuery.trim()}&rdquo;
                    </div>
                    <div style={{ fontSize: '11px', color: '#003F88' }}>
                      Nhận lời giải chi tiết tức thì từ AI Gemini Pro
                    </div>
                  </div>
                  <ArrowRight size={15} color="#0057B8" />
                </button>
              </div>
            )}

            {/* Default Quick Tags when query is empty */}
            {searchResults.isDefaultSuggestions && (
              <div style={{ padding: '4px 14px 10px 14px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Tìm kiếm gợi ý
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {['Excel thực chiến', 'Pivot Table', 'MOS 2026', 'Word nâng cao', 'Đổi mật khẩu'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleSelectSearchItem(tag)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '16px',
                        backgroundColor: '#F4F8FD',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px',
                        color: '#0B2545',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#EFF6FF';
                        e.currentTarget.style.borderColor = '#BFDBFE';
                        e.currentTarget.style.color = '#0057B8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#F4F8FD';
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.color = '#0B2545';
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Courses section */}
            {searchResults.courses.length > 0 && (
              <div style={{ padding: '6px 0' }}>
                <div style={{ padding: '4px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={13} color="#0057B8" />
                  <span>KHÓA HỌC ({searchResults.courses.length})</span>
                </div>
                {searchResults.courses.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSearchItem(item.title)}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background-color 0.12s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F4F8FD')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0B2545' }}>{item.title}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{item.subtitle}</div>
                    </div>
                    {item.tag && (
                      <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#EFF6FF', color: '#0057B8', fontWeight: 600 }}>
                        {item.tag}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Lessons section */}
            {searchResults.lessons.length > 0 && (
              <div style={{ padding: '6px 0', borderTop: '1px solid #F1F5F9' }}>
                <div style={{ padding: '4px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={13} color="#003F88" />
                  <span>BÀI HỌC ({searchResults.lessons.length})</span>
                </div>
                {searchResults.lessons.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSearchItem(item.title)}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background-color 0.12s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F4F8FD')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0B2545' }}>{item.title}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{item.subtitle}</div>
                    </div>
                    {item.tag && (
                      <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#F1F5F9', color: '#475569', fontWeight: 500 }}>
                        {item.tag}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Documents section */}
            {searchResults.documents.length > 0 && (
              <div style={{ padding: '6px 0', borderTop: '1px solid #F1F5F9' }}>
                <div style={{ padding: '4px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={13} color="#16A34A" />
                  <span>TÀI LIỆU & ĐỀ THI ({searchResults.documents.length})</span>
                </div>
                {searchResults.documents.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSearchItem(item.title)}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background-color 0.12s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F4F8FD')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0B2545' }}>{item.title}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{item.subtitle}</div>
                    </div>
                    {item.tag && (
                      <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#DCFCE7', color: '#166534', fontWeight: 600 }}>
                        {item.tag}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Empty state when searching and no results */}
            {!searchResults.isDefaultSuggestions && searchResults.total === 0 && (
              <div style={{ padding: '18px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#64748B' }}>
                  Không tìm thấy nội dung phù hợp với &ldquo;<strong>{searchQuery}</strong>&rdquo;
                </div>
                <button
                  type="button"
                  onClick={() => handleAskAIFromSearch(searchQuery)}
                  style={{
                    marginTop: '10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#0057B8',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Sparkles size={14} />
                  <span>Nhờ Trợ lý AI giải đáp thắc mắc này</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── ACTION 4, 5, 6: AI ASSISTANT, NOTIFICATIONS, COMPACT USER PROFILE ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Mobile Search Button (Visible on screens < 580px) */}
        <button
          type="button"
          onClick={() => {
            setIsMobileSearchExpanded(true);
            setIsSearchOpen(true);
            setTimeout(() => searchInputRef.current?.focus(), 60);
          }}
          aria-label="Tìm kiếm nội dung"
          title="Tìm kiếm"
          className="show-on-mobile-search"
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            cursor: 'pointer',
            color: '#475569'
          }}
        >
          <Search size={17} />
        </button>

        {/* ACTION 4: AI ASSISTANT MASCOT BUTTON (Integrated with chatbot.ai.png) */}
        {onOpenAITutor && (
          <button
            type="button"
            onClick={() => onOpenAITutor()}
            aria-label="Mở Trợ lý AI Gen Z"
            title="Trợ lý Gen Z (Gemini Pro)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1.5px solid #0057B8',
              backgroundColor: '#EFF6FF',
              color: '#0057B8',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 3px rgba(0, 87, 184, 0.08)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#DBEAFE';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#EFF6FF';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(0, 87, 184, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5px',
                flexShrink: 0
              }}
            >
              <img
                src="/chatbot.ai.png"
                alt="Mascot Trợ lý Gen Z"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => {
                  e.currentTarget.src = '/assets/chatbot.ai.png';
                }}
              />
            </div>
            <span className="hide-on-mobile">{isAdmin ? 'AI Assistant' : 'AI Hỗ trợ'}</span>
          </button>
        )}

        {/* ACTION 5: NOTIFICATIONS BELL BUTTON (With unread counter badge) */}
        {onOpenNotifications && (
          <button
            type="button"
            onClick={onOpenNotifications}
            aria-label="Thông báo hệ thống (3 chưa đọc)"
            title="Thông báo mới"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              cursor: 'pointer',
              color: '#475569',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F4F8FD';
              e.currentTarget.style.color = '#0057B8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.color = '#475569';
            }}
          >
            <Bell size={17} />
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1
              }}
            >
              3
            </span>
          </button>
        )}

        {/* ACTION 6: USER PROFILE TRIGGER & COMPACT DROPDOWN MENU */}
        <div ref={userMenuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="Menu tài khoản người dùng"
            aria-expanded={showUserMenu}
            aria-haspopup="menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              padding: '3px 10px 3px 3px',
              borderRadius: '24px',
              border: `1px solid ${showUserMenu ? '#0057B8' : '#E2E8F0'}`,
              backgroundColor: showUserMenu ? '#EFF6FF' : '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              if (!showUserMenu) e.currentTarget.style.backgroundColor = '#F8FAFC';
            }}
            onMouseLeave={(e) => {
              if (!showUserMenu) e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            {/* User Avatar Circle */}
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#0057B8',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 700,
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span>{displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>

            {/* User details text block (hidden on mobile for compact layout) */}
            <div className="lms-user-text hide-on-mobile" style={{ textAlign: 'left', lineHeight: 1.25 }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#0B2545',
                  maxWidth: '120px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {displayName}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                {displaySubtitle}
              </div>
            </div>

            <ChevronDown
              size={14}
              color="#64748B"
              style={{
                transform: showUserMenu ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.15s ease'
              }}
            />
          </button>

          {/* ── Compact User Dropdown Panel ── */}
          {showUserMenu && (
            <div
              role="menu"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '260px',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 12px 28px -4px rgba(11, 37, 69, 0.14)',
                padding: '6px',
                zIndex: 999
              }}
            >
              {/* Header Profile Identity Card */}
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  marginBottom: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#0057B8',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 700,
                      flexShrink: 0
                    }}
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      <span>{displayName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B2545', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {displayName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          backgroundColor: '#EFF6FF',
                          color: '#0057B8'
                        }}
                      >
                        {roleBadgeLabel}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>{userCode}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Portal Switcher (if user has permissions / dual role) */}
              {onSwitchPortal && (
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    onSwitchPortal(currentPortal === 'student' ? 'teacher' : 'student');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px dashed #BFDBFE',
                    backgroundColor: '#EFF6FF',
                    color: '#0057B8',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginBottom: '6px'
                  }}
                >
                  <span>
                    {currentPortal === 'student' ? 'Chuyển sang Cổng Giảng viên' : 'Chuyển sang Cổng Học viên'}
                  </span>
                  <ArrowRight size={13} />
                </button>
              )}

              {/* Menu items */}
              {onOpenProfile && (
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenProfile();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'none',
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.12s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F4F8FD')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <User size={15} color="#64748B" />
                  <span>Hồ sơ cá nhân</span>
                </button>
              )}

              {onOpenChangePassword && (
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenChangePassword();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'none',
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.12s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F4F8FD')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Key size={15} color="#64748B" />
                  <span>Đổi mật khẩu</span>
                </button>
              )}

              {/* Integrated Language Switcher within User Menu (Clean & Uncluttered Header) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155', fontWeight: 500 }}>
                  <Globe size={15} color="#64748B" />
                  <span>Ngôn ngữ</span>
                </div>
                <LanguageSelector variant="compact" />
              </div>

              <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '4px 0' }} />

              {/* Logout button */}
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'none',
                    color: '#EF4444',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.12s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEF2F2')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <LogOut size={15} color="#EF4444" />
                  <span>Đăng xuất</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Expanded Search Bar Overlay ── */}
      {isMobileSearchExpanded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            gap: '8px',
            zIndex: 950
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsMobileSearchExpanded(false);
              setIsSearchOpen(false);
            }}
            aria-label="Đóng tìm kiếm"
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              color: '#64748B'
            }}
          >
            <X size={20} />
          </button>
          <form
            onSubmit={handleSearchFormSubmit}
            style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}
          >
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm khóa học, bài học, tài liệu..."
              style={{
                width: '100%',
                height: '40px',
                padding: '0 12px',
                borderRadius: '8px',
                border: '1px solid #0057B8',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </form>
        </div>
      )}

      {/* ── Responsive Styling Rules ── */}
      <style>{`
        @media (max-width: 768px) {
          .lms-top-nav {
            padding: 0 14px !important;
          }
          .lms-search-container {
            margin: 0 12px !important;
            max-width: 260px !important;
          }
          .hide-on-mobile {
            display: none !important;
          }
        }
        @media (max-width: 580px) {
          .lms-search-container {
            display: none !important;
          }
          .show-on-mobile-search {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
};

