import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, X, Minimize2, Maximize2, Send,
  RotateCcw, Languages, ExternalLink
} from 'lucide-react';
import { useLanguage, SupportedLocale } from '../../i18n';
import { LanguageSelector } from '../ui/LanguageSelector';
import { soundFx } from '../../utils/audio';

export interface LoginMascotChatbotProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  onOpenForgotPassword: () => void;
  onOpenSupportModal: () => void;
  onSelectRole: (role: 'student' | 'teacher') => void;
}

interface ChatMessage {
  id: string;
  sender: 'mascot' | 'user';
  text: string;
  timestamp: string;
  originalText?: string;
  isTranslated?: boolean;
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
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initial welcome message localized
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'mascot',
      text: t('mascot.loginWelcome'),
      originalText: t('mascot.loginWelcome'),
      timestamp: 'Vừa xong'
    }
  ]);

  // Update initial welcome message when locale changes if no conversation yet
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [{
          id: 'welcome',
          sender: 'mascot',
          text: t('mascot.loginWelcome'),
          originalText: t('mascot.loginWelcome'),
          timestamp: 'Vừa xong'
        }];
      }
      return prev;
    });
  }, [currentLocale, t]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isOpen && !isMinimized) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Quick prompt buttons
  const quickPrompts = [
    { id: 'guide', label: t('mascot.loginPrompt1'), query: t('mascot.loginPrompt1') },
    { id: 'forgot', label: t('mascot.loginPrompt2'), query: t('mascot.loginPrompt2') },
    { id: 'support', label: t('mascot.loginPrompt3'), query: t('mascot.loginPrompt3') }
  ];

  /**
   * Generates safe, localized AI response adhering to strict security boundaries.
   */
  const generateResponse = (rawQuery: string): ChatMessage => {
    const q = rawQuery.toLowerCase();
    const time = formatTime(new Date()) || new Date().toLocaleTimeString();

    // Check if user requested an alternate language for this specific turn
    let targetLang = currentLocale;
    if (q.includes('english') || q.includes('tiếng anh') || q.includes('in english')) targetLang = 'en';
    else if (q.includes('chinese') || q.includes('tiếng trung') || q.includes('中文')) targetLang = 'zh';
    else if (q.includes('japanese') || q.includes('tiếng nhật') || q.includes('日本語')) targetLang = 'ja';
    else if (q.includes('korean') || q.includes('tiếng hàn') || q.includes('한국어')) targetLang = 'ko';
    else if (q.includes('tiếng việt') || q.includes('vietnamese')) targetLang = 'vi';

    // ── BOUNDARY 1: STRICT PROHIBITION ON PASSWORDS ──
    if (
      q.includes('mật khẩu') || q.includes('password') || q.includes('pass') ||
      q.includes('mật mã') || q.includes('密码') || q.includes('パスワード') || q.includes('비밀번호')
    ) {
      if (q.includes('quên') || q.includes('forgot') || q.includes('lấy lại') || q.includes('reset') || q.includes('找回')) {
        const msgs: Record<SupportedLocale, string> = {
          vi: 'Để lấy lại mật khẩu, bạn vui lòng nhấn vào liên kết "Quên mật khẩu?" ngay bên dưới biểu mẫu hoặc nhấn nút dưới đây để mở quy trình khôi phục an toàn bằng OTP.',
          en: 'To reset your password, please click the "Forgot password?" link below the login form or use the button below to start the secure OTP recovery process.',
          zh: '如需找回密码，请点击登录表单下方的“忘记密码？”链接，或点击下方按钮启动 OTP 安全恢复流程。',
          ja: 'パスワードを再設定するには、ログインフォーム下の「パスワードをお忘れですか？」をクリックするか、以下のボタンから安全なOTP認証手続きを行ってください。',
          ko: '비밀번호를 재설정하려면 로그인 양식 아래의 "비밀번호를 잊으셨나요?" 링크를 클릭하시거나 아래 버튼을 눌러 안전한 OTP 복구 절차를 진행하세요.'
        };
        return {
          id: `m-${Date.now()}`,
          sender: 'mascot',
          text: msgs[targetLang],
          originalText: msgs[targetLang],
          timestamp: time,
          actionButton: {
            label: t('auth.forgotPassword'),
            onClick: onOpenForgotPassword
          }
        };
      }

      // Prohibited request asking for passwords
      const msgs: Record<SupportedLocale, string> = {
        vi: '🛡️ NGUYÊN TẮC BẢO MẬT: Trợ lý AI tuyệt đối không truy xuất, không hiển thị và không lưu trữ mật khẩu của bất kỳ tài khoản nào. Vui lòng không chia sẻ mật khẩu của bạn cho bất kỳ ai.',
        en: '🛡️ SECURITY POLICY: The AI Assistant strictly never accesses, displays, or stores passwords of any account. Please do not share your password with anyone.',
        zh: '🛡️ 安全准则：AI 助手严格禁止访问、显示或存储任何账户的密码。请勿向任何人透露您的密码。',
        ja: '🛡️ セキュリティポリシー: AIアシスタントはパスワードの取得・表示・保存を厳格に禁止されています。パスワードを他人に共有しないでください。',
        ko: '🛡️ 보안 원칙: AI 어시스턴트는 어떠한 계정의 비밀번호도 조회, 표시 또는 저장하지 않습니다. 비밀번호를 타인과 공유하지 마세요.'
      };
      return {
        id: `m-${Date.now()}`,
        sender: 'mascot',
        text: msgs[targetLang],
        originalText: msgs[targetLang],
        timestamp: time
      };
    }

    // ── BOUNDARY 2: STRICT PROHIBITION ON DELETION OR ROLE ELEVATION ──
    if (
      q.includes('xóa tài khoản') || q.includes('delete') || q.includes('super admin') ||
      q.includes('cấp quyền') || q.includes('nâng quyền') || q.includes('删除') || q.includes('権限')
    ) {
      const msgs: Record<SupportedLocale, string> = {
        vi: '⚠️ AN TOÀN HỆ THỐNG: AI không có quyền tự ý xóa tài khoản hay cấp quyền quản trị. Mọi thao tác quản trị phải được phê duyệt bởi Quản trị viên cấp cao.',
        en: '⚠️ SYSTEM SAFETY: The AI has no permission to delete accounts or grant admin roles. All administrative operations must be approved by high-level administrators.',
        zh: '⚠️ 系统安全：AI 无权删除账户或授予管理员权限。所有管理权限均需由高级管理员审批。',
        ja: '⚠️ システム安全基準: AIにはアカウント削除や管理者権限の付与を行う権限はありません。すべての管理者操作は上位管理者による承認が必要です。',
        ko: '⚠️ 시스템 안전: AI는 계정 삭제나 관리자 권한 부여를 수행할 수 없습니다. 모든 관리자 작업은 상위 관리자의 승인이 필요합니다.'
      };
      return {
        id: `m-${Date.now()}`,
        sender: 'mascot',
        text: msgs[targetLang],
        originalText: msgs[targetLang],
        timestamp: time
      };
    }

    // ── PROMPT: LOGIN GUIDE / CỔNG ĐĂNG NHẬP ──
    if (q.includes('hướng dẫn') || q.includes('đăng nhập') || q.includes('guide') || q.includes('sign in') || q.includes('登录') || q.includes('ログイン') || q.includes('로그인')) {
      const msgs: Record<SupportedLocale, string> = {
        vi: 'Hướng dẫn đăng nhập:\n1. Chọn tab "Học viên" (nếu là học sinh/sinh viên) hoặc "Giảng viên" (nếu là giáo viên/nhân sự).\n2. Nhập Email hoặc Mã tài khoản đã được cấp.\n3. Nhập mật khẩu chính xác và bấm "Đăng nhập".\nNếu tài khoản tham gia nhiều môn học, hệ thống sẽ mở màn hình để bạn chọn môn.',
        en: 'Login Guide:\n1. Choose "Student" (for learners) or "Teacher" (for instructors/staff).\n2. Enter your assigned Email or Account ID.\n3. Enter your password and click "Sign In".\nIf enrolled in multiple tracks, a course picker will appear.',
        zh: '登录指南：\n1. 选择“学员”（针对学生）或“讲师”（针对教师/教工）。\n2. 输入分配的电子邮箱或账号。\n3. 输入密码并点击“登录”。\n如果参加了多个课程，系统会提示您选择课程。',
        ja: 'ログインのご案内:\n1. 「受講生」または「講師」タブを選択してください。\n2. 発行されたメールアドレスまたはIDを入力します。\n3. パスワードを入力し「ログイン」を押してください。\n複数コース受講中の場合はコース選択画面が表示されます。',
        ko: '로그인 안내:\n1. "수강생" 또는 "강사" 탭을 선택하세요.\n2. 발급받은 이메일 또는 계정 ID를 입력하세요.\n3. 비밀번호를 입력하고 "로그인"을 누르세요.\n여러 과정에 등록된 경우 과정 선택 화면이 나타납니다.'
      };
      return {
        id: `m-${Date.now()}`,
        sender: 'mascot',
        text: msgs[targetLang],
        originalText: msgs[targetLang],
        timestamp: time,
        actionButton: {
          label: t('auth.roleStudent'),
          onClick: () => onSelectRole('student')
        }
      };
    }

    // ── PROMPT: CONTACT ACADEMIC AFFAIRS ──
    if (q.includes('giáo vụ') || q.includes('hỗ trợ') || q.includes('liên hệ') || q.includes('support') || q.includes('academic') || q.includes('教务') || q.includes('問い合わせ') || q.includes('문의')) {
      const msgs: Record<SupportedLocale, string> = {
        vi: 'Phòng Giáo vụ Tin Học Gen Z hỗ trợ kỹ thuật và học tập:\n• Hotline / Zalo: 0987.654.321\n• Email: giaovu@tinhocgenz.edu.vn\n• Giờ làm việc: 08:00 - 21:00 (Thứ 2 - Thứ 7)',
        en: 'Tin Hoc Gen Z Academic Affairs Support:\n• Hotline / Zalo: 0987.654.321\n• Email: giaovu@tinhocgenz.edu.vn\n• Working hours: 08:00 - 21:00 (Mon - Sat)',
        zh: 'Tin Hoc Gen Z 教务处技术与学习支持：\n• 热线 / Zalo: 0987.654.321\n• 邮箱: giaovu@tinhocgenz.edu.vn\n• 服务时间: 08:00 - 21:00 (周一至周六)',
        ja: 'Tin Hoc Gen Z 教務課サポート:\n• ホットライン / Zalo: 0987.654.321\n• メール: giaovu@tinhocgenz.edu.vn\n• 営業時間: 08:00 - 21:00 (月〜土)',
        ko: 'Tin Hoc Gen Z 교무처 지원 센터:\n• 핫라인 / Zalo: 0987.654.321\n• 이메일: giaovu@tinhocgenz.edu.vn\n• 운영 시간: 08:00 - 21:00 (월~토)'
      };
      return {
        id: `m-${Date.now()}`,
        sender: 'mascot',
        text: msgs[targetLang],
        originalText: msgs[targetLang],
        timestamp: time,
        actionButton: {
          label: t('auth.contactAcademic'),
          onClick: onOpenSupportModal
        }
      };
    }

    // ── DEFAULT SAFE RESPONSE ──
    const msgs: Record<SupportedLocale, string> = {
      vi: `Em đã ghi nhận câu hỏi của bạn. Để được hỗ trợ cụ thể về tài khoản hoặc lớp học, bạn có thể bấm vào "Hướng dẫn đăng nhập", "Quên mật khẩu", hoặc liên hệ trực tiếp phòng Giáo vụ nhé!`,
      en: `I noted your question. For specific account assistance, feel free to use the quick guides above or reach out to Academic Affairs!`,
      zh: `我已收到您的问题。如需有关账号或课程的具体协助，欢迎点击上方快捷指南或直接联系教务处！`,
      ja: `ご質問を承りました。アカウントや受講に関する詳細は、上部のクイックガイドまたは教務課へお気軽にお問い合わせください！`,
      ko: `질문을 확인했습니다. 계정이나 수업에 관한 자세한 안내는 상단의 빠른 가이드를 이용하시거나 교무처로 문의해 주세요!`
    };
    return {
      id: `m-${Date.now()}`,
      sender: 'mascot',
      text: msgs[targetLang],
      originalText: msgs[targetLang],
      timestamp: time
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!query) return;

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

    setTimeout(() => {
      const resp = generateResponse(query);
      setMessages(prev => [...prev, resp]);
    }, 300);
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
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0057B8 0%, #003F88 100%)',
              color: '#FFFFFF',
              border: '2.5px solid #FFFFFF',
              boxShadow: '0 8px 24px rgba(0, 87, 184, 0.35)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              animation: 'gentle-bounce 3.5s infinite ease-in-out'
            }}
          >
            <Bot size={28} />
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
            width: isMinimized ? '280px' : '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: isMinimized ? '54px' : '560px',
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
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#0057B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Bot size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t('mascot.name') || 'Trợ lý Gen Z'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                  {t('mascot.subtitle') || 'Trực tuyến 24/7'}
                </div>
              </div>
            </div>

            {/* Actions: LanguageSelector & Min/Close */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
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
                        maxWidth: '85%',
                        padding: '10px 14px',
                        borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        background: msg.sender === 'user' ? '#0057B8' : '#FFFFFF',
                        color: msg.sender === 'user' ? '#FFFFFF' : '#0B2545',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
                        border: msg.sender === 'user' ? 'none' : '1px solid #E2E8F0',
                        fontSize: '0.84rem',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-line',
                        wordBreak: 'break-word'
                      }}
                    >
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

                    {/* Timestamp & Translate toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', padding: '0 4px' }}>
                      <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{msg.timestamp}</span>
                      {msg.sender === 'mascot' && (
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
                    </div>
                  </div>
                ))}
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
                    onClick={() => handleSendMessage(p.query)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      borderRadius: '16px',
                      background: '#F4F8FD',
                      border: '1px solid rgba(0, 87, 184, 0.2)',
                      color: '#0057B8',
                      cursor: 'pointer',
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
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('mascot.loginInputPlaceholder') || 'Nhập câu hỏi…'}
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
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};
