import React, { useState } from 'react';
import { UserProfile, StudentAccount } from '../../types/auth';
import { EarlyWarningService } from '../../services/earlyWarningService';
import { ClassScheduleItem } from '../../types/schedule';
import { Assignment, AssignmentSubmission } from '../../types/assignment';
import { AttendanceSession, AttendanceStatus } from '../../types/attendance';
import {
  QrCode, BookOpen, Calendar, AlertTriangle,
  Send, Check, Award, Clock,
  Video, Sparkles, Users, Layers, Bell
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { TeacherGradingView } from '../teacher/TeacherGradingView';
import { TeacherQRGeoAttendance } from '../teacher/TeacherQRGeoAttendance';
import { TeacherClassDetail } from '../teacher/TeacherClassDetail';

export interface TeacherAcademicPortalProps {
  currentUser: UserProfile;
  studentAccounts: StudentAccount[];
  schedules: ClassScheduleItem[];
  assignments?: Assignment[];
  submissions: AssignmentSubmission[];
  activeSubTab?: string;
  sessions?: AttendanceSession[];
  onRotateQR?: (sessionId: string) => void;
  onUpdateStatus?: (sessionId: string, studentId: string, status: AttendanceStatus) => void;
  onToggleSessionOpen?: (sessionId: string, isOpen: boolean) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenAttendanceSession?: (schedule?: ClassScheduleItem) => void;
  onOpenEarlyWarning?: () => void;
  onOpenAssignmentManager?: () => void;
  onOpenAdminPortal?: () => void;
  onOpenScheduleCalendar?: () => void;
  onOpenQuizBank?: () => void;
}

export const TeacherAcademicPortal: React.FC<TeacherAcademicPortalProps> = ({
  currentUser,
  studentAccounts,
  schedules,
  submissions,
  activeSubTab,
  sessions,
  onRotateQR,
  onUpdateStatus,
  onToggleSessionOpen,
  onNavigateTab,
  onOpenAttendanceSession: _onOpenAttendanceSession,
  onOpenEarlyWarning: _onOpenEarlyWarning,
  onOpenAssignmentManager: _onOpenAssignmentManager,
  onOpenAdminPortal,
  onOpenScheduleCalendar,
  onOpenQuizBank
}) => {
  const [remindedAll, setRemindedAll] = useState(false);
  const [searchWarning] = useState('');
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [internalView, setInternalView] = useState<'dashboard' | 'grading' | 'attendance' | 'classes'>(() => {
    if (activeSubTab === 'grading') return 'grading';
    if (activeSubTab === 'attendance') return 'attendance';
    if (activeSubTab === 'classes') return 'classes';
    return 'dashboard';
  });

  // Keep internalView in sync with activeSubTab prop if provided
  React.useEffect(() => {
    if (activeSubTab === 'grading') setInternalView('grading');
    else if (activeSubTab === 'attendance') setInternalView('attendance');
    else if (activeSubTab === 'classes') setInternalView('classes');
    else if (activeSubTab === 'dashboard') setInternalView('dashboard');
  }, [activeSubTab]);

  // Date formatting
  const todayStr = new Date().toISOString().split('T')[0];
  const formattedToday = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date());

  // 1. Next schedule
  const todayClasses = schedules.filter(s => s.date === todayStr);
  const displayClasses = todayClasses.length > 0 ? todayClasses : schedules.slice(0, 3);

  // 2. Early Warning students
  const evaluatedStudents = EarlyWarningService.evaluateAllStudents(studentAccounts);
  const atRiskStudents = evaluatedStudents.filter(s => s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH');
  const filteredRiskStudents = atRiskStudents.filter(s =>
    (s.studentName || '').toLowerCase().includes(searchWarning.toLowerCase()) ||
    (s.studentCode || '').toLowerCase().includes(searchWarning.toLowerCase())
  );

  // 3. Submissions
  const ungradedSubmissions = submissions.filter(s => s.status === 'submitted');

  const handleRemindAll = () => {
    soundFx.playClick();
    setRemindedAll(true);
    alert(`📢 Đã gửi thông báo nhắc nhở chuyên cần và làm bài tập tới toàn bộ ${atRiskStudents.length} học viên cần lưu ý!`);
    setTimeout(() => setRemindedAll(false), 4000);
  };

  const handleAiAction = (actionType: string) => {
    soundFx.playClick();
    setIsAiGenerating(true);
    setTimeout(() => {
      setIsAiGenerating(false);
      if (actionType === 'lesson') {
        setAiOutput('🤖 AI Gợi ý: Với bài giảng Excel tuần này, bạn nên tập trung vào bài toán thực tế quản lý công nợ và chiết khấu bán hàng bằng hàm IF kết hợp AND/OR và VLOOKUP.');
      } else if (actionType === 'question') {
        setAiOutput('🤖 AI Đã tạo 3 câu hỏi trắc nghiệm mới về phím tắt Word (Ctrl+Shift+C/V) và kỹ thuật định dạng Section Breaks.');
      } else if (actionType === 'practice') {
        setAiOutput('🤖 AI Đã thiết kế đề thực hành PowerPoint 5 slide: Thiết kế báo cáo tài chính sử dụng Morph Transition và SmartArt.');
      } else {
        setAiOutput('🤖 AI Phân tích lớp K26-WE01: Tỷ lệ làm bài tập đạt 88%, học viên tiến bộ nhanh ở thao tác bảng tính, cần ôn tập thêm về in ấn trang tính.');
      }
    }, 500);
  };

  // Sub-view renders
  if (internalView === 'grading') {
    return (
      <TeacherGradingView
        currentUser={currentUser}
        submissions={submissions}
        onBackToDashboard={() => {
          setInternalView('dashboard');
          if (onNavigateTab) onNavigateTab('dashboard');
        }}
      />
    );
  }

  if (internalView === 'attendance') {
    return (
      <TeacherQRGeoAttendance
        currentUser={currentUser}
        sessions={sessions}
        schedules={schedules}
        studentAccounts={studentAccounts}
        onRotateQR={onRotateQR}
        onUpdateStatus={onUpdateStatus}
        onToggleSessionOpen={onToggleSessionOpen}
        onBackToDashboard={() => {
          setInternalView('dashboard');
          if (onNavigateTab) onNavigateTab('dashboard');
        }}
      />
    );
  }

  if (internalView === 'classes') {
    return (
      <TeacherClassDetail
        currentUser={currentUser}
        classCode="K26-WE01"
        studentAccounts={studentAccounts}
        schedules={schedules}
        onBack={() => {
          setInternalView('dashboard');
          if (onNavigateTab) onNavigateTab('dashboard');
        }}
        onNavigateTab={tab => {
          if (tab === 'attendance') setInternalView('attendance');
          else if (tab === 'grading') setInternalView('grading');
          else if (onNavigateTab) onNavigateTab(tab);
        }}
      />
    );
  }

  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        padding: '24px 24px 60px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        background: '#F4F8FD',
        boxSizing: 'border-box'
      }}
    >
      {/* ── HÀNG 1: CHÀO BUỔI SÁNG THẦY/CÔ [TÊN] + NGÀY THÁNG TIẾNG VIỆT ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#FFFFFF',
          padding: '20px 24px',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0057B8', background: '#EFF6FF', padding: '3px 8px', borderRadius: '6px' }}>
              CỔNG GIẢNG VIÊN
            </span>
            <span style={{ fontSize: '13px', color: '#64748B' }}>
              {formattedToday.charAt(0).toUpperCase() + formattedToday.slice(1)}
            </span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Chào buổi sáng, {currentUser.name || 'Thầy Nguyễn Đình Huy'}! 👋
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B', margin: '3px 0 0' }}>
            Hôm nay bạn có {todayClasses.length} ca giảng dạy và {ungradedSubmissions.length} bài tập cần chấm điểm.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setInternalView('attendance')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '10px',
              background: '#0057B8',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <QrCode size={16} />
            <span>Mở Điểm Danh QR</span>
          </button>

          <button
            onClick={() => setInternalView('grading')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '10px',
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              color: '#0057B8',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Award size={16} />
            <span>Chấm Điểm ({ungradedSubmissions.length})</span>
          </button>
        </div>
      </div>

      {/* ── HÀNG 2: 4 THẺ KPI CHUẨN (LỚP ĐANG DẠY, HỌC VIÊN, BÀI GIẢNG, BÀI CẦN CHẤM) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px'
        }}
      >
        {/* KPI 1: Lớp đang dạy */}
        <div
          onClick={() => setInternalView('classes')}
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              LỚP ĐANG DẠY
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0057B8' }}>
              <Layers size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>3</span>
            <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 600 }}>Chuyên cần 94.2%</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
            {schedules.length} buổi học trong kế hoạch
          </div>
        </div>

        {/* KPI 2: Học viên quản lý */}
        <div
          onClick={() => onOpenAdminPortal && onOpenAdminPortal()}
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              HỌC VIÊN PHỤ TRÁCH
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>{studentAccounts.length || 12}</span>
            <span style={{ fontSize: '12px', color: '#0057B8', fontWeight: 600 }}>100% Hoạt động</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
            Phân bổ trên 3 lớp Tin Học
          </div>
        </div>

        {/* KPI 3: Bài giảng */}
        <div
          onClick={() => onOpenQuizBank && onOpenQuizBank()}
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              BÀI GIẢNG & HỌC LIỆU
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
              <BookOpen size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>24</span>
            <span style={{ fontSize: '12px', color: '#7C3AED', fontWeight: 600 }}>Chuẩn khảo thí</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
            Word, Excel, PowerPoint 3-in-1
          </div>
        </div>

        {/* KPI 4: Bài cần chấm */}
        <div
          onClick={() => setInternalView('grading')}
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              BÀI CẦN CHẤM
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
              <Award size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '26px', fontWeight: 800, color: ungradedSubmissions.length > 0 ? '#D97706' : '#15803D' }}>
              {ungradedSubmissions.length}
            </span>
            <span style={{ fontSize: '12px', color: ungradedSubmissions.length > 0 ? '#D97706' : '#15803D', fontWeight: 600 }}>
              {ungradedSubmissions.length > 0 ? 'Cần chấm ngay' : 'Đã sạch bài'}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
            Bài thực hành và bài tập về nhà
          </div>
        </div>
      </div>

      {/* ── HÀNG 3: 7 CỘT "LỊCH DẠY HÔM NAY" + 5 CỘT "HỌC VIÊN CẦN CHÚ Ý" ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 5fr)', gap: '24px' }}>
        {/* 7 Cột: Lịch Dạy Hôm Nay */}
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color="#0057B8" />
                Lịch Giảng Dạy Hôm Nay ({displayClasses.length} ca học)
              </h2>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Danh sách các buổi học đang và sắp diễn ra</span>
            </div>
            <button
              onClick={() => onOpenScheduleCalendar && onOpenScheduleCalendar()}
              style={{ background: 'none', border: 'none', color: '#0057B8', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
            >
              Xem lịch tuần →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayClasses.map((cls, idx) => (
              <div
                key={cls.id || idx}
                style={{
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#EFF6FF', color: '#0057B8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={16} />
                    <span style={{ fontSize: '11px', fontWeight: 700, marginTop: '2px' }}>{cls.startTime || '08:00'}</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '14px' }}>
                      {cls.title || 'Lớp Word, Excel, PowerPoint 3-in-1'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span>Mã lớp: <strong>{cls.classCode || 'K26-WE01'}</strong></span>
                      <span>•</span>
                      <span>{cls.room || 'Phòng LAB 01'}</span>
                      <span>•</span>
                      <span style={{ color: '#15803D', fontWeight: 600 }}>Sĩ số: {studentAccounts.length || 12}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setInternalView('attendance')}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '8px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      color: '#0F172A',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <QrCode size={13} color="#0057B8" />
                    Điểm danh
                  </button>

                  <button
                    onClick={() => cls.onlineMeetingUrl ? window.open(cls.onlineMeetingUrl, '_blank') : alert('Đã bắt đầu buổi học!')}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      background: '#0057B8',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Video size={13} />
                    Vào lớp
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5 Cột: Học Viên Cần Chú Ý (Early Warning) */}
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="#DC2626" />
                Học Viên Cần Chú Ý ({atRiskStudents.length})
              </h2>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Nguy cơ vắng hoặc kết quả giảm sút</span>
            </div>
            <button
              onClick={handleRemindAll}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                background: remindedAll ? '#DCFCE7' : '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: remindedAll ? '#166534' : '#991B1B',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {remindedAll ? <Check size={12} /> : <Send size={12} />}
              {remindedAll ? 'Đã gửi' : 'Nhắc cả nhóm'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(filteredRiskStudents.length > 0 ? filteredRiskStudents.slice(0, 4) : evaluatedStudents.slice(0, 3)).map((item, idx) => (
              <div
                key={item.studentId || idx}
                style={{
                  background: '#FFF7ED',
                  border: '1px solid #FFEDD5',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#9A3412', fontSize: '13px' }}>{item.studentName}</div>
                  <div style={{ fontSize: '11px', color: '#C2410C', marginTop: '2px' }}>
                    {item.studentCode} • {item.factors && item.factors[0] ? item.factors[0] : 'Vắng 2 buổi liên tiếp'}
                  </div>
                </div>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: item.riskLevel === 'CRITICAL' ? '#FEE2E2' : '#FEF3C7',
                  color: item.riskLevel === 'CRITICAL' ? '#991B1B' : '#92400E',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  {item.riskLevel === 'CRITICAL' ? 'Nguy cơ cao' : 'Cảnh báo'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HÀNG 4: 4 CỘT "HOẠT ĐỘNG GIẢNG DẠY" + 4 CỘT "BÀI TẬP CHỜ CHẤM" + 4 CỘT "AI TRỢ GIẢNG" ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {/* Khối 1: Hoạt Động Giảng Dạy */}
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#0057B8" />
            Hoạt Động Giảng Dạy
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ color: '#64748B' }}>Buổi học đã hoàn thành:</span>
              <strong style={{ color: '#0F172A' }}>18 / 24 buổi</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ color: '#64748B' }}>Tài liệu đã chia sẻ:</span>
              <strong style={{ color: '#0F172A' }}>14 file giáo trình</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
              <span style={{ color: '#64748B' }}>Đánh giá trung bình:</span>
              <strong style={{ color: '#15803D' }}>4.9 / 5.0 ⭐</strong>
            </div>
          </div>
        </div>

        {/* Khối 2: Bài Tập Chờ Chấm */}
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color="#D97706" />
              Bài Tập Chờ Chấm ({ungradedSubmissions.length})
            </h3>
            <button
              onClick={() => setInternalView('grading')}
              style={{ background: 'none', border: 'none', color: '#0057B8', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
            >
              Xem tất cả →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {ungradedSubmissions.slice(0, 3).map((sub, idx) => (
              <div
                key={sub.id || idx}
                style={{
                  background: '#F8FAFC',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '12.5px' }}>{sub.studentName || 'Học viên'}</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>{sub.assignmentTitle || 'Bài tập thực hành'}</div>
                </div>
                <button
                  onClick={() => setInternalView('grading')}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: '#0057B8',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Chấm ngay
                </button>
              </div>
            ))}
            {ungradedSubmissions.length === 0 && (
              <div style={{ color: '#15803D', fontSize: '13px', padding: '12px', textAlign: 'center', background: '#DCFCE7', borderRadius: '8px' }}>
                🎉 Đã hoàn tất chấm điểm toàn bộ bài nộp!
              </div>
            )}
          </div>
        </div>

        {/* Khối 3: AI Trợ Giảng (4 Quick Actions) */}
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#7C3AED" />
            AI Trợ Giảng Tin Học
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <button
              onClick={() => handleAiAction('lesson')}
              disabled={isAiGenerating}
              style={{
                padding: '8px',
                borderRadius: '8px',
                background: '#F5F3FF',
                border: '1px solid #DDD6FE',
                color: '#6D28D9',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              💡 Gợi ý bài giảng
            </button>
            <button
              onClick={() => handleAiAction('question')}
              disabled={isAiGenerating}
              style={{
                padding: '8px',
                borderRadius: '8px',
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#1D4ED8',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              📝 Tạo câu hỏi
            </button>
            <button
              onClick={() => handleAiAction('practice')}
              disabled={isAiGenerating}
              style={{
                padding: '8px',
                borderRadius: '8px',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#047857',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              ⚡ Tạo bài thực hành
            </button>
            <button
              onClick={() => handleAiAction('analytics')}
              disabled={isAiGenerating}
              style={{
                padding: '8px',
                borderRadius: '8px',
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                color: '#B45309',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              📊 Phân tích lớp
            </button>
          </div>

          {aiOutput && (
            <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '11.5px', color: '#334155', lineHeight: 1.5 }}>
              {aiOutput}
            </div>
          )}
        </div>
      </div>

      {/* ── HÀNG 5: 8 CỘT "BIỂU ĐỒ HIỆU QUẢ LỚP" + 4 CỘT "THÔNG BÁO MỚI" ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 8fr) minmax(0, 4fr)', gap: '24px' }}>
        {/* 8 Cột: Hiệu quả lớp */}
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#0057B8" />
            Hiệu Quả Đào Tạo & Tiến Độ Các Lớp Chuyên Đề
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            {[
              { name: 'K26-WE01 (Word & Excel)', progress: '75%', score: '8.8', color: '#0057B8' },
              { name: 'K26-CC01 (CC CNTT Cơ bản)', progress: '60%', score: '8.4', color: '#16A34A' },
              { name: 'K26-AI01 (AI Văn Phòng)', progress: '90%', score: '9.1', color: '#7C3AED' }
            ].map(item => (
              <div key={item.name} style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '13px' }}>{item.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0 4px', fontSize: '12px', color: '#64748B' }}>
                  <span>Tiến độ: {item.progress}</span>
                  <strong style={{ color: item.color }}>ĐTB: {item.score}</strong>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: item.progress, height: '100%', background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Cột: Thông Báo Học Vụ */}
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color="#0057B8" />
            Thông Báo Từ Giáo Vụ
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
            <div style={{ background: '#EFF6FF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
              <div style={{ fontWeight: 700, color: '#1E40AF' }}>Hạn chót nhập điểm giữa kỳ</div>
              <div style={{ color: '#3B82F6', marginTop: '2px' }}>Vui lòng hoàn tất trước 18:00 ngày 25/09/2026.</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 600, color: '#0F172A' }}>Bảo trì phòng LAB 02 Chủ Nhật</div>
              <div style={{ color: '#64748B', marginTop: '2px' }}>Các lớp học sẽ chuyển sang phòng LAB 01 và Online.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
