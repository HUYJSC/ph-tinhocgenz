import React, { useState, useRef, useEffect } from 'react';
import {
  X, Minimize2, Maximize2, Send,
  RotateCcw, Languages, ExternalLink, Copy, Check,
  ThumbsUp, ThumbsDown, Square, Loader2, Database,
  Trash2, AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../i18n';
import { LanguageSelector } from '../ui/LanguageSelector';
import { soundFx } from '../../utils/audio';
import { AIChatService, AIChatSource } from '../../services/aiChatService';

export interface LoginMascotChatbotProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  onOpenForgotPassword: () => void;
  onOpenSupportModal: () => void;
  onSelectRole: (role: 'student' | 'teacher') => void;
}

export interface ChatMessage {
  id: string;
  sender: 'mascot' | 'user';
  text: string;
  timestamp: string;
  originalText?: string;
  isTranslated?: boolean;
  sources?: AIChatSource[];
  rating?: 'like' | 'dislike';
  error?: boolean;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export const LoginMascotChatbot: React.FC<LoginMascotChatbotProps> = ({
  isOpen,
  onToggleOpen,
  onOpenForgotPassword,
  onOpenSupportModal,
  onSelectRole
}) => {
  const { currentLocale, t, formatTime } = useLanguage();
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [activeSourcesModal, setActiveSourcesModal] = useState<AIChatSource[] | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load stored history or default welcome message
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = AIChatService.getStoredHistory('login_mascot');
    if (saved && saved.length > 0) return saved as ChatMessage[];

    return [
      {
        id: 'welcome',
        sender: 'mascot',
        text: t('mascot.loginWelcome') || 'Xin chào! Tôi có thể giúp bạn đăng nhập.',
        originalText: t('mascot.loginWelcome') || 'Xin chào! Tôi có thể giúp bạn đăng nhập.',
        timestamp: 'Vừa xong'
      }
    ];
  });

  // Save history on change
  useEffect(() => {
    if (messages.length > 0) {
      AIChatService.saveHistory('login_mascot', messages as any);
    }
  }, [messages]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isOpen && !isMinimized) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isThinking]);

  // Quick prompt buttons
  const quickPrompts = [
    { id: 'guide', label: t('mascot.loginPrompt1') || 'Hướng dẫn đăng nhập', query: t('mascot.loginPrompt1') || 'Hướng dẫn đăng nhập' },
    { id: 'forgot', label: t('mascot.loginPrompt2') || 'Quên mật khẩu', query: t('mascot.loginPrompt2') || 'Quên mật khẩu' },
    { id: 'support', label: t('mascot.loginPrompt3') || 'Liên hệ Giáo vụ', query: t('mascot.loginPrompt3') || 'Liên hệ Giáo vụ' }
  ];

  /**
   * Stop AI generation
   */
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsThinking(false);
    soundFx.playClick();
  };

  /**
   * Clear personal conversation history
   */
  const handleClearHistory = () => {
    soundFx.playClick();
    AIChatService.clearHistory('login_mascot');
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'mascot',
        text: t('mascot.loginWelcome') || 'Xin chào! Tôi có thể giúp bạn đăng nhập.',
        originalText: t('mascot.loginWelcome') || 'Xin chào! Tôi có thể giúp bạn đăng nhập.',
        timestamp: 'Vừa xong'
      }
    ]);
  };

  /**
   * Copy message text
   */
  const handleCopyMessage = (msgId: string, text: string) => {
    soundFx.playClick();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  /**
   * Rate message helpful / unhelpful
   */
  const handleRateMessage = (msgId: string, rating: 'like' | 'dislike') => {
    soundFx.playClick();
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, rating } : m));
    AIChatService.recordRating(msgId, rating);
  };

  /**
   * Core Send Message Routine connecting to Gemini API Backend
   * RÀO CHẮN AN NINH AI: NGUYÊN TẮC BẢO MẬT (không lộ mật khẩu) & AN TOÀN HỆ THỐNG (không tự ý nâng quyền).
   */
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!query || isThinking) return;

    soundFx.playClick();
    const time = formatTime(new Date()) || new Date().toLocaleTimeString();

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      originalText: query,
      timestamp: time
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Call backend Gemini AI endpoint POST /api/ai/chat
      const aiResponse = await AIChatService.sendMessage(query, currentLocale, abortController.signal);

      if (!abortController.signal.aborted) {
        setIsThinking(false);
        abortControllerRef.current = null;

        if (aiResponse.success) {
          // Check if specific action buttons apply
          let actionButton: ChatMessage['actionButton'];
          const qLower = query.toLowerCase();
          if (qLower.includes('quên') || qLower.includes('mật khẩu') || qLower.includes('reset')) {
            actionButton = {
              label: t('auth.forgotPassword') || 'Quên mật khẩu?',
              onClick: onOpenForgotPassword
            };
          } else if (qLower.includes('hướng dẫn') || qLower.includes('đăng nhập') || qLower.includes('cổng')) {
            actionButton = {
              label: t('auth.roleStudent') || 'Cổng Học viên',
              onClick: () => onSelectRole('student')
            };
          } else if (qLower.includes('giáo vụ') || qLower.includes('liên hệ') || qLower.includes('hỗ trợ')) {
            actionButton = {
              label: t('auth.contactAcademic') || 'Liên hệ Giáo vụ',
              onClick: onOpenSupportModal
            };
          }

          const botMsg: ChatMessage = {
            id: `m-${Date.now()}`,
            sender: 'mascot',
            text: aiResponse.reply || aiResponse.response || '',
            originalText: aiResponse.reply || aiResponse.response || '',
            timestamp: formatTime(new Date()) || new Date().toLocaleTimeString(),
            sources: aiResponse.sources,
            actionButton
          };

          setMessages(prev => [...prev, botMsg]);
          soundFx.playVictory();
        } else {
          // Failure message with retry option
          const errorMsg: ChatMessage = {
            id: `err-${Date.now()}`,
            sender: 'mascot',
            text: aiResponse.error || 'Dịch vụ AI đang bận hoặc gián đoạn kết nối. Vui lòng thử lại sau giây lát.',
            originalText: aiResponse.error,
            timestamp: formatTime(new Date()) || new Date().toLocaleTimeString(),
            error: true
          };
          setMessages(prev => [...prev, errorMsg]);
          soundFx.playIncorrect();
        }
      }
    } catch (err: any) {
      if (!abortController.signal.aborted) {
        setIsThinking(false);
        abortControllerRef.current = null;
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          sender: 'mascot',
          text: 'Lỗi kết nối đến máy chủ AI. Vui lòng thử lại sau giây lát.',
          timestamp: formatTime(new Date()) || new Date().toLocaleTimeString(),
          error: true
        };
        setMessages(prev => [...prev, errorMsg]);
        soundFx.playIncorrect();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Toggle Translate / Show Original for a message
  const handleToggleTranslate = (msgId: string) => {
    soundFx.playClick();
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      if (m.isTranslated) {
        return { ...m, isTranslated: false, text: m.originalText || m.text };
      } else {
        return {
          ...m,
          isTranslated: true,
          text: currentLocale === 'vi'
            ? `[Bản dịch tiếng Việt]: ${m.originalText || m.text}`
            : `[Translated to ${currentLocale.toUpperCase()}]: ${m.originalText || m.text}`
        };
      }
    }));
  };

  return (
    <>
      {/* ── FLOATING BUTTON (COLLAPSED) ── */}
      {!isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {/* Tooltip */}
          {showTooltip && (
            <div
              style={{
                position: 'absolute',
                bottom: '66px',
                right: '0',
                background: '#0B2545',
                color: '#FFFFFF',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                animation: 'fade-in 0.15s ease'
              }}
            >
              {t('mascot.loginTooltip')}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onToggleOpen();
            }}
            aria-label={t('mascot.loginTooltip')}
            title={t('mascot.loginTooltip')}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#FFFFFF',
              border: '1.5px solid #0057B8',
              boxShadow: '0 8px 24px rgba(0, 87, 184, 0.25), 0 2px 6px rgba(0, 0, 0, 0.08)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              padding: '6px',
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease',
              animation: 'gentle-bounce 3.5s infinite ease-in-out'
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
            {/* Green Online Dot */}
            <span
              style={{
                position: 'absolute',
                top: '3px',
                right: '3px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#16803C',
                border: '2px solid #FFFFFF'
              }}
            />
          </button>
        </div>
      )}

      {/* ── EXPANDED CHAT PANEL ── */}
      {isOpen && (
        <div
          role="complementary"
          aria-label="Trợ lý Gen Z"
          className="login-mascot-panel"
          style={{
            position: 'fixed',
            bottom: isMinimized ? '24px' : '24px',
            right: '24px',
            width: isMinimized ? '280px' : '390px',
            maxWidth: 'calc(100vw - 32px)',
            height: isMinimized ? '54px' : '580px',
            maxHeight: 'calc(100vh - 48px)',
            background: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 12px 36px rgba(0, 63, 136, 0.18), 0 2px 8px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1000,
            transition: 'height 0.25s ease, width 0.25s ease'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 14px',
              background: '#0B2545',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}
          >
            {/* Avatar & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  border: '1.5px solid rgba(255, 255, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
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
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t('mascot.name') || 'Trợ lý Gen Z'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                  {t('mascot.subtitle') || 'Trực tuyến 24/7 • Gemini Pro'}
                </div>
              </div>
            </div>

            {/* Actions: Clear, LanguageSelector & Min/Close */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              {/* Clear History */}
              <button
                type="button"
                onClick={handleClearHistory}
                title="Xóa lịch sử hội thoại"
                aria-label="Xóa lịch sử hội thoại"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px'
                }}
              >
                <Trash2 size={15} />
              </button>

              {/* Language Selector Dropdown inside Chatbot Header */}
              <LanguageSelector variant="chatbot" />

              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                aria-label={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px'
                }}
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>

              <button
                type="button"
                onClick={onToggleOpen}
                aria-label="Đóng"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px'
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body (only if not minimized) */}
          {!isMinimized && (
            <>
              {/* Message List */}
              <div
                style={{
                  flex: 1,
                  padding: '14px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  background: '#F8FAFC'
                }}
              >
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      width: '100%'
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '88%',
                        padding: '10px 14px',
                        borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        background: msg.sender === 'user' ? '#0057B8' : msg.error ? '#FEF3F2' : '#FFFFFF',
                        color: msg.sender === 'user' ? '#FFFFFF' : msg.error ? '#B42318' : '#0B2545',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
                        border: msg.sender === 'user' ? 'none' : msg.error ? '1px solid #FECDCA' : '1px solid #E2E8F0',
                        fontSize: '0.84rem',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-line',
                        wordBreak: 'break-word',
                        position: 'relative'
                      }}
                    >
                      {msg.error && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 600 }}>
                          <AlertCircle size={14} />
                          <span>Thông báo kết nối</span>
                        </div>
                      )}

                      {msg.text}

                      {/* Action button if attached */}
                      {msg.actionButton && (
                        <div style={{ marginTop: '8px' }}>
                          <button
                            type="button"
                            onClick={msg.actionButton.onClick}
                            style={{
                              background: '#0057B8',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span>{msg.actionButton.label}</span>
                            <ExternalLink size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Metadata & Message Actions Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', padding: '0 4px' }}>
                      <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{msg.timestamp}</span>

                      {/* Copy Button */}
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        title="Sao chép câu trả lời"
                        aria-label="Sao chép"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: copiedId === msg.id ? '#16803C' : '#94A3B8',
                          fontSize: '0.68rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          padding: 0
                        }}
                      >
                        {copiedId === msg.id ? <Check size={11} /> : <Copy size={11} />}
                      </button>

                      {/* Translate button */}
                      {msg.sender === 'mascot' && !msg.error && (
                        <button
                          type="button"
                          onClick={() => handleToggleTranslate(msg.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0057B8',
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px',
                            padding: 0
                          }}
                        >
                          {msg.isTranslated ? <RotateCcw size={10} /> : <Languages size={10} />}
                          <span>{msg.isTranslated ? t('mascot.showOriginal') : t('mascot.translate')}</span>
                        </button>
                      )}

                      {/* View Sources Button */}
                      {msg.sources && msg.sources.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveSourcesModal(msg.sources || null)}
                          title="Xem nguồn dữ liệu đã dùng"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0057B8',
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px',
                            padding: 0
                          }}
                        >
                          <Database size={10} />
                          <span>{msg.sources.length} nguồn</span>
                        </button>
                      )}

                      {/* Feedback Thumbs Up / Down */}
                      {msg.sender === 'mascot' && !msg.error && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleRateMessage(msg.id, 'like')}
                            title="Hữu ích"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: msg.rating === 'like' ? '#16803C' : '#94A3B8',
                              cursor: 'pointer',
                              padding: 0
                            }}
                          >
                            <ThumbsUp size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRateMessage(msg.id, 'dislike')}
                            title="Chưa hữu ích"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: msg.rating === 'dislike' ? '#D92D20' : '#94A3B8',
                              cursor: 'pointer',
                              padding: 0
                            }}
                          >
                            <ThumbsDown size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Thinking / Streaming Indicator with Stop button */}
                {isThinking && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', width: 'fit-content' }}>
                    <Loader2 size={16} className="animate-spin" color="#0057B8" />
                    <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>
                      Trợ lý Gen Z đang suy nghĩ…
                    </span>
                    <button
                      type="button"
                      onClick={handleStopGeneration}
                      title="Dừng tạo câu trả lời"
                      style={{
                        background: '#FEF3F2',
                        border: '1px solid #FECDCA',
                        color: '#B42318',
                        borderRadius: '6px',
                        padding: '2px 6px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <Square size={10} />
                      <span>Dừng</span>
                    </button>
                  </div>
                )}

                <div ref={chatBottomRef} />
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
                {quickPrompts.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    disabled={isThinking}
                    onClick={() => handleSendMessage(p.query)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      borderRadius: '16px',
                      background: '#F4F8FD',
                      border: '1px solid rgba(0, 87, 184, 0.2)',
                      color: '#0057B8',
                      cursor: isThinking ? 'not-allowed' : 'pointer',
                      flexShrink: 0
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Chat Input Field */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
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
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={inputText}
                  disabled={isThinking}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('mascot.loginInputPlaceholder') || 'Nhập câu hỏi… (Enter để gửi)'}
                  style={{
                    flex: 1,
                    resize: 'none',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.84rem',
                    color: '#0B2545',
                    outline: 'none',
                    fontFamily: 'inherit',
                    lineHeight: 1.4,
                    maxHeight: '70px'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#0057B8')}
                  onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
                />

                {isThinking ? (
                  <button
                    type="button"
                    onClick={handleStopGeneration}
                    title="Dừng tạo câu trả lời"
                    aria-label="Dừng tạo câu trả lời"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: '#B42318',
                      color: '#FFFFFF',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    <Square size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    aria-label="Gửi tin nhắn"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: inputText.trim() ? '#0057B8' : '#CBD5E1',
                      color: '#FFFFFF',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: inputText.trim() ? 'pointer' : 'default',
                      flexShrink: 0
                    }}
                  >
                    <Send size={16} />
                  </button>
                )}
              </form>
            </>
          )}

          {/* Sources Inspection Modal */}
          {activeSourcesModal && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(11, 37, 69, 0.65)',
                backdropFilter: 'blur(3px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                zIndex: 1010
              }}
            >
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  width: '100%',
                  maxHeight: '80%',
                  padding: '16px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0B2545', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Database size={16} color="#0057B8" />
                    <span>Nguồn dữ liệu đã sử dụng</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSourcesModal(null)}
                    style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeSourcesModal.map((s, idx) => (
                    <div
                      key={s.id || idx}
                      style={{
                        padding: '10px',
                        background: '#F8FAFC',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        fontSize: '0.78rem'
                      }}
                    >
                      <div style={{ color: '#64748B', fontSize: '0.72rem', margin: '2px 0 4px 0' }}>
                        Loại: {s.type || s.sourceType} • Cập nhật: {s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : 'Gần đây'}
                      </div>
                      <div style={{ color: '#334155', fontStyle: 'italic', background: '#FFFFFF', padding: '6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                        "{s.snippet}"
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSourcesModal(null)}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    background: '#0057B8',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    marginTop: '4px'
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
