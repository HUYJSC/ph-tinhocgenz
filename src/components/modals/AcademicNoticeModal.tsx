import React, { useState } from 'react';
import { X, Bell, Calendar, Award, FileText, Download } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface AcademicNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AcademicNoticeModal: React.FC<AcademicNoticeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'exam' | 'forms'>('schedule');

  if (!isOpen) return null;

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
        fontFamily: "'Be Vietnam Pro', sans-serif"
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          background: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
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
            <Bell size={18} color="#2563EB" />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                Bảng Tin Thông Báo Học Vụ
              </h3>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Học kỳ 1 Năm học 2026 - 2027 • PH - TIN HỌC GENZ
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', background: '#FFFFFF' }}>
          {[
            { id: 'schedule', label: 'Lịch học & Mở lớp', icon: Calendar },
            { id: 'exam', label: 'Khảo thí & Đề thi', icon: Award },
            { id: 'forms', label: 'Biểu mẫu & Quy chế', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab(tab.id as any);
                }}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: isActive ? '2.5px solid #2563EB' : '2.5px solid transparent',
                  color: isActive ? '#2563EB' : '#64748B',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Icon size={14} color={isActive ? '#2563EB' : '#64748B'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div style={{ padding: '20px', maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activeTab === 'schedule' && (
            <>
              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#2563EB', background: '#EFF6FF', padding: '2px 6px', borderRadius: '4px' }}>
                    KẾ HOẠCH HỌC KỲ 1
                  </span>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>20/08/2026</span>
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', margin: '6px 0 3px' }}>
                  Thông báo kế hoạch giảng dạy các lớp Tin học Văn phòng Cấp tốc (Khóa T8/2026)
                </h4>
                <p style={{ fontSize: '12.5px', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                  Tất cả các lớp Word (3b), Excel (3b) và PowerPoint (3b) sẽ bắt đầu tuần học mới. Học viên kiểm tra Thời khóa biểu để vào phòng Meet đúng giờ.
                </p>
              </div>

              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#16A34A', background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>
                    MỞ LỚP MỚI
                  </span>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>18/08/2026</span>
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', margin: '6px 0 3px' }}>
                  Khai giảng chuyên đề Ứng dụng AI vào công việc Văn phòng & Phân tích Dữ liệu
                </h4>
                <p style={{ fontSize: '12.5px', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                  Chương trình đào tạo 5 buổi thực hành trực tiếp trên ChatGPT, Copilot và Microsoft Excel tự động hóa.
                </p>
              </div>
            </>
          )}

          {activeTab === 'exam' && (
            <>
              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#D97706', background: '#FEF3C7', padding: '2px 6px', borderRadius: '4px' }}>
                    LỊCH KHẢO THÍ
                  </span>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>15/08/2026</span>
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', margin: '6px 0 3px' }}>
                  Quy chế làm bài thi thực hành và nộp bài trên Google Drive
                </h4>
                <p style={{ fontSize: '12.5px', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                  Học viên tải file dữ liệu mẫu về máy, tuyệt đối không chia sẻ đề thi ra ngoài (đề thi được gắn mã watermark bảo mật định danh học viên).
                </p>
              </div>

              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#2563EB', background: '#EFF6FF', padding: '2px 6px', borderRadius: '4px' }}>
                    CHỨNG CHỈ
                  </span>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>10/08/2026</span>
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', margin: '6px 0 3px' }}>
                  Kế hoạch tổ chức thi đánh giá chuẩn đầu ra Chứng chỉ CNTT & MOS
                </h4>
                <p style={{ fontSize: '12.5px', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                  Học viên hoàn thành đủ 80% thời lượng khóa học và bài kiểm tra tiến độ sẽ được đăng ký dự thi cấp chứng chỉ.
                </p>
              </div>
            </>
          )}

          {activeTab === 'forms' && (
            <>
              {[
                { title: 'Đơn xin học bù / Chuyển ca học thực hành', size: '115 KB', type: 'DOCX' },
                { title: 'Mẫu báo cáo bài tập thực hành chuẩn khóa học', size: '240 KB', type: 'XLSX' },
                { title: 'Quy chế đào tạo & Khảo thí trực tuyến PH - Tin Học GenZ', size: '420 KB', type: 'PDF' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px 14px',
                    background: '#F8FAFC',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={18} color="#2563EB" />
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 500, color: '#0F172A' }}>{item.title}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748B' }}>Dung lượng: {item.size} • Định dạng: {item.type}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      alert(`📥 Đang tải xuống biểu mẫu: ${item.title}`);
                    }}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '4px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      color: '#334155',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Download size={13} />
                    <span>Tải về</span>
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '7px 18px',
              borderRadius: '6px',
              background: '#2563EB',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Đóng bảng tin
          </button>
        </div>
      </div>
    </div>
  );
};
