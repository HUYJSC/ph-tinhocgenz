import React from 'react';
import {
  BookOpen, Award, TrendingUp, CheckSquare,
  CheckCircle2, Clock, ShieldCheck
} from 'lucide-react';

export interface CourseProgressItem {
  id: string;
  name: string;
  progressPercent: number; // 0-100
  gpaScore: number; // e.g. 8.5
  maxScore?: number; // e.g. 10
  attendanceRate: number; // 0-100, e.g. 95
  completedLessons: number;
  totalLessons: number;
  status: 'active' | 'completed' | 'paused';
}

export interface DigitalCertificateSummary {
  id: string;
  title: string;
  issueDate: string;
  verificationHash: string;
  blockchainVerified: boolean;
}

export interface LearningProgressProps {
  totalCourses?: number;
  overallProgress?: number; // e.g. 72
  totalTests?: number; // e.g. 15
  totalCertificates?: number; // e.g. 2
  courses?: CourseProgressItem[];
  certificates?: DigitalCertificateSummary[];
}

export const LearningProgress: React.FC<LearningProgressProps> = ({
  totalCourses = 5,
  overallProgress = 72,
  totalTests = 15,
  totalCertificates = 2,
  courses = [
    {
      id: 'c1',
      name: 'Chứng Chỉ CNTT Cơ Bản Chuẩn Bộ TT&TT (6 Buổi)',
      progressPercent: 80,
      gpaScore: 8.5,
      maxScore: 10,
      attendanceRate: 95,
      completedLessons: 5,
      totalLessons: 6,
      status: 'active'
    },
    {
      id: 'c2',
      name: 'Word, Excel, PowerPoint 3-in-1 Fast-Track',
      progressPercent: 68,
      gpaScore: 9.0,
      maxScore: 10,
      attendanceRate: 100,
      completedLessons: 6,
      totalLessons: 9,
      status: 'active'
    },
    {
      id: 'c3',
      name: 'Kỹ Năng Phân Tích Dữ Liệu Excel Nâng Cao',
      progressPercent: 100,
      gpaScore: 9.2,
      maxScore: 10,
      attendanceRate: 98,
      completedLessons: 6,
      totalLessons: 6,
      status: 'completed'
    }
  ],
  certificates = [
    {
      id: 'cert-1',
      title: 'Chứng Nhận Xuất Sắc: Microsoft Office Specialist',
      issueDate: '15/09/2026',
      verificationHash: '0x8f2a...7c91',
      blockchainVerified: true
    },
    {
      id: 'cert-2',
      title: 'Chứng Chỉ Ứng Dụng CNTT Cơ Bản',
      issueDate: '28/08/2026',
      verificationHash: '0x3b1c...99a4',
      blockchainVerified: true
    }
  ]
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── 1. STUDENT MINI-DASHBOARD METRICS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '12px'
      }}>
        {/* Metric 1: Khóa học */}
        <div style={{
          padding: '14px 16px',
          borderRadius: '12px',
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0057B8' }}>
            <BookOpen size={16} />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Khóa học</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0B2545' }}>
            {totalCourses}
          </div>
          <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Đang tham gia</span>
        </div>

        {/* Metric 2: Tiến độ tổng thể */}
        <div style={{
          padding: '14px 16px',
          borderRadius: '12px',
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0057B8' }}>
            <TrendingUp size={16} />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Tiến độ</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0057B8' }}>
            {overallProgress}%
          </div>
          <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Hoàn thành tổng</span>
        </div>

        {/* Metric 3: Bài kiểm tra */}
        <div style={{
          padding: '14px 16px',
          borderRadius: '12px',
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0057B8' }}>
            <CheckSquare size={16} />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Khảo thí</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0B2545' }}>
            {totalTests}
          </div>
          <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Bài kiểm tra</span>
        </div>

        {/* Metric 4: Chứng chỉ */}
        <div style={{
          padding: '14px 16px',
          borderRadius: '12px',
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0057B8' }}>
            <Award size={16} />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Chứng chỉ</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0B2545' }}>
            {totalCertificates}
          </div>
          <span style={{ fontSize: '0.74rem', color: '#16A34A', fontWeight: 700 }}>Đã bảo chứng ✓</span>
        </div>
      </div>

      {/* ── 2. ACTIVE COURSES PROGRESS LIST ── */}
      <div>
        <h4 style={{
          fontSize: '0.88rem',
          fontWeight: 800,
          color: '#0B2545',
          margin: '0 0 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>Danh sách môn học & tiến độ chi tiết</span>
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {courses.map((course) => (
            <div
              key={course.id}
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              {/* Course Title + Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0B2545', lineHeight: 1.35 }}>
                    {course.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '3px' }}>
                    Đã hoàn thành {course.completedLessons}/{course.totalLessons} bài học
                  </div>
                </div>

                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '999px',
                  background: course.status === 'completed' ? '#ECFDF5' : '#EFF6FF',
                  color: course.status === 'completed' ? '#059669' : '#0057B8',
                  border: `1px solid ${course.status === 'completed' ? '#A7F3D0' : '#BFDBFE'}`
                }}>
                  {course.status === 'completed' ? 'Đã hoàn thành' : 'Đang học'}
                </span>
              </div>

              {/* Visual Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                  <span>Tiến độ bài học</span>
                  <span style={{ color: '#0057B8' }}>{course.progressPercent}%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#F1F5F9',
                  borderRadius: '999px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${course.progressPercent}%`,
                    height: '100%',
                    background: '#0057B8',
                    borderRadius: '999px',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>

              {/* Score & Attendance Metrics Row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: '1px solid #F1F5F9',
                fontSize: '0.78rem'
              }}>
                <div style={{ color: '#475569' }}>
                  <span>Điểm trung bình: </span>
                  <strong style={{ color: '#0B2545' }}>{course.gpaScore}/{course.maxScore || 10}</strong>
                </div>

                <div style={{ color: '#475569' }}>
                  <span>Chuyên cần: </span>
                  <strong style={{ color: '#16A34A' }}>{course.attendanceRate}%</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. DIGITAL CERTIFICATES LIST ── */}
      {certificates && certificates.length > 0 && (
        <div>
          <h4 style={{
            fontSize: '0.88rem',
            fontWeight: 800,
            color: '#0B2545',
            margin: '0 0 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <ShieldCheck size={16} color="#0057B8" />
            <span>Văn bằng & Chứng chỉ số đã cấp</span>
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {certificates.map((cert) => (
              <div
                key={cert.id}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0B2545' }}>
                    {cert.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <Clock size={11} />
                    <span>Cấp ngày: {cert.issueDate}</span>
                    <span>•</span>
                    <span style={{ fontFamily: 'monospace' }}>Hash: {cert.verificationHash}</span>
                  </div>
                </div>

                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: '#F0FDF4',
                  color: '#166534',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  border: '1px solid #BBF7D0',
                  whiteSpace: 'nowrap'
                }}>
                  <CheckCircle2 size={12} color="#16A34A" />
                  <span>Xác thực</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

