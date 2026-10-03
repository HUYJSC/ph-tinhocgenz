import React from 'react';
import {
  BookOpen, TrendingUp, FileText, Award,
  Users, Star, Clock, CheckCircle2,
  Shield, Activity, Layers, HelpCircle
} from 'lucide-react';

export interface UserStatsProps {
  role: 'STUDENT' | 'TEACHER' | 'STAFF' | 'ADMIN' | string;
  data?: {
    // Student
    totalCourses?: number;
    overallProgress?: number;
    totalTests?: number;
    totalCertificates?: number;
    // Teacher
    totalSubjects?: number;
    totalStudents?: number;
    averageRating?: number;
    totalHours?: number;
    // Staff
    totalManagedClasses?: number;
    attendanceRate?: number;
    supportTickets?: number;
    exportedReports?: number;
    // Admin
    totalAccounts?: number;
    activeAccounts?: number;
    rbacRolesCount?: number;
    auditRecordsCount?: number;
  };
}

export const UserStats: React.FC<UserStatsProps> = ({
  role,
  data = {}
}) => {
  const normalizedRole = role.toUpperCase();

  const getMetricCards = () => {
    switch (normalizedRole) {
      case 'STUDENT':
        return [
          {
            label: 'Khóa học đang học',
            value: data.totalCourses ?? 5,
            icon: <BookOpen size={18} color="#0057B8" />,
            badge: 'Đang theo học'
          },
          {
            label: 'Tiến độ trung bình',
            value: `${data.overallProgress ?? 72}%`,
            icon: <TrendingUp size={18} color="#0057B8" />,
            badge: 'Hoàn thành'
          },
          {
            label: 'Bài kiểm tra',
            value: data.totalTests ?? 15,
            icon: <FileText size={18} color="#0057B8" />,
            badge: 'Đã hoàn thành'
          },
          {
            label: 'Chứng chỉ số',
            value: data.totalCertificates ?? 2,
            icon: <Award size={18} color="#0057B8" />,
            badge: 'Đã xác thực'
          }
        ];

      case 'TEACHER':
        return [
          {
            label: 'Môn phụ trách',
            value: data.totalSubjects ?? 10,
            icon: <BookOpen size={18} color="#0057B8" />,
            badge: 'Chuyên đề'
          },
          {
            label: 'Tổng học viên',
            value: data.totalStudents ?? 352,
            icon: <Users size={18} color="#0057B8" />,
            badge: 'Học viên'
          },
          {
            label: 'Đánh giá trung bình',
            value: `${data.averageRating ?? 4.9} / 5`,
            icon: <Star size={18} color="#0057B8" />,
            badge: 'Xuất sắc'
          },
          {
            label: 'Tổng giờ giảng',
            value: `${data.totalHours ?? 128}h`,
            icon: <Clock size={18} color="#0057B8" />,
            badge: 'Giảng dạy'
          }
        ];

      case 'STAFF':
      case 'ACADEMIC':
      case 'GIAOVU':
      case 'ACADEMIC_STAFF':
        return [
          {
            label: 'Lớp điều phối',
            value: data.totalManagedClasses ?? 18,
            icon: <Layers size={18} color="#0057B8" />,
            badge: 'Đang hoạt động'
          },
          {
            label: 'Tỷ lệ chuyên cần',
            value: `${data.attendanceRate ?? 96}%`,
            icon: <CheckCircle2 size={18} color="#0057B8" />,
            badge: 'Toàn khóa'
          },
          {
            label: 'Yêu cầu học vụ',
            value: data.supportTickets ?? 42,
            icon: <HelpCircle size={18} color="#0057B8" />,
            badge: 'Đã xử lý'
          },
          {
            label: 'Báo cáo đã xuất',
            value: data.exportedReports ?? 8,
            icon: <FileText size={18} color="#0057B8" />,
            badge: 'Định kỳ'
          }
        ];

      case 'ADMIN':
      case 'SUPER_ADMIN':
      default:
        return [
          {
            label: 'Tổng tài khoản',
            value: data.totalAccounts ?? 1420,
            icon: <Users size={18} color="#0057B8" />,
            badge: 'Toàn hệ thống'
          },
          {
            label: 'Đang hoạt động',
            value: data.activeAccounts ?? 1385,
            icon: <CheckCircle2 size={18} color="#0057B8" />,
            badge: '97.5% Active'
          },
          {
            label: 'Nhóm quyền RBAC',
            value: data.rbacRolesCount ?? 12,
            icon: <Shield size={18} color="#0057B8" />,
            badge: 'Bảo mật cao'
          },
          {
            label: 'Nhật ký Audit Log',
            value: data.auditRecordsCount ?? 4890,
            icon: <Activity size={18} color="#0057B8" />,
            badge: 'Đã băm SHA-256'
          }
        ];
    }
  };

  const cards = getMetricCards();

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '12px',
      width: '100%'
    }}>
      {cards.map((card, idx) => (
        <div
          key={idx}
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(11, 37, 69, 0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
              {card.label}
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#F4F8FD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {card.icon}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '4px' }}>
            <div style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#0B2545',
              letterSpacing: '-0.02em'
            }}>
              {card.value}
            </div>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#0057B8',
              background: '#EFF6FF',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {card.badge}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
