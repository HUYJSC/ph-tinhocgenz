/**
 * AIChatService — Client-side communication service for Mascot AI Chatbot
 * Securely communicates with /api/ai/chat serverless backend.
 * Manages localized conversation history, ratings, and prompt suggestions.
 */

export interface AIChatSource {
  id?: string;
  type?: string;
  title: string;
  sourceType: 'database' | 'drive' | 'curriculum' | 'policy';
  snippet: string;
  url?: string;
  version?: string;
  updatedAt?: string;
}

export interface AIChatMessage {
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

export interface AIChatResponse {
  success: boolean;
  reply: string;
  response?: string; // alias for backwards compatibility
  sources?: AIChatSource[];
  isFlaggedInjection?: boolean;
  error?: string;
}

export class AIChatService {
  private static readonly STORAGE_PREFIX = 'phtgz_ai_chat_history_';

  /**
   * Send message to backend Gemini Pro endpoint (/api/ai/chat)
   * Supports both (message, role, language, signal) and (message, language, signal)
   */
  public static async sendMessage(
    message: string,
    roleOrLocale: string = 'student',
    localeOrSignal?: string | AbortSignal,
    maybeSignal?: AbortSignal
  ): Promise<AIChatResponse> {
    let role = 'student';
    let language = 'vi';
    let signal: AbortSignal | undefined;

    if (localeOrSignal instanceof AbortSignal) {
      // Called as: sendMessage(msg, language, abortSignal)
      language = roleOrLocale || 'vi';
      signal = localeOrSignal;
    } else if (typeof localeOrSignal === 'string') {
      // Called as: sendMessage(msg, role, language, abortSignal)
      role = roleOrLocale || 'student';
      language = localeOrSignal || 'vi';
      signal = maybeSignal;
    } else {
      role = roleOrLocale || 'student';
      signal = maybeSignal;
    }

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          role,
          language
        }),
        signal
      });

      if (!res.ok) {
        if (res.status === 429) {
          const reply = 'Bạn đã gửi câu hỏi quá nhanh. Vui lòng chờ 30 giây trước khi thử lại.';
          return {
            success: false,
            reply,
            response: reply,
            error: 'RATE_LIMIT'
          };
        }
        const errJson = await res.json().catch(() => ({}));
        const reply = errJson.error || 'Hệ thống AI đang bảo trì. Vui lòng thử lại sau.';
        return {
          success: false,
          reply,
          response: reply,
          error: 'HTTP_ERROR'
        };
      }

      const data = await res.json();
      const replyText = data.reply || data.response || 'Tôi chưa tìm thấy thông tin này trong dữ liệu được cấp quyền.';
      return {
        success: true,
        reply: replyText,
        response: replyText,
        sources: data.sources || [],
        isFlaggedInjection: data.isFlaggedInjection
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        const reply = 'Đã dừng tạo câu trả lời.';
        return {
          success: false,
          reply,
          response: reply,
          error: 'ABORTED'
        };
      }
      const reply = 'Không thể kết nối đến máy chủ AI. Vui lòng kiểm tra kết nối mạng của bạn.';
      return {
        success: false,
        reply,
        response: reply,
        error: 'NETWORK_ERROR'
      };
    }
  }

  /**
   * Save conversation history to localStorage
   */
  public static saveHistory(scope: string, messages: AIChatMessage[]): void {
    try {
      localStorage.setItem(`${this.STORAGE_PREFIX}${scope}`, JSON.stringify(messages.slice(-50)));
    } catch (e) {
      console.warn('[AIChatService] Failed to save history to storage', e);
    }
  }

  /**
   * Retrieve stored conversation history
   */
  public static getStoredHistory(scope: string): AIChatMessage[] {
    try {
      const data = localStorage.getItem(`${this.STORAGE_PREFIX}${scope}`);
      if (!data) return [];
      return JSON.parse(data) as AIChatMessage[];
    } catch {
      return [];
    }
  }

  /**
   * Clear conversation history
   */
  public static clearHistory(scope: string): void {
    try {
      localStorage.removeItem(`${this.STORAGE_PREFIX}${scope}`);
    } catch (e) {
      console.warn('[AIChatService] Failed to clear history', e);
    }
  }

  /**
   * Record message satisfaction rating (like/dislike)
   */
  public static recordRating(messageId: string, rating: 'like' | 'dislike'): void {
    try {
      const ratings = JSON.parse(localStorage.getItem('phtgz_ai_ratings') || '{}');
      ratings[messageId] = {
        rating,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('phtgz_ai_ratings', JSON.stringify(ratings));
    } catch (e) {
      console.warn('[AIChatService] Failed to save rating', e);
    }
  }
}
