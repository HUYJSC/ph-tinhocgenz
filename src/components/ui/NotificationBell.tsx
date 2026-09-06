import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, X, Clock } from 'lucide-react';
import { PushNotificationService } from '../../services/pushNotificationService';
import { AppNotification, NOTIFICATION_TYPE_ICONS, NOTIFICATION_TYPE_LABELS } from '../../types/notification';
import { soundFx } from '../../utils/audio';

interface NotificationBellProps {
  userId: string;
  /** Polling interval in ms (default: 60000 = 1 phút) */
  pollInterval?: number;
}

/**
 * NotificationBell — Icon 🔔 với badge đếm tin chưa đọc
 * Hiện dropdown panel khi click
 */
export const NotificationBell: React.FC<NotificationBellProps> = ({
  userId,
  pollInterval = 60000
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const prevUnreadRef = useRef(0);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const data = await PushNotificationService.fetchNotifications(userId, { limit: 20 });
      setNotifications(data.notifications);

      // Nếu có tin mới → bounce animation
      if (data.unreadCount > prevUnreadRef.current && prevUnreadRef.current > 0) {
        soundFx.playClick();
      }
      prevUnreadRef.current = data.unreadCount;
      setUnreadCount(data.unreadCount);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  };

  // Check push status
  useEffect(() => {
    PushNotificationService.isSubscribed().then(setPushEnabled);
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, pollInterval);
    return () => clearInterval(timer);
  }, [userId, pollInterval]);

  // Listen for push notification clicks from SW
  useEffect(() => {
    const cleanup = PushNotificationService.onNotificationClick(() => {
      fetchNotifications();
      setIsOpen(true);
    });
    return cleanup;
  }, []);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        bellRef.current && !bellRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Mark single as read
  const handleMarkRead = async (notifId: string) => {
    await PushNotificationService.markAsRead(notifId, userId);
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    await PushNotificationService.markAllAsRead(userId);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    soundFx.playClick();
  };

  // Toggle push subscription
  const handleTogglePush = async () => {
    if (pushEnabled) {
      await PushNotificationService.unsubscribe(userId);
      setPushEnabled(false);
    } else {
      const result = await PushNotificationService.subscribe(userId);
      setPushEnabled(result.success);
      if (result.success) {
        soundFx.playVictory();
      }
    }
  };

  // Format time ago
  const timeAgo = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* 🔔 Bell Button */}
      <button
        ref={bellRef}
        onClick={() => {
          soundFx.playClick();
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        title="Thông báo tiến độ học tập"
        className="btn btn-icon"
        style={{
          width: '34px',
          height: '34px',
          minHeight: '34px',
          position: 'relative',
          color: unreadCount > 0 ? '#2563EB' : 'var(--text-secondary)',
          animation: unreadCount > 0 ? 'notifBellBounce 2s ease-in-out infinite' : 'none'
        }}
      >
        <Bell size={16} fill={unreadCount > 0 ? 'rgba(37,99,235,0.15)' : 'none'} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-3px',
            right: '-3px',
            minWidth: '18px',
            height: '18px',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: '#fff',
            fontSize: '10px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            boxShadow: '0 2px 6px rgba(239,68,68,0.4)',
            animation: 'notifBadgePulse 1.5s ease-in-out infinite'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: '480px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            zIndex: 300,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'notifPanelSlideIn 0.2s ease-out'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                🔔 Thông báo
              </span>
              {unreadCount > 0 && (
                <span style={{
                  background: '#2563EB',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '999px'
                }}>
                  {unreadCount} mới
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'rgba(37,99,235,0.08)',
                    color: '#2563EB',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <CheckCheck size={12} /> Đọc hết
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Push Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            borderBottom: '1px solid var(--border-color)',
            background: pushEnabled ? 'rgba(34,197,94,0.04)' : 'rgba(245,158,11,0.04)'
          }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {pushEnabled ? '✅ Đang nhận Push trên thiết bị này' : '🔕 Chưa bật Push Notification'}
            </span>
            <button
              onClick={handleTogglePush}
              style={{
                padding: '4px 10px',
                borderRadius: '8px',
                border: 'none',
                background: pushEnabled ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.1)',
                color: pushEnabled ? '#ef4444' : '#16a34a',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {pushEnabled ? 'Tắt Push' : 'Bật Push'}
            </button>
          </div>

          {/* Notification List */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden'
          }}>
            {isLoading && notifications.length === 0 ? (
              <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                <div style={{
                  width: '24px', height: '24px', border: '2px solid rgba(37,99,235,0.2)',
                  borderTopColor: '#2563EB', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite', margin: '0 auto 12px'
                }} />
                Đang tải thông báo...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                <Bell size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                <div>Chưa có thông báo nào</div>
                <div style={{ fontSize: '11px', marginTop: '4px' }}>
                  Hệ thống sẽ tự động gửi báo cáo tiến độ hàng tuần
                </div>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.isRead) handleMarkRead(notif.id);
                  }}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-color)',
                    cursor: notif.isRead ? 'default' : 'pointer',
                    background: notif.isRead ? 'transparent' : 'rgba(37,99,235,0.03)',
                    transition: 'background 0.15s',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start'
                  }}
                  onMouseEnter={e => {
                    if (!notif.isRead) e.currentTarget.style.background = 'rgba(37,99,235,0.06)';
                  }}
                  onMouseLeave={e => {
                    if (!notif.isRead) e.currentTarget.style.background = 'rgba(37,99,235,0.03)';
                    else e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: notif.isRead ? 'var(--bg-secondary)' : 'rgba(37,99,235,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    flexShrink: 0
                  }}>
                    {NOTIFICATION_TYPE_ICONS[notif.type] || '📢'}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: notif.isRead ? 400 : 600,
                      color: 'var(--text-primary)',
                      lineHeight: 1.4,
                      marginBottom: '3px',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {notif.title}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {notif.body}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '4px',
                      fontSize: '11px',
                      color: 'var(--text-muted)'
                    }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={10} /> {timeAgo(notif.createdAt)}
                      </span>
                      <span style={{
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: 'var(--bg-secondary)',
                        fontSize: '10px',
                        fontWeight: 500
                      }}>
                        {NOTIFICATION_TYPE_LABELS[notif.type] || notif.type}
                      </span>
                    </div>
                  </div>

                  {/* Unread dot */}
                  {!notif.isRead && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#2563EB',
                      flexShrink: 0,
                      marginTop: '4px'
                    }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes notifBellBounce {
          0%, 100% { transform: rotate(0deg); }
          5% { transform: rotate(12deg); }
          10% { transform: rotate(-10deg); }
          15% { transform: rotate(8deg); }
          20% { transform: rotate(-5deg); }
          25% { transform: rotate(0deg); }
        }
        @keyframes notifBadgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes notifPanelSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
