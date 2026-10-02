import React, { useState, useRef, useEffect } from 'react';
import {
  X, Minimize2, Maximize2, Send,
  RotateCcw, Copy, Check, ThumbsUp, ThumbsDown,
  Square, Database
} from 'lucide-react';
import { useLanguage } from '../../i18n';
import { LanguageSelector } from '../ui/LanguageSelector';
import { soundFx } from '../../utils/audio';
import { AIChatService, AIChatSource, AIChatMessage } from '../../services/aiChatService';
import { PORTAL_TOKENS } from '../../styles/portalDesignTokens';
import { MascotChatbotButton } from './MascotChatbotButton';

export interface GenZMascotChatbotProps {
  role?: 'student' | 'teacher' | 'admin' | 'guest';
  userId?: string;
  userName?: string;
  isOpen?: boolean;
  onToggleOpen?: () => void;
  initialPrompt?: string;
}

export const GenZMascotChatbot: React.FC<GenZMascotChatbotProps> = ({
  role = 'student',
  userId = 'default_user',
  userName: _userName = 'Bạn',
  isOpen: controlledIsOpen,
  onToggleOpen: controlledToggleOpen,
  initialPrompt
}) => {
  const { currentLocale } = useLanguage();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeSourcesModal, setActiveSourcesModal] = useState<AIChatSource[] | null>(null);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const handleToggle = () => {
    if (controlledToggleOpen) {
      controlledToggleOpen();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const storageKey = `portal_mascot_${role}_${userId}`;

  // 1. Initial messages - Standardized welcome per Section 4
  const defaultWelcomeText =
    'Xin chào! Tôi là Trợ lý Gen Z. Tôi có thể giúp bạn sử dụng hệ thống, tìm khóa học, kiểm tra lịch học và giải đáp thắc mắc.';

  const [messages, setMessages] = useState<AIChatMessage[]>(() => {
    const saved = AIChatService.getStoredHistory(storageKey);
    if (saved && saved.length > 0) return saved;

    return [
      {
        id: 'welcome',
        sender: 'mascot',
        text: defaultWelcomeText,
        originalText: defaultWelcomeText,
        timestamp: 'Vừa xong'
      }
    ];
  });

  // Save history on changes
  useEffect(() => {
    if (messages.length > 0) {
      AIChatService.saveHistory(storageKey, messages);
    }
  }, [messages, storageKey]);

  // Handle external initialPrompt if passed
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt.trim());
    }
  }, [initialPrompt]);

  // Auto scroll
  useEffect(() => {
    if (isOpen && !isMinimized) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isThinking]);

  // Exact quick suggestions required in Section 4
  const studentPrompts = [
    'Hướng dẫn tôi vào khóa học',
    'Tôi đang học đến đâu?',
    'Bài tiếp theo của tôi là gì?',
    'Tôi quên mật khẩu',
    'Hướng dẫn xem chứng chỉ',
    'Giải thích khóa học này.',
    'Hướng dẫn nộp bài.'
  ];

  const teacherPrompts = [
    'Tóm tắt tiến độ lớp học',
    'Học viên nào chưa nộp bài?',
    'Hướng dẫn điểm danh',
    'Hướng dẫn tạo bài tập.',
    'Bài nào đang chờ chấm?',
    'Lớp nào sắp có bài cần chấm?',
    'Tóm tắt tiến độ lớp của tôi.',
    'Tạo thông báo cho lớp.'
  ];

  const quickPrompts = role === 'teacher' ? teacherPrompts : studentPrompts;

  /**
   * Send message to backend Gemini Pro endpoint
   */
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isThinking) return;

    soundFx.playClick();
    const userMsgId = `user_${Date.now()}`;
    const userMsg: AIChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date())
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await AIChatService.sendMessage(
        textToSend.trim(),
        role,
        currentLocale,
        abortControllerRef.current.signal
      );

      const botMsgId = `mascot_${Date.now()}`;
      const botMsg: AIChatMessage = {
        id: botMsgId,
        sender: 'mascot',
        text: response.reply,
        originalText: response.reply,
        sources: response.sources,
        timestamp: new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
        error: !response.success
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const errMsg: AIChatMessage = {
          id: `err_${Date.now()}`,
          sender: 'mascot',
          text: 'Lỗi kết nối đến máy chủ AI. Vui lòng thử lại sau giây lát.',
          timestamp: 'Vừa xong',
          error: true
        };
        setMessages(prev => [...prev, errMsg]);
      }
    } finally {
      setIsThinking(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsThinking(false);
  };

  const handleClearHistory = () => {
    AIChatService.clearHistory(storageKey);
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: 'mascot',
        text: defaultWelcomeText,
        timestamp: 'Vừa xong'
      }
    ]);
  };

  const handleCopyMessage = (msgId: string, text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleRateMessage = (msgId: string, rating: 'like' | 'dislike') => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, rating } : m));
    AIChatService.recordRating(msgId, rating);
  };

  return (
    <>
      {/* ── 1. FLOATING LAUNCHER (BOTTOM-RIGHT) ── */}
      {!isOpen && (
        <MascotChatbotButton
          onClick={handleToggle}
          isOpen={false}
          isThinking={isThinking}
          tooltipText="Bạn cần hỗ trợ?"
        />
      )}

      {/* ── 2. CHAT PANEL (DESKTOP 380px / MOBILE BOTTOM SHEET) ── */}
      {isOpen && (
        <div
          className="portal-mascot-panel"
          style={{
            position: 'fixed',
            bottom: isMinimized ? '22px' : '20px',
            right: '22px',
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: isMinimized ? '56px' : '560px',
            maxHeight: 'calc(100vh - 40px)',
            backgroundColor: PORTAL_TOKENS.colors.card,
            borderRadius: PORTAL_TOKENS.radii.lg,
            border: `1px solid ${PORTAL_TOKENS.colors.border}`,
            boxShadow: PORTAL_TOKENS.shadows.dropdown,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 950,
            overflow: 'hidden',
            fontFamily: PORTAL_TOKENS.typography.fontFamily,
            transition: 'height 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s ease'
          }}
        >
          {/* Header */}
          <div
            style={{
              height: '56px',
              padding: '0 16px',
              borderBottom: `1px solid ${PORTAL_TOKENS.colors.border}`,
              backgroundColor: PORTAL_TOKENS.colors.card,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Mascot Robot Avatar from chatbot.ai.png */}
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid rgba(0, 87, 184, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2px',
                  boxShadow: '0 1px 4px rgba(0, 87, 184, 0.12)',
                  flexShrink: 0
                }}
              >
                <img
                  src="/chatbot.ai.png"
                  alt="Mascot Trợ lý Gen Z"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                  onError={(e) => {
                    e.currentTarget.src = '/assets/chatbot.ai.png';
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: PORTAL_TOKENS.colors.text }}>
                  Trợ lý Gen Z
                </div>
                <div style={{ fontSize: '11px', color: PORTAL_TOKENS.colors.success, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: PORTAL_TOKENS.colors.success }} />
                  Đang trực tuyến
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Synchronized Language selector dropdown */}
              <LanguageSelector variant="compact" />

              {/* Clear history button */}
              <button
                onClick={handleClearHistory}
                title="Xóa đoạn hội thoại"
                style={{
                  background: 'none',
                  border: 'none',
                  color: PORTAL_TOKENS.colors.textMuted,
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <RotateCcw size={15} />
              </button>

              {/* Minimize button */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
                style={{
                  background: 'none',
                  border: 'none',
                  color: PORTAL_TOKENS.colors.textMuted,
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>

              {/* Close button */}
              <button
                onClick={handleToggle}
                title="Đóng chat"
                style={{
                  background: 'none',
                  border: 'none',
                  color: PORTAL_TOKENS.colors.textMuted,
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Message History */}
              <div
                style={{
                  flex: 1,
                  padding: '16px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  backgroundColor: PORTAL_TOKENS.colors.background
                }}
              >
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: isUser ? '0' : '8px',
                        alignSelf: isUser ? 'flex-end' : 'flex-start',
                        maxWidth: '88%'
                      }}
                    >
                      {!isUser && (
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: '#FFFFFF',
                            border: '1.5px solid rgba(0, 87, 184, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2px',
                            flexShrink: 0,
                            marginTop: '2px',
                            boxShadow: '0 1px 3px rgba(0, 87, 184, 0.1)'
                          }}
                        >
                          <img
                            src="/chatbot.ai.png"
                            alt="Mascot Trợ lý Gen Z"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={(e) => { e.currentTarget.src = '/assets/chatbot.ai.png'; }}
                          />
                        </div>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isUser ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div
                          style={{
                            padding: '10px 14px',
                            borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                            backgroundColor: isUser ? PORTAL_TOKENS.colors.primary : PORTAL_TOKENS.colors.card,
                            color: isUser ? '#FFFFFF' : PORTAL_TOKENS.colors.text,
                            border: isUser ? 'none' : `1px solid ${PORTAL_TOKENS.colors.border}`,
                            fontSize: '13px',
                            lineHeight: 1.5,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                            wordBreak: 'break-word'
                          }}
                        >
                          {msg.text}
                        </div>

                        {/* Message Footer Actions */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginTop: '4px',
                            fontSize: '10px',
                            color: PORTAL_TOKENS.colors.textMuted
                          }}
                        >
                          <span>{msg.timestamp}</span>

                          {!isUser && (
                            <>
                              <button
                                onClick={() => handleCopyMessage(msg.id, msg.text)}
                                title="Sao chép"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px', color: PORTAL_TOKENS.colors.textMuted }}
                              >
                                {copiedId === msg.id ? <Check size={12} color={PORTAL_TOKENS.colors.success} /> : <Copy size={12} />}
                              </button>

                              <button
                                onClick={() => handleRateMessage(msg.id, 'like')}
                                title="Hữu ích"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px', color: msg.rating === 'like' ? PORTAL_TOKENS.colors.primary : PORTAL_TOKENS.colors.textMuted }}
                              >
                                <ThumbsUp size={12} />
                              </button>

                              <button
                                onClick={() => handleRateMessage(msg.id, 'dislike')}
                                title="Chưa hữu ích"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px', color: msg.rating === 'dislike' ? PORTAL_TOKENS.colors.error : PORTAL_TOKENS.colors.textMuted }}
                              >
                                <ThumbsDown size={12} />
                              </button>

                              {msg.sources && msg.sources.length > 0 && (
                                <button
                                  onClick={() => setActiveSourcesModal(msg.sources!)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: PORTAL_TOKENS.colors.primary,
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '2px'
                                  }}
                                >
                                  <Database size={11} /> Nguồn ({msg.sources.length})
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Thinking Indicator with mascot avatar & bouncing dots */}
                {isThinking && (
                  <div
                    style={{
                      alignSelf: 'flex-start',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      backgroundColor: PORTAL_TOKENS.colors.card,
                      borderRadius: '12px',
                      border: `1px solid ${PORTAL_TOKENS.colors.border}`,
                      fontSize: '12px',
                      color: PORTAL_TOKENS.colors.primary,
                      boxShadow: '0 1px 3px rgba(0, 87, 184, 0.08)'
                    }}
                  >
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid rgba(0, 87, 184, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1.5px',
                        flexShrink: 0
                      }}
                    >
                      <img
                        src="/chatbot.ai.png"
                        alt="Mascot"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => { e.currentTarget.src = '/assets/chatbot.ai.png'; }}
                      />
                    </div>
                    <span>Trợ lý Gen Z đang trả lời</span>
                    <span style={{ display: 'inline-flex', gap: '3px', alignItems: 'center' }}>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#0057B8', animation: 'mascotDotBounce 1.2s infinite ease-in-out' }} />
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#0057B8', animation: 'mascotDotBounce 1.2s infinite ease-in-out 0.2s' }} />
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#0057B8', animation: 'mascotDotBounce 1.2s infinite ease-in-out 0.4s' }} />
                    </span>
                    <button
                      onClick={handleStopGeneration}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: PORTAL_TOKENS.colors.error,
                        cursor: 'pointer',
                        fontWeight: 600,
                        marginLeft: '4px'
                      }}
                    >
                      Dừng
                    </button>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: PORTAL_TOKENS.colors.card,
                  borderTop: `1px solid ${PORTAL_TOKENS.colors.border}`,
                  overflowX: 'auto',
                  display: 'flex',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: PORTAL_TOKENS.radii.sm,
                      backgroundColor: '#F8FAFC',
                      border: `1px solid ${PORTAL_TOKENS.colors.border}`,
                      fontSize: '11.5px',
                      color: PORTAL_TOKENS.colors.textSecondary,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }}
                style={{
                  padding: '12px',
                  backgroundColor: PORTAL_TOKENS.colors.card,
                  borderTop: `1px solid ${PORTAL_TOKENS.colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(inputText);
                    }
                  }}
                  placeholder="Đặt câu hỏi cho Trợ lý Gen Z..."
                  rows={1}
                  style={{
                    flex: 1,
                    resize: 'none',
                    height: '38px',
                    padding: '8px 12px',
                    borderRadius: PORTAL_TOKENS.radii.sm,
                    border: `1px solid ${PORTAL_TOKENS.colors.border}`,
                    fontSize: '13px',
                    color: PORTAL_TOKENS.colors.text,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />

                {isThinking ? (
                  <button
                    type="button"
                    onClick={handleStopGeneration}
                    title="Dừng tạo câu trả lời"
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: PORTAL_TOKENS.radii.sm,
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Square size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: PORTAL_TOKENS.radii.sm,
                      backgroundColor: inputText.trim() ? PORTAL_TOKENS.colors.primary : '#E2E8F0',
                      color: '#FFFFFF',
                      border: 'none',
                      cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Send size={16} />
                  </button>
                )}
              </form>
            </>
          )}

          {/* Sources Modal */}
          {activeSourcesModal && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(11, 37, 69, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                zIndex: 990
              }}
            >
              <div
                style={{
                  backgroundColor: PORTAL_TOKENS.colors.card,
                  borderRadius: PORTAL_TOKENS.radii.md,
                  padding: '20px',
                  width: '100%',
                  maxHeight: '80%',
                  overflowY: 'auto'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: PORTAL_TOKENS.colors.text }}>
                    Nguồn tài liệu tham khảo
                  </h4>
                  <button
                    onClick={() => setActiveSourcesModal(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: PORTAL_TOKENS.colors.textMuted }}
                  >
                    <X size={16} />
                  </button>
                </div>
                {activeSourcesModal.map((src, i) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: `1px solid ${PORTAL_TOKENS.colors.divider}`, fontSize: '12px' }}>
                    <div style={{ fontWeight: 600, color: PORTAL_TOKENS.colors.primary }}>{src.title}</div>
                    <div style={{ color: PORTAL_TOKENS.colors.textSecondary, marginTop: '2px' }}>{src.snippet}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes mascotDotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
        @media (max-width: 640px) {
          .portal-mascot-panel {
            bottom: 0 !important;
            right: 0 !important;
            left: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: 92vh !important;
            max-height: 92vh !important;
            border-bottom-left-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
          }
        }
      `}</style>
    </>
  );
};
