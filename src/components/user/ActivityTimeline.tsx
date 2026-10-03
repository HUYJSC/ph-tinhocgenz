import React from 'react';
import {
  CheckCircle2, Clock, Smartphone,
  Key, Award, QrCode, FileText
} from 'lucide-react';

export interface TimelineEventItem {
  id: string;
  actionTitle: string; // e.g. "Đăng nhập hệ thống"
  timestamp: string; // e.g. "Hôm nay, 14:32"
  description?: string; // e.g. "Thiết bị: Windows 11 Chrome (IP: 118.69.182.42)"
  category: 'login' | 'profile' | 'test' | 'password' | 'attendance' | 'certificate' | 'other';
}

export interface ActivityTimelineProps {
  events?: TimelineEventItem[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  events = [
    {
      id: 'e1',
      actionTitle: 'Đăng nhập hệ thống thành công',
      timestamp: 'Hôm nay • 14:32',
      description: 'Thiết bị: Windows 11 Chrome (IP: 118.69.182.42)',
      category: 'login'
    },
    {
      id: 'e2',
      actionTitle: 'Hoàn thành bài kiểm tra trực tuyến',
      timestamp: '01/10/2026 • 20:15',
      description: 'Bài thi: Word & Excel 3in1 Fast-Track • Điểm: 9.5/10',
      category: 'test'
    },
    {
      id: 'e3',
      actionTitle: 'Điểm danh lớp học thành công',
      timestamp: '28/09/2026 • 18:30',
      description: 'Lớp: K26-WE01 (Phòng LAB 01 - Mã QR hợp lệ)',
      category: 'attendance'
    },
    {
      id: 'e4',
      actionTitle: 'Cập nhật thông tin hồ sơ học tập',
      timestamp: '20/09/2026 • 10:15',
      description: 'Cập nhật số điện thoại liên hệ và ảnh hồ sơ',
      category: 'profile'
    },
    {
      id: 'e5',
      actionTitle: 'Thay đổi mật khẩu tài khoản an toàn',
      timestamp: '15/09/2026 • 09:40',
      description: 'Xác thực OTP qua email và tạo phiên đăng nhập mới',
      category: 'password'
    },
    {
      id: 'e6',
      actionTitle: 'Được cấp chứng chỉ số chuỗi khối',
      timestamp: '15/09/2026 • 09:00',
      description: 'Chứng chỉ Tin học văn phòng MOS (Đã neo băm SHA-256)',
      category: 'certificate'
    }
  ]
}) => {
  const getEventIcon = (category: string) => {
    switch (category) {
      case 'login':
        return <Smartphone size={13} color="#0057B8" />;
      case 'test':
        return <FileText size={13} color="#16A34A" />;
      case 'attendance':
        return <QrCode size={13} color="#0284C7" />;
      case 'password':
        return <Key size={13} color="#D97706" />;
      case 'certificate':
        return <Award size={13} color="#0057B8" />;
      default:
        return <CheckCircle2 size={13} color="#0057B8" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '4px'
      }}>
        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0B2545' }}>
          Nhật ký hoạt động bảo mật (Không mã code kỹ thuật)
        </span>
        <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
          Được lưu trữ bất biến
        </span>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        borderLeft: '2px solid #E2E8F0',
        marginLeft: '10px',
        paddingLeft: '18px'
      }}>
        {events.map((evt) => (
          <div key={evt.id} style={{ position: 'relative' }}>
            {/* Timeline Circle Bullet */}
            <div style={{
              position: 'absolute',
              left: '-28px',
              top: '1px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#FFFFFF',
              border: '1.5px solid #0057B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0, 87, 184, 0.15)'
            }}>
              {getEventIcon(evt.category)}
            </div>

            {/* Event Timestamp */}
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <Clock size={11} />
              <span>{evt.timestamp}</span>
            </div>

            {/* Action Title (Friendly language) */}
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0B2545', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#16A34A', fontWeight: 900 }}>✓</span>
              <span>{evt.actionTitle}</span>
            </div>

            {/* Description */}
            {evt.description && (
              <div style={{ fontSize: '0.76rem', color: '#475569', marginTop: '2px', lineHeight: 1.4 }}>
                {evt.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
