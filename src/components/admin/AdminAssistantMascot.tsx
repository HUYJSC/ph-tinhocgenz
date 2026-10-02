import React, { useState, useId, useMemo } from 'react';
import {
  X,
  Minimize2,
  Maximize2,
  Send,
  Languages,
  RotateCcw
} from 'lucide-react';
import { TeacherAccount, UserProfile } from '../../types/auth';
import { useLanguage, SupportedLocale } from '../../i18n';
import { LanguageSelector } from '../ui/LanguageSelector';
import { AIChatService } from '../../services/aiChatService';

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
  originalText?: string;
  isTranslated?: boolean;
  locale?: SupportedLocale;
  timestamp: string;
  type?: 'text' | 'action' | 'warning' | 'error';
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
  const { currentLocale, t, formatTime } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const inputId = useId();

  // Welcome message localized according to initial locale
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'mascot',
      text: t('mascot.welcome', { name: currentUser.name || 'Quản trị viên' }),
      originalText: t('mascot.welcome', { name: currentUser.name || 'Quản trị viên' }),
      locale: currentLocale,
      timestamp: 'Vừa xong'
    }
  ]);

  // 5 Prompt gợi ý nhanh: 'Tìm giảng viên', 'Kiểm tra tài khoản bị khóa', 'Hướng dẫn phân quyền', 'Tìm dữ liệu còn thiếu', 'Hướng dẫn thêm giảng viên'
  const quickPrompts = useMemo(() => [
    { id: 'p1', label: t('mascot.quickPrompt1'), query: t('mascot.quickPrompt1') },
    { id: 'p2', label: t('mascot.quickPrompt2'), query: t('mascot.quickPrompt2') },
    { id: 'p3', label: t('mascot.quickPrompt3'), query: t('mascot.quickPrompt3') },
    { id: 'p4', label: t('mascot.quickPrompt4'), query: t('mascot.quickPrompt4') },
    { id: 'p5', label: t('mascot.quickPrompt5'), query: t('mascot.quickPrompt5') }
  ], [t]);

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;

    const time = formatTime(new Date()) || new Date().toLocaleTimeString();

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: promptText,
      originalText: promptText,
      locale: currentLocale,
      timestamp: time
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Try calling backend Gemini AI service first
    try {
      const aiRes = await AIChatService.sendMessage(promptText.trim(), currentLocale);
      if (aiRes.success && aiRes.response) {
        const botResponse: ChatMessage = {
          id: `m-${Date.now()}`,
          sender: 'mascot',
          text: aiRes.response,
          originalText: aiRes.response,
          locale: currentLocale,
          timestamp: formatTime(new Date()) || new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, botResponse]);
        return;
      }
    } catch {}

    // Fallback to grounded localized response
    setTimeout(() => {
      const botResponse = generateLocalizedResponse(promptText.trim(), currentLocale);
      setMessages(prev => [...prev, botResponse]);
    }, 300);
  };

  /**
   * Helper to translate a single message in the chat history
   * toggles between translated text and original text.
   */
  const handleToggleTranslateMessage = (msgId: string) => {
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id !== msgId) return msg;

        if (msg.isTranslated) {
          // Switch back to original
          return {
            ...msg,
            text: msg.originalText || msg.text,
            isTranslated: false
          };
        } else {
          // Translate to current active language
          const translated = translateMessageContent(msg.originalText || msg.text, currentLocale);
          return {
            ...msg,
            text: translated,
            isTranslated: true
          };
        }
      })
    );
  };

  /**
   * Simple multi-language translator for message text
   */
  const translateMessageContent = (text: string, targetLocale: SupportedLocale): string => {
    if (targetLocale === 'en') {
      if (text.includes('Xin chào')) return `Hello! I am the Tin Hoc Gen Z AI Assistant.`;
      if (text.includes('NGUYÊN TẮC BẢO MẬT')) return `SECURITY POLICY: The AI Assistant strictly does not access, display, or store passwords.`;
      if (text.includes('AN TOÀN HỆ THỐNG')) return `SYSTEM SAFETY: AI cannot delete accounts or elevate permissions.`;
      if (text.includes('QUY TRÌNH THÊM')) return `GUIDE TO ADD TEACHERS: Click + Add Teacher, enter name and code, choose tracks, and save.`;
      return `[Translated to English]: ${text}`;
    }
    if (targetLocale === 'zh') {
      if (text.includes('Xin chào') || text.includes('Hello')) return `您好！我是 Tin Hoc Gen Z 的 AI 助手。`;
      if (text.includes('NGUYÊN TẮC BẢO MẬT') || text.includes('SECURITY')) return `安全准则：AI 助手严格禁止访问、显示或存储任何密码。`;
      if (text.includes('AN TOÀN HỆ THỐNG') || text.includes('SAFETY')) return `系统安全：AI 无权自行删除账户或提升管理员权限。`;
      return `[已翻译为简体中文]: ${text}`;
    }
    if (targetLocale === 'ja') {
      if (text.includes('Xin chào') || text.includes('Hello')) return `こんにちは！Tin Hoc Gen Z の AI アシスタントです。`;
      if (text.includes('NGUYÊN TẮC BẢO MẬT') || text.includes('SECURITY')) return `セキュリティポリシー: AIアシスタントはパスワードへのアクセスを禁止されています。`;
      if (text.includes('AN TOÀN HỆ THỐNG') || text.includes('SAFETY')) return `システム安全基準: AIはアカウント削除を行えません。`;
      return `[日本語に翻訳済み]: ${text}`;
    }
    if (targetLocale === 'ko') {
      if (text.includes('Xin chào') || text.includes('Hello')) return `안녕하세요! Tin Hoc Gen Z AI 어시스턴트입니다.`;
      if (text.includes('NGUYÊN TẮC BẢO MẬT') || text.includes('SECURITY')) return `보안 원칙: AI 어시스턴트는 비밀번호에 접근할 수 없습니다.`;
      if (text.includes('AN TOÀN HỆ THỐNG') || text.includes('SAFETY')) return `시스템 안전: AI는 계정을 임의로 삭제할 수 없습니다.`;
      return `[한국어로 번역됨]: ${text}`;
    }
    // Default Vietnamese
    return text;
  };

  /**
   * Generates response strictly adhering to Security Boundaries in the chosen language.
   */
  const generateLocalizedResponse = (query: string, defaultLocale: SupportedLocale): ChatMessage => {
    const q = query.toLowerCase();
    const time = formatTime(new Date()) || new Date().toLocaleTimeString();

    // Check if user requested an alternate language for this specific turn
    let targetLang = defaultLocale;
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
      const msgs: Record<SupportedLocale, string> = {
        vi: '🛡️ NGUYÊN TẮC BẢO MẬT: Trợ lý AI tuyệt đối không truy xuất, không hiển thị và không lưu trữ mật khẩu của bất kỳ tài khoản nào. Để cấp lại mật khẩu, Thầy/Cô vui lòng nhấn vào menu ba chấm (...) cạnh tài khoản và chọn "Đặt lại mật khẩu" có xác nhận 2 bước.',
        en: '🛡️ SECURITY POLICY: The AI Assistant strictly does not access, display, or store passwords of any account. To reissue credentials, please click the (...) menu next to the teacher and select "Reset Password" with two-step confirmation.',
        zh: '🛡️ 安全准则：AI 助手严格禁止访问、显示或存储任何账户的密码。如需重新颁发凭证，请点击账户旁的更多菜单 (...) 并选择具有二次确认的“重置密码”。',
        ja: '🛡️ セキュリティポリシー: AIアシスタントはアカウントのパスワード取得・表示・保存を厳格に禁止されています。再設定は該当アカウント横の（...）メニューより「パスワード再設定」をご利用ください。',
        ko: '🛡️ 보안 원칙: AI 어시스턴트는 어떠한 계정의 비밀번호도 조회, 표시 또는 저장하지 않습니다. 재발급을 원하시면 계정 옆의 (...) 메뉴에서 2단계 확인이 포함된 "비밀번호 재설정"을 진행해 주세요.'
      };
      return {
        id: `m-${Date.now()}`,
        sender: 'mascot',
        text: msgs[targetLang],
        originalText: msgs[targetLang],
        locale: targetLang,
        timestamp: time,
        type: 'warning'
      };
    }

    // ── BOUNDARY 2: STRICT PROHIBITION ON DELETION OR ROLE ELEVATION ──
    if (
      q.includes('xóa tài khoản') || q.includes('xóa') || q.includes('delete') ||
      q.includes('super admin') || q.includes('đổi role') || q.includes('删除') ||
      q.includes('削除') || q.includes('삭제')
    ) {
      const msgs: Record<SupportedLocale, string> = {
        vi: '⚠️ AN TOÀN HỆ THỐNG: AI không có quyền tự ý xóa tài khoản hay nâng cấp quyền Super Admin. Các thao tác này yêu cầu quyền Quản trị viên cấp cao và phải được thực hiện trực tiếp trên giao diện quản trị có ghi nhận nhật ký kiểm toán (Audit Trail).',
        en: '⚠️ SYSTEM SAFETY: The AI has no permission to delete accounts or elevate Super Admin rights. These operations require elevated admin rights and must be performed directly on the UI with Audit Trail logging.',
        zh: '⚠️ 系统安全：AI 无权自行删除账户或提升超级管理员权限。这些敏感操作需由高权限管理员直接在管理界面执行并记入审计跟踪日志。',
        ja: '⚠️ システム安全基準: AIにはアカウント削除やスーパー管理者への権限昇格を行う権限はありません。これらの操作は監査ログが記録される管理画面で直接実行する必要があります。',
        ko: '⚠️ 시스템 안전: AI는 계정 삭제나 최고 관리자 권한 부여를 수행할 수 없습니다. 이 작업은 감사 로그(Audit Trail)가 기록되는 관리 인터페이스에서 직접 수행되어야 합니다.'
      };
      return {
        id: `m-${Date.now()}`,
        sender: 'mascot',
        text: msgs[targetLang],
        originalText: msgs[targetLang],
        locale: targetLang,
        timestamp: time,
        type: 'warning'
      };
    }

    // ── PROMPT 1: FIND TEACHERS ──
    if (
      q.includes('tìm') || q.includes('find') || q.includes('search') ||
      q.includes('查找') || q.includes('検索') || q.includes('찾기')
    ) {
      const total = teacherAccounts.length;
      const msgs: Record<SupportedLocale, string> = {
        vi: `Hệ thống hiện có ${total} tài khoản giảng viên & nhân sự. Thầy/Cô có thể nhập tên hoặc mã GV vào thanh tìm kiếm phía trên để lọc nhanh, hoặc gõ tên GV vào đây để em tra cứu giúp!`,
        en: `The system currently has ${total} teacher & staff accounts. You can enter a name or code in the top search bar to filter quickly, or ask here to search!`,
        zh: `系统当前共有 ${total} 个讲师与人事账户。您可以在上方搜索栏输入姓名或代码快速筛选，或在此输入姓名由我协助查找！`,
        ja: `システムには現在 ${total} 件の講師・職員アカウントが登録されています。上部の検索バーで素早く絞り込むか、こちらに講師名を入力して検索してください！`,
        ko: `시스템에 현재 ${total}개의 강사 및 인사 계정이 등록되어 있습니다. 상단 검색창에 이름이나 코드를 입력하여 빠르게 필터링하시거나 여기서 검색을 요청하세요!`
      };
      return {
        id: `m-${Date.now()}`,
        sender: 'mascot',
        text: msgs[targetLang],
        originalText: msgs[targetLang],
        locale: targetLang,
        timestamp: time,
        actionButton: onFilterTeachers ? { label: t('common.search'), onClick: () => onFilterTeachers('') } : undefined
      };
    }

    // ── PROMPT 2: CHECK LOCKED ACCOUNTS ──
    if (
      q.includes('khóa') || q.includes('lock') || q.includes('locked') ||
      q.includes('锁定') || q.includes('ロック') || q.includes('잠김')
    ) {
      const lockedTeachers = teacherAccounts.filter(t => t.status === 'locked');
      if (lockedTeachers.length === 0) {
        const msgs: Record<SupportedLocale, string> = {
          vi: '✅ Tuyệt vời! Hiện tại không có tài khoản giảng viên nào đang bị khóa. Tất cả các tài khoản đều đang hoạt động bình thường.',
          en: '✅ Great! No teacher accounts are currently locked. All accounts are operating normally.',
          zh: '✅ 很好！当前没有被锁定的讲师账户，所有账户均正常运行。',
          ja: '✅ 素晴らしい！現在ロックされている講師アカウントはありません。すべて正常に稼働しています。',
          ko: '✅ 훌륭합니다! 현재 잠긴 강사 계정이 없습니다. 모든 계정이 정상적으로 운영 중입니다.'
        };
        return {
          id: `m-${Date.now()}`,
          sender: 'mascot',
          text: msgs[targetLang],
          originalText: msgs[targetLang],
          locale: targetLang,
          timestamp: time
        };
      }
      const names = lockedTeachers.map(t => `${t.name} (${t.teacherCode})`).join(', ');
      const msgs: Record<SupportedLocale, string> = {
        vi: `⚠️ Phát hiện ${lockedTeachers.length} tài khoản đang bị tạm khóa: ${names}. Thầy/Cô có thể vào menu ba chấm (...) của từng giảng viên để Mở khóa khi cần.`,
        en: `⚠️ Detected ${lockedTeachers.length} locked account(s): ${names}. You can use the (...) menu of each teacher to unlock when ready.`,
        zh: `⚠️ 发现 ${lockedTeachers.length} 个被锁定的账户：${names}。您可以通过各账户的操作菜单 (...) 按需解锁。`,
        ja: `⚠️ ${lockedTeachers.length} 件の一時ロックアカウントが検出されました: ${names}。（...）メニューから解除できます。`,
        ko: `⚠️ ${lockedTeachers.length}개의 잠긴 계정이 감지되었습니다: ${names}. 각 계정의 (...) 메뉴에서 잠금을 해제하실 수 있습니다.`
      };
      return {
        id: `m-${Date.now()}`,
        sender: 'mascot',
        text: msgs[targetLang],
        originalText: msgs[targetLang],
        locale: targetLang,
        timestamp: time,
        type: 'warning',
        actionButton: onFilterLocked ? { label: t('common.filter'), onClick: onFilterLocked } : undefined
      };
    }

    // ── PROMPT 3: RBAC PERMISSIONS GUIDE ──
    if (
      q.includes('phân quyền') || q.includes('rbac') || q.includes('permission') ||
      q.includes('vai trò') || q.includes('权限') || q.includes('権限') || q.includes('권한')
    ) {
      const msgs: Record<SupportedLocale, string> = {
        vi: `📘 HƯỚNG DẪN PHÂN QUYỀN RBAC 2.0:\n• Giảng viên: Có quyền vào lớp học, nhập điểm danh QR, chấm bài tập và xem danh sách học viên.\n• Quản trị viên: Có quyền quản lý khóa học, đề thi, lịch học và học viên.\n• Super Admin: Nắm toàn quyền hệ thống và thiết lập quyền hạn chi tiết.\n👉 Nhấn nút "RBAC" tại dòng giảng viên để phân quyền chi tiết.`,
        en: `📘 RBAC 2.0 PERMISSIONS GUIDE:\n• Teachers: Access classrooms, dynamic QR attendance, grading, and student roster.\n• Administrators: Manage courses, exams, schedules, and students.\n• Super Admin: Master control with granular permission tuning.\n👉 Click the "RBAC" button on any row for granular settings.`,
        zh: `📘 RBAC 2.0 权限指南：\n• 任课讲师：可进入班级、管理 QR 签到、评定作业并查看学员名册。\n• 系统管理员：可管理课程、考试、课表及学员资料。\n• 超级管理员：拥有最高全局权限并可细粒度分配权限。\n👉 点击各行中的“RBAC”按钮即可开展配置。`,
        ja: `📘 RBAC 2.0 権限ガイド:\n• 担当講師: クラス、QR出席管理、採点、受講生リストへのアクセス権。\n• 管理者: コース、試験、時間割、受講生の管理権限。\n• スーパー管理者: 詳細な権限設定を含む最高全権。\n👉 各行の「RBAC」ボタンより詳細設定を行えます。`,
        ko: `📘 RBAC 2.0 권한 설정 안내:\n• 강사: 강의실, QR 출석, 과제 채점 및 수강생 명단 접근 권한.\n• 관리자: 과정, 시험, 시간표 및 수강생 관리 권한.\n• 최고 관리자: 세부 권한 조정을 포함한 전체 권한 보유.\n👉 행의 "RBAC" 버튼을 클릭하여 세부 권한을 설정하세요.`
      };
      return {
        id: `m-${Date.now()}`,
        sender: 'mascot',
        text: msgs[targetLang],
        originalText: msgs[targetLang],
        locale: targetLang,
        timestamp: time
      };
    }

    // ── PROMPT 4: FIND MISSING DATA ──
    if (
      q.includes('thiếu') || q.includes('missing') || q.includes('dữ liệu') ||
      q.includes('缺失') || q.includes('不足') || q.includes('누락')
    ) {
      const missingContact = teacherAccounts.filter(t => !t.phoneOrEmail && !t.email && !t.phone);
      const noTracks = teacherAccounts.filter(t => !t.assignedTracks || t.assignedTracks.length === 0);
      const countC = missingContact.length;
      const countT = noTracks.length;

      const msgs: Record<SupportedLocale, string> = {
        vi: `📊 KIỂM TRA TÍNH TOÀN VẸN DỮ LIỆU:\n• ${countC} giảng viên chưa có thông tin Email / SĐT liên hệ.\n• ${countT} giảng viên chưa được phân công môn giảng dạy.`,
        en: `📊 DATA INTEGRITY REPORT:\n• ${countC} teacher(s) missing contact information.\n• ${countT} teacher(s) without assigned tracks.`,
        zh: `📊 数据完整性检查报告：\n• ${countC} 位讲师尚未登记联系电话或邮箱。\n• ${countT} 位讲师尚未分配负责课程。`,
        ja: `📊 データ整合性レポート:\n• ${countC} 名の講師に連絡先情報が登録されていません。\n• ${countT} 名の講師に担当コースが割り当てられていません。`,
        ko: `📊 데이터 무결성 검사 보고서:\n• ${countC}명의 강사에게 연락처 정보가 등록되지 않았습니다.\n• ${countT}명의 강사에게 담당 트랙이 배정되지 않았습니다.`
      };
      return {
        id: `m-${Date.now()}`,
        sender: 'mascot',
        text: msgs[targetLang],
        originalText: msgs[targetLang],
        locale: targetLang,
        timestamp: time
      };
    }

    // ── PROMPT 5: GUIDE TO ADD TEACHERS ──
    if (
      q.includes('thêm') || q.includes('add') || q.includes('create') ||
      q.includes('添加') || q.includes('追加') || q.includes('추가')
    ) {
      const msgs: Record<SupportedLocale, string> = {
        vi: `✨ QUY TRÌNH THÊM GIẢNG VIÊN MỚI:\n1. Nhấn nút "+ Thêm Giảng Viên / Nhân Sự" ở góc trên bên phải bảng.\n2. Nhập Họ và tên (VD: Thầy Đình Huy).\n3. Nhập Mã giảng viên (VD: GV05) - dùng làm tài khoản đăng nhập.\n4. Tích chọn các môn/phân hệ mà giảng viên sẽ phụ trách.\n5. Nhấn "Lưu & Cấp Tài Khoản". Mật khẩu an toàn mặc định sẽ được khởi tạo tự động.`,
        en: `✨ STEPS TO ADD A NEW TEACHER:\n1. Click the "+ Add Teacher / Staff" button at the top right of the table.\n2. Enter full name (e.g. Teacher Dinh Huy).\n3. Enter account code (e.g. GV05) - used for login credentials.\n4. Select the curriculum tracks they will be teaching.\n5. Click "Save & Issue Account". A secure hashed default password is created automatically.`,
        zh: `✨ 添加新讲师的操作流程：\n1. 点击表格右上角的“+ 添加讲师 / 人事”按钮。\n2. 输入姓名（例如：黄讲师）。\n3. 输入讲师代码（例如：GV05）作为登录凭证。\n4. 勾选负责教授的课程与模块。\n5. 点击“保存并生成账户”，系统将自动生成安全散列密码。`,
        ja: `✨ 新規講師の追加手順:\n1. テーブル右上の「+ 講師・職員を追加」ボタンをクリックします。\n2. 氏名を入力します（例: フイ講師）。\n3. ログインIDとなる講師コードを入力します（例: GV05）。\n4. 担当するコースにチェックを入れます。\n5. 「保存」をクリックすると、安全な初期認証が自動設定されます。`,
        ko: `✨ 신규 강사 추가 절차:\n1. 테이블 우측 상단의 "+ 강사 / 인사 추가" 버튼을 클릭합니다.\n2. 강사 성명을 입력합니다.\n3. 로그인 아이디로 사용할 강사 코드(예: GV05)를 입력합니다.\n4. 담당할 교육 트랙을 선택합니다.\n5. "저장"을 클릭하면 안전한 기본 인증 정보가 자동으로 생성됩니다.`
      };
      return {
        id: `m-${Date.now()}`,
        sender: 'mascot',
        text: msgs[targetLang],
        originalText: msgs[targetLang],
        locale: targetLang,
        timestamp: time,
        actionButton: onOpenAddTeacher ? { label: t('common.add'), onClick: onOpenAddTeacher } : undefined
      };
    }

    // ── DEFAULT POLITE RESPONSE ──
    const defaults: Record<SupportedLocale, string> = {
      vi: `Dạ em đã ghi nhận thông tin: "${query}". Em có thể giúp Thầy/Cô kiểm tra tài khoản bị khóa, tra cứu môn phụ trách hoặc hướng dẫn quy trình quản trị. Hãy chọn một trong các gợi ý bên dưới nhé!`,
      en: `I have noted: "${query}". I can help you check locked accounts, search allocated tracks, or provide administrative guidance. Please choose one of the suggestions below!`,
      zh: `我已收到您的提问：“${query}”。我可以协助您核查锁定账户、查询课程分工或提供管理操作指引。请选择下方的快捷提示！`,
      ja: `「${query}」について承知いたしました。アカウントの確認、担当コースの検索、管理操作のサポートが可能です。下記のメニューからお選びください。`,
      ko: `문의하신 내용("${query}")을 확인했습니다. 잠긴 계정 확인, 담당 과목 조회 또는 관리 가이드를 지원할 수 있습니다. 아래 추천 질문 중 하나를 선택해 보세요!`
    };

    return {
      id: `m-${Date.now()}`,
      sender: 'mascot',
      text: defaults[targetLang],
      originalText: defaults[targetLang],
      locale: targetLang,
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
          aria-label={t('mascot.title')}
          style={{
            position: 'absolute',
            bottom: '70px',
            right: 0,
            width: isMinimized ? '320px' : '400px',
            maxWidth: 'calc(100vw - 32px)',
            height: isMinimized ? '70px' : '530px',
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
              padding: '12px 14px',
              background: 'linear-gradient(135deg, #0057B8 0%, #003F88 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}
          >
            {/* Mascot Avatar & Title */}
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
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
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
                <div style={{ fontSize: '0.86rem', fontWeight: 800, lineHeight: 1.2, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t('mascot.name')}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.85)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('common.online')} 24/7</span>
                </div>
              </div>
            </div>

            {/* Right Header Actions: Language Selector + Minimize + Close */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              {/* Language Selector Dropdown right in the chatbot header */}
              <LanguageSelector variant="chatbot" />

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
                {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
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
                title={t('common.close')}
                aria-label={t('common.close')}
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
                        maxWidth: '88%',
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

                      {/* Action Button if present */}
                      {msg.actionButton && (
                        <div style={{ marginTop: '8px' }}>
                          <button
                            type="button"
                            onClick={msg.actionButton.onClick}
                            style={{
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
                        </div>
                      )}
                    </div>

                    {/* Timestamp & Translate message toggle button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', padding: '0 4px' }}>
                      <span style={{ fontSize: '0.66rem', color: '#64748B' }}>
                        {msg.timestamp}
                      </span>

                      {/* Translate button (Requirement 5) */}
                      {msg.sender === 'mascot' && (
                        <button
                          type="button"
                          onClick={() => handleToggleTranslateMessage(msg.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0057B8',
                            fontSize: '0.66rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px',
                            padding: '0 2px'
                          }}
                        >
                          {msg.isTranslated ? <RotateCcw size={10} /> : <Languages size={10} />}
                          <span>{msg.isTranslated ? t('mascot.showOriginal') : t('mascot.translate')}</span>
                        </button>
                      )}
                    </div>
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
                  {t('mascot.name')}
                </label>
                <input
                  id={inputId}
                  type="text"
                  placeholder={t('mascot.inputPlaceholder')}
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
          animation: !isOpen ? 'gentle-bounce 3s infinite ease-in-out' : 'none'
        }}
        title={t('mascot.title')}
        aria-label={t('mascot.title')}
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
        {/* Pulsing Green Online Indicator */}
        <span
          style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#22c55e',
            border: '2px solid #FFFFFF',
            boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.3)'
          }}
        />
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
