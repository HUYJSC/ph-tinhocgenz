import React, { useState } from 'react';
import {
  Headphones, MessageSquare, Search, ChevronRight, Check, X
} from 'lucide-react';
import { UserProfile } from '../../types/auth';
import { soundFx } from '../../utils/audio';

export interface StudentTicket {
  id: string;
  ticketCode: string;
  studentName: string;
  studentCode: string;
  classCode: string;
  phone: string;
  type: 'LEAVE_REQUEST' | 'MAKEUP_REQUEST' | 'CERTIFICATE_ISSUE' | 'TUITION_QUERY' | 'TECH_SUPPORT';
  title: string;
  content: string;
  status: 'new' | 'processing' | 'waiting_feedback' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  responseNote?: string;
}

export interface GiaoVuStudentCareProps {
  currentUser?: UserProfile;
  onBackToDashboard?: () => void;
}

export const GiaoVuStudentCare: React.FC<GiaoVuStudentCareProps> = ({
  currentUser: _currentUser,
  onBackToDashboard
}) => {
  const [tickets, setTickets] = useState<StudentTicket[]>([
    {
      id: 't-1',
      ticketCode: '#TK-101',
      studentName: 'Trần Văn Bảo',
      studentCode: 'HV2601',
      classCode: 'K26-WE01',
      phone: '0912 345 678',
      type: 'LEAVE_REQUEST',
      title: 'Đơn xin nghỉ học buổi 8 do việc gia đình',
      content: 'Em xin phép nghỉ buổi học sáng Chủ Nhật tuần này. Em đã xem tài liệu bài giảng trên hệ thống và xin phép học bù vào buổi chiều hoặc tuần sau ạ.',
      status: 'new',
      priority: 'medium',
      createdAt: 'Hôm nay, 08:30'
    },
    {
      id: 't-2',
      ticketCode: '#TK-102',
      studentName: 'Nguyễn Thị Mai',
      studentCode: 'HV2602',
      classCode: 'K26-CC01',
      phone: '0988 765 432',
      type: 'CERTIFICATE_ISSUE',
      title: 'Yêu cầu xác nhận hoàn thành khóa học để nộp cơ quan',
      content: 'Em đã hoàn thành đủ 6 buổi và vượt qua bài kiểm tra cuối khóa CC CNTT Cơ bản. Nhờ thầy cô giáo vụ hỗ trợ cấp giấy chứng nhận bản PDF có mã QR xác thực để em bổ sung hồ sơ công chức.',
      status: 'processing',
      priority: 'high',
      createdAt: 'Hôm qua, 14:15'
    },
    {
      id: 't-3',
      ticketCode: '#TK-103',
      studentName: 'Lê Minh Khang',
      studentCode: 'HV2603',
      classCode: 'K26-WE01',
      phone: '0903 112 233',
      type: 'MAKEUP_REQUEST',
      title: 'Xin đăng ký học bù buổi 3 môn Excel',
      content: 'Do tuần trước đi công tác nên em bị vắng buổi hàm VLOOKUP. Nhờ giáo vụ xếp giúp em vào lớp K26-WE02 buổi chiều thứ 7 để em theo kịp tiến độ.',
      status: 'resolved',
      priority: 'medium',
      createdAt: '18/09/2026',
      responseNote: 'Đã phân công học bù lớp K26-WE02 ngày 21/09/2026.'
    }
  ]);

  const [activeFilter, setActiveFilter] = useState<'all' | 'new' | 'processing' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<StudentTicket | null>(null);
  const [responseInput, setResponseInput] = useState('');

  const filteredTickets = tickets.filter(t => {
    if (activeFilter !== 'all' && t.status !== activeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.studentName.toLowerCase().includes(q);
      const matchCode = t.ticketCode.toLowerCase().includes(q);
      const matchTitle = t.title.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchTitle) return false;
    }
    return true;
  });

  const handleOpenResponse = (ticket: StudentTicket) => {
    setSelectedTicket(ticket);
    setResponseInput(ticket.responseNote || 'Đã tiếp nhận yêu cầu và xử lý cập nhật lịch học / quyền lợi cho học viên.');
    soundFx.playClick();
  };

  const handleResolveTicket = () => {
    if (!selectedTicket) return;
    soundFx.playCorrect();
    setTickets(prev =>
      prev.map(t => t.id === selectedTicket.id ? { ...t, status: 'resolved', responseNote: responseInput } : t)
    );
    setSelectedTicket(null);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', color: '#64748B' }}>Giáo Vụ</span>
            <ChevronRight size={14} color="#94A3B8" />
            <span style={{ fontSize: '13px', color: '#0057B8', fontWeight: 600 }}>Chăm Sóc & Hỗ Trợ Học Viên</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Headphones size={26} color="#0057B8" />
            Tiếp Nhận & Xử Lý Yêu Cầu Học Viên (Student Care)
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748B' }}>
            Xử lý đơn xin vắng học, xếp lịch học bù, khiếu nại học phí và giải quyết yêu cầu kỹ thuật.
          </p>
        </div>

        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ← Bảng điều khiển
          </button>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div style={{
        background: '#FFFFFF',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'new', label: 'Mới gửi' },
            { id: 'processing', label: 'Đang xử lý' },
            { id: 'resolved', label: 'Đã giải quyết' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => { setActiveFilter(f.id as any); soundFx.playClick(); }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: activeFilter === f.id ? '1px solid #0057B8' : '1px solid #CBD5E1',
                background: activeFilter === f.id ? '#EFF6FF' : '#FFFFFF',
                color: activeFilter === f.id ? '#0057B8' : '#64748B'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '280px' }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo học viên, mã vé, tiêu đề..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* Tickets List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredTickets.map((t, idx) => (
          <div
            key={t.id || idx}
            style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: t.priority === 'high' ? '#FEF2F2' : '#EFF6FF',
                color: t.priority === 'high' ? '#DC2626' : '#0057B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '2px'
              }}>
                <MessageSquare size={20} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0057B8', background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px' }}>
                    {t.ticketCode}
                  </span>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                    {t.title}
                  </h3>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: t.status === 'resolved' ? '#DCFCE7' : t.status === 'new' ? '#FEF3C7' : '#EFF6FF',
                    color: t.status === 'resolved' ? '#15803D' : t.status === 'new' ? '#D97706' : '#0057B8'
                  }}>
                    {t.status === 'resolved' ? 'Đã giải quyết' : t.status === 'new' ? 'Mới gửi' : 'Đang xử lý'}
                  </span>
                </div>

                <div style={{ fontSize: '13px', color: '#475569', marginBottom: '6px', maxWidth: '700px', lineHeight: 1.5 }}>
                  {t.content}
                </div>

                <div style={{ fontSize: '12px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>Học viên: <strong style={{ color: '#334155' }}>{t.studentName} ({t.studentCode})</strong></span>
                  <span>•</span>
                  <span>Lớp: {t.classCode}</span>
                  <span>•</span>
                  <span>SĐT: {t.phone}</span>
                  <span>•</span>
                  <span>Thời gian: {t.createdAt}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleOpenResponse(t)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  background: t.status === 'resolved' ? '#FFFFFF' : '#0057B8',
                  border: t.status === 'resolved' ? '1px solid #CBD5E1' : 'none',
                  color: t.status === 'resolved' ? '#334155' : '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {t.status === 'resolved' ? 'Xem phản hồi' : 'Xử lý & Phản hồi'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Response Modal */}
      {selectedTicket && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
                Xử Lý Yêu Cầu {selectedTicket.ticketCode}
              </h3>
              <button onClick={() => setSelectedTicket(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>{selectedTicket.title}</div>
              <div style={{ color: '#64748B', lineHeight: 1.5 }}>{selectedTicket.content}</div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Nội dung phản hồi / Giải pháp xử lý cho học viên:
              </label>
              <textarea
                rows={4}
                value={responseInput}
                onChange={e => setResponseInput(e.target.value)}
                placeholder="Ghi chú phản hồi đã điều phối..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setSelectedTicket(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#64748B', fontSize: '13px', cursor: 'pointer' }}
              >
                Đóng
              </button>
              <button
                onClick={handleResolveTicket}
                style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#0057B8', color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Check size={16} />
                Đánh dấu Đã xử lý & Gửi phản hồi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

