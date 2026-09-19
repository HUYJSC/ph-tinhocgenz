/**
 * GiaoVuDashboard — Giao diện Giáo Vụ & Quản trị đào tạo
 * Đặc tả theo Ảnh 05: TINHOCGENZ LMS AI + Blockchain
 * 
 * Chức năng:
 * - 5 Thẻ KPI: Lớp mở, Học viên active, Lịch hôm nay, Đơn chờ duyệt, Doanh thu tháng
 * - Lịch học hôm nay (Phòng, Giảng viên, Sĩ số, Trạng thái)
 * - Đơn đăng ký chờ duyệt (Duyệt/Từ chối học viên)
 * - Tình trạng học phí (Tỷ lệ hoàn thành, Chờ thanh toán, Quá hạn)
 * - Yêu cầu hỗ trợ (Tickets: Không vào được lớp, Cần cấp chứng chỉ, v.v.)
 * - Phòng học & thiết bị (Trạng thái phòng sẵn sàng, bảo trì, sự cố)
 * - Trợ lý AI Giáo vụ (Tra cứu nhanh sĩ số, lịch thi, mẫu báo cáo)
 */
import React, { useState } from 'react';
import {
  BookOpen, Users, Calendar, CheckCircle2, Clock, AlertTriangle,
  DollarSign, Check, X, FileText, ArrowUpRight,
  Sparkles, Send, HelpCircle
} from 'lucide-react';
import { UserProfile } from '../../types/auth';
import { soundFx } from '../../utils/audio';

interface GiaoVuDashboardProps {
  currentUser: UserProfile;
  onOpenScheduleCalendar?: () => void;
  onOpenAttendance?: () => void;
  onOpenAI?: () => void;
}

interface RegistrationOrder {
  id: string;
  studentName: string;
  courseTitle: string;
  registrationDate: string;
  status: 'pending' | 'approved' | 'rejected';
  amountVnd: number;
}

interface SupportTicket {
  id: string;
  ticketCode: string;
  title: string;
  timeAgo: string;
  status: 'new' | 'processing' | 'resolved';
  priority: 'low' | 'medium' | 'high';
}

export const GiaoVuDashboard: React.FC<GiaoVuDashboardProps> = ({
  currentUser,
  onOpenScheduleCalendar,
  onOpenAttendance: _onOpenAttendance,
  onOpenAI: _onOpenAI
}) => {
  const [registrations, setRegistrations] = useState<RegistrationOrder[]>([
    { id: 'reg-1', studentName: 'Nguyễn Hoàng Nam', courseTitle: 'Lập trình Python cơ bản', registrationDate: '14/05/2026', status: 'pending', amountVnd: 1500000 },
    { id: 'reg-2', studentName: 'Trần Thị Bảo Ngọc', courseTitle: 'Thiết kế Web với React', registrationDate: '14/05/2026', status: 'pending', amountVnd: 2500000 },
    { id: 'reg-3', studentName: 'Lê Minh Khoa', courseTitle: 'Cơ sở dữ liệu MySQL & SQL', registrationDate: '13/05/2026', status: 'pending', amountVnd: 1200000 },
    { id: 'reg-4', studentName: 'Phạm Ngọc Anh', courseTitle: 'Lập trình Java Nâng Cao', registrationDate: '13/05/2026', status: 'pending', amountVnd: 2800000 },
    { id: 'reg-5', studentName: 'Vũ Quang Huy', courseTitle: 'AI Fundamentals & Copilot', registrationDate: '13/05/2026', status: 'pending', amountVnd: 2000000 }
  ]);

  const [tickets] = useState<SupportTicket[]>([
    { id: 'sup-1', ticketCode: '#SUP-001', title: 'Không vào được lớp online sáng nay', timeAgo: '10 phút trước', status: 'new', priority: 'high' },
    { id: 'sup-2', ticketCode: '#SUP-002', title: 'Cần xác thực và cấp lại chứng chỉ MOS Excel', timeAgo: '2 giờ trước', status: 'processing', priority: 'medium' },
    { id: 'sup-3', ticketCode: '#SUP-003', title: 'Lỗi xác nhận thanh toán học phí qua VNPay', timeAgo: 'Hôm qua', status: 'new', priority: 'high' }
  ]);

  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleApproveRegistration = (id: string) => {
    soundFx.playCorrect();
    setRegistrations(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'approved' } : r)
    );
  };

  const handleRejectRegistration = (id: string) => {
    soundFx.playClick();
    setRegistrations(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r)
    );
  };

  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    soundFx.playClick();
    setTimeout(() => {
      setAiResponse(`Trợ lý Giáo vụ AI: Đã ghi nhận yêu cầu "${aiQuery}". Hiện tại toàn hệ thống có 24 lớp đang vận hành, 18 buổi học theo lịch hôm nay không phát hiện xung đột phòng hay giảng viên. Tỷ lệ chuyên cần đạt 94.2%.`);
      setIsAiLoading(false);
    }, 600);
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Top Header info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0B2545', margin: '0 0 4px 0' }}>
              Tổng quan giáo vụ & Điều độ đào tạo
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
              Hôm nay là Thứ Ba, 14 tháng 5, 2026. Chúc bạn làm việc hiệu quả!
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', background: '#EFF6FF', color: '#0057B8', border: '1px solid #BFDBFE', padding: '6px 14px', borderRadius: '8px', fontWeight: 600 }}>
              Vai trò: Giáo vụ học đường ({currentUser.name})
            </span>
          </div>
        </div>

        {/* ROW 1: 5 THẺ THỐNG KÊ GIÁO VỤ (Theo Đặc tả Ảnh 05) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
          {/* Card 1: Lớp học đang mở */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '18px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Lớp học đang mở</span>
              <span style={{ background: '#EFF6FF', color: '#0057B8', padding: '6px', borderRadius: '8px' }}><BookOpen size={18} /></span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0B2545' }}>24</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>
              <ArrowUpRight size={14} /> +2 so với tuần trước
            </div>
          </div>

          {/* Card 2: Học viên đang học */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '18px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Học viên đang học</span>
              <span style={{ background: '#ECFDF5', color: '#16A34A', padding: '6px', borderRadius: '8px' }}><Users size={18} /></span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0B2545' }}>1.250</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>
              <ArrowUpRight size={14} /> +12% so với tháng trước
            </div>
          </div>

          {/* Card 3: Lịch hôm nay */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '18px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Lịch hôm nay</span>
              <span style={{ background: '#EFF6FF', color: '#0057B8', padding: '6px', borderRadius: '8px' }}><Calendar size={18} /></span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0B2545' }}>18</div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>
              8 lớp học · 10 giảng viên
            </div>
          </div>

          {/* Card 4: Đơn đăng ký chờ duyệt */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '18px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Đơn đăng ký chờ duyệt</span>
              <span style={{ background: '#FFFBEB', color: '#D97706', padding: '6px', borderRadius: '8px' }}><FileText size={18} /></span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#D97706' }}>32</div>
            <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>
              +5 mới hôm nay
            </div>
          </div>

          {/* Card 5: Doanh thu tháng này */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '18px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Doanh thu tháng này</span>
              <span style={{ background: '#ECFDF5', color: '#16A34A', padding: '6px', borderRadius: '8px' }}><DollarSign size={18} /></span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0057B8' }}>320 Triệu</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>
              <ArrowUpRight size={14} /> +18% so với tháng trước
            </div>
          </div>
        </div>

        {/* ROW 2: BẢNG LỊCH HỌC HÔM NAY & ĐƠN ĐĂNG KÝ CHỜ DUYỆT */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
          {/* Lịch học hôm nay */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0B2545', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="#0057B8" /> Lịch học hôm nay
              </h2>
              {onOpenScheduleCalendar && (
                <button onClick={onOpenScheduleCalendar} style={{ background: 'none', border: 'none', color: '#0057B8', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                  Xem tất cả →
                </button>
              )}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                    <th style={{ padding: '8px 4px' }}>Giờ</th>
                    <th style={{ padding: '8px 4px' }}>Lớp học</th>
                    <th style={{ padding: '8px 4px' }}>Giảng viên</th>
                    <th style={{ padding: '8px 4px' }}>Phòng</th>
                    <th style={{ padding: '8px 4px' }}>Sĩ số</th>
                    <th style={{ padding: '8px 4px' }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px 4px', fontWeight: 600 }}>08:00 - 10:00</td>
                    <td style={{ padding: '10px 4px', color: '#0057B8', fontWeight: 600 }}>Lập trình Python - Lớp PY01</td>
                    <td style={{ padding: '10px 4px' }}>Nguyễn Văn An</td>
                    <td style={{ padding: '10px 4px' }}><span style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>P.101</span></td>
                    <td style={{ padding: '10px 4px' }}>24</td>
                    <td style={{ padding: '10px 4px' }}><span style={{ color: '#16A34A', background: '#ECFDF5', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>● Đang học</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px 4px', fontWeight: 600 }}>10:30 - 12:00</td>
                    <td style={{ padding: '10px 4px', color: '#0057B8', fontWeight: 600 }}>Thiết kế Web - Lớp WEB02</td>
                    <td style={{ padding: '10px 4px' }}>Trần Thị Mai</td>
                    <td style={{ padding: '10px 4px' }}><span style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>P.202</span></td>
                    <td style={{ padding: '10px 4px' }}>18</td>
                    <td style={{ padding: '10px 4px' }}><span style={{ color: '#0057B8', background: '#EFF6FF', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>Sắp diễn ra</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px 4px', fontWeight: 600 }}>13:30 - 15:00</td>
                    <td style={{ padding: '10px 4px', color: '#0057B8', fontWeight: 600 }}>Cơ sở dữ liệu MySQL</td>
                    <td style={{ padding: '10px 4px' }}>Lê Minh Quân</td>
                    <td style={{ padding: '10px 4px' }}><span style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>P.301</span></td>
                    <td style={{ padding: '10px 4px' }}>22</td>
                    <td style={{ padding: '10px 4px' }}><span style={{ color: '#0057B8', background: '#EFF6FF', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>Sắp diễn ra</span></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 4px', fontWeight: 600 }}>15:30 - 17:00</td>
                    <td style={{ padding: '10px 4px', color: '#0057B8', fontWeight: 600 }}>AI Fundamentals</td>
                    <td style={{ padding: '10px 4px' }}>Phạm Thu Hà</td>
                    <td style={{ padding: '10px 4px' }}><span style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>P.401</span></td>
                    <td style={{ padding: '10px 4px' }}>26</td>
                    <td style={{ padding: '10px 4px' }}><span style={{ color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>Chưa bắt đầu</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Đơn đăng ký chờ duyệt */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0B2545', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#D97706" /> Đơn đăng ký chờ duyệt ({registrations.filter(r => r.status === 'pending').length})
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {registrations.map(reg => (
                <div key={reg.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#0B2545' }}>{reg.studentName}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{reg.courseTitle} · {reg.amountVnd.toLocaleString('vi-VN')} đ</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {reg.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApproveRegistration(reg.id)}
                          style={{ background: '#0057B8', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Check size={13} /> Duyệt
                        </button>
                        <button
                          onClick={() => handleRejectRegistration(reg.id)}
                          style={{ background: '#F1F5F9', color: '#DC2626', border: '1px solid #E2E8F0', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          <X size={13} />
                        </button>
                      </>
                    ) : reg.status === 'approved' ? (
                      <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700 }}>Đã duyệt ✓</span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 700 }}>Từ chối</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROW 3: 4 KHỐI NGHIỆP VỤ (Tình trạng học phí, Tickets, Phòng học, Trợ lý AI Giáo vụ) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          {/* Khối 1: Tình trạng học phí */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0B2545', margin: 0 }}>
              Tình trạng học phí
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* Vòng tròn 78% */}
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'conic-gradient(#0057B8 0% 78%, #E2E8F0 78% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#0057B8', fontSize: '16px' }}>
                  78%
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0057B8' }}></span>
                  <span>Đã thanh toán: <strong>980</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D97706' }}></span>
                  <span>Chờ thanh toán: <strong>210</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#DC2626' }}></span>
                  <span>Quá hạn: <strong>60</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Khối 2: Yêu cầu hỗ trợ mới */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0B2545', margin: 0 }}>
              Yêu cầu hỗ trợ mới ({tickets.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tickets.map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#0057B8', marginRight: '6px' }}>{t.ticketCode}</span>
                    <span style={{ color: '#0B2545' }}>{t.title}</span>
                  </div>
                  <span style={{ color: t.status === 'new' ? '#0057B8' : '#D97706', background: t.status === 'new' ? '#EFF6FF' : '#FFFBEB', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
                    {t.status === 'new' ? 'Mới' : 'Đang xử lý'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Khối 3: Phòng học & Thiết bị */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0B2545', margin: 0 }}>
              Phòng học & thiết bị
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ECFDF5', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: '#16A34A', fontWeight: 600 }}>12 / 15 Phòng sẵn sàng</span>
                <CheckCircle2 size={16} color="#16A34A" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFBEB', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: '#D97706', fontWeight: 600 }}>3 Phòng đang bảo trì</span>
                <AlertTriangle size={16} color="#D97706" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FEF2F2', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: '#DC2626', fontWeight: 600 }}>2 Sự cố thiết bị (Máy chiếu P.202, WiFi P.301)</span>
                <HelpCircle size={16} color="#DC2626" />
              </div>
            </div>
          </div>

          {/* Khối 4: Trợ lý AI Giáo vụ */}
          <div style={{ background: 'linear-gradient(135deg, #0057B8 0%, #003F88 100%)', color: '#fff', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#FCD34D" />
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Trợ lý Giáo vụ AI</h3>
            </div>
            <p style={{ fontSize: '12px', opacity: 0.9, margin: 0 }}>
              Hỏi đáp tra cứu sĩ số lớp, lịch học, giảng viên hoặc soạn thông báo vận hành nhanh.
            </p>
            <form onSubmit={handleAskAI} style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
              <input
                type="text"
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
                placeholder="Tra cứu lịch học, sĩ số..."
                style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: 'none', fontSize: '12px', color: '#0B2545', outline: 'none' }}
              />
              <button
                type="submit"
                disabled={isAiLoading}
                style={{ background: '#FCD34D', color: '#0B2545', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
              >
                {isAiLoading ? '...' : <Send size={14} />}
              </button>
            </form>
            {aiResponse && (
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', lineHeight: 1.4 }}>
                {aiResponse}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
