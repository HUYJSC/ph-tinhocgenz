import React, { useState } from 'react';
import {
  Layers, Users, BookOpen, CheckSquare, Award, QrCode,
  Calendar, BarChart3, ChevronRight, Video,
  Clock, Search, CheckCircle2
} from 'lucide-react';
import { UserProfile, StudentAccount } from '../../types/auth';
import { ClassScheduleItem } from '../../types/schedule';
import { soundFx } from '../../utils/audio';

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
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'students' | 'lessons' | 'assignments' | 'grades' | 'attendance' | 'schedule'>('overview');
  const [searchStudent, setSearchStudent] = useState('');

  const classStudents = studentAccounts.filter(s => !s.classCode || s.classCode === classCode);

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: Layers },
    { id: 'students', label: `Học viên (${classStudents.length})`, icon: Users },
    { id: 'lessons', label: 'Bài giảng (12)', icon: BookOpen },
    { id: 'assignments', label: 'Bài tập (8)', icon: CheckSquare },
    { id: 'grades', label: 'Bảng điểm', icon: Award },
    { id: 'attendance', label: 'Điểm danh', icon: QrCode },
    { id: 'schedule', label: 'Lịch học', icon: Calendar }
  ] as const;

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Breadcrumb & Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '13px', cursor: 'pointer', padding: 0 }}
          >
            Quản Lý Lớp Học
          </button>
          <ChevronRight size={14} color="#94A3B8" />
          <span style={{ fontSize: '13px', color: '#0057B8', fontWeight: 600 }}>Lớp {classCode}</span>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ← Quay lại danh sách
          </button>
        )}
      </div>

      {/* Class Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0057B8 0%, #1E40AF 100%)',
        borderRadius: '16px',
        padding: '24px 28px',
        color: '#FFFFFF',
        marginBottom: '24px',
        boxShadow: '0 4px 16px rgba(0,87,184,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
            Mã lớp: {classCode} • Kỹ Năng Văn Phòng Chuẩn Quốc Tế
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 700 }}>
            Word, Excel, PowerPoint 3-in-1 Thực Chiến
          </h1>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
            Giảng viên: {currentUser?.name || 'Thầy Nguyễn Đình Huy'} • Sĩ số: {classStudents.length} học viên • Phòng LAB 01
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onNavigateTab ? onNavigateTab('live') : window.open('https://meet.google.com', '_blank')}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              background: '#FFFFFF',
              color: '#0057B8',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Video size={16} />
            Mở Lớp Trực Tuyến
          </button>

          <button
            onClick={() => onNavigateTab && onNavigateTab('attendance')}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.1)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <QrCode size={16} />
            Điểm Danh QR
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #E2E8F0', marginBottom: '24px', overflowX: 'auto' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveSubTab(tab.id); soundFx.playClick(); }}
              style={{
                padding: '10px 18px',
                border: 'none',
                background: 'none',
                borderBottom: isActive ? '2px solid #0057B8' : '2px solid transparent',
                color: isActive ? '#0057B8' : '#64748B',
                fontWeight: isActive ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content: Overview */}
      {activeSubTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Progress Card */}
          <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} color="#0057B8" />
              Tiến Độ Khóa Học Lớp {classCode}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: '#64748B' }}>Đã học 8 / 12 buổi</span>
              <span style={{ fontWeight: 700, color: '#0057B8' }}>66.7%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden', marginBottom: '20px' }}>
              <div style={{ width: '66.7%', height: '100%', background: '#0057B8' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>TỶ LỆ CHUYÊN CẦN</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#15803D' }}>95.4%</div>
              </div>
              <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>ĐIỂM TRUNG BÌNH</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#0057B8' }}>8.6 / 10</div>
              </div>
            </div>
          </div>

          {/* Next Schedule Card */}
          <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#0057B8" />
              Buổi Học Kế Tiếp
            </h3>
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
              <div style={{ fontWeight: 700, color: '#1E3A8A', fontSize: '14px' }}>Buổi 9: Xử lý dữ liệu nâng cao với PivotTable & VLOOKUP</div>
              <div style={{ fontSize: '12px', color: '#3B82F6', marginTop: '4px' }}>
                Thứ Bảy, 08:00 - 11:00 • Phòng LAB 01
              </div>
            </div>
            <div style={{ fontSize: '13px', color: '#475569' }}>
              <strong>Tài liệu chuẩn bị:</strong> File thực hành Excel <code>CaseStudy_May2026.xlsx</code> đã được tải lên thư viện học liệu.
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Students List */}
      {activeSubTab === 'students' && (
        <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
              Danh Sách Học Viên ({classStudents.length})
            </h3>
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={searchStudent}
                onChange={e => setSearchStudent(e.target.value)}
                placeholder="Tìm học viên..."
                style={{
                  width: '100%',
                  padding: '6px 12px 6px 30px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  fontSize: '12px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                <th style={{ padding: '10px 16px' }}>Mã HV</th>
                <th style={{ padding: '10px 16px' }}>Họ và Tên</th>
                <th style={{ padding: '10px 16px' }}>Điện thoại / Email</th>
                <th style={{ padding: '10px 16px', textAlign: 'center' }}>Chuyên Cần</th>
                <th style={{ padding: '10px 16px', textAlign: 'center' }}>Điểm TB</th>
              </tr>
            </thead>
            <tbody>
              {classStudents
                .filter(s => (s.name || '').toLowerCase().includes(searchStudent.toLowerCase()) || (s.studentCode || '').toLowerCase().includes(searchStudent.toLowerCase()))
                .map((student, idx) => (
                  <tr key={student.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0057B8' }}>{student.studentCode}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0F172A' }}>{student.name}</td>
                    <td style={{ padding: '12px 16px', color: '#64748B' }}>{student.phone || student.email || '0988***123'}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{ background: '#DCFCE7', color: '#15803D', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                        95%
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#0057B8' }}>
                      8.5
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Fallback for other tabs */}
      {activeSubTab !== 'overview' && activeSubTab !== 'students' && (
        <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '40px', textAlign: 'center', color: '#64748B' }}>
          <CheckCircle2 size={36} color="#0057B8" style={{ margin: '0 auto 12px', display: 'block' }} />
          <h3 style={{ margin: '0 0 8px', color: '#0F172A' }}>Đang đồng bộ dữ liệu {activeSubTab}</h3>
          <p style={{ margin: 0, fontSize: '13px' }}>Phân hệ quản lý chuyên sâu cho lớp học {classCode} đã sẵn sàng kết nối.</p>
        </div>
      )}
    </div>
  );
};

