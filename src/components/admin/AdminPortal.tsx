import React, { useState } from 'react';
import { Quiz, QuizAttempt } from '../../types/quiz';
import { UserProfile, StudentAccount, CurriculumTrack } from '../../types/auth';
import {
  Shield, BookOpen, Users, BarChart3, PlusCircle, Trash2, Download,
  Search, FileSpreadsheet, Sparkles, UserCheck
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface AdminPortalProps {
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  studentAccounts: StudentAccount[];
  onAddQuiz: (quiz: Quiz) => void;
  onDeleteCustomQuiz: (quizId: string) => void;
  onNavigateToCreator: () => void;
  onCreateStudentAccount: (name: string, studentCode: string, password?: string, schoolOrClass?: string, programTrack?: CurriculumTrack) => void;
  onDeleteStudentAccount: (id: string) => void;
  currentUser: UserProfile;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  quizzes,
  attempts,
  studentAccounts,
  onDeleteCustomQuiz,
  onNavigateToCreator,
  onCreateStudentAccount,
  onDeleteStudentAccount,
  currentUser
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'student_directory' | 'exams' | 'students' | 'question_bank'>('overview');
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // New Student Account Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentCode, setNewStudentCode] = useState(`THGZ${String(studentAccounts.length + 1).padStart(2, '0')}`);
  const [newStudentPass, setNewStudentPass] = useState('123');
  const [newStudentClass, setNewStudentClass] = useState('Lớp CNTT Cơ Bản K1');
  const [newStudentTrack, setNewStudentTrack] = useState<CurriculumTrack>('cntt-basic');
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);

  // Stats computation
  const totalQuizzes = quizzes.length;
  const totalQuestions = quizzes.reduce((sum, q) => sum + q.questions.length, 0);
  const totalSubmissions = attempts.length;
  const avgScore = totalSubmissions > 0
    ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / totalSubmissions)
    : 0;
  const passRate = totalSubmissions > 0
    ? Math.round((attempts.filter(a => a.percentage >= 70).length / totalSubmissions) * 100)
    : 0;

  // Filtered quizzes
  const filteredQuizzes = quizzes.filter(q => {
    const matchSearch = q.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      q.description.toLowerCase().includes(searchFilter.toLowerCase());
    const matchCat = categoryFilter === 'all' || q.category === categoryFilter;
    return matchSearch && matchCat;
  });

  // Filtered attempts
  const filteredAttempts = attempts.filter(a => {
    return a.quizTitle.toLowerCase().includes(searchFilter.toLowerCase());
  });

  // Filtered students
  const filteredStudents = studentAccounts.filter(s => {
    return (
      s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.schoolOrClass.toLowerCase().includes(searchFilter.toLowerCase())
    );
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentCode.trim()) {
      alert('Vui lòng nhập đầy đủ họ tên và mã học viên!');
      return;
    }

    onCreateStudentAccount(
      newStudentName,
      newStudentCode,
      newStudentPass,
      newStudentClass,
      newStudentTrack
    );

    soundFx.playVictory();
    setNewStudentName('');
    setNewStudentCode(`THGZ${String(studentAccounts.length + 2).padStart(2, '0')}`);
    setShowAddStudentForm(false);
  };

  const exportGradebookJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(attempts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `BangDiem_HocVien_PH_TINHOCGENZ_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    soundFx.playCorrect();
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '16px' }} className="animate-slide-up">
      {/* Admin Header Banner */}
      <div
        className="card"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(245, 158, 11, 0.03) 100%)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '20px',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)'
            }}
          >
            <Shield size={24} />
          </div>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Cổng Quản Trị Giảng Viên</span>
              <span>•</span>
              <span>{currentUser.name}</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              Quản Trị Đào Tạo & Phân Hệ Tin Học
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Cấp tài khoản học viên, quản lý ngân hàng đề thi theo 6 phân hệ đào tạo CNTT.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              setActiveSubTab('student_directory');
              setShowAddStudentForm(true);
            }}
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}
          >
            <UserCheck size={16} />
            <span>Thêm Học Viên Mới</span>
          </button>

          <button
            onClick={onNavigateToCreator}
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)'
            }}
          >
            <PlusCircle size={16} />
            <span>Tạo Đề Thi Mới</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}
      >
        {[
          { id: 'overview', label: 'Tổng Quan Giảng Dạy', icon: BarChart3 },
          { id: 'student_directory', label: 'Tài Khoản Học Viên', icon: UserCheck, count: studentAccounts.length },
          { id: 'exams', label: 'Kho Đề Thi Hệ Thống', icon: BookOpen, count: totalQuizzes },
          { id: 'students', label: 'Bảng Điểm Làm Bài', icon: Users, count: totalSubmissions },
          { id: 'question_bank', label: 'Ngân Hàng Câu Hỏi', icon: FileSpreadsheet, count: totalQuestions }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                soundFx.playClick();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--bg-secondary)' : 'var(--bg-card)',
                border: isActive ? '1.5px solid #d97706' : '1px solid var(--border-color)',
                color: isActive ? '#d97706' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.18s ease'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    background: isActive ? 'rgba(217, 119, 6, 0.15)' : 'var(--border-color)',
                    color: isActive ? '#d97706' : 'var(--text-muted)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 700
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeSubTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Key Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div className="card" style={{ padding: '18px', borderLeft: '4px solid #2563eb' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Tổng Số Học Viên</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>{studentAccounts.length}</div>
              <div style={{ fontSize: '0.75rem', color: '#2563eb' }}>Đã cấp mã đăng nhập</div>
            </div>

            <div className="card" style={{ padding: '18px', borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Kho Đề Thi Phân Hệ</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>{totalQuizzes}</div>
              <div style={{ fontSize: '0.75rem', color: '#10b981' }}>6 Phân hệ đào tạo CNTT</div>
            </div>

            <div className="card" style={{ padding: '18px', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Lượt Nộp Bài Thi</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>{totalSubmissions}</div>
              <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Từ toàn bộ học viên</div>
            </div>

            <div className="card" style={{ padding: '18px', borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Tỷ Lệ Đạt Chuẩn (≥70%)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>{passRate}%</div>
              <div style={{ fontSize: '0.75rem', color: '#8b5cf6' }}>Điểm TB: {avgScore}%</div>
            </div>
          </div>

          {/* Structured Curriculum Tracks Summary */}
          <div className="card" style={{ padding: '22px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#d97706" />
              <span>6 Phân Hệ Đào Tạo CNTT Chuẩn Hóa Tại PH Digital Education</span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
              <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid #10b981' }}>
                <div style={{ fontWeight: 800, color: '#10b981' }}>1. CNTT & Tin Học Cơ Bản</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Phần cứng, hệ điều hành Windows, thao tác tệp tin và Internet an toàn.</div>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid #2563eb' }}>
                <div style={{ fontWeight: 800, color: '#2563eb' }}>2. Tin Học Văn Phòng Quốc Tế MOS</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>MOS Word (văn bản), MOS Excel (hàm & biểu đồ), MOS PowerPoint.</div>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid #3b82f6' }}>
                <div style={{ fontWeight: 800, color: '#3b82f6' }}>3. Chuẩn Tin Học Quốc Tế IC3 GS6</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Computing Fundamentals, Key Applications và Living Online.</div>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid #ea580c' }}>
                <div style={{ fontWeight: 800, color: '#ea580c' }}>4. CNTT Nâng Cao & Xử Lý Dữ Liệu</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Hàm lồng phức hợp, Dynamic Arrays, PivotTable nâng cao và VBA.</div>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid #f59e0b' }}>
                <div style={{ fontWeight: 800, color: '#f59e0b' }}>5. Lập Trình Python & Thuật Toán</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Cú pháp Python 3, cấu trúc dữ liệu, giải thuật tìm kiếm, sắp xếp.</div>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid #6366f1' }}>
                <div style={{ fontWeight: 800, color: '#6366f1' }}>6. Mạng Máy Tính & An Toàn Thông Tin</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Hệ thống DNS, địa chỉ IP, bảo mật mạng và phòng chống mã độc số.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. STUDENT DIRECTORY TAB */}
      {activeSubTab === 'student_directory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Tìm học viên theo tên, mã THGZ, lớp..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>

            <button
              onClick={() => setShowAddStudentForm(!showAddStudentForm)}
              className="btn btn-primary"
            >
              <UserCheck size={16} />
              <span>{showAddStudentForm ? 'Đóng Biểu Mẫu' : 'Tạo Tài Khoản Học Viên Mới'}</span>
            </button>
          </div>

          {/* Add Student Form */}
          {showAddStudentForm && (
            <form onSubmit={handleCreateStudent} className="card animate-slide-up" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1.5px solid var(--accent-primary)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Tạo & Cấp Mã Đăng Nhập Cho Học Viên Mới
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    Họ và Tên Học Sinh *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Hoàng Minh Trí"
                    value={newStudentName}
                    onChange={e => setNewStudentName(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    Mã Học Viên Đăng Nhập *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="THGZ04"
                    value={newStudentCode}
                    onChange={e => setNewStudentCode(e.target.value.toUpperCase())}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 800, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    Mật Khẩu Đăng Nhập (Mặc định: 123)
                  </label>
                  <input
                    type="text"
                    value={newStudentPass}
                    onChange={e => setNewStudentPass(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    Lớp Học Phân Công
                  </label>
                  <input
                    type="text"
                    value={newStudentClass}
                    onChange={e => setNewStudentClass(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    Phân Hệ Chương Trình Học
                  </label>
                  <select
                    value={newStudentTrack}
                    onChange={e => setNewStudentTrack(e.target.value as CurriculumTrack)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                  >
                    <option value="cntt-basic">1. CNTT & Tin Học Cơ Bản</option>
                    <option value="mos-office">2. Tin Học Văn Phòng MOS</option>
                    <option value="ic3-gs">3. Chuẩn Quốc Tế IC3 GS6</option>
                    <option value="cntt-advanced">4. CNTT Nâng Cao & Data</option>
                    <option value="programming">5. Lập Trình Python</option>
                    <option value="cyber-security">6. Mạng & Bảo Mật IT</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', fontWeight: 800 }}>
                  Lưu & Cấp Tài Khoản
                </button>
                <button type="button" onClick={() => setShowAddStudentForm(false)} className="btn btn-secondary">
                  Hủy
                </button>
              </div>
            </form>
          )}

          {/* Student Accounts Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px' }}>Họ và Tên</th>
                  <th style={{ padding: '12px 14px' }}>Mã Học Viên (Tài Khoản)</th>
                  <th style={{ padding: '12px 14px' }}>Mật Khẩu</th>
                  <th style={{ padding: '12px 14px' }}>Lớp Học</th>
                  <th style={{ padding: '12px 14px' }}>Phân Hệ Đào Tạo</th>
                  <th style={{ padding: '12px 14px' }}>Quyền Hạn</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {s.name}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontWeight: 800, color: 'var(--accent-primary)', background: 'rgba(37, 99, 235, 0.1)', padding: '3px 8px', borderRadius: 'var(--radius-sm)' }}>
                        {s.studentCode}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>
                      <code>{s.password || '123'}</code>
                    </td>
                    <td style={{ padding: '12px 14px' }}>{s.schoolOrClass}</td>
                    <td style={{ padding: '12px 14px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 600, color: '#d97706' }}>
                      {s.programTrack}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                        Chỉ Quyền Học Sinh 🎓
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => onDeleteStudentAccount(s.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        title="Xóa học viên này"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. EXAMS TAB */}
      {activeSubTab === 'exams' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Tìm kiếm đề thi..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none' }}
              />
            </div>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none' }}
            >
              <option value="all">Tất cả 6 phân hệ đào tạo</option>
              <option value="cntt-basic">1. CNTT Cơ Bản</option>
              <option value="mos-office">2. MOS Quốc Tế</option>
              <option value="ic3-gs">3. IC3 GS6</option>
              <option value="cntt-advanced">4. CNTT Nâng Cao</option>
              <option value="programming">5. Lập Trình Python</option>
              <option value="cyber-security">6. Mạng & Bảo Mật</option>
            </select>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px' }}>Tên Đề Thi</th>
                  <th style={{ padding: '12px 14px' }}>Phân Hệ Đào Tạo</th>
                  <th style={{ padding: '12px 14px' }}>Số Câu</th>
                  <th style={{ padding: '12px 14px' }}>Thời Lượng</th>
                  <th style={{ padding: '12px 14px' }}>Loại Đề</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuizzes.map((quiz, i) => (
                  <tr key={quiz.id} style={{ borderBottom: i < filteredQuizzes.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {quiz.title}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.78rem' }}>
                      {quiz.category}
                    </td>
                    <td style={{ padding: '12px 14px' }}>{quiz.questions.length} câu</td>
                    <td style={{ padding: '12px 14px' }}>{quiz.timeLimitMinutes} phút</td>
                    <td style={{ padding: '12px 14px' }}>
                      {quiz.isCustom ? (
                        <span style={{ fontSize: '0.72rem', background: 'rgba(217, 119, 6, 0.15)', color: '#d97706', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                          Giáo viên tạo
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.72rem', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                          Hệ thống chuẩn
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {quiz.isCustom ? (
                        <button
                          onClick={() => onDeleteCustomQuiz(quiz.id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                          title="Xóa đề thi này"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cố định</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. STUDENTS GRADEBOOK TAB */}
      {activeSubTab === 'students' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ position: 'relative', minWidth: '260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Tìm kiếm kết quả theo tên bài thi..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none' }}
              />
            </div>

            <button onClick={exportGradebookJSON} className="btn btn-secondary">
              <Download size={16} />
              <span>Tải Bảng Điểm (.JSON)</span>
            </button>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            {filteredAttempts.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Chưa có dữ liệu nộp bài thi nào được ghi nhận.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px 16px' }}>STT</th>
                    <th style={{ padding: '12px 14px' }}>Bài Kiểm Tra</th>
                    <th style={{ padding: '12px 14px' }}>Chế Độ</th>
                    <th style={{ padding: '12px 14px' }}>Điểm Số</th>
                    <th style={{ padding: '12px 14px' }}>Tỷ Lệ Đúng</th>
                    <th style={{ padding: '12px 14px' }}>Đánh Giá</th>
                    <th style={{ padding: '12px 16px' }}>Thời Gian Nộp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttempts.map((att, i) => (
                    <tr key={i} style={{ borderBottom: i < filteredAttempts.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>#{i + 1}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>{att.quizTitle}</td>
                      <td style={{ padding: '12px 14px', textTransform: 'capitalize' }}>
                        {att.mode === 'exam' ? 'Thi tính giờ' : 'Luyện tập'}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 700 }}>{att.score}/{att.maxScore}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontWeight: 800, color: att.percentage >= 70 ? '#10b981' : '#ef4444' }}>
                          {att.percentage}%
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {att.percentage >= 85 ? (
                          <span style={{ color: '#10b981', fontWeight: 700 }}>Xuất Sắc 🌟</span>
                        ) : att.percentage >= 70 ? (
                          <span style={{ color: '#3b82f6', fontWeight: 700 }}>Đạt Chuẩn 👏</span>
                        ) : (
                          <span style={{ color: '#ef4444', fontWeight: 700 }}>Cần Luyện Thêm 💪</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{att.completedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 5. QUESTION BANK TAB */}
      {activeSubTab === 'question_bank' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Ngân hàng câu hỏi trắc nghiệm phân theo 6 phân hệ đào tạo CNTT:
            </p>
            <button onClick={onNavigateToCreator} className="btn btn-primary">
              <PlusCircle size={16} />
              <span>Thêm Câu Hỏi Mới</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {quizzes.map(quiz => (
              <div key={quiz.id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {quiz.title} ({quiz.questions.length} câu)
                  </h4>
                  <span className="badge" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--accent-primary)' }}>
                    {quiz.category}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {quiz.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      style={{
                        padding: '10px 14px',
                        background: 'var(--bg-primary)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        Câu {idx + 1}: {q.prompt}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Dạng: <b>{q.type}</b> • Điểm: <b>{q.points} XP</b> • Giải thích: {q.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
