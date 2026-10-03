import React, { useState } from 'react';
import {
  ShieldCheck, CheckCircle2, Key,
  Mail, Phone, Shield, Copy, Check
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export interface SecurityPanelProps {
  email?: string;
  phone?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isAccountSafe?: boolean;
  role: 'student' | 'teacher' | 'academic' | 'admin' | string;
  didString?: string;
  profileHash?: string;
}

export const SecurityPanel: React.FC<SecurityPanelProps> = ({
  email = 'hocvien@tinhocgenz.edu.vn',
  phone = '0988 123 456',
  isEmailVerified = true,
  isPhoneVerified = true,
  isAccountSafe = true,
  role = 'student',
  didString = 'did:ph:edu:HV001-K26-VERIFIED',
  profileHash = '0x8f2a6d7c1e9b4a3f5c8d2e1b9a7c4f6e3d2a1b9c'
}) => {
  const [copiedDid, setCopiedDid] = useState(false);

  const getRolePermissions = () => {
    switch (role) {
      case 'student':
        return [
          'Xem khóa học và tài liệu học tập',
          'Làm bài kiểm tra & nộp bài tập thực hành',
          'Quét mã QR điểm danh lớp học',
          'Xem lịch sử học tập & chứng chỉ số'
        ];
      case 'teacher':
        return [
          'Quản lý danh sách lớp học phụ trách',
          'Tạo mã QR và chủ trì điểm danh',
          'Chấm điểm và phản hồi bài tập thực hành',
          'Cập nhật tiến độ học tập của học viên'
        ];
      case 'academic':
      case 'giaovu':
        return [
          'Điều phối thời khóa biểu và phòng học',
          'Giám sát & dự giờ các lớp học trực tuyến',
          'Chăm sóc học viên và hỗ trợ học vụ',
          'Xuất báo cáo chuyên cần và điểm danh'
        ];
      case 'admin':
      case 'super_admin':
        return [
          'Toàn quyền quản trị tài khoản & người dùng',
          'Phân quyền bảo mật hệ thống RBAC',
          'Cấu hình tích hợp và chứng chỉ số chuỗi khối',
          'Quản lý hệ thống sao lưu và giám sát an ninh'
        ];
      default:
        return ['Truy cập tài nguyên học tập cơ bản'];
    }
  };

  const permissions = getRolePermissions();

  const handleCopyDid = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(didString);
    setCopiedDid(true);
    setTimeout(() => setCopiedDid(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── 1. ACCOUNT VERIFICATION STATUS (Checkmarks) ── */}
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
          <ShieldCheck size={16} color="#0057B8" />
          <span>Trạng thái xác thực danh tính</span>
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '10px'
        }}>
          {/* Email Verification */}
          <div style={{
            padding: '12px 14px',
            borderRadius: '10px',
            background: isEmailVerified ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${isEmailVerified ? '#BBF7D0' : '#FECACA'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={15} color={isEmailVerified ? '#166534' : '#991B1B'} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0B2545' }}>
                  Email xác thực
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  {email}
                </div>
              </div>
            </div>
            <span style={{ color: isEmailVerified ? '#16A34A' : '#DC2626', fontWeight: 800, fontSize: '0.82rem' }}>
              {isEmailVerified ? '✓ Đã xác thực' : 'Chưa'}
            </span>
          </div>

          {/* Phone Verification */}
          <div style={{
            padding: '12px 14px',
            borderRadius: '10px',
            background: isPhoneVerified ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${isPhoneVerified ? '#BBF7D0' : '#FECACA'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={15} color={isPhoneVerified ? '#166534' : '#991B1B'} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0B2545' }}>
                  Số điện thoại xác thực
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  {phone}
                </div>
              </div>
            </div>
            <span style={{ color: isPhoneVerified ? '#16A34A' : '#DC2626', fontWeight: 800, fontSize: '0.82rem' }}>
              {isPhoneVerified ? '✓ Đã xác thực' : 'Chưa'}
            </span>
          </div>

          {/* Account Safety */}
          <div style={{
            padding: '12px 14px',
            borderRadius: '10px',
            background: isAccountSafe ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${isAccountSafe ? '#BBF7D0' : '#FECACA'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={15} color={isAccountSafe ? '#166534' : '#991B1B'} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0B2545' }}>
                  Tài khoản an toàn
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Không phát hiện rủi ro
                </div>
              </div>
            </div>
            <span style={{ color: isAccountSafe ? '#16A34A' : '#DC2626', fontWeight: 800, fontSize: '0.82rem' }}>
              {isAccountSafe ? '✓ Đạt chuẩn' : 'Cảnh báo'}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. TRUST / BLOCKCHAIN VERIFICATION LAYER (User-Friendly) ── */}
      <div style={{
        padding: '16px',
        borderRadius: '12px',
        background: '#F8FAFC',
        border: '1.5px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: '#0057B8',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 800
            }}>
              ✓
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0B2545' }}>
                Bảo chứng danh tính số & học tập
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                Hệ thống xác thực chuỗi khối chạy ngầm
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyDid}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '6px',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#0057B8',
              cursor: 'pointer'
            }}
          >
            {copiedDid ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
            <span>{copiedDid ? 'Đã sao chép mã W3C DID' : 'Sao chép mã W3C DID'}</span>
          </button>
        </div>

        {/* 3 Core Trust Badges */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#0B2545', fontWeight: 700 }}>
            <span style={{ color: '#16A34A' }}>✓</span>
            <span>Hồ sơ đã xác thực</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#0B2545', fontWeight: 700 }}>
            <span style={{ color: '#16A34A' }}>✓</span>
            <span>Lịch sử học tập an toàn</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#0B2545', fontWeight: 700 }}>
            <span style={{ color: '#16A34A' }}>✓</span>
            <span>Chứng chỉ có thể kiểm tra</span>
          </div>
        </div>

        {/* Cryptographic hash snippet */}
        <div style={{
          fontSize: '0.72rem',
          color: '#64748B',
          background: '#FFFFFF',
          padding: '6px 10px',
          borderRadius: '6px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Mã băm toàn vẹn (SHA-256): <code style={{ color: '#0057B8', fontFamily: 'monospace' }}>{profileHash.slice(0, 18)}...{profileHash.slice(-8)}</code></span>
          <span style={{ color: '#16A34A', fontWeight: 700 }}>Hợp lệ ✓</span>
        </div>
      </div>

      {/* ── 3. ROLE-BASED ACCESS PERMISSIONS LIST ── */}
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
          <Key size={16} color="#0057B8" />
          <span>Phân quyền chức năng theo vai trò</span>
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {permissions.map((perm, idx) => (
            <div
              key={idx}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                fontSize: '0.8rem',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle2 size={14} color="#0057B8" />
              <span>{perm}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
