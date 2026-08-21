import React, { useState } from 'react';
import { UserProfile } from '../../types/auth';
import { AITutorMode, AITutorMessage } from '../../types/edtech';
import { AITutorService } from '../../services/aiTutorService';
import { Bot, Sparkles, Send, X, HelpCircle, Lightbulb, CheckCircle2 } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface AITutorDrawerProps {
  currentUser: UserProfile;
  isOpen: boolean;
  initialPrompt?: string;
  onClose: () => void;
}

export const AITutorDrawer: React.FC<AITutorDrawerProps> = ({
  currentUser,
  isOpen,
  initialPrompt = '',
  onClose
}) => {
  const [mode, setMode] = useState<AITutorMode>('explain');
  const [messages, setMessages] = useState<AITutorMessage[]>([
    {
      id: 'init_1',
      sender: 'ai',
      text: `Xin chào ${currentUser.name || 'bạn'}! Tôi là **TinHocGenZ AI Tutor 2026**.\n\nHãy chọn 1 trong 3 chế độ bên dưới hoặc nhập câu hỏi về Microsoft Word, Excel, PowerPoint, AI Văn Phòng hay CNTT để tôi hỗ trợ bạn ngay!`,
      mode: 'explain',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputQuery, setInputQuery] = useState(initialPrompt);
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = async (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text) return;

    const studentMsg: AITutorMessage = {
      id: `std_${Date.now()}`,
      sender: 'student',
      text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, studentMsg]);
    setInputQuery('');
    setIsTyping(true);
    soundFx.playClick();

    try {
      const aiResponse = await AITutorService.generateResponse(text, mode, {
        studentName: currentUser.name,
        track: currentUser.programTrack
      });
      setMessages(prev => [...prev, aiResponse]);
      soundFx.playCorrect();
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        justifyContent: 'flex-end'
      }}
      className="animate-fade-in"
    >
      <div
        className="card animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '520px',
          height: '100%',
          borderRadius: '24px 0 0 24px',
          padding: '20px',
          background: 'var(--bg-card)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.3)',
          borderLeft: '1.5px solid var(--border-color)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                  TinHocGenZ AI Tutor
                </h3>
                <span style={{ fontSize: '0.68rem', background: '#8b5cf6', color: '#fff', padding: '1px 6px', borderRadius: '999px', fontWeight: 800 }}>
                  2026
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Trợ lý học tập thông minh & giải đáp ngữ cảnh
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-icon"
            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Mode Selector (3 Modes) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', margin: '12px 0', padding: '4px', borderRadius: '12px', background: 'var(--bg-secondary)' }}>
          {[
            { id: 'explain', label: '1. Giải Thích', icon: HelpCircle },
            { id: 'hint', label: '2. Gợi Ý Mẹo', icon: Lightbulb },
            { id: 'quiz_check', label: '3. Kiểm Tra', icon: CheckCircle2 }
          ].map(m => {
            const Icon = m.icon;
            const isSelected = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setMode(m.id as AITutorMode);
                  soundFx.playClick();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '7px 4px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isSelected ? 'var(--bg-card)' : 'transparent',
                  color: isSelected ? '#8b5cf6' : 'var(--text-secondary)',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                <Icon size={13} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="horizontal-scroll" style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
          {[
            'Hàm XLOOKUP dùng thế nào?',
            'Khi nào dùng phím F4 trong Excel?',
            'Cách tạo mục lục tự động Word?',
            'Mẹo dùng hiệu ứng Morph PPT'
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              style={{
                padding: '4px 10px',
                borderRadius: '999px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Messages Chat List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
          {messages.map(msg => {
            const isAI = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: isAI ? 'flex-start' : 'flex-end',
                  maxWidth: '90%',
                  padding: '12px 14px',
                  borderRadius: isAI ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                  background: isAI ? 'var(--bg-secondary)' : 'var(--brand)',
                  color: isAI ? 'var(--text-primary)' : '#fff',
                  border: isAI ? '1px solid var(--border-color)' : 'none',
                  fontSize: '0.84rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap'
                }}
              >
                {msg.text}
              </div>
            );
          })}

          {isTyping && (
            <div style={{ alignSelf: 'flex-start', padding: '8px 14px', borderRadius: '12px', background: 'var(--bg-secondary)', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} color="#8b5cf6" />
              <span>AI Tutor đang soạn câu trả lời...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', marginTop: '8px' }}>
          <input
            type="text"
            placeholder={mode === 'explain' ? 'Hỏi AI giải thích kiến thức...' : mode === 'hint' ? 'Nhập câu hỏi để nhận gợi ý từng bước...' : 'Nhập câu trả lời để AI chấm điểm...'}
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            style={{
              flex: 1,
              padding: '10px 14px',
              fontSize: '0.84rem',
              borderRadius: '12px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)'
            }}
          />
          <button
            onClick={() => handleSendMessage()}
            className="btn btn-primary"
            style={{ padding: '10px 16px', borderRadius: '12px', background: '#8b5cf6' }}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
