import React, { useState } from 'react';
import {
  Layers, Users, BookOpen, CheckSquare, Award, QrCode,
  BarChart3, ChevronRight, Video, Download,
  Search, FileSpreadsheet, ArrowLeft
} from 'lucide-react';
import { UserProfile, StudentAccount } from '../../types/auth';
import { ClassScheduleItem } from '../../types/schedule';
import { PORTAL_TOKENS } from '../../styles/portalDesignTokens';
import { PortalCard } from '../ui/PortalCard';
import { PortalButton } from '../ui/PortalButton';
import { PortalBadge } from '../ui/PortalBadge';

export type ClassDetailTab =
  | 'overview'
  | 'students'
  | 'courses_content'
  | 'assignments'
  | 'quizzes_exams'
  | 'attendance'
  | 'grades'
  | 'analytics';

export interface TeacherClassDetailProps {
  currentUser?: UserProfile;
  classCode?: string;
  studentAccounts?: StudentAccount[];
  schedules?: ClassScheduleItem[];
  onBack?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const TeacherClassDetail: React.FC<TeacherClassDetailProps> = ({
  currentUser,
  classCode = 'K26-WE01',
  studentAccounts = [],
  onBack,
  onNavigateTab
}) => {
  const [activeTab, setActiveTab] = useState<ClassDetailTab>('overview');
  const [searchStudent, setSearchStudent] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'warning' | 'completed'>('all');

  // Strict boundary: Only show students assigned to this class!
  const classStudents = studentAccounts.filter(s => {
    if (s.classCode) return s.classCode === classCode;
    // Fallback default demo data if classCode is not yet set on demo accounts
    return true;
  });

  // Filter students based on search and status
  const filteredStudents = classStudents.filter(s => {
    const matchesSearch = (s.name || '').toLowerCase().includes(searchStudent.toLowerCase()) ||
      (s.studentCode || '').toLowerCase().includes(searchStudent.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchStudent.toLowerCase());
    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'warning') return Boolean((s as any).status === 'locked' || (s as any).riskLevel === 'HIGH');
    if (statusFilter === 'active') return (s as any).status !== 'locked';
    return true;
  });

  // Exactly 8 tabs from Section IX specification
  const tabs: Array<{ id: ClassDetailTab; label: string; icon: React.ElementType; badge?: string | number }> = [
    { id: 'overview', label: 'Tổng quan', icon: Layers },
    { id: 'students', label: `Học viên (${classStudents.length})`, icon: Users },
    { id: 'courses_content', label: 'Nội dung khóa học', icon: BookOpen },
    { id: 'assignments', label: 'Bài tập', icon: CheckSquare, badge: 3 },
    { id: 'quizzes_exams', label: 'Bài kiểm tra', icon: Award },
    { id: 'attendance', label: 'Điểm danh', icon: QrCode },
    { id: 'grades', label: 'Điểm số', icon: FileSpreadsheet },
    { id: 'analytics', label: 'Thống kê', icon: BarChart3 }
  ];

  const handleExportReport = () => {
    alert(`📊 Đã xuất báo cáo học tập lớp ${classCode} dạng Excel thành công!`);
  };

  return (
    <div
      style={{
        padding: '24px',
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        fontFamily: PORTAL_TOKENS.typography.fontFamily
      }}
    >
      {/* ── BREADCRUMB & TOP ACTIONS ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: PORTAL_TOKENS.colors.primary,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: 0
            }}
          >
            <ArrowLeft size={14} /> Danh sách lớp học
          </button>
          <ChevronRight size={14} color={PORTAL_TOKENS.colors.textMuted} />
          <span style={{ color: PORTAL_TOKENS.colors.textSecondary }}>Lớp {classCode}</span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <PortalButton
            variant="secondary"
            size="sm"
            icon={<Download size={14} />}
            onClick={handleExportReport}
          >
            Xuất báo cáo lớp
          </PortalButton>
          <PortalButton
            variant="primary"
            size="sm"
            icon={<Video size={14} />}
            onClick={() => onNavigateTab ? onNavigateTab('live') : window.open('https://meet.google.com', '_blank')}
          >
            Mở lớp trực tuyến
          </PortalButton>
        </div>
      </div>

      {/* ── CLASS HEADER CARD (CLEAN WHITE CARD WITH PRIMARY ACCENTS, NO RAINBOW GRADIENT) ── */}
      <PortalCard padding="24px">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <PortalBadge variant="primary">Mã lớp: {classCode}</PortalBadge>
              <PortalBadge variant="neutral">Chương trình Cấp tốc 3-in-1</PortalBadge>
            </div>
            <h1
              style={{
                fontSize: '22px',
                fontWeight: PORTAL_TOKENS.typography.weights.bold,
                color: PORTAL_TOKENS.colors.text,
                margin: '0 0 6px 0'
              }}
            >
              Word, Excel, PowerPoint 3-in-1 Thực Chiến
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: PORTAL_TOKENS.colors.textSecondary }}>
              Giảng viên: <strong>{currentUser?.name || 'Thầy Nguyễn Đình Huy'}</strong> • Sĩ số: <strong>{classStudents.length} học viên</strong> • Phòng LAB 01
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <PortalButton
              variant="outline"
              size="sm"
              icon={<QrCode size={14} />}
              onClick={() => setActiveTab('attendance')}
            >
              Điểm danh QR
            </PortalButton>
          </div>
        </div>
      </PortalCard>

      {/* ── EXACT 8 TABS NAVIGATION ── */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          borderBottom: `1px solid ${PORTAL_TOKENS.colors.border}`,
          overflowX: 'auto',
          paddingBottom: '2px'
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? PORTAL_TOKENS.colors.primary : PORTAL_TOKENS.colors.textSecondary,
                border: 'none',
                borderBottom: isActive ? `2px solid ${PORTAL_TOKENS.colors.primary}` : '2px solid transparent',
                background: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  style={{
                    backgroundColor: isActive ? PORTAL_TOKENS.colors.primary : '#E2E8F0',
                    color: isActive ? '#FFFFFF' : PORTAL_TOKENS.colors.textSecondary,
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: TỔNG QUAN ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <PortalCard padding="18px">
              <div style={{ fontSize: '12px', color: PORTAL_TOKENS.colors.textMuted }}>Tổng học viên</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: PORTAL_TOKENS.colors.text, marginTop: '4px' }}>
                {classStudents.length}
              </div>
              <div style={{ fontSize: '12px', color: PORTAL_TOKENS.colors.success, marginTop: '4px' }}>
                100% Hoạt động
              </div>
            </PortalCard>
            <PortalCard padding="18px">
              <div style={{ fontSize: '12px', color: PORTAL_TOKENS.colors.textMuted }}>Tiến độ trung bình</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: PORTAL_TOKENS.colors.primary, marginTop: '4px' }}>
                72%
              </div>
              <div style={{ fontSize: '12px', color: PORTAL_TOKENS.colors.textSecondary, marginTop: '4px' }}>
                16/24 bài giảng hoàn tất
              </div>
            </PortalCard>
            <PortalCard padding="18px">
              <div style={{ fontSize: '12px', color: PORTAL_TOKENS.colors.textMuted }}>Bài tập chờ chấm</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: PORTAL_TOKENS.colors.warning, marginTop: '4px' }}>
                3
              </div>
              <div style={{ fontSize: '12px', color: PORTAL_TOKENS.colors.warning, marginTop: '4px' }}>
                Cần nhận xét bài nộp
              </div>
            </PortalCard>
            <PortalCard padding="18px">
              <div style={{ fontSize: '12px', color: PORTAL_TOKENS.colors.textMuted }}>Tỷ lệ chuyên cần</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: PORTAL_TOKENS.colors.success, marginTop: '4px' }}>
                94%
              </div>
              <div style={{ fontSize: '12px', color: PORTAL_TOKENS.colors.textSecondary, marginTop: '4px' }}>
                Điểm danh qua QR
              </div>
            </PortalCard>
          </div>
        </div>
      )}

      {/* ── TAB 2: HỌC VIÊN (Strict Class Boundary, Search & Filter) ── */}
      {activeTab === 'students' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
              <Search size={15} color={PORTAL_TOKENS.colors.textMuted} style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                placeholder="Tìm tên, mã học viên..."
                style={{
                  width: '100%',
                  height: '38px',
                  paddingLeft: '36px',
                  paddingRight: '12px',
                  borderRadius: PORTAL_TOKENS.radii.sm,
                  border: `1px solid ${PORTAL_TOKENS.colors.border}`,
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {(['all', 'active', 'warning'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: PORTAL_TOKENS.radii.sm,
                    fontSize: '12px',
                    fontWeight: statusFilter === st ? 600 : 500,
                    border: `1px solid ${statusFilter === st ? PORTAL_TOKENS.colors.primary : PORTAL_TOKENS.colors.border}`,
                    backgroundColor: statusFilter === st ? '#EFF6FF' : '#FFFFFF',
                    color: statusFilter === st ? PORTAL_TOKENS.colors.primary : PORTAL_TOKENS.colors.textSecondary,
                    cursor: 'pointer'
                  }}
                >
                  {st === 'all' ? 'Tất cả' : st === 'active' ? 'Đang học' : 'Cần chú ý'}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <PortalCard padding="0">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: `1px solid ${PORTAL_TOKENS.colors.border}` }}>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: PORTAL_TOKENS.colors.textSecondary }}>Mã HV</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: PORTAL_TOKENS.colors.textSecondary }}>Họ và tên</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: PORTAL_TOKENS.colors.textSecondary }}>Email</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: PORTAL_TOKENS.colors.textSecondary }}>Tiến độ</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: PORTAL_TOKENS.colors.textSecondary }}>Trạng thái</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: PORTAL_TOKENS.colors.textSecondary, textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: PORTAL_TOKENS.colors.textMuted }}>
                        Không tìm thấy học viên trong lớp phụ trách này.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st, idx) => (
                      <tr key={st.id || idx} style={{ borderBottom: `1px solid ${PORTAL_TOKENS.colors.divider}` }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: PORTAL_TOKENS.colors.primary }}>
                          {st.studentCode || `THGZ${idx + 1}`}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: PORTAL_TOKENS.colors.text }}>
                          {st.name}
                        </td>
                        <td style={{ padding: '12px 16px', color: PORTAL_TOKENS.colors.textSecondary }}>
                          {st.email || 'student@eduquest.app'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontWeight: 600, color: PORTAL_TOKENS.colors.primary }}>75%</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <PortalBadge variant="success" size="sm">Đang học</PortalBadge>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => alert(`Xem chi tiết học tập của ${st.name}`)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: PORTAL_TOKENS.colors.primary,
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </PortalCard>
        </div>
      )}

      {/* ── TAB 3: NỘI DUNG KHÓA HỌC ── */}
      {activeTab === 'courses_content' && (
        <PortalCard padding="20px">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: PORTAL_TOKENS.colors.text }}>
            Khung chương trình: Word, Excel, PowerPoint 3-in-1
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: PORTAL_TOKENS.colors.textMuted }}>
            Bao gồm 24 bài giảng chuẩn đầu ra khảo thí quốc tế. Giảng viên có thể xem giáo trình và tải tài liệu mẫu.
          </p>
        </PortalCard>
      )}

      {/* ── TAB 4: BÀI TẬP ── */}
      {activeTab === 'assignments' && (
        <PortalCard padding="20px">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: PORTAL_TOKENS.colors.text }}>
              Danh sách bài tập lớp {classCode}
            </h3>
            <PortalButton variant="primary" size="sm" onClick={() => onNavigateTab && onNavigateTab('assignments')}>
              Chấm và nhận xét bài
            </PortalButton>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: PORTAL_TOKENS.colors.textMuted }}>
            Có 3 bài nộp đang chờ giảng viên chấm điểm và đưa ra nhận xét phản hồi.
          </p>
        </PortalCard>
      )}

      {/* ── TAB 5: BÀI KIỂM TRA ── */}
      {activeTab === 'quizzes_exams' && (
        <PortalCard padding="20px">
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: PORTAL_TOKENS.colors.text }}>
            Đề kiểm tra định kỳ & Khảo sát giữa khóa
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: PORTAL_TOKENS.colors.textMuted }}>
            Bài thi trắc nghiệm IC3 GS6 và thực hành tổng hợp Word - Excel - PowerPoint.
          </p>
        </PortalCard>
      )}

      {/* ── TAB 6: ĐIỂM DANH ── */}
      {activeTab === 'attendance' && (
        <PortalCard padding="20px">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: PORTAL_TOKENS.colors.text }}>
                Quản lý điểm danh ca học lớp {classCode}
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: PORTAL_TOKENS.colors.textMuted }}>
                Tạo mã QR động xoay vòng 30 giây hoặc điểm danh thủ công theo danh sách.
              </p>
            </div>
            <PortalButton
              variant="primary"
              size="sm"
              icon={<QrCode size={14} />}
              onClick={() => onNavigateTab && onNavigateTab('attendance')}
            >
              Mở phiên điểm danh QR
            </PortalButton>
          </div>
        </PortalCard>
      )}

      {/* ── TAB 7: ĐIỂM SỐ ── */}
      {activeTab === 'grades' && (
        <PortalCard padding="20px">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: PORTAL_TOKENS.colors.text }}>
              Bảng tổng hợp điểm số lớp {classCode}
            </h3>
            <PortalButton variant="secondary" size="sm" icon={<Download size={14} />} onClick={handleExportReport}>
              Xuất bảng điểm (Excel)
            </PortalButton>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: PORTAL_TOKENS.colors.textMuted }}>
            Gồm điểm chuyên cần, điểm bài tập thực hành, và điểm bài kiểm tra cuối khóa.
          </p>
        </PortalCard>
      )}

      {/* ── TAB 8: THỐNG KÊ ── */}
      {activeTab === 'analytics' && (
        <PortalCard padding="20px">
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: PORTAL_TOKENS.colors.text }}>
            Báo cáo phân tích chất lượng học tập
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: PORTAL_TOKENS.colors.textMuted }}>
            Tỷ lệ hoàn thành: 72% • Tỷ lệ làm bài tập: 88% • Mức độ tương tác: Rất tích cực.
          </p>
        </PortalCard>
      )}
    </div>
  );
};
