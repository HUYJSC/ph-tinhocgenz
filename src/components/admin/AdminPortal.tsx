import React, { useState } from 'react';
import { Quiz, QuizAttempt } from '../../types/quiz';
import { UserProfile } from '../../types/auth';
import {
  Shield, BookOpen, Users, BarChart3, PlusCircle, Trash2, Download,
  Search, Clock, FileSpreadsheet, Sparkles
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface AdminPortalProps {
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  onAddQuiz: (quiz: Quiz) => void;
  onDeleteCustomQuiz: (quizId: string) => void;
  onNavigateToCreator: () => void;
  currentUser: UserProfile;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  quizzes,
  attempts,
  onDeleteCustomQuiz,
  onNavigateToCreator,
  currentUser
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'exams' | 'students' | 'question_bank'>('overview');
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

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
              Quản Trị Đào Tạo & Ngân Hàng Đề Thi Tin Học
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Quản lý đề thi MOS / IC3 / Lập trình, giám sát bảng điểm học sinh và xuất báo cáo.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
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

          <button
            onClick={exportGradebookJSON}
            className="btn btn-secondary"
            title="Xuất bảng điểm ra file JSON"
          >
            <Download size={16} />
            <span>Xuất Bảng Điểm</span>
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
          { id: 'exams', label: 'Danh Sách Đề Thi', icon: BookOpen, count: totalQuizzes },
          { id: 'students', label: 'Bảng Điểm Học Viên', icon: Users, count: totalSubmissions },
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
            <div className="card" style={{ padding: '18px', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Tổng Số Đề Thi</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>{totalQuizzes}</div>
              <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}>MOS • IC3 • Python • Mạng</div>
            </div>

            <div className="card" style={{ padding: '18px', borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Tổng Số Câu Hỏi</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>{totalQuestions}</div>
              <div style={{ fontSize: '0.75rem', color: '#10b981' }}>Đầy đủ giải thích chi tiết</div>
            </div>

            <div className="card" style={{ padding: '18px', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Lượt Nộp Bài Thi</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>{totalSubmissions}</div>
              <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Từ tất cả học viên</div>
            </div>

            <div className="card" style={{ padding: '18px', borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Tỷ Lệ Đạt Yêu Cầu (≥70%)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>{passRate}%</div>
              <div style={{ fontSize: '0.75rem', color: '#8b5cf6' }}>Điểm TB: {avgScore}%</div>
            </div>
          </div>

          {/* Quick Actions & Syllabus Guide */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#d97706" />
                <span>Chương Trình Đào Tạo Đang Giảng Dạy</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                  <span>📊 <b>MOS Excel Specialist</b> (Hàm, PivotTable, Data)</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>Hoạt động</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                  <span>🖥️ <b>Chuẩn Quốc Tế IC3 GS6</b> (Computing, Internet)</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>Hoạt động</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                  <span>📝 <b>MOS Word Specialist</b> (Style, Mail Merge, TOC)</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>Hoạt động</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                  <span>🐍 <b>Lập Trình Python & Thuật Toán</b></span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>Hoạt động</span>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="#3b82f6" />
                <span>Lịch Sử Thi Gần Nhất</span>
              </h3>
              {attempts.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Chưa có lượt nộp bài nào gần đây.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {attempts.slice(-4).reverse().map((att, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 10px',
                        background: 'var(--bg-primary)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem'
                      }}
                    >
                      <div style={{ minWidth: 0, paddingRight: '8px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {att.quizTitle}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{att.completedAt}</div>
                      </div>
                      <span
                        style={{
                          fontWeight: 800,
                          color: att.percentage >= 70 ? '#10b981' : '#ef4444',
                          background: att.percentage >= 70 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)'
                        }}
                      >
                        {att.score}/{att.maxScore} ({att.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. EXAMS TAB */}
      {activeSubTab === 'exams' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filter Toolbar */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Tìm kiếm đề thi..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            >
              <option value="all">Tất cả môn học</option>
              <option value="mos-excel">MOS Excel</option>
              <option value="mos-word">MOS Word</option>
              <option value="mos-powerpoint">MOS PowerPoint</option>
              <option value="ic3-gs">IC3 GS5/GS6</option>
              <option value="programming">Lập trình Python</option>
              <option value="general-it">Mạng & Bảo mật IT</option>
            </select>
          </div>

          {/* Table List of Quizzes */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px' }}>Tên Đề Thi</th>
                  <th style={{ padding: '12px 14px' }}>Chuyên Đề</th>
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
                    <td style={{ padding: '12px 14px', color: 'var(--accent-primary)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.78rem' }}>
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

      {/* 3. STUDENTS & GRADEBOOK TAB */}
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
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
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

      {/* 4. QUESTION BANK TAB */}
      {activeSubTab === 'question_bank' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Danh mục toàn bộ câu hỏi trắc nghiệm Tin học phân theo môn học:
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
