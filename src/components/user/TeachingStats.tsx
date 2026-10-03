import React from 'react';
import {
  BookOpen, Users, Star, Clock,
  Calendar, Layers, CheckCircle2
} from 'lucide-react';

export interface TeachingClassItem {
  id: string;
  classCode: string; // e.g. "K26-WE01"
  subjectName: string;
  studentCount: number;
  scheduleTime: string; // e.g. "Tối 2 - 4 - 6 (19:30 - 21:00)"
  room: string;
  attendanceRate: number; // e.g. 98
}

export interface TeachingStatsProps {
  totalSubjects?: number; // e.g. 10
  totalStudents?: number; // e.g. 352
  averageRating?: number; // e.g. 4.9
  totalHours?: number; // e.g. 128
  totalClasses?: number; // e.g. 12
  classes?: TeachingClassItem[];
}

export const TeachingStats: React.FC<TeachingStatsProps> = ({
  totalSubjects = 10,
  totalStudents = 352,
  averageRating = 4.9,
  totalHours = 128,
  totalClasses = 12,
  classes = [
    {
      id: 'tc-1',
      classCode: 'K26-WE01',
      subjectName: 'Word, Excel, PowerPoint (3 Buổi 1 Môn)',
      studentCount: 28,
      scheduleTime: 'Tối 2 - 4 - 6 (19:30 - 21:00)',
      room: 'Phòng LAB 01 (Tầng 2)',
      attendanceRate: 98
    },
    {
      id: 'tc-2',
      classCode: 'K26-CB02',
      subjectName: 'Chứng Chỉ CNTT Cơ Bản Chuẩn Bộ TT&TT (6 Buổi)',
      studentCount: 25,
      scheduleTime: 'Tối 3 - 5 - 7 (18:00 - 19:30)',
      room: 'Phòng LAB 02 (Tầng 3)',
      attendanceRate: 96
    },
    {
      id: 'tc-3',
      classCode: 'K26-AI01',
      subjectName: 'Ứng Dụng AI Vào Công Việc Văn Phòng (5 Buổi)',
      studentCount: 30,
      scheduleTime: 'Thứ 7 & Chủ Nhật (09:00 - 11:00)',
      room: 'Phòng Trực Tuyến Toàn Khóa',
      attendanceRate: 100
    }
  ]
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── 1. TEACHING ANALYTICS METRIC CARDS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '12px'
      }}>
        {/* Metric 1: Môn phụ trách */}
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
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Môn học</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0B2545' }}>
            {totalSubjects}
          </div>
          <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Chuyên đề giảng dạy</span>
        </div>

        {/* Metric 2: Học viên */}
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
            <Users size={16} />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Học viên</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0057B8' }}>
            {totalStudents}
          </div>
          <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Tổng số học viên</span>
        </div>

        {/* Metric 3: Đánh giá */}
        <div style={{
          padding: '14px 16px',
          borderRadius: '12px',
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#D97706' }}>
            <Star size={16} fill="#D97706" />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Đánh giá</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0B2545' }}>
            {averageRating} <span style={{ fontSize: '0.88rem', color: '#64748B', fontWeight: 600 }}>/ 5</span>
          </div>
          <span style={{ fontSize: '0.74rem', color: '#16A34A', fontWeight: 700 }}>Rất xuất sắc</span>
        </div>

        {/* Metric 4: Giờ giảng */}
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
            <Clock size={16} />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Giờ giảng</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0B2545' }}>
            {totalHours}h
          </div>
          <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Trong học kỳ này</span>
        </div>
      </div>

      {/* ── 2. CLASSROOMS & TEACHING SCHEDULE ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{
            fontSize: '0.88rem',
            fontWeight: 800,
            color: '#0B2545',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Layers size={16} color="#0057B8" />
            <span>Lớp học phụ trách ({totalClasses} lớp)</span>
          </h4>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {classes.map((cls) => (
            <div
              key={cls.id}
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: '#EFF6FF',
                      color: '#0057B8',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      border: '1px solid #BFDBFE'
                    }}>
                      {cls.classCode}
                    </span>
                    <strong style={{ fontSize: '0.88rem', color: '#0B2545' }}>{cls.subjectName}</strong>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <Calendar size={13} color="#0057B8" />
                    <span>{cls.scheduleTime}</span>
                    <span>•</span>
                    <span>{cls.room}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0B2545' }}>
                    {cls.studentCount} học viên
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end', marginTop: '2px' }}>
                    <CheckCircle2 size={11} />
                    <span>Chuyên cần {cls.attendanceRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
