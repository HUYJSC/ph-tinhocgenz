import React, { useState, useId } from 'react';
import {
  Bot,
  X,
  Minimize2,
  Maximize2,
  Send,
  Sparkles
} from 'lucide-react';
import { TeacherAccount, UserProfile } from '../../types/auth';

interface AdminAssistantMascotProps {
  currentUser: UserProfile;
  teacherAccounts: TeacherAccount[];
  onOpenAddTeacher?: () => void;
  onFilterTeachers?: (query: string) => void;
  onFilterLocked?: () => void;
  onOpenRBACGuide?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'mascot' | 'user';
  text: string;
  timestamp: string;
  type?: 'text' | 'action' | 'warning';
  actionPrompt?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export const AdminAssistantMascot: React.FC<AdminAssistantMascotProps> = ({
  currentUser,
  teacherAccounts,
  onOpenAddTeacher,
  onFilterTeachers,
  onFilterLocked
}) => {

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const inputId = useId();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'mascot',
      text: `Xin chào ${currentUser.name || 'Quản trị viên'}! Em là Trợ lý AI của Tin Học Gen Z. Em có thể hỗ trợ thầy/cô tra cứu danh sách, hướng dẫn phân quyền và kiểm tra an toàn dữ liệu giảng viên.`,
      timestamp: 'Vừa xong'
    }
  ]);

  const quickPrompts = [
    { id: 'p1', label: '🔍 Tìm giảng viên', query: 'Tìm giảng viên' },
    { id: 'p2', label: '🔒 Kiểm tra tài khoản bị khóa', query: 'Kiểm tra tài khoản bị khóa' },
    { id: 'p3', label: '🛡️ Hướng dẫn phân quyền', query: 'Hướng dẫn phân quyền' },
    { id: 'p4', label: '⚠️ Tìm dữ liệu còn thiếu', query: 'Tìm dữ liệu còn thiếu' },
    { id: 'p5', label: '➕ Hướng dẫn thêm giảng viên', query: 'Hướng dẫn thêm giảng viên' }
  ];

  const handleSendPrompt = (promptText: string) => {
    if (!promptText.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Generate response adhering strictly to AI Security Boundaries (Requirement 8)
    setTimeout(() => {
      const botResponse = generateSecureResponse(promptText.trim());
      setMessages(prev => [...prev, botResponse]);
    }, 400);
  };

  const generateSecureResponse = (query: string): ChatMessage => {
    const q = query.toLowerCase();
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    // Boundary 1: Prohibit password queries
    if (q.includes('mật khẩu') || q.includes('password') || q.includes('pass') || q.includes('mật mã')) {
      return {
        id: `m-${Date.now()}`,
        sender: 'mascot',
        text: '🛡️ NGUYÊN TẮC BẢO MẬT: Trợ lý AI tuyệt đối không truy xuất, không hiển thị và không lưu trữ mật khẩu của bất kỳ tài khoản nào. Để cấp lại mật khẩu, Thầy/Cô vui lòng nhấn vào menu ba chấm (...) cạnh tài khoản và chọn "Đặt lại mật khẩu" có xác nhận 2 bước.',
        timestamp: time,
        type: 'warning'
      };
    }

    // Boundary 2: Prohibit unauthorized deletion or role elevation
    if (q.includes('xóa tài khoản') || q.includes('xóa') || q.includes('cấp quyền super admin') || q.includes('đổi role')) {
      return {
        id: `m-${Date.now()}`,
        sender: 'mascot',
        text: '⚠️ AN TOÀN HỆ THỐNG: AI không có quyền tự ý xóa tài khoản hay nâng cấp quyền Super Admin. Các thao tác này yêu cầu quyền Quản trị viên cấp cao và phải được thực hiện trực tiếp trên giao diện quản trị có ghi nhận nhật ký kiểm toán (Audit Trail).',
        timestamp: time,
        type: 'warning'
      };
    }

    // Prompt 1: Tìm giảng viên
    if (q.includes('tìm') && (q.includes('giảng viên') || q.includes('gv') || q.includes('thầy') || q.includes('cô'))) {
      const total = teacherAccounts.length;
      return {
        id: `m-${Date.now()}`,
        sender: 'mascot',
        text: `Hệ thống hiện có ${total} tài khoản giảng viên & nhân sự. Thầy/Cô có thể nhập tên hoặc mã GV vào thanh tìm kiếm phía trên để lọc nhanh, hoặc gõ tên GV vào đây để em tra cứu giúp!`,
        timestamp: time,
        actionButton: onFilterTeachers ? { label: 'Đặt lại tìm kiếm', onClick: () => onFilterTeachers('') } : undefined
      };
    }

    // Prompt 2: Kiểm tra tài khoản bị khóa
    if (q.includes('khóa') || q.includes('locked')) {
      const lockedTeachers = teacherAccounts.filter(t => t.status === 'locked');
      if (lockedTeachers.length === 0) {
        return {
          id: `m-${Date.now()}`,
          sender: 'mascot',
          text: '✅ Tuyệt vời! Hiện tại không có tài khoản giảng viên nào đang bị khóa. Tất cả các tài khoản đều đang hoạt động bình thường.',
          timestamp: time
        };
      }
      const names = lockedTeachers.map(t => `${t.name} (${t.teacherCode})`).join(', ');
      return {
        id: `m-${Date.now()}`,
        sender: 'mascot',
        text: `⚠️ Phát hiện ${lockedTeachers.length} tài khoản đang bị tạm khóa: ${names}. Thầy/Cô có thể vào menu ba chấm (...) của từng giảng viên để Mở khóa khi cần.`,
        timestamp: time,
        type: 'warning',
        actionButton: onFilterLocked ? { label: 'Lọc tài khoản bị khóa', onClick: onFilterLocked } : undefined
      };
    }

    // Prompt 3: Hướng dẫn phân quyền
    if (q.includes('phân quyền') || q.includes('rbac') || q.includes('vai trò')) {
      return {
        id: `m-${Date.now()}`,
        sender: 'mascot',
        text: `📘 HƯỚNG DẪN PHÂN QUYỀN RBAC 2.0:\n• Giảng viên đứng lớp: Có quyền vào lớp học, nhập điểm danh QR, chấm bài tập và xem danh sách học viên trong lớp.\n• Quản trị viên (Admin): Có quyền quản lý khóa học, đề thi, lịch học và học viên.\n• Super Admin: Nắm toàn quyền hệ thống và thiết lập quyền hạn chi tiết.\n👉 Để phân quyền chi tiết, nhấn vào nút "RBAC" tại dòng của giảng viên.`,
        timestamp: time
      };
    }

    // Prompt 4: Tìm dữ liệu còn thiếu
    if (q.includes('thiếu') || q.includes('chưa có') || q.includes('dữ liệu')) {
      const missingContact = teacherAccounts.filter(t => !t.phoneOrEmail && !t.email && !t.phone);
      const noTracks = teacherAccounts.filter(t => !t.assignedTracks || t.assignedTracks.length === 0);
      let report = '📊 KIỂM TRA TÍNH TOÀN VẸN DỮ LIỆU:\n';
      if (missingContact.length > 0) {
        report += `• ${missingContact.length} giảng viên chưa có thông tin Email / SĐT liên hệ (${missingContact.map(t => t.teacherCode).join(', ')}).\n`;
      } else {
        report += '• 100% giảng viên đã có thông tin liên hệ.\n';
      }
      if (noTracks.length > 0) {
        report += `• ${noTracks.length} giảng viên chưa được phân công môn học nào.\n`;
      } else {
        report += '• Toàn bộ giảng viên đều đã được phân công môn giảng dạy.';
      }
      return {
        id: `m-${Date.now()}`,
        sender: 'mascot',
        text: report,
        timestamp: time
      };
    }

    // Prompt 5: Hướng dẫn thêm giảng viên
    if (q.includes('thêm') || q.includes('tạo mới') || q.includes('cấp tài khoản')) {
      return {
        id: `m-${Date.now()}`,
        sender: 'mascot',
        text: `✨ QUY TRÌNH THÊM GIẢNG VIÊN MỚI:\n1. Nhấn nút "+ Thêm Giảng Viên / Nhân Sự" ở góc trên bên phải bảng.\n2. Nhập Họ và tên (VD: Thầy Đình Huy).\n3. Nhập Mã giảng viên (VD: GV05) - dùng làm tài khoản đăng nhập.\n4. Tích chọn các môn/phân hệ mà giảng viên sẽ phụ trách.\n5. Nhấn "Lưu & Cấp Tài Khoản". Mật khẩu an toàn mặc định sẽ được khởi tạo tự động.`,
        timestamp: time,
        actionButton: onOpenAddTeacher ? { label: '+ Mở form thêm giảng viên', onClick: onOpenAddTeacher } : undefined
      };
    }

    // Default friendly response
    return {
      id: `m-${Date.now()}`,
      sender: 'mascot',
      text: `Dạ em đã ghi nhận thông tin: "${query}". Em có thể giúp Thầy/Cô kiểm tra tài khoản bị khóa, tra cứu môn phụ trách hoặc hướng dẫn quy trình quản trị. Hãy chọn một trong các gợi ý bên dưới nhé!`,
      timestamp: time
    };
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 40,
        fontFamily: 'inherit'
      }}
    >
      {/* ── EXPANDED CHAT PANEL ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Trợ lý AI Tin Học Gen Z"
          style={{
            position: 'absolute',
            bottom: '70px',
            right: 0,
            width: isMinimized ? '320px' : '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: isMinimized ? '70px' : '520px',
            maxHeight: 'calc(100vh - 120px)',
            background: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 16px 40px -8px rgba(11, 37, 69, 0.22), 0 0 0 1px rgba(0, 87, 184, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'height 0.25s ease, width 0.25s ease',
            border: '1.5px solid #0057B8'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #0057B8 0%, #003F88 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              >
                <Bot size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, lineHeight: 1.2, color: '#FFFFFF' }}>
                  Trợ Lý AI Gen Z
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.85)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                  Trực tuyến 24/7 • Tin Học Gen Z
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: '#FFFFFF',
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
                aria-label={isMinimized ? 'Mở rộng trợ lý AI' : 'Thu nhỏ trợ lý AI'}
              >
                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: '#FFFFFF',
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Đóng trợ lý"
                aria-label="Đóng trợ lý AI"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Message History */}
              <div
                style={{
                  flex: 1,
                  padding: '14px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  background: '#F4F8FD'
                }}
              >
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '86%',
                        padding: '10px 14px',
                        borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        background: msg.sender === 'user'
                          ? '#0057B8'
                          : msg.type === 'warning'
                            ? '#FEF2F2'
                            : '#FFFFFF',
                        color: msg.sender === 'user'
                          ? '#FFFFFF'
                          : msg.type === 'warning'
                            ? '#991B1B'
                            : '#0B2545',
                        border: msg.type === 'warning'
                          ? '1px solid #FECACA'
                          : msg.sender === 'user' ? 'none' : '1px solid #E2E8F0',
                        fontSize: '0.82rem',
                        lineHeight: 1.45,
                        whiteSpace: 'pre-line',
                        boxShadow: '0 2px 6px rgba(0, 87, 184, 0.04)'
                      }}
                    >
                      {msg.text}
                      {msg.actionButton && (
                        <button
                          type="button"
                          onClick={msg.actionButton.onClick}
                          style={{
                            marginTop: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            background: '#0057B8',
                            color: '#FFFFFF',
                            border: 'none',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {msg.actionButton.label}
                        </button>
                      )}
                    </div>
                    <span style={{ fontSize: '0.66rem', color: '#64748B', marginTop: '3px', padding: '0 4px' }}>
                      {msg.timestamp}
                    </span>

                  </div>
                ))}
              </div>

              {/* Quick Prompt Chips */}
              <div
                style={{
                  padding: '8px 12px',
                  background: '#FFFFFF',
                  borderTop: '1px solid #E2E8F0',
                  display: 'flex',
                  gap: '6px',
                  overflowX: 'auto',
                  whiteSpace: 'nowrap'
                }}
              >
                {quickPrompts.map(qp => (
                  <button
                    key={qp.id}
                    type="button"
                    onClick={() => handleSendPrompt(qp.query)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      borderRadius: '16px',
                      background: '#F4F8FD',
                      border: '1px solid rgba(0, 87, 184, 0.2)',
                      color: '#0057B8',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {qp.label}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendPrompt(inputText);
                }}
                style={{
                  padding: '10px 12px',
                  background: '#FFFFFF',
                  borderTop: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <label htmlFor={inputId} className="sr-only" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0 }}>
                  Hỏi trợ lý AI quản trị
                </label>
                <input
                  id={inputId}
                  type="text"
                  placeholder="Hỏi trợ lý AI (VD: Kiểm tra tài khoản bị khóa)..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.82rem',
                    color: '#0B2545',
                    outline: 'none',
                    background: '#F8FAFC'
                  }}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    border: 'none',
                    background: inputText.trim() ? '#0057B8' : '#CBD5E1',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: inputText.trim() ? 'pointer' : 'default',
                    transition: 'background 0.2s'
                  }}
                  title="Gửi câu hỏi"
                  aria-label="Gửi câu hỏi cho trợ lý AI"
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* ── FLOATING MASCOT BUTTON (COLLAPSED) ── */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0057B8 0%, #003F88 100%)',
          color: '#FFFFFF',
          border: '2.5px solid #FFFFFF',
          boxShadow: '0 8px 24px rgba(0, 87, 184, 0.4), 0 2px 6px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          animation: !isOpen ? 'gentle-bounce 3s infinite ease-in-out' : 'none'
        }}
        title="Trợ lý AI Tin Học Gen Z"
        aria-label="Mở Trợ lý AI Tin Học Gen Z"
      >
        <Bot size={28} />
        {/* Pulsing Green Online Indicator */}
        <span
          style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '13px',
            height: '13px',
            borderRadius: '50%',
            background: '#22c55e',
            border: '2px solid #FFFFFF',
            boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.3)'
          }}
        />
        {/* Sparkle badge */}
        <span
          style={{
            position: 'absolute',
            bottom: '-2px',
            left: '-2px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: '#F59E0B',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1.5px solid #FFFFFF'
          }}
        >
          <Sparkles size={10} />
        </span>
      </button>

      <style>{`
        @keyframes gentle-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};
