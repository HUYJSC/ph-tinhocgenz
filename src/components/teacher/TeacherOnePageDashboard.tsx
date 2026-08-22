import React, { useState, useEffect } from 'react';
import { UserProfile, StudentAccount } from '../../types/auth';
import { EarlyWarningService } from '../../services/earlyWarningService';
import { ClassScheduleItem } from '../../types/schedule';
import { Assignment, AssignmentSubmission } from '../../types/assignment';
import {
  QrCode, Calendar, FileText, CheckCircle2,
  ExternalLink, Bot, Send, Users, PlusCircle,
  ChevronRight, BookOpen
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface TeacherOnePageDashboardProps {
  currentUser: UserProfile;
  studentAccounts: StudentAccount[];
  schedules: ClassScheduleItem[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  unreadNotificationCount?: number;
  onOpenAttendanceSession: (schedule?: ClassScheduleItem) => void;
  onOpenEarlyWarning: () => void;
  onOpenAssignmentManager: () => void;
  onOpenAdminPortal: () => void;
  onOpenScheduleCalendar: () => void;
  onOpenQuizCreator: () => void;
  onOpenQuizBank: () => void;
  onOpenAITutor: (prompt?: string) => void;
  onActiveSectionChange?: (sectionId: string) => void;
}

export const TeacherOnePageDashboard: React.FC<TeacherOnePageDashboardProps> = ({
  currentUser,
  studentAccounts,
  schedules,
  submissions,
  onOpenAttendanceSession,
  onOpenEarlyWarning,
  onOpenAssignmentManager,
  onOpenAdminPortal,
  onOpenScheduleCalendar,
  onOpenQuizCreator,
  onOpenQuizBank,
  onOpenAITutor,
  onActiveSectionChange
}) => {
  const [activeSection, setActiveSection] = useState<'class' | 'risk' | 'grading' | 'mgmt'>('class');
  const [aiInputText, setAiInputText] = useState('');

  // 1. Evaluate today's schedule
  const todayStr = new Date().toISOString().split('T')[0];
  const todayClasses = schedules.filter(s => s.date === todayStr);
  const nextClass = todayClasses.length > 0 ? todayClasses[0] : schedules[0];

  // 2. Evaluate Early Warning students
  const evaluatedStudents = EarlyWarningService.evaluateAllStudents(studentAccounts);
  const atRiskStudents = evaluatedStudents.filter(s => s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH');
  const criticalCount = evaluatedStudents.filter(s => s.riskLevel === 'CRITICAL').length;

  // 3. Evaluate pending submissions
  const ungradedSubmissions = submissions.filter(s => s.status === 'submitted');

  // Scroll Spy via IntersectionObserver
  useEffect(() => {
    const sectionIds = ['section-teacher-class', 'section-teacher-risk', 'section-teacher-grading', 'section-teacher-mgmt'];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const secKey = id.replace('section-teacher-', '') as any;
              setActiveSection(secKey);
              if (onActiveSectionChange) onActiveSectionChange(secKey);
            }
          });
        },
        { threshold: 0.3, rootMargin: '-64px 0px -40% 0px' }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach(obs => obs.disconnect());
    };
  }, [onActiveSectionChange]);

  // Contextual AI Placeholder
  const getAiPlaceholder = () => {
    switch (activeSection) {
      case 'class':
        return 'Hỏi AI tạo kế hoạch giảng dạy hoặc câu hỏi khởi động cho lớp...';
      case 'risk':
        return 'Hỏi AI đề xuất phương án hỗ trợ học viên có nguy cơ bỏ học...';
      case 'grading':
        return 'Hỏi AI gợi ý tiêu chí chấm điểm và nhận xét bài nộp...';
      case 'mgmt':
        return 'Hỏi AI tự động soạn 5 câu hỏi trắc nghiệm Office mới...';
      default:
        return 'Hỏi AI Trợ Giảng (Soạn đề, nhận xét, phân tích)...';
    }
  };

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInputText.trim()) {
      onOpenAITutor(getAiPlaceholder().replace('Hỏi AI ', ''));
    } else {
      onOpenAITutor(aiInputText);
      setAiInputText('');
    }
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', width: '100%', padding: '24px 20px 100px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* ── 1. ABOVE THE FOLD (CLEAN TEACHER SUMMARY & PRIMARY CTA) ── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '4px' }}>
            Chào {currentUser.name || 'Thầy/Cô'} 👋
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Bàn Làm Việc Giảng Viên
            </h1>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brand)' }}>
              {todayClasses.length > 0 ? `Hôm nay có ${todayClasses.length} lớp học` : 'Hôm nay không có lớp'}
            </div>
          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {studentAccounts.length} học viên • {ungradedSubmissions.length} bài chờ chấm • {atRiskStudents.length} học viên cần can thiệp
          </div>
        </div>

        {/* Primary Action Card */}
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 1px 3px rgba(16,24,40,.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          {nextClass ? (
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                {todayClasses.length > 0 ? 'LỚP HỌC HÔM NAY' : 'LỚP HỌC KẾ TIẾP'}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                {nextClass.title} ({nextClass.classCode})
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⏱️ {nextClass.startTime} - {nextClass.endTime}</span>
                <span>•</span>
                <span>{nextClass.room || 'Phòng LAB 01'}</span>
              </div>
            </div>
          ) : (
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>BÀI NỘP CHỜ CHẤM</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                {ungradedSubmissions.length} bài nộp của học viên đang chờ chấm điểm
              </div>
            </div>
          )}

          {/* Single Dominant Primary Action Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              if (nextClass) {
                onOpenAttendanceSession(nextClass);
              } else {
                onOpenAssignmentManager();
              }
            }}
            className="btn btn-primary"
            style={{
              padding: '10px 22px',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              gap: '8px',
              boxShadow: 'var(--shadow-brand)',
              flexShrink: 0
            }}
          >
            <QrCode size={16} />
            <span>{nextClass ? 'MỞ ĐIỂM DANH QR & LỚP' : 'CHẤM BÀI NỘP NGAY'}</span>
          </button>
        </div>
      </section>

      <div style={{ height: '1px', background: 'var(--border-color)' }} />

      {/* ── 2. SECTION 1: LỚP HỌC & ĐIỂM DANH (#section-teacher-class) ── */}
      <section id="section-teacher-class" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          ● 01. LỚP HỌC & THỜI KHÓA BIỂU
        </div>

        <div
          style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          {todayClasses.length > 0 ? (
            todayClasses.map(cls => (
              <div key={cls.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--brand-light)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Calendar size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {cls.title}
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {cls.startTime} - {cls.endTime} • {cls.classCode} • {cls.room}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {cls.onlineMeetingUrl && (
                    <a
                      href={cls.onlineMeetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600, gap: '4px' }}
                    >
                      <ExternalLink size={12} />
                      <span>Meet</span>
                    </a>
                  )}
                  <button
                    onClick={() => onOpenAttendanceSession(cls)}
                    className="btn btn-primary"
                    style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 600, gap: '6px' }}
                  >
                    <QrCode size={13} />
                    <span>Điểm danh QR</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', padding: '6px 0' }}>
              Hôm nay không có lớp giảng dạy. Bạn có thể xem toàn bộ lịch dạy trong tuần.
            </div>
          )}

          <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border-muted)', textAlign: 'right' }}>
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenScheduleCalendar();
              }}
              style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', fontWeight: 600, fontSize: '13px', padding: 0 }}
            >
              Xem toàn bộ Thời Khóa Biểu Lớp →
            </button>
          </div>
        </div>
      </section>

      {/* ── 3. SECTION 2: CẢNH BÁO SỚM HỌC VIÊN (#section-teacher-risk) ── */}
      <section id="section-teacher-risk" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: criticalCount > 0 ? 'var(--danger)' : 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          ● 02. CẢNH BÁO SỚM & CAN THIỆP 1-1 ({atRiskStudents.length} HỌC VIÊN)
        </div>

        <div
          style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {atRiskStudents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {atRiskStudents.slice(0, 3).map(student => (
                <div
                  key={student.studentId}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: student.riskLevel === 'CRITICAL' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                    borderLeft: `4px solid ${student.riskLevel === 'CRITICAL' ? '#ef4444' : '#f59e0b'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {student.studentName} ({student.studentCode})
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {student.factors[0] || 'Tỉ lệ điểm danh thấp & điểm quiz giảm'}
                    </div>
                  </div>

                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: student.riskLevel === 'CRITICAL' ? 'var(--danger)' : 'var(--warning)',
                      color: '#fff',
                      flexShrink: 0
                    }}
                  >
                    Nguy cơ: {student.riskScore}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '13.5px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} />
              <span>Tất cả học viên đều đang có tiến độ và tỉ lệ chuyên cần tốt!</span>
            </div>
          )}

          <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border-muted)', textAlign: 'right' }}>
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenEarlyWarning();
              }}
              style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', fontWeight: 600, fontSize: '13px', padding: 0 }}
            >
              Mở Bảng Điều Khiển Cảnh Báo Sớm Chi Tiết →
            </button>
          </div>
        </div>
      </section>

      {/* ── 4. SECTION 3: CHẤM BÀI & ĐÁNH GIÁ (#section-teacher-grading) ── */}
      <section id="section-teacher-grading" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          ● 03. QUẢN LÝ BÀI TẬP & CHẤM ĐIỂM ({ungradedSubmissions.length} CHỜ CHẤM)
        </div>

        <div
          style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--brand-light)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={18} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {ungradedSubmissions.length} bài nộp cần chấm điểm & nhận xét
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Học viên đã nộp file thực hành Word/Excel qua hệ thống.
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                onOpenAssignmentManager();
              }}
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, borderRadius: 'var(--radius-sm)', flexShrink: 0 }}
            >
              <span>Vào Chấm Bài Ngay</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 5. SECTION 4: QUẢN LÝ HỌC VIÊN & NGÂN HÀNG ĐỀ (#section-teacher-mgmt) ── */}
      <section id="section-teacher-mgmt" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          ● 04. QUẢN LÝ HỆ THỐNG & KHẢO THÍ
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {/* Card 1: Student & Class Management */}
          <div
            className="card card-interactive"
            onClick={() => {
              soundFx.playClick();
              onOpenAdminPortal();
            }}
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--brand-light)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Quản Lý Học Viên</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Danh sách {studentAccounts.length} học viên</div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>

          {/* Card 2: Create Quiz */}
          <div
            className="card card-interactive"
            onClick={() => {
              soundFx.playClick();
              onOpenQuizCreator();
            }}
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <PlusCircle size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Soạn Đề Thi Mới</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Tạo câu hỏi trắc nghiệm</div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>

          {/* Card 3: Quiz Bank */}
          <div
            className="card card-interactive"
            onClick={() => {
              soundFx.playClick();
              onOpenQuizBank();
            }}
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BookOpen size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Ngân Hàng Đề Thi</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Kho câu hỏi & đề thi</div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>
        </div>
      </section>

      {/* ── 6. STICKY CONTEXTUAL AI TEACHER ASSISTANT (BOTTOM VIEWPORT) ── */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '720px',
          zIndex: 80
        }}
      >
        <form
          onSubmit={handleAiSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 8px 6px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
          }}
        >
          <Bot size={18} color="var(--purple-ai)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            value={aiInputText}
            onChange={(e) => setAiInputText(e.target.value)}
            placeholder={getAiPlaceholder()}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '13.5px',
              color: 'var(--text-primary)',
              outline: 'none',
              padding: '4px 0',
              fontWeight: 500
            }}
          />
          <button
            type="submit"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--purple-ai)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            title="Gửi yêu cầu cho AI Trợ Giảng"
          >
            <Send size={13} style={{ marginLeft: '1px' }} />
          </button>
        </form>
      </div>

    </div>
  );
};
