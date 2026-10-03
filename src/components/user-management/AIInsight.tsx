import React, { useState } from 'react';
import {
  Sparkles, Send, CheckCircle2, AlertTriangle, Lightbulb
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export interface AIInsightProps {
  role: 'student' | 'teacher' | 'academic' | 'admin' | string;
  userName?: string;
  customPrompt?: string;
  onSendReminder?: () => void;
  onTakeAction?: (actionType: string) => void;
}

export const AIInsight: React.FC<AIInsightProps> = ({
  role = 'student',
  userName = 'Học viên',
  onSendReminder,
  onTakeAction
}) => {
  const [reminderSent, setReminderSent] = useState(false);
  const [adminQuery, setAdminQuery] = useState('');
  const [adminAnswer, setAdminAnswer] = useState<{
    count: number;
    inactiveDays: number;
    message: string;
  } | null>(null);

  const getRoleInsight = () => {
    switch (role) {
      case 'student':
        return {
          badge: 'AI Learning Assistant',
          icon: Lightbulb,
          color: '#0057B8',
          bg: '#EFF6FF',
          border: '#BFDBFE',
          title: 'Gợi ý lộ trình cá nhân hóa',
          message: `Bạn đang chậm tiến độ khóa Kỹ Năng Excel Nâng Cao. Nên hoàn thành bài 5 trong tuần này để kịp kỳ thi đánh giá vào thứ Bảy tới.`,
          actionLabel: 'Học bài 5 ngay',
          actionType: 'resume_lesson'
        };
      case 'teacher':
        return {
          badge: 'AI Teaching Assistant',
          icon: AlertTriangle,
          color: '#D97706',
          bg: '#FEF3C7',
          border: '#FDE68A',
          title: 'Cảnh báo học liệu & giảng dạy',
          message: `Có 3 lớp (K26-WE01, K26-CB02, K26-AI01) chưa được cập nhật tài liệu thực hành tuần này. Hãy tải lên bài tập để học viên chuẩn bị trước buổi học.`,
          actionLabel: 'Cập nhật tài liệu',
          actionType: 'upload_material'
        };
      default:
        return {
          badge: 'AI User Management Assistant',
          icon: Sparkles,
          color: '#0057B8',
          bg: '#EFF6FF',
          border: '#BFDBFE',
          title: 'Trợ lý phân tích người dùng LMS',
          message: `Hệ thống ghi nhận 32 học viên chưa hoàn thành khóa học kỳ này (trong đó 15 người chưa đăng nhập trên 7 ngày). Bạn có muốn gửi thông báo nhắc nhở tự động không?`,
          actionLabel: 'Gửi nhắc nhở hàng loạt',
          actionType: 'send_bulk_reminder'
        };
    }
  };

  const insight = getRoleInsight();

  const handleAction = () => {
    soundFx.playClick();
    if (insight.actionType === 'send_bulk_reminder' || onSendReminder) {
      setReminderSent(true);
      if (onSendReminder) onSendReminder();
      setTimeout(() => setReminderSent(false), 3000);
    } else if (onTakeAction) {
      onTakeAction(insight.actionType);
    }
  };

  const handleAdminAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminQuery.trim()) return;
    soundFx.playClick();

    const q = adminQuery.toLowerCase();
    if (q.includes('chưa hoàn thành') || q.includes('chậm tiến độ')) {
      setAdminAnswer({
        count: 32,
        inactiveDays: 7,
        message: '32 học viên chưa hoàn thành khóa học. 15 người chưa học trên 7 ngày. Bạn có muốn gửi tin nhắn nhắc nhở qua Zalo/Email?'
      });
    } else if (q.includes('giảng viên') || q.includes('giáo viên')) {
      setAdminAnswer({
        count: 12,
        inactiveDays: 0,
        message: '12 giảng viên đang phụ trách 10 lớp học. Tỷ lệ điểm danh trung bình đạt 97.4% trong tháng này.'
      });
    } else {
      setAdminAnswer({
        count: 240,
        inactiveDays: 0,
        message: `Đã phân tích yêu cầu "${adminQuery}". Hệ thống vận hành bình thường, không ghi nhận tài khoản có dấu hiệu gian lận điểm danh.`
      });
    }
  };

  return (
    <div style={{
      padding: '16px 20px',
      borderRadius: '12px',
      background: insight.bg,
      border: `1.5px solid ${insight.border}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Top Banner Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 800, color: insight.color, textTransform: 'uppercase' }}>
          <Sparkles size={14} />
          <span>{insight.badge}</span>
        </div>

        <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>
          Dành cho {userName}
        </span>
      </div>

      {/* Insight Message */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{ fontSize: '0.84rem', color: '#0B2545', lineHeight: 1.5, flex: 1 }}>
          <strong>{insight.title}: </strong>
          <span>{insight.message}</span>
        </div>
      </div>

      {/* Action CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleAction}
          disabled={reminderSent}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            background: reminderSent ? '#16A34A' : '#0057B8',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '0.8rem',
            fontWeight: 800,
            cursor: reminderSent ? 'default' : 'pointer',
            transition: 'background 0.2s ease'
          }}
        >
          {reminderSent ? <CheckCircle2 size={14} /> : <Send size={14} />}
          <span>{reminderSent ? 'Đã gửi nhắc nhở thành công ✓' : insight.actionLabel}</span>
        </button>

        {role === 'admin' && (
          <form onSubmit={handleAdminAsk} style={{ display: 'flex', gap: '6px', flex: '1 1 240px' }}>
            <input
              type="text"
              value={adminQuery}
              onChange={(e) => setAdminQuery(e.target.value)}
              placeholder="Hỏi AI: Có bao nhiêu học viên chưa hoàn thành?..."
              style={{
                flex: 1,
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                fontSize: '0.78rem',
                color: '#0B2545'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                background: '#0B2545',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Hỏi
            </button>
          </form>
        )}
      </div>

      {/* Interactive Answer from AI Query */}
      {adminAnswer && (
        <div style={{
          marginTop: '6px',
          padding: '10px 12px',
          borderRadius: '8px',
          background: '#FFFFFF',
          border: '1px solid #CBD5E1',
          fontSize: '0.8rem',
          color: '#0B2545',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          <div>
            <strong>AI Trả lời: </strong> {adminAnswer.message}
          </div>
          <button
            type="button"
            onClick={() => { soundFx.playVictory(); setReminderSent(true); setTimeout(() => setReminderSent(false), 3000); }}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              background: '#0057B8',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Gửi nhắc ngay
          </button>
        </div>
      )}
    </div>
  );
};
