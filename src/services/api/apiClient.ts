/**
 * API Client SDK — PH Digital Education
 * Centralized HTTP Client with CSRF protection, credentials support, and standardized error handling.
 */

export const API_BASE_URL = (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) ||
  (import.meta as any).env?.VITE_API_BASE_URL ||
  '';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  ok: boolean;
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  // Auto attach CSRF Token for mutating requests
  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfToken = getCookie('csrftoken');
    if (csrfToken && !headers.has('X-CSRFToken')) {
      headers.set('X-CSRFToken', csrfToken);
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: options.credentials || 'include'
    });

    const isJson = (response.headers.get('content-type') || '').includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      let errorMessage = 'Yêu cầu không thành công.';
      if (data) {
        if (typeof data.error === 'string') errorMessage = data.error;
        else if (typeof data.detail === 'string') errorMessage = data.detail;
        else if (typeof data.message === 'string') errorMessage = data.message;
        else if (Array.isArray(data.non_field_errors)) errorMessage = data.non_field_errors.join(' ');
      }
      return {
        error: errorMessage,
        status: response.status,
        ok: false
      };
    }

    return {
      data,
      status: response.status,
      ok: true
    };
  } catch (err: any) {
    return {
      error: err?.message || 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng.',
      status: 0,
      ok: false
    };
  }
}

export const api = {
  get: <T = any>(endpoint: string, headers?: HeadersInit) =>
    apiRequest<T>(endpoint, { method: 'GET', headers }),
  post: <T = any>(endpoint: string, body?: any, headers?: HeadersInit) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers
    }),
  put: <T = any>(endpoint: string, body?: any, headers?: HeadersInit) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers
    }),
  patch: <T = any>(endpoint: string, body?: any, headers?: HeadersInit) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers
    }),
  delete: <T = any>(endpoint: string, headers?: HeadersInit) =>
    apiRequest<T>(endpoint, { method: 'DELETE', headers })
};
