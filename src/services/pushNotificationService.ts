/**
 * PH DIGITAL EDUCATION — Web Push Notification Service (Client-side)
 * Quản lý đăng ký/hủy đăng ký Web Push, xin quyền thông báo
 */

const VAPID_PUBLIC_KEY = (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY || '';

/**
 * Chuyển đổi VAPID key từ base64url sang Uint8Array cho PushManager
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export class PushNotificationService {
  /**
   * Kiểm tra trình duyệt có hỗ trợ Web Push không
   */
  static isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  /**
   * Lấy trạng thái permission hiện tại
   */
  static getPermissionState(): NotificationPermission {
    if (!('Notification' in window)) return 'denied';
    return Notification.permission;
  }

  /**
   * Xin phép hiển thị thông báo
   * Returns: 'granted' | 'denied' | 'default'
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) return 'denied';
    const permission = await Notification.requestPermission();
    return permission;
  }

  /**
   * Đăng ký Service Worker và Push Subscription
   * Gửi subscription lên server để lưu vào database
   */
  static async subscribe(userId: string): Promise<{
    success: boolean;
    subscription?: PushSubscription;
    error?: string;
  }> {
    try {
      if (!this.isSupported()) {
        return { success: false, error: 'Trình duyệt không hỗ trợ Web Push' };
      }

      if (!VAPID_PUBLIC_KEY) {
        return { success: false, error: 'VAPID Public Key chưa được cấu hình' };
      }

      // Đảm bảo permission đã được cấp
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        return { success: false, error: 'Người dùng từ chối nhận thông báo' };
      }

      // Đăng ký/lấy Service Worker
      const registration = await navigator.serviceWorker.ready;

      // Kiểm tra subscription hiện có
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Tạo subscription mới
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as BufferSource
        });
      }

      // Gửi subscription lên server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subscription: subscription.toJSON()
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return {
          success: false,
          error: data.error || 'Lỗi lưu đăng ký thông báo'
        };
      }

      return { success: true, subscription };
    } catch (err: any) {
      console.error('[PushService] Subscribe error:', err);
      return {
        success: false,
        error: `Lỗi đăng ký Push: ${err.message}`
      };
    }
  }

  /**
   * Hủy đăng ký Push Subscription
   */
  static async unsubscribe(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Xóa trên server
        await fetch('/api/notifications/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            endpoint: subscription.endpoint
          })
        });
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Kiểm tra đã đăng ký Push chưa
   */
  static async isSubscribed(): Promise<boolean> {
    try {
      if (!this.isSupported()) return false;
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch {
      return false;
    }
  }

  /**
   * Lấy danh sách thông báo in-app
   */
  static async fetchNotifications(userId: string, options?: {
    unreadOnly?: boolean;
    limit?: number;
  }): Promise<{
    notifications: import('../types/notification').AppNotification[];
    unreadCount: number;
  }> {
    try {
      const params = new URLSearchParams({ userId });
      if (options?.unreadOnly) params.set('unreadOnly', 'true');
      if (options?.limit) params.set('limit', String(options.limit));

      const res = await fetch(`/api/notifications/list?${params}`);
      if (!res.ok) {
        return { notifications: [], unreadCount: 0 };
      }

      const data = await res.json();
      return {
        notifications: data.notifications || [],
        unreadCount: data.unreadCount || 0
      };
    } catch {
      return { notifications: [], unreadCount: 0 };
    }
  }

  /**
   * Đánh dấu thông báo đã đọc
   */
  static async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const res = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, userId })
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Đánh dấu tất cả đã đọc
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const res = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true, userId })
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Lắng nghe khi user click vào notification từ Service Worker
   */
  static onNotificationClick(callback: (data: { notificationId: string; url: string }) => void): () => void {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'NOTIFICATION_CLICKED') {
        callback({
          notificationId: event.data.notificationId,
          url: event.data.url
        });
      }
    };

    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }
}
