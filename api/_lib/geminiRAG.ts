/**
 * Gemini RAG Pipeline & Security Shield
 * Grounded context retrieval, Role-Based Access Control (RBAC),
 * Prompt Injection Protection, and Google Gemini API integration.
 */

export interface RAGUserContext {
  userId: string;
  role: 'student' | 'teacher' | 'academic' | 'admin' | 'super_admin' | 'guest';
  name: string;
  language: string;
  permissions: string[];
  studentCode?: string;
  teacherCode?: string;
  track?: string;
}

export interface AIChatSource {
  id?: string;
  title: string;
  type?: string;
  sourceType: 'database' | 'drive' | 'curriculum' | 'policy';
  snippet: string;
  url?: string;
  version?: string;
  updatedAt?: string;
}

export interface RAGRetrievalResult {
  isFlaggedInjection: boolean;
  injectionReason?: string;
  scopedContext: string;
  formattedContext: string;
  intent?: string;
  sources: AIChatSource[];
}

/**
 * 1. Approved Google Drive & Knowledge Base Documents (RBAC Controlled)
 */
export const APPROVED_DRIVE_DOCUMENTS: Array<{
  id: string;
  title: string;
  category: 'policy' | 'curriculum' | 'guideline';
  rolesAllowed: Array<'all' | 'student' | 'teacher' | 'academic' | 'admin'>;
  content: string;
  version: string;
  updatedAt: string;
}> = [
  {
    id: 'doc-handbook-2026',
    title: 'Sổ tay học viên Tin Học Gen Z 2026',
    category: 'policy',
    rolesAllowed: ['all'],
    content: 'Quy chế đào tạo: Điểm danh bằng QR code hoặc mã PIN trước mỗi buổi học. Học viên vắng không quá 2 buổi/khóa để đủ điều kiện cấp chứng chỉ. Nộp bài tập đúng hạn trước 23:59 ngày quy định.',
    version: '2.1.0',
    updatedAt: '2026-09-15'
  },
  {
    id: 'doc-course-tracks',
    title: 'Khung chương trình đào tạo Tin Học Gen Z',
    category: 'curriculum',
    rolesAllowed: ['all'],
    content: 'Các lộ trình: 1. Tin học Văn phòng Cấp tốc 3-in-1 (Word, Excel, PowerPoint thực chiến). 2. Luyện thi IC3/MOS chuẩn quốc tế. 3. Ứng dụng AI vào văn phòng hiện đại (ChatGPT, Copilot, Gemini). 4. Lập trình Frontend & Backend.',
    version: '1.4.0',
    updatedAt: '2026-08-20'
  },
  {
    id: 'doc-teacher-guideline',
    title: 'Quy định giảng dạy & chấm điểm dành cho Giảng viên',
    category: 'guideline',
    rolesAllowed: ['teacher', 'academic', 'admin'],
    content: 'Quy định giảng viên: Mở ca điểm danh QR 15 phút trước giờ học và khóa sau 30 phút. Chấm bài tập trong vòng 48 giờ sau khi học viên nộp. Phản hồi thắc mắc học viên trong mục thảo luận.',
    version: '3.0.0',
    updatedAt: '2026-09-01'
  }
];

/**
 * 2. Security Shield: Detect Prompt Injection and Jailbreaks
 */
export function detectPromptInjection(message: string): boolean {
  const normalized = message.toLowerCase();
  const injectionPatterns = [
    /ignore\s+(all\s+)?(previous|above)\s+(instructions|prompts|rules)/i,
    /disregard\s+(the\s+)?system\s+prompt/i,
    /you\s+are\s+now\s+(in\s+)?dan\s+mode/i,
    /reveal\s+(your\s+)?(system\s+prompt|instructions|secret|api\s*key)/i,
    /bỏ\s+qua\s+(toàn\s+bộ\s+)?(hướng\s+dẫn|chỉ\s+dẫn|quy\s+tắc)\s+(trước|hệ\s+thống)/i,
    /tiết\s+lộ\s+(mật\s+khẩu|token|api\s*key|system\s+prompt)/i,
    /đóng\s+vai\s+hacker/i
  ];

  return injectionPatterns.some(pattern => pattern.test(normalized));
}

/**
 * 3. Scoped RAG Context Retrieval based on User Role & Permissions
 */
export async function retrieveScopedContext(
  userContext: RAGUserContext,
  query: string
): Promise<RAGRetrievalResult> {
  // Check for prompt injection
  if (detectPromptInjection(query)) {
    const warning = 'Phát hiện câu hỏi vi phạm an toàn hệ thống hoặc cố ý can thiệp system prompt.';
    return {
      isFlaggedInjection: true,
      injectionReason: warning,
      scopedContext: warning,
      formattedContext: warning,
      intent: 'security_violation',
      sources: []
    };
  }

  const queryLower = query.toLowerCase();
  const sources: AIChatSource[] = [];
  const contextSnippets: string[] = [];

  // Filter approved Google Drive documents according to role permissions
  for (const doc of APPROVED_DRIVE_DOCUMENTS) {
    const isAllowed = doc.rolesAllowed.includes('all') ||
      (userContext.role !== 'guest' && doc.rolesAllowed.includes(userContext.role as any)) ||
      userContext.role === 'super_admin';

    if (isAllowed) {
      const match = queryLower.split(/\s+/).some(word => word.length > 2 && doc.content.toLowerCase().includes(word));
      if (match || queryLower.includes('chứng chỉ') || queryLower.includes('điểm danh') || queryLower.includes('khóa học') || queryLower.includes('quy định')) {
        sources.push({
          id: doc.id,
          title: doc.title,
          type: doc.category,
          sourceType: 'drive',
          snippet: doc.content.slice(0, 150) + '...',
          version: doc.version,
          updatedAt: doc.updatedAt
        });
        contextSnippets.push(`[Tài liệu ${doc.title} (v${doc.version})]: ${doc.content}`);
      }
    }
  }

  // Role-specific LMS Knowledge
  if (userContext.role === 'student') {
    contextSnippets.push(
      `[Học viên]: Mã HV ${userContext.studentCode || 'Chưa định danh'}, Tên: ${userContext.name}, Khóa: ${userContext.track || 'Tin học Văn phòng Cấp tốc 3-in-1'}. Tiến độ học tập trung bình: 78%. Điểm danh đạt 95%.`
    );
  } else if (userContext.role === 'teacher') {
    contextSnippets.push(
      `[Giảng viên]: Mã GV ${userContext.teacherCode || 'GV01'}, Tên: ${userContext.name}. Lớp phụ trách: K26-WE01 (Sĩ số 24). Có 3 bài tập nộp gần nhất đang chờ chấm.`
    );
  }

  const formatted = contextSnippets.join('\n\n');

  return {
    isFlaggedInjection: false,
    scopedContext: formatted,
    formattedContext: formatted,
    intent: 'general_query',
    sources
  };
}

/**
 * 4. Build System Prompt with Strict Anti-Hallucination & Fallback Directive
 */
export function buildGeminiSystemPrompt(
  userContext: RAGUserContext,
  scopedContext?: string,
  _userQuery?: string
): string {
  return `Bạn là "Trợ lý Gen Z" — Mascot AI thông minh, thân thiện của Hệ sinh thái Giáo dục Tin Học Gen Z (PH Digital Education).
Ngôn ngữ phản hồi chính: ${userContext.language || 'vi'}.
Vai trò người dùng đang tương tác: ${userContext.role} (Tên: ${userContext.name}).

NGUYÊN TẮC BẢO MẬT & VẬN HÀNH BẮT BUỘC:
1. KHÔNG BAO GIỜ tiết lộ mật khẩu, API key, JWT token, mã băm hay dữ liệu nội bộ hệ thống.
2. KHÔNG tự ý thay đổi dữ liệu, điểm số, trạng thái điểm danh hay quyền hạn tài khoản.
3. Nếu không tìm thấy thông tin phù hợp trong dữ liệu được cấp quyền, bạn PHẢI trả lời rõ:
   "Tôi chưa tìm thấy thông tin này trong dữ liệu được cấp quyền."
4. Tuyệt đối KHÔNG tự bịa đặt thông tin, ngày thi hay chính sách không có trong ngữ cảnh.
5. Luôn giữ phong cách giao tiếp tích cực, tôn trọng, lịch sự và giải thích ngắn gọn, dễ hiểu.

NGỮ CẢNH DỮ LIỆU ĐƯỢC CẤP PHÉP:
${scopedContext ? scopedContext : 'Không có tài liệu bổ sung.'}`;
}

/**
 * 5. Call Gemini API or Secure Fallback Generation
 */
export async function generateGeminiChatResponse(
  systemPrompt: string,
  userMessage: string,
  _userContextOrLang?: RAGUserContext | string,
  sources?: AIChatSource[]
): Promise<{ text: string; modelUsed: string; sourcesUsed: AIChatSource[] }> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-pro';

  if (!apiKey) {
    let fallbackText = 'Xin chào! Tôi là Trợ lý Gen Z. Tôi luôn sẵn sàng hỗ trợ bạn tra cứu lịch học, bài tập, hướng dẫn học tập và giải đáp các thắc mắc trong suốt khóa học.';
    if (userMessage.toLowerCase().includes('đăng nhập') || userMessage.toLowerCase().includes('mật khẩu')) {
      fallbackText = 'Để đăng nhập vào LMS Tin Học Gen Z, bạn vui lòng nhập Mã học viên hoặc Email và Mật khẩu được cấp. Nếu quên mật khẩu, hãy bấm "Quên mật khẩu" hoặc liên hệ Giáo vụ đào tạo để được cấp lại.';
    } else if (userMessage.toLowerCase().includes('chứng chỉ')) {
      fallbackText = 'Để nhận chứng chỉ hoàn thành khóa học, bạn cần tham gia tối thiểu 80% số buổi điểm danh và nộp đầy đủ các bài tập thực hành theo quy chế đào tạo.';
    } else if (userMessage.toLowerCase().includes('điểm danh')) {
      fallbackText = 'Bạn có thể điểm danh bằng cách quét mã QR do Giảng viên hiển thị tại lớp học hoặc nhập mã PIN điểm danh 6 chữ số nếu thiết bị không bật được camera.';
    }

    return {
      text: fallbackText,
      modelUsed: 'mock-gemini-pro',
      sourcesUsed: sources || []
    };
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userMessage }]
        }
      ],
      generationConfig: {
        temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.3'),
        maxOutputTokens: parseInt(process.env.GEMINI_MAX_OUTPUT_TOKENS || '800', 10)
      }
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Gemini API Error]:', res.status, errText);
      return {
        text: 'Hiện tại hệ thống AI đang bận. Vui lòng thử lại sau giây lát hoặc liên hệ bộ phận hỗ trợ kỹ thuật.',
        modelUsed: model,
        sourcesUsed: []
      };
    }

    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return {
      text: candidateText || 'Tôi chưa tìm thấy thông tin này trong dữ liệu được cấp quyền.',
      modelUsed: model,
      sourcesUsed: sources || []
    };
  } catch (error) {
    console.error('[Gemini Service Exception]:', error);
    return {
      text: 'Lỗi kết nối đến dịch vụ AI. Vui lòng kiểm tra đường truyền mạng hoặc thử lại.',
      modelUsed: model,
      sourcesUsed: []
    };
  }
}
