/**
 * InstructorDashboard — Portal giảng viên
 * LMS EduQuest — PH Digital Education
 */
import { useState } from 'react';
import {
  Users, BookOpen, BarChart3,
  TrendingUp, CheckCircle, AlertTriangle,
  Edit3, PlusCircle, Search
} from 'lucide-react';

interface StudentSummary {
  id: string;
  name: string;
  studentCode: string;
  classCode: string;
  lastActive: string;
  overallProgress: number;
  riskLevel: 'low' | 'medium' | 'high';
  totalQuizzesTaken: number;
  averageScore: number;
}

const DEMO_STUDENTS: StudentSummary[] = [
  { id: 'std-101', name: 'Nguyễn Văn An', studentCode: 'THGZ01', classCode: 'K26-WE01', lastActive: '2 giờ trước', overallProgress: 67, riskLevel: 'low', totalQuizzesTaken: 8, averageScore: 82 },
  { id: 'std-102', name: 'Trần Thị Mai', studentCode: 'THGZ02', classCode: 'K26-WE01', lastActive: '1 ngày trước', overallProgress: 45, riskLevel: 'medium', totalQuizzesTaken: 5, averageScore: 71 },
  { id: 'std-103', name: 'Phạm Minh Tuấn', studentCode: 'THGZ03', classCode: 'K26-WE01', lastActive: '3 ngày trước', overallProgress: 20, riskLevel: 'high', totalQuizzesTaken: 2, averageScore: 55 },
  { id: 'std-104', name: 'Đỗ Thu Hà', studentCode: 'THGZ04', classCode: 'K26-CC01', lastActive: '5 giờ trước', overallProgress: 80, riskLevel: 'low', totalQuizzesTaken: 12, averageScore: 91 },
  { id: 'std-105', name: 'Lê Hoàng Long', studentCode: 'THGZ05', classCode: 'K26-CC01', lastActive: '1 giờ trước', overallProgress: 55, riskLevel: 'low', totalQuizzesTaken: 7, averageScore: 78 },
];

const RISK_CONFIG = {
  low: { color: '#16A34A', bg: '#ECFDF5', label: 'Tốt', icon: <CheckCircle size={13} /> },
  medium: { color: '#D97706', bg: '#FFFBEB', label: 'Cần chú ý', icon: <AlertTriangle size={13} /> },
  high: { color: '#DC2626', bg: '#FEF2F2', label: 'Nguy cơ cao', icon: <AlertTriangle size={13} /> }
};

interface InstructorDashboardProps {
  teacherName?: string;
}

export function InstructorDashboard({ teacherName = 'Giảng viên' }: InstructorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'courses' | 'grading'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  const filteredStudents = DEMO_STUDENTS.filter(s =>
    (riskFilter === 'all' || s.riskLevel === riskFilter) &&
    (searchQuery === '' ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const stats = {
    totalStudents: DEMO_STUDENTS.length,
    atRisk: DEMO_STUDENTS.filter(s => s.riskLevel === 'high').length,
    avgProgress: Math.round(DEMO_STUDENTS.reduce((a, s) => a + s.overallProgress, 0) / DEMO_STUDENTS.length),
    totalCourses: 3
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>
            Xin chào, {teacherName} 👋
          </h1>
          <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>
            Quản lý lớp học và theo dõi tiến độ học viên
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: '#ffffff', borderRadius: '12px', padding: '4px', border: '1px solid #E2E8F0', width: 'fit-content' }}>
          {([
            { id: 'overview', label: 'Tổng quan', icon: <BarChart3 size={15} /> },
            { id: 'students', label: 'Học viên', icon: <Users size={15} /> },
            { id: 'courses', label: 'Khóa học', icon: <BookOpen size={15} /> },
            { id: 'grading', label: 'Chấm bài', icon: <Edit3 size={15} /> }
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '8px', border: 'none',
                background: activeTab === tab.id ? '#0057B8' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#64748B',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {[
                { icon: <Users size={22} />, label: 'Tổng học viên', value: stats.totalStudents, color: '#0057B8', bg: '#EFF6FF' },
                { icon: <AlertTriangle size={22} />, label: 'Học viên nguy cơ cao', value: stats.atRisk, color: '#DC2626', bg: '#FEF2F2' },
                { icon: <TrendingUp size={22} />, label: 'Tiến độ trung bình', value: `${stats.avgProgress}%`, color: '#16A34A', bg: '#ECFDF5' },
                { icon: <BookOpen size={22} />, label: 'Khóa học đang dạy', value: stats.totalCourses, color: '#7C3AED', bg: '#F5F3FF' }
              ].map((stat, i) => (
                <div key={i} style={{
                  background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '14px',
                  padding: '20px', display: 'flex', alignItems: 'center', gap: '16px'
                }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: stat.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: stat.color, flexShrink: 0
                  }}>
                    {stat.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>{stat.value}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* At-risk students */}
            <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{
                padding: '16px 24px', borderBottom: '1px solid #F1F5F9',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <AlertTriangle size={16} color="#DC2626" />
                <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>
                  Học viên cần hỗ trợ
                </h2>
              </div>
              {DEMO_STUDENTS.filter(s => s.riskLevel !== 'low').map(student => {
                const risk = RISK_CONFIG[student.riskLevel];
                return (
                  <div key={student.id} style={{
                    padding: '16px 24px', borderBottom: '1px solid #F8FAFC',
                    display: 'flex', alignItems: 'center', gap: '16px'
                  }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: '#EFF6FF', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: '#0057B8', fontWeight: '700', fontSize: '14px', flexShrink: 0
                    }}>
                      {student.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '600', color: '#0F172A', fontSize: '14px' }}>{student.name}</div>
                      <div style={{ fontSize: '12px', color: '#94A3B8' }}>{student.studentCode} · {student.classCode} · Hoạt động {student.lastActive}</div>
                    </div>
                    <div style={{ width: '120px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#64748B' }}>Tiến độ</span>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#0F172A' }}>{student.overallProgress}%</span>
                      </div>
                      <div style={{ height: '4px', background: '#E2E8F0', borderRadius: '2px' }}>
                        <div style={{ height: '100%', width: `${student.overallProgress}%`, background: risk.color, borderRadius: '2px' }} />
                      </div>
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      background: risk.bg, color: risk.color,
                      padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '600', flexShrink: 0
                    }}>
                      {risk.icon} {risk.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div>
            {/* Search + Filter */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên, mã học viên..."
                  style={{
                    width: '100%', padding: '9px 12px 9px 34px',
                    border: '1px solid #E2E8F0', borderRadius: '10px',
                    fontSize: '13px', background: '#ffffff', outline: 'none', color: '#0F172A'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['all', 'low', 'medium', 'high'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setRiskFilter(f)}
                    style={{
                      padding: '8px 14px', borderRadius: '8px', border: '1px solid',
                      borderColor: riskFilter === f ? '#0057B8' : '#E2E8F0',
                      background: riskFilter === f ? '#EFF6FF' : '#ffffff',
                      color: riskFilter === f ? '#0057B8' : '#64748B',
                      fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                    }}
                  >
                    {f === 'all' ? 'Tất cả' : f === 'low' ? '🟢 Tốt' : f === 'medium' ? '🟡 Chú ý' : '🔴 Nguy cơ'}
                  </button>
                ))}
              </div>
            </div>

            {/* Student Table */}
            <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    {['Học viên', 'Lớp', 'Tiến độ', 'Điểm TB', 'Số bài thi', 'Rủi ro', 'Hoạt động'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => {
                    const risk = RISK_CONFIG[student.riskLevel];
                    return (
                      <tr key={student.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '50%', background: '#EFF6FF',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#0057B8', fontWeight: '700', fontSize: '13px', flexShrink: 0
                            }}>
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: '#0F172A', fontSize: '13px' }}>{student.name}</div>
                              <div style={{ fontSize: '11px', color: '#94A3B8' }}>{student.studentCode}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748B' }}>{student.classCode}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '80px', height: '4px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${student.overallProgress}%`, background: '#0057B8', borderRadius: '2px' }} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>{student.overallProgress}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            fontWeight: '700', fontSize: '14px',
                            color: student.averageScore >= 80 ? '#16A34A' : student.averageScore >= 60 ? '#D97706' : '#DC2626'
                          }}>
                            {student.averageScore}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748B' }}>{student.totalQuizzesTaken}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            background: risk.bg, color: risk.color,
                            padding: '3px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: '600'
                          }}>
                            {risk.icon} {risk.label}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '12px', color: '#94A3B8' }}>{student.lastActive}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div style={{
            background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>Khóa học đang dạy</h2>
              <button style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: '#0057B8', color: '#ffffff', border: 'none',
                borderRadius: '8px', padding: '8px 16px', fontSize: '13px',
                fontWeight: '600', cursor: 'pointer'
              }}>
                <PlusCircle size={15} /> Tạo khóa học
              </button>
            </div>
            <div style={{ color: '#94A3B8', textAlign: 'center', padding: '40px 0' }}>
              <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
              <p>Tính năng quản lý khóa học đầy đủ đang được phát triển</p>
            </div>
          </div>
        )}

        {/* Grading Tab */}
        {activeTab === 'grading' && (
          <div style={{
            background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px'
          }}>
            <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>Chấm bài & Nhận xét</h2>
            <div style={{ color: '#94A3B8', textAlign: 'center', padding: '40px 0' }}>
              <Edit3 size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
              <p>Chức năng chấm bài tự luận đang được phát triển</p>
              <p style={{ fontSize: '13px' }}>Bài thi trắc nghiệm đã được chấm tự động bởi server</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
