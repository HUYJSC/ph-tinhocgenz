import React, { useState } from 'react';
import { X, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface AcademicFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  studentCode?: string;
}

export const AcademicFeedbackModal: React.FC<AcademicFeedbackModalProps> = ({
  isOpen,
  onClose,
  studentName = 'Học viên',
  studentCode = 'THGZ01'
}) => {
  const [feedbackType, setFeedbackType] = useState<'makeup' | 'reserve' | 'support' | 'feedback'>('makeup');
  const [content, setContent] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('Vui lòng nhập nội dung đề xuất hoặc yêu cầu hỗ trợ!');
      return;
    }

    soundFx.playVictory();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setContent('');
      setContactNumber('');
      onClose();
    }, 2500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 160,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: "'Times New Roman', Times, serif"
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#F8FAFC'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} color="#2563EB" />
            <h3 style={{ fontSize: '15.5px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
              Tiếp Nhận Ý Kiến & Hỗ Trợ Học Vụ
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {isSubmitted ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#DCFCE7',
                color: '#16A34A',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}
            >
              <CheckCircle2 size={26} />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
              Đã Gửi Yêu Cầu Thành Công!
            </h4>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '6px' }}>
              Ban Đào tạo & Giảng viên phụ trách sẽ xử lý và phản hồi tới bạn trong vòng 24 giờ làm việc.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '12.5px', color: '#64748B' }}>
              Học viên: <b>{studentName}</b> ({studentCode})
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Phân loại yêu cầu học vụ
              </label>
              <select
                value={feedbackType}
                onChange={e => setFeedbackType(e.target.value as any)}
                style={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '6px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  fontSize: '13.5px',
                  padding: '0 10px',
                  outline: 'none'
                }}
              >
                <option value="makeup">Đăng ký học bù / Chuyển ca học thực hành</option>
                <option value="reserve">Đơn xin bảo lưu học phần / Tạm hoãn thi</option>
                <option value="support">Hỗ trợ kỹ thuật phần mềm Office / Lỗi bài tập</option>
                <option value="feedback">Đóng góp ý kiến cải tiến chất lượng giảng dạy</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Số điện thoại hoặc Zalo liên hệ
              </label>
              <input
                type="text"
                placeholder="VD: 0988 123 456"
                value={contactNumber}
                onChange={e => setContactNumber(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '6px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  padding: '0 12px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Nội dung chi tiết yêu cầu *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Mô tả cụ thể buổi học cần bù, ngày vắng hoặc thắc mắc của bạn..."
                value={content}
                onChange={e => setContent(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                type="submit"
                style={{
                  padding: '8px 20px',
                  borderRadius: '6px',
                  background: '#2563EB',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Send size={13} />
                <span>Gửi yêu cầu</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
