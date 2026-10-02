import React, { useState } from 'react';
import { Bell, FileText, Eye, Download, Check } from 'lucide-react';
import { Button } from './Button';
import { UniversalFileViewer, LMSFileItem } from './UniversalFileViewer';
import { soundFx } from '../../utils/audio';

export interface NotificationAttachment {
  name: string;
  type: string;
  size: string;
  url: string;
}

export interface LMSNotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'system' | 'teacher' | 'course_update' | 'assignment' | 'exam' | 'file_sharing';
  sender?: string;
  createdAt: string;
  isRead: boolean;
  attachment?: NotificationAttachment;
  actionUrl?: string;
}

export const DEMO_NOTIFICATIONS: LMSNotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Giáo viên Nguyễn Văn A đã cập nhật tài liệu',
    body: 'Thầy vừa bổ sung tài liệu thực hành Module 3: Hàm nâng cao và xử lý mảng trong Excel.',
    type: 'file_sharing',
    sender: 'Thầy Quang Huy (GV03)',
    createdAt: '10 phút trước',
    isRead: false,
    attachment: {
      name: 'Python_Basic.pdf',
      type: 'pdf',
      size: '2.4 MB',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    }
  },
  {
    id: 'notif-2',
    title: 'Nhắc nhở hạn nộp bài tập K26-WE01',
    body: 'Bài tập thực hành MOS Word 2026 sẽ đóng cổng nộp vào 23:59 tối nay.',
    type: 'assignment',
    sender: 'Hệ thống Khảo thí',
    createdAt: '1 giờ trước',
    isRead: false,
    attachment: {
      name: 'DeThi_Word_ThucHanh_01.docx',
      type: 'docx',
      size: '850 KB',
      url: '#'
    }
  },
  {
    id: 'notif-3',
    title: 'Lịch học phòng LAB được cập nhật',
    body: 'Buổi học thứ 7 tuần này chuyển từ phòng LAB 02 sang phòng LAB 05 (Tòa nhà B).',
    type: 'system',
    sender: 'Phòng Giáo vụ',
    createdAt: 'Hôm qua',
    isRead: true
  }
];

export interface NotificationCenterProps {
  notifications?: LMSNotificationItem[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onNavigate?: (url: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications: initialNotifications = DEMO_NOTIFICATIONS,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigate
}) => {
  const [notifications, setNotifications] = useState<LMSNotificationItem[]>(initialNotifications);
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedFile, setSelectedFile] = useState<LMSFileItem | null>(null);

  const filteredList = notifications.filter(n => {
    if (filterType === 'unread') return !n.isRead;
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  const handleToggleRead = (id: string, actionUrl?: string) => {
    soundFx.playClick();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    if (onMarkAsRead) onMarkAsRead(id);
    if (actionUrl && onNavigate) onNavigate(actionUrl);
  };

  const handleMarkAll = () => {
    soundFx.playClick();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    if (onMarkAllAsRead) onMarkAllAsRead();
  };

  const handlePreviewAttachment = (attachment: NotificationAttachment) => {
    soundFx.playClick();
    setSelectedFile({
      id: `att-${Date.now()}`,
      name: attachment.name,
      type: attachment.type,
      size: attachment.size,
      url: attachment.url,
      uploader: 'Giảng viên'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '780px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div
        style={{
          background: '#FFFFFF',
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid #D9E2F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', color: '#0057B8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0B2545', margin: 0 }}>Trung tâm Thông báo</h2>
            <span style={{ fontSize: '13px', color: '#64748B' }}>
              Cập nhật bài giảng, lịch thi, điểm danh và học liệu
            </span>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={handleMarkAll} leftIcon={<Check size={14} />}>
          Đánh dấu đã đọc tất cả
        </Button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'all', label: 'Tất cả' },
          { id: 'unread', label: 'Chưa đọc' },
          { id: 'file_sharing', label: 'Học liệu & File' },
          { id: 'assignment', label: 'Bài tập' },
          { id: 'system', label: 'Học vụ' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterType(tab.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: filterType === tab.id ? '#0057B8' : '#CBD5E1',
              background: filterType === tab.id ? '#0057B8' : '#FFFFFF',
              color: filterType === tab.id ? '#FFFFFF' : '#475569',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredList.map(item => (
          <div
            key={item.id}
            onClick={() => handleToggleRead(item.id, item.actionUrl)}
            style={{
              background: item.isRead ? '#FFFFFF' : '#F4F8FD',
              borderRadius: '12px',
              border: '1px solid',
              borderColor: item.isRead ? '#E2E8F0' : '#BFDBFE',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              position: 'relative',
              cursor: 'pointer'
            }}
          >
            {!item.isRead && (
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#2563EB'
                }}
              />
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0057B8', textTransform: 'uppercase' }}>
                  {item.sender || 'Hệ thống'}
                </span>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>•</span>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>{item.createdAt}</span>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0B2545', margin: '0 0 6px 0' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                {item.body}
              </p>
            </div>

            {/* Attachment preview / download if present */}
            {item.attachment && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #D9E2F0',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  marginTop: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div style={{ color: '#0057B8' }}><FileText size={18} /></div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0B2545', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.attachment.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>{item.attachment.size}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Eye size={12} />}
                    onClick={() => handlePreviewAttachment(item.attachment!)}
                  >
                    Xem trước
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = item.attachment!.url;
                      a.download = item.attachment!.name;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: '#0057B8',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Download size={12} /> Tải về
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredList.length === 0 && (
          <div style={{ textAlign: 'center', padding: '36px', background: '#FFFFFF', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>Không có thông báo nào trong mục này</p>
          </div>
        )}
      </div>

      {/* Embedded File Viewer */}
      <UniversalFileViewer
        file={selectedFile}
        isOpen={Boolean(selectedFile)}
        onClose={() => setSelectedFile(null)}
      />
    </div>
  );
};
