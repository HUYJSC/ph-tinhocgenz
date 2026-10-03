import React, { useState } from 'react';
import {
  ChevronDown, ChevronUp, User, BookOpen,
  Clock, Shield, Settings,
  Mail, Phone, Calendar, MapPin
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { LearningProgress, CourseProgressItem, DigitalCertificateSummary } from './LearningProgress';
import { TeachingStats, TeachingClassItem } from './TeachingStats';
import { ActivityTimeline, TimelineEventItem } from './ActivityTimeline';
import { SecurityPanel } from './SecurityPanel';

export interface UserPersonalDetails {
  fullName: string;
  email: string;
  phone: string;
  birthDate?: string;
  address?: string;
  createdAt: string;
  departmentOrSchool?: string;
}

export interface ProfileAccordionProps {
  role: 'STUDENT' | 'TEACHER' | 'STAFF' | 'ADMIN' | string;
  personalDetails: UserPersonalDetails;
  isAccountLocked?: boolean;
  studentData?: {
    totalCourses?: number;
    overallProgress?: number;
    totalTests?: number;
    totalCertificates?: number;
    courses?: CourseProgressItem[];
    certificates?: DigitalCertificateSummary[];
  };
  teacherData?: {
    totalSubjects?: number;
    totalStudents?: number;
    averageRating?: number;
    totalHours?: number;
    totalClasses?: number;
    classes?: TeachingClassItem[];
  };
  timelineEvents?: TimelineEventItem[];
  onResetPassword?: () => void;
  onToggleLockAccount?: () => void;
  onUpdateSettings?: (key: string, value: any) => void;
  defaultExpandedSection?: string;
}

export const ProfileAccordion: React.FC<ProfileAccordionProps> = ({
  role,
  personalDetails,
  isAccountLocked = false,
  studentData,
  teacherData,
  timelineEvents,
  onResetPassword,
  onToggleLockAccount,
  defaultExpandedSection
}) => {
  const normalizedRole = role.toUpperCase();

  // Accordion Sections State — Only necessary section open by default (Section 1: personal)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: defaultExpandedSection ? defaultExpandedSection === 'personal' : true,
    learning_teaching: defaultExpandedSection ? defaultExpandedSection === 'learning_teaching' : true,
    activity: defaultExpandedSection ? defaultExpandedSection === 'activity' : false,
    security: defaultExpandedSection ? defaultExpandedSection === 'security' : false,
    settings: defaultExpandedSection ? defaultExpandedSection === 'settings' : false
  });

  // Settings State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [privacyProfile, setPrivacyProfile] = useState<'public' | 'internal'>('internal');

  const toggleSection = (sectionKey: string) => {
    soundFx.playClick();
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const isStudent = normalizedRole === 'STUDENT';
  const isTeacher = normalizedRole === 'TEACHER';
  const isStaff = normalizedRole === 'STAFF' || normalizedRole === 'ACADEMIC' || normalizedRole === 'GIAOVU' || normalizedRole === 'ACADEMIC_STAFF';
  const isAdmin = normalizedRole === 'ADMIN' || normalizedRole === 'SUPER_ADMIN';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {/* ─────────────────────────────────────────────────────────────
          1. 👤 THÔNG TIN CÁ NHÂN (Mặc định mở)
      ────────────────────────────────────────────────────────────── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(11, 37, 69, 0.03)'
      }}>
        <button
          type="button"
          onClick={() => toggleSection('personal')}
          style={{
            width: '100%',
            padding: '16px 20px',
            background: openSections.personal ? '#F8FAFC' : '#FFFFFF',
            border: 'none',
            borderBottom: openSections.personal ? '1px solid #E2E8F0' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#EFF6FF',
              color: '#0057B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0B2545' }}>
                1. 👤 Thông tin cá nhân
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                Họ tên, liên hệ, địa chỉ và ngày khởi tạo tài khoản
              </div>
            </div>
          </div>
          {openSections.personal ? <ChevronUp size={18} color="#64748B" /> : <ChevronDown size={18} color="#64748B" />}
        </button>

        {openSections.personal && (
          <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {/* Họ và tên */}
            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>
                Họ và tên đầy đủ
              </label>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0B2545' }}>
                {personalDetails.fullName || 'Chưa cập nhật'}
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <Mail size={12} />
                <span>Địa chỉ Email</span>
              </label>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0B2545' }}>
                {personalDetails.email || 'Chưa cập nhật'}
              </div>
            </div>

            {/* Số điện thoại */}
            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <Phone size={12} />
                <span>Số điện thoại</span>
              </label>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0B2545' }}>
                {personalDetails.phone || 'Chưa cập nhật'}
              </div>
            </div>

            {/* Ngày sinh */}
            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <Calendar size={12} />
                <span>Ngày sinh / Năm sinh</span>
              </label>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0B2545' }}>
                {personalDetails.birthDate || 'Chưa cập nhật'}
              </div>
            </div>

            {/* Địa chỉ */}
            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <MapPin size={12} />
                <span>Địa chỉ liên hệ</span>
              </label>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0B2545' }}>
                {personalDetails.address || 'Hà Nội / TP. Hồ Chí Minh (Toàn quốc)'}
              </div>
            </div>

            {/* Ngày tạo tài khoản */}
            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <Clock size={12} />
                <span>Ngày tạo tài khoản</span>
              </label>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0B2545' }}>
                {personalDetails.createdAt || '01/09/2026'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. 📚 HỌC TẬP / GIẢNG DẠY (Thích ứng theo vai trò)
      ────────────────────────────────────────────────────────────── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(11, 37, 69, 0.03)'
      }}>
        <button
          type="button"
          onClick={() => toggleSection('learning_teaching')}
          style={{
            width: '100%',
            padding: '16px 20px',
            background: openSections.learning_teaching ? '#F8FAFC' : '#FFFFFF',
            border: 'none',
            borderBottom: openSections.learning_teaching ? '1px solid #E2E8F0' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#EFF6FF',
              color: '#0057B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0B2545' }}>
                {isStudent && '2. 📚 Quá trình học tập & thành tích'}
                {isTeacher && '2. 📚 Hồ sơ giảng dạy & lớp phụ trách'}
                {isStaff && '2. 📚 Quản vụ lớp học & điều phối'}
                {isAdmin && '2. 📚 Quản trị phân hệ đào tạo'}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                {isStudent && 'Khóa học, tiến độ %, điểm trung bình và chứng chỉ'}
                {isTeacher && 'Môn phụ trách, sĩ số học viên và thời khóa biểu'}
                {isStaff && 'Danh mục lớp điều phối và giám sát chuyên cần'}
                {isAdmin && 'Tổng quan quy mô và chỉ số toàn viện đào tạo'}
              </div>
            </div>
          </div>
          {openSections.learning_teaching ? <ChevronUp size={18} color="#64748B" /> : <ChevronDown size={18} color="#64748B" />}
        </button>

        {openSections.learning_teaching && (
          <div style={{ padding: '20px' }}>
            {isStudent && (
              <LearningProgress
                totalCourses={studentData?.totalCourses}
                overallProgress={studentData?.overallProgress}
                totalTests={studentData?.totalTests}
                totalCertificates={studentData?.totalCertificates}
                courses={studentData?.courses}
                certificates={studentData?.certificates}
              />
            )}

            {isTeacher && (
              <TeachingStats
                totalSubjects={teacherData?.totalSubjects}
                totalStudents={teacherData?.totalStudents}
                averageRating={teacherData?.averageRating}
                totalHours={teacherData?.totalHours}
                totalClasses={teacherData?.totalClasses}
                classes={teacherData?.classes}
              />
            )}

            {(isStaff || isAdmin) && (
              <TeachingStats
                totalSubjects={teacherData?.totalSubjects ?? 12}
                totalStudents={teacherData?.totalStudents ?? 420}
                averageRating={teacherData?.averageRating ?? 4.9}
                totalHours={teacherData?.totalHours ?? 240}
                totalClasses={teacherData?.totalClasses ?? 16}
                classes={teacherData?.classes}
              />
            )}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. 🕒 HOẠT ĐỘNG GẦN ĐÂY (Ngôn ngữ tự nhiên, không mã code)
      ────────────────────────────────────────────────────────────── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(11, 37, 69, 0.03)'
      }}>
        <button
          type="button"
          onClick={() => toggleSection('activity')}
          style={{
            width: '100%',
            padding: '16px 20px',
            background: openSections.activity ? '#F8FAFC' : '#FFFFFF',
            border: 'none',
            borderBottom: openSections.activity ? '1px solid #E2E8F0' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#EFF6FF',
              color: '#0057B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0B2545' }}>
                3. 🕒 Hoạt động gần đây
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                Nhật ký đăng nhập, hoàn thành bài tập, điểm danh và cập nhật hồ sơ
              </div>
            </div>
          </div>
          {openSections.activity ? <ChevronUp size={18} color="#64748B" /> : <ChevronDown size={18} color="#64748B" />}
        </button>

        {openSections.activity && (
          <div style={{ padding: '20px' }}>
            <ActivityTimeline events={timelineEvents} />
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. 🔐 BẢO MẬT & QUYỀN TRUY CẬP (Trust Layer & RBAC)
      ────────────────────────────────────────────────────────────── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(11, 37, 69, 0.03)'
      }}>
        <button
          type="button"
          onClick={() => toggleSection('security')}
          style={{
            width: '100%',
            padding: '16px 20px',
            background: openSections.security ? '#F8FAFC' : '#FFFFFF',
            border: 'none',
            borderBottom: openSections.security ? '1px solid #E2E8F0' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#EFF6FF',
              color: '#0057B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0B2545' }}>
                4. 🔐 Bảo mật & quyền truy cập
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                Trạng thái xác thực tài khoản, quyền hạn RBAC và chứng thực toàn vẹn
              </div>
            </div>
          </div>
          {openSections.security ? <ChevronUp size={18} color="#64748B" /> : <ChevronDown size={18} color="#64748B" />}
        </button>

        {openSections.security && (
          <div style={{ padding: '20px' }}>
            <SecurityPanel
              email={personalDetails.email}
              phone={personalDetails.phone}
              role={role}
            />
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. ⚙ CÀI ĐẶT TÀI KHOẢN (Đổi MK, Khóa TK, Thông báo, Riêng tư)
      ────────────────────────────────────────────────────────────── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(11, 37, 69, 0.03)'
      }}>
        <button
          type="button"
          onClick={() => toggleSection('settings')}
          style={{
            width: '100%',
            padding: '16px 20px',
            background: openSections.settings ? '#F8FAFC' : '#FFFFFF',
            border: 'none',
            borderBottom: openSections.settings ? '1px solid #E2E8F0' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#EFF6FF',
              color: '#0057B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Settings size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0B2545' }}>
                5. ⚙ Thiết lập tài khoản
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                Đổi mật khẩu, khóa/mở tài khoản, thông báo và riêng tư hồ sơ
              </div>
            </div>
          </div>
          {openSections.settings ? <ChevronUp size={18} color="#64748B" /> : <ChevronDown size={18} color="#64748B" />}
        </button>

        {openSections.settings && (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Password & Lock Actions */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '12px'
            }}>
              {/* Reset Password Button */}
              <div style={{
                padding: '14px 16px',
                borderRadius: '10px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0B2545' }}>
                    Đổi mật khẩu tài khoản
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                    Yêu cầu đăng xuất mọi thiết bị khác sau khi đổi
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onResetPassword}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: '#0057B8',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cấp lại mật khẩu mới
                </button>
              </div>

              {/* Lock / Unlock Account */}
              <div style={{
                padding: '14px 16px',
                borderRadius: '10px',
                background: isAccountLocked ? '#FEF2F2' : '#F8FAFC',
                border: `1px solid ${isAccountLocked ? '#FECACA' : '#E2E8F0'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: isAccountLocked ? '#991B1B' : '#0B2545' }}>
                    {isAccountLocked ? 'Tài khoản đang bị tạm khóa' : 'Khóa tài khoản truy cập'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                    {isAccountLocked ? 'Người dùng không thể đăng nhập cho đến khi được mở khóa' : 'Tạm thời đình chỉ quyền truy cập vào LMS'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onToggleLockAccount}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: isAccountLocked ? '#16A34A' : '#DC2626',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {isAccountLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản ngay'}
                </button>
              </div>
            </div>

            {/* Notification & Privacy Toggles */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
              paddingTop: '8px'
            }}>
              <label style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0B2545' }}>Nhận thông báo qua Email</span>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#0057B8' }}
                />
              </label>

              <label style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0B2545' }}>Nhắc nhở qua SMS / Zalo</span>
                <input
                  type="checkbox"
                  checked={smsNotifications}
                  onChange={(e) => setSmsNotifications(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#0057B8' }}
                />
              </label>

              <label style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0B2545' }}>Bảo mật 2 lớp (OTP)</span>
                <input
                  type="checkbox"
                  checked={twoFactorAuth}
                  onChange={(e) => setTwoFactorAuth(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#0057B8' }}
                />
              </label>

              {/* Privacy Setting */}
              <div style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0B2545' }}>Quyền riêng tư hồ sơ</span>
                <select
                  value={privacyProfile}
                  onChange={(e) => setPrivacyProfile(e.target.value as 'public' | 'internal')}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.78rem',
                    color: '#0B2545',
                    background: '#FFFFFF',
                    fontWeight: 600
                  }}
                >
                  <option value="internal">Chỉ nội bộ trường</option>
                  <option value="public">Công khai công nhận</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
