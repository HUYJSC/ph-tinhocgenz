/**
 * PH DIGITAL EDUCATION — Backend API Client SDK
 * Chuẩn hóa giao tiếp giữa phân hệ Frontend (FE) và Backend (BE).
 */

export interface BackendApiResponse<T = any> {
  ok?: boolean;
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class BackendApiClient {
  private static baseUrl: string = '';

  /**
   * Thiết lập Base URL kết nối Backend Django nếu hoạt động ở chế độ Hybrid Server
   */
  public static setBackendUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, '');
  }

  /**
   * Gọi API nội bộ Serverless hoặc Django Backend với tự động xử lý Cookie & Header
   */
  public static async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<BackendApiResponse<T>> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = cleanEndpoint.startsWith('/api')
      ? cleanEndpoint
      : `${this.baseUrl}${cleanEndpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(options.headers || {})
        },
        credentials: 'same-origin'
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          ok: false,
          success: false,
          error: data?.error || data?.message || `HTTP error ${response.status}`
        };
      }

      return {
        ok: true,
        success: true,
        data: data?.data || data
      };
    } catch (err: any) {
      return {
        ok: false,
        success: false,
        error: err?.message || 'Không thể kết nối đến Backend API'
      };
    }
  }

  /**
   * GET helper
   */
  public static async get<T = any>(endpoint: string, params?: Record<string, string>): Promise<BackendApiResponse<T>> {
    let url = endpoint;
    if (params) {
      const query = new URLSearchParams(params).toString();
      url += (url.includes('?') ? '&' : '?') + query;
    }
    return this.request<T>(url, { method: 'GET' });
  }

  /**
   * POST helper
   */
  public static async post<T = any>(endpoint: string, body?: any): Promise<BackendApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    });
  }
}
